namespace FirstCry.Infrastructure.Services.Auth;

// ─────────────────────────────────────────────────────────────────────────────
// RedisOtpService — Production Redis-backed OTP storage with full resilience
//
// Design principles:
//   • EVERY Redis call is wrapped in try-catch — the service NEVER throws
//   • If Redis is down, a structured warning is logged and a safe default returned
//   • IDatabase is obtained lazily to survive transient connection resets
//   • All OTP data is JSON-serialised before storage
//   • Brute-force protection: max 3 attempts before OTP is deleted
//   • 30-second resend cooldown tracked via CreatedAt timestamp in the stored record
//   • 5-minute absolute expiry is enforced by Redis TTL
// ─────────────────────────────────────────────────────────────────────────────

using System.Security.Cryptography;
using System.Text.Json;

using FirstCry.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

/// <summary>
/// Redis-backed OTP service.
/// Wraps every Redis call in a try-catch so the OTP flow never crashes even
/// when the Redis server is temporarily unreachable.
/// </summary>
public class RedisOtpService : IOtpService
{
    // ── Constants ───────────────────────────────────────────────────────────
    private const string OtpKeyPrefix       = "otp:";
    private const int    OtpExpiryMinutes   = 5;
    private const int    CooldownSeconds    = 30;
    private const int    MaxAttempts        = 3;

    // ── Dependencies ────────────────────────────────────────────────────────
    private readonly IConnectionMultiplexer          _redis;
    private readonly ILogger<RedisOtpService>        _logger;

    // ── JSON options (shared, avoids per-call allocation) ───────────────────
    private static readonly JsonSerializerOptions _json = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public RedisOtpService(
        IConnectionMultiplexer redis,
        ILogger<RedisOtpService> logger)
    {
        _redis  = redis;
        _logger = logger;
    }

    // ── Lazy DB accessor ────────────────────────────────────────────────────
    // Calling GetDatabase() is lightweight (no network hop), but we wrap it
    // so that a broken multiplexer doesn't propagate as an unhandled exception.
    private IDatabase? TryGetDatabase()
    {
        try
        {
            return _redis.GetDatabase();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex,
                "[RedisOTP] Could not obtain IDatabase from multiplexer. Redis may be restarting.");
            return null;
        }
    }

    // ── IOtpService: GenerateOtpAsync ────────────────────────────────────────

    /// <summary>
    /// Generates a cryptographically secure 6-digit OTP and persists it in
    /// Redis with a 5-minute TTL. Returns the OTP even if the Redis write fails
    /// (the caller — InMemoryOtpService fallback chain — handles persistence).
    /// </summary>
    public async Task<string> GenerateOtpAsync(string phoneNumber)
    {
        var otp = RandomNumberGenerator.GetInt32(100_000, 1_000_000).ToString();
        var db  = TryGetDatabase();

        if (db is null)
        {
            _logger.LogWarning(
                "[RedisOTP] Redis unavailable during GenerateOtpAsync for {Phone}. OTP cannot be persisted.",
                MaskPhone(phoneNumber));
            return otp; // caller's fallback layer will store it in memory
        }

        var key  = BuildKey(phoneNumber);
        var data = new OtpPayload { Otp = otp, Attempts = 0, CreatedAt = DateTime.UtcNow };

        try
        {
            await db.StringSetAsync(
                key,
                JsonSerializer.Serialize(data, _json),
                TimeSpan.FromMinutes(OtpExpiryMinutes));

            _logger.LogInformation(
                "[RedisOTP] OTP stored in Redis for {Phone}. TTL={Ttl}m",
                MaskPhone(phoneNumber), OtpExpiryMinutes);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex,
                "[RedisOTP] Redis write failed in GenerateOtpAsync for {Phone}. Returning OTP anyway.",
                MaskPhone(phoneNumber));
        }

        return otp;
    }

    // ── IOtpService: ValidateOtpAsync ────────────────────────────────────────

    /// <summary>
    /// Validates the OTP. Enforces expiry (via Redis TTL — if key is gone the
    /// OTP is expired) and brute-force attempt limit. Returns false on any
    /// Redis error rather than throwing.
    /// </summary>
    public async Task<bool> ValidateOtpAsync(string phoneNumber, string otp)
    {
        var db = TryGetDatabase();
        if (db is null)
        {
            _logger.LogWarning(
                "[RedisOTP] Redis unavailable during ValidateOtpAsync for {Phone}. Returning false.",
                MaskPhone(phoneNumber));
            return false;
        }

        var key = BuildKey(phoneNumber);
        try
        {
            var raw = await db.StringGetAsync(key);
            if (raw.IsNullOrEmpty)
            {
                _logger.LogWarning("[RedisOTP] No OTP found in Redis for {Phone}.", MaskPhone(phoneNumber));
                return false;
            }

            var data = JsonSerializer.Deserialize<OtpPayload>(raw.ToString(), _json);
            if (data is null)
            {
                _logger.LogWarning("[RedisOTP] Failed to deserialise OTP payload for {Phone}.", MaskPhone(phoneNumber));
                await db.KeyDeleteAsync(key);
                return false;
            }

            // Brute-force guard
            if (data.Attempts >= MaxAttempts)
            {
                _logger.LogWarning(
                    "[RedisOTP] Max attempts ({Max}) already reached for {Phone}. OTP invalidated.",
                    MaxAttempts, MaskPhone(phoneNumber));
                await db.KeyDeleteAsync(key);
                return false;
            }

            // Correct OTP
            if (data.Otp == otp)
            {
                await db.KeyDeleteAsync(key);
                _logger.LogInformation("[RedisOTP] OTP validated successfully for {Phone}.", MaskPhone(phoneNumber));
                return true;
            }

            // Wrong OTP — increment counter
            data.Attempts++;

            if (data.Attempts >= MaxAttempts)
            {
                await db.KeyDeleteAsync(key);
                _logger.LogWarning(
                    "[RedisOTP] OTP attempt {Attempt}/{Max} failed for {Phone}. OTP invalidated.",
                    data.Attempts, MaxAttempts, MaskPhone(phoneNumber));
            }
            else
            {
                // Preserve remaining TTL while updating attempt counter
                var ttl = await db.KeyTimeToLiveAsync(key);
                await db.StringSetAsync(
                    key,
                    JsonSerializer.Serialize(data, _json),
                    ttl ?? TimeSpan.FromMinutes(OtpExpiryMinutes));

                _logger.LogWarning(
                    "[RedisOTP] OTP attempt {Attempt}/{Max} failed for {Phone}.",
                    data.Attempts, MaxAttempts, MaskPhone(phoneNumber));
            }

            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "[RedisOTP] Redis error in ValidateOtpAsync for {Phone}. Returning false.",
                MaskPhone(phoneNumber));
            return false;
        }
    }

    // ── IOtpService: GetRemainingCooldownAsync ───────────────────────────────

    /// <summary>
    /// Returns seconds remaining before the user may request a new OTP.
    /// Returns 0 (no cooldown) on any Redis error — allows the user to retry.
    /// </summary>
    public async Task<int> GetRemainingCooldownAsync(string phoneNumber)
    {
        var db = TryGetDatabase();
        if (db is null)
        {
            _logger.LogWarning(
                "[RedisOTP] Redis unavailable during GetRemainingCooldownAsync for {Phone}. Returning 0 (no cooldown).",
                MaskPhone(phoneNumber));
            return 0; // safe default — allow the request through
        }

        var key = BuildKey(phoneNumber);
        try
        {
            var raw = await db.StringGetAsync(key);
            if (raw.IsNullOrEmpty) return 0;

            var data = JsonSerializer.Deserialize<OtpPayload>(raw.ToString(), _json);
            if (data is null) return 0;

            var elapsedSeconds = (int)(DateTime.UtcNow - data.CreatedAt).TotalSeconds;
            var remaining      = CooldownSeconds - elapsedSeconds;

            return remaining > 0 ? remaining : 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "[RedisOTP] Redis error in GetRemainingCooldownAsync for {Phone}. Returning 0.",
                MaskPhone(phoneNumber));
            return 0; // allow retry — do not block user because of infrastructure error
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private static string BuildKey(string phoneNumber) => $"{OtpKeyPrefix}{phoneNumber}";

    private static string MaskPhone(string phone) =>
        phone.Length <= 4 ? phone : new string('*', phone.Length - 4) + phone[^4..];

    // ── Inner DTO ────────────────────────────────────────────────────────────

    private sealed class OtpPayload
    {
        public string   Otp       { get; set; } = string.Empty;
        public int      Attempts  { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
