namespace FirstCry.Application.Common.Interfaces;

public interface IEmailService
{
    Task<bool> SendLoginOtpAsync(string toEmail, string otp, CancellationToken cancellationToken = default);

    bool IsLiveConfigured { get; }
}
