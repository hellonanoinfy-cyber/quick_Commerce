namespace FirstCry.Infrastructure.Services.Email;

using System.Collections.Concurrent;
using System.Security.Cryptography;
using FirstCry.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

public sealed class InMemoryEmailOtpStore : IEmailOtpStore
{
    private const int OtpExpiryMinutes = 5;
    private const int ResendCooldownSeconds = 30;
    private const int MaxAttempts = 5;

    private readonly ConcurrentDictionary<string, EmailOtpRecord> _store = new();
    private readonly EmailOtpHasher _hasher;
    private readonly ILogger<InMemoryEmailOtpStore> _logger;

    public InMemoryEmailOtpStore(EmailOtpHasher hasher, ILogger<InMemoryEmailOtpStore> logger)
    {
        _hasher = hasher;
        _logger = logger;
    }

    public Task<string> CreateOtpAsync(string normalizedEmail, CancellationToken cancellationToken = default)
    {
        var otp = RandomNumberGenerator.GetInt32(100_000, 1_000_000).ToString();
        var record = new EmailOtpRecord
        {
            OtpHash = _hasher.Hash(otp),
            Attempts = 0,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddMinutes(OtpExpiryMinutes),
        };

        _store.AddOrUpdate(normalizedEmail, record, (_, _) => record);
        _logger.LogDebug("[EmailOTP] Stored in-memory OTP for {Email}", Mask(normalizedEmail));
        return Task.FromResult(otp);
    }

    public Task<bool> ValidateOtpAsync(string normalizedEmail, string otp, CancellationToken cancellationToken = default)
    {
        if (!_store.TryGetValue(normalizedEmail, out var record) || IsExpired(record))
        {
            _store.TryRemove(normalizedEmail, out _);
            return Task.FromResult(false);
        }

        if (record.Attempts >= MaxAttempts)
        {
            _store.TryRemove(normalizedEmail, out _);
            return Task.FromResult(false);
        }

        if (_hasher.Verify(otp, record.OtpHash))
        {
            _store.TryRemove(normalizedEmail, out _);
            return Task.FromResult(true);
        }

        record.Attempts++;
        if (record.Attempts >= MaxAttempts)
        {
            _store.TryRemove(normalizedEmail, out _);
        }

        return Task.FromResult(false);
    }

    public Task<int> GetRemainingCooldownSecondsAsync(string normalizedEmail, CancellationToken cancellationToken = default)
    {
        if (!_store.TryGetValue(normalizedEmail, out var record) || IsExpired(record))
        {
            _store.TryRemove(normalizedEmail, out _);
            return Task.FromResult(0);
        }

        var elapsed = (int)(DateTime.UtcNow - record.CreatedAt).TotalSeconds;
        var remaining = ResendCooldownSeconds - elapsed;
        return Task.FromResult(remaining > 0 ? remaining : 0);
    }

    private static bool IsExpired(EmailOtpRecord record) => DateTime.UtcNow > record.ExpiresAt;

    private static string Mask(string email)
    {
        var at = email.IndexOf('@');
        return at <= 1 ? "***" : $"{email[0]}***";
    }

    private sealed class EmailOtpRecord
    {
        public string OtpHash { get; init; } = string.Empty;
        public int Attempts { get; set; }
        public DateTime CreatedAt { get; init; }
        public DateTime ExpiresAt { get; init; }
    }
}
