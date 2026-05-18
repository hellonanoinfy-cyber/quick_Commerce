namespace FirstCry.Application.Common.Interfaces;

/// <summary>Hashed email OTP storage with expiry, cooldown, and attempt limits.</summary>
public interface IEmailOtpStore
{
    Task<string> CreateOtpAsync(string normalizedEmail, CancellationToken cancellationToken = default);

    Task<bool> ValidateOtpAsync(string normalizedEmail, string otp, CancellationToken cancellationToken = default);

    Task<int> GetRemainingCooldownSecondsAsync(string normalizedEmail, CancellationToken cancellationToken = default);
}
