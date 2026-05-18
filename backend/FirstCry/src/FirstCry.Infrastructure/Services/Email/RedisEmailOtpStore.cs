namespace FirstCry.Infrastructure.Services.Email;

using System.Security.Cryptography;
using System.Text.Json;
using FirstCry.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

public sealed class RedisEmailOtpStore : IEmailOtpStore
{
    private const string KeyPrefix = "email-otp:";
    private const int OtpExpiryMinutes = 5;
    private const int ResendCooldownSeconds = 30;
    private const int MaxAttempts = 5;

    private static readonly JsonSerializerOptions Json = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    private readonly IConnectionMultiplexer _redis;
    private readonly EmailOtpHasher _hasher;
    private readonly ILogger<RedisEmailOtpStore> _logger;

    public RedisEmailOtpStore(
        IConnectionMultiplexer redis,
        EmailOtpHasher hasher,
        ILogger<RedisEmailOtpStore> logger)
    {
        _redis = redis;
        _hasher = hasher;
        _logger = logger;
    }

    public async Task<string> CreateOtpAsync(string normalizedEmail, CancellationToken cancellationToken = default)
    {
        var otp = RandomNumberGenerator.GetInt32(100_000, 1_000_000).ToString();
        var db = TryGetDatabase();
        if (db is null)
        {
            return otp;
        }

        var payload = new EmailOtpPayload
        {
            OtpHash = _hasher.Hash(otp),
            Attempts = 0,
            CreatedAt = DateTime.UtcNow,
        };

        try
        {
            await db.StringSetAsync(
                BuildKey(normalizedEmail),
                JsonSerializer.Serialize(payload, Json),
                TimeSpan.FromMinutes(OtpExpiryMinutes));
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[EmailOTP] Redis write failed for {Email}", Mask(normalizedEmail));
        }

        return otp;
    }

    public async Task<bool> ValidateOtpAsync(string normalizedEmail, string otp, CancellationToken cancellationToken = default)
    {
        var db = TryGetDatabase();
        if (db is null)
        {
            return false;
        }

        var key = BuildKey(normalizedEmail);
        try
        {
            var raw = await db.StringGetAsync(key);
            if (raw.IsNullOrEmpty)
            {
                return false;
            }

            var payload = JsonSerializer.Deserialize<EmailOtpPayload>(raw!, Json);
            if (payload is null)
            {
                return false;
            }

            if (payload.Attempts >= MaxAttempts)
            {
                await db.KeyDeleteAsync(key);
                return false;
            }

            if (_hasher.Verify(otp, payload.OtpHash))
            {
                await db.KeyDeleteAsync(key);
                return true;
            }

            payload.Attempts++;
            if (payload.Attempts >= MaxAttempts)
            {
                await db.KeyDeleteAsync(key);
            }
            else
            {
                var ttl = await db.KeyTimeToLiveAsync(key);
                await db.StringSetAsync(
                    key,
                    JsonSerializer.Serialize(payload, Json),
                    ttl ?? TimeSpan.FromMinutes(OtpExpiryMinutes));
            }

            return false;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[EmailOTP] Redis validate failed for {Email}", Mask(normalizedEmail));
            return false;
        }
    }

    public async Task<int> GetRemainingCooldownSecondsAsync(string normalizedEmail, CancellationToken cancellationToken = default)
    {
        var db = TryGetDatabase();
        if (db is null)
        {
            return 0;
        }

        try
        {
            var raw = await db.StringGetAsync(BuildKey(normalizedEmail));
            if (raw.IsNullOrEmpty)
            {
                return 0;
            }

            var payload = JsonSerializer.Deserialize<EmailOtpPayload>(raw!, Json);
            if (payload is null)
            {
                return 0;
            }

            var elapsed = (int)(DateTime.UtcNow - payload.CreatedAt).TotalSeconds;
            var remaining = ResendCooldownSeconds - elapsed;
            return remaining > 0 ? remaining : 0;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[EmailOTP] Redis cooldown read failed for {Email}", Mask(normalizedEmail));
            return 0;
        }
    }

    private IDatabase? TryGetDatabase()
    {
        try
        {
            return _redis.GetDatabase();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[EmailOTP] Could not obtain Redis database.");
            return null;
        }
    }

    private static string BuildKey(string normalizedEmail) => $"{KeyPrefix}{normalizedEmail}";

    private static string Mask(string email)
    {
        var at = email.IndexOf('@');
        return at <= 1 ? "***" : $"{email[0]}***";
    }

    private sealed class EmailOtpPayload
    {
        public string OtpHash { get; set; } = string.Empty;
        public int Attempts { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
