namespace FirstCry.Application.Common.Interfaces;

using FirstCry.Application.DTOs.Auth;

public interface IEmailOtpAuthService
{
    Task SendEmailOtpAsync(SendEmailOtpRequest request, CancellationToken cancellationToken = default);

    Task<AuthResponse> VerifyEmailOtpAsync(VerifyEmailOtpRequest request, string ipAddress, CancellationToken cancellationToken = default);
}
