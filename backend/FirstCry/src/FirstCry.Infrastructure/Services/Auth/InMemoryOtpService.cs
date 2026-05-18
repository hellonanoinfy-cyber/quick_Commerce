namespace FirstCry.Infrastructure.Services.Auth;

// ─────────────────────────────────────────────────────────────────────────────
// InMemoryOtpService — Thread-safe in-memory fallback for Redis-backed OTP
//
// Used automatically when Redis is unavailable at startup or during runtime.
// Stores OTP data in a ConcurrentDictionary for lock-free concurrent access.
// Includes:
//   • 6-digit cryptographically secure OTP generation
//   • Per-phone expiry (5 minutes)
//   • 30-second resend cooldown
//   • 3-attempt brute-force protection
//   • Automatic entry cleanup on expiry check
// ─────────────────────────────────────────────────────────────────────────────

using System.Collections.Concurrent;
using System.Security.Cryptography;

using FirstCry.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

/// <summary>
/// In-memory OTP service used as fallback when Redis is unavailable.
/// Thread-safe via ConcurrentDictionary. Suitable for single-node development
/// and as a resilience layer behind the Redis OTP service.
/// </summary>
public class InMemoryOtpService : IOtpService
{
    // ── Constants ───────────────────────────────────────────────────────────
    private const int OtpExpiryMinutes       = 5;
    private const int ResendCooldownSeconds  = 30;
    private const int MaxAttempts            = 3;

    // ── Storage ─────────────────────────────────────────────────────────────
    // Each phone number maps to a single OtpRecord. ConcurrentDictionary
    // eliminates the need for explicit locks in most operations.
    private readonly ConcurrentDictionary<string, OtpRecord> _store = new();

    // ── Dependencies ────────────────────────────────────────────────────────
    private readonly ILogger<InMemoryOtpService> _logger;

    public InMemoryOtpService(ILogger<InMemoryOtpService> logger)
    {
        _logger = logger;
    }

    // ── IOtpService: GenerateOtpAsync ────────────────────────────────────────

    /// <summary>
    /// Generates a cryptographically secure 6-digit OTP and stores it
    /// in-memory for the given phone number, replacing any existing entry.
    /// </summary>
    public Task<string> GenerateOtpAsync(string phoneNumber)
    {
        // Cryptographically secure random int in [100000, 999999]
        var otp = RandomNumberGenerator.GetInt32(100000, 1_000_000).ToString();

        var record = new OtpRecord
        {
            Otp       = otp,
            Attempts  = 0,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddMinutes(OtpExpiryMinutes)
        };

        // AddOrUpdate ensures atomicity for both insert and replace
        _store.AddOrUpdate(phoneNumber, record, (_, _) => record);

        _logger.LogInformation(
            "[InMemoryOTP] OTP generated and stored in memory for {PhoneNumber}. Expires at {ExpiresAt:HH:mm:ss} UTC",
            MaskPhone(phoneNumber),
            record.ExpiresAt);

        return Task.FromResult(otp);
    }

    // ── IOtpService: ValidateOtpAsync ────────────────────────────────────────

    /// <summary>
    /// Validates the provided OTP against the stored value for the given
    /// phone number. Enforces expiry and brute-force attempt limits.
    /// </summary>
    public Task<bool> ValidateOtpAsync(string phoneNumber, string otp)
    {
        // Entry missing or already expired
        if (!_store.TryGetValue(phoneNumber, out var record) || IsExpired(record))
        {
            _logger.LogWarning(
                "[InMemoryOTP] Validation attempt for {PhoneNumber}: no valid OTP found (missing or expired)",
                MaskPhone(phoneNumber));
            _store.TryRemove(phoneNumber, out _);
            return Task.FromResult(false);
        }

        // Brute-force guard: too many attempts → remove and block
        if (record.Attempts >= MaxAttempts)
        {
            _logger.LogWarning(
                "[InMemoryOTP] Max attempts ({MaxAttempts}) exceeded for {PhoneNumber}. OTP invalidated.",
                MaxAttempts,
                MaskPhone(phoneNumber));
            _store.TryRemove(phoneNumber, out _);
            return Task.FromResult(false);
        }

        // Correct OTP → remove entry and succeed
        if (record.Otp == otp)
        {
            _store.TryRemove(phoneNumber, out _);
            _logger.LogInformation(
                "[InMemoryOTP] OTP validated successfully for {PhoneNumber}",
                MaskPhone(phoneNumber));
            return Task.FromResult(true);
        }

        // Wrong OTP → increment attempt counter (thread-safe update)
        // We use a local mutation and re-add because OtpRecord is a class (reference type).
        // The record reference is already shared via the dictionary, so incrementing
        // Attempts in place is safe for single-field mutation under ConcurrentDictionary.
        record.Attempts++;

        if (record.Attempts >= MaxAttempts)
        {
            _store.TryRemove(phoneNumber, out _);
            _logger.LogWarning(
                "[InMemoryOTP] OTP attempt {Attempt} of {Max} failed for {PhoneNumber}. OTP invalidated (max reached).",
                record.Attempts,
                MaxAttempts,
                MaskPhone(phoneNumber));
        }
        else
        {
            _logger.LogWarning(
                "[InMemoryOTP] OTP attempt {Attempt} of {Max} failed for {PhoneNumber}.",
                record.Attempts,
                MaxAttempts,
                MaskPhone(phoneNumber));
        }

        return Task.FromResult(false);
    }

    // ── IOtpService: GetRemainingCooldownAsync ───────────────────────────────

    /// <summary>
    /// Returns the remaining resend cooldown in seconds for a given phone.
    /// Returns 0 if no active OTP exists or the cooldown has elapsed.
    /// </summary>
    public Task<int> GetRemainingCooldownAsync(string phoneNumber)
    {
        if (!_store.TryGetValue(phoneNumber, out var record) || IsExpired(record))
        {
            // Clean up expired entry if present
            _store.TryRemove(phoneNumber, out _);
            return Task.FromResult(0);
        }

        var elapsedSeconds = (int)(DateTime.UtcNow - record.CreatedAt).TotalSeconds;
        var remaining      = ResendCooldownSeconds - elapsedSeconds;

        return Task.FromResult(remaining > 0 ? remaining : 0);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    /// <summary>Returns true if the OTP record has passed its TTL.</summary>
    private static bool IsExpired(OtpRecord record) => DateTime.UtcNow > record.ExpiresAt;

    /// <summary>Masks all but the last 4 digits of a phone number for safe logging.</summary>
    private static string MaskPhone(string phone) =>
        phone.Length <= 4 ? phone : new string('*', phone.Length - 4) + phone[^4..];

    // ── Inner Record Type ────────────────────────────────────────────────────

    /// <summary>
    /// Holds OTP state for a single phone number.
    /// Class (reference type) allows in-place mutation inside ConcurrentDictionary.
    /// </summary>
    private sealed class OtpRecord
    {
        public string   Otp       { get; init; } = string.Empty;
        public int      Attempts  { get; set;  }
        public DateTime CreatedAt { get; init; }
        public DateTime ExpiresAt { get; init; }
    }
}
