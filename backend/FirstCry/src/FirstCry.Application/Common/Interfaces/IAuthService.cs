namespace FirstCry.Application.Common.Interfaces;

using FirstCry.Application.DTOs.Auth;
using FirstCry.Domain.Entities;

public interface IAuthService
{
    Task<bool> SendOtpAsync(LoginRequest request);
    Task<AuthResponse> VerifyOtpAsync(VerifyOtpRequest request, string ipAddress);
    Task<AuthResponse> RefreshTokenAsync(string token, string ipAddress);
    Task RevokeTokenAsync(string token, string ipAddress);
    Task<User> UpdateUserProfileAsync(string userId, UpdateProfileRequest request);
}
