namespace FirstCry.Infrastructure.Services.Auth;

using FirstCry.Application.Common;
using FirstCry.Application.Common.Exceptions;
using FirstCry.Application.Common.Interfaces;
using FirstCry.Application.DTOs.Auth;
using FirstCry.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

public class AuthService : IAuthService
{
    private readonly IApplicationDbContext _context;
    private readonly IOtpService _otpService;
    private readonly ISmsService _smsService;
    private readonly ITokenService _tokenService;
    private readonly ILogger<AuthService> _logger;
    private readonly IConfiguration _config;

    public AuthService(
        IApplicationDbContext context,
        IOtpService otpService,
        ISmsService smsService,
        ITokenService tokenService,
        ILogger<AuthService> logger,
        IConfiguration config)
    {
        _context = context;
        _otpService = otpService;
        _smsService = smsService;
        _tokenService = tokenService;
        _logger = logger;
        _config = config;
    }

    public async Task<bool> SendOtpAsync(LoginRequest request)
    {
        var cooldown = await _otpService.GetRemainingCooldownAsync(request.PhoneNumber);
        if (cooldown > 0)
        {
            throw new ApiException($"Please wait {cooldown} seconds before requesting a new OTP.", 429);
        }

        var otp = await _otpService.GenerateOtpAsync(request.PhoneNumber);
        var channel = OtpChannel.Normalize(request.Channel);

        var message = $"Your FirstCry login OTP is {otp}. Valid for 5 minutes.";
        var sent = OtpChannel.IsWhatsApp(channel)
            ? await _smsService.SendWhatsAppAsync(request.PhoneNumber, message)
            : await _smsService.SendSmsAsync(request.PhoneNumber, message);

        if (!sent)
        {
            throw new ApiException("Failed to send OTP. Please try again later.", 500);
        }

        _logger.LogInformation("OTP sent via {Channel} to {PhoneNumber}", channel, request.PhoneNumber);
        return true;
    }

    public async Task<AuthResponse> VerifyOtpAsync(VerifyOtpRequest request, string ipAddress)
    {
        var isValid = await _otpService.ValidateOtpAsync(request.PhoneNumber, request.Otp);
        if (!isValid)
        {
            throw new ApiException("Invalid or expired OTP.", 400);
        }

        var user = await _context.Users
            .Include(u => u.RefreshTokens)
            .FirstOrDefaultAsync(u => u.PhoneNumber == request.PhoneNumber);

        if (user == null)
        {
            // Auto-create guest account
            user = new User
            {
                PhoneNumber = request.PhoneNumber,
                IsGuest = true,
                Role = "User",
                ProfileCompleted = false
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync(CancellationToken.None);
            _logger.LogInformation("Created new guest user for {PhoneNumber}", request.PhoneNumber);
        }

        var jwtToken = _tokenService.CreateJwtToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken(ipAddress);

        user.RefreshTokens.Add(refreshToken);
        
        // Keep only last 5 tokens for security/cleanup
        if (user.RefreshTokens.Count > 5)
        {
            user.RefreshTokens.RemoveAt(0);
        }

        await _context.SaveChangesAsync(CancellationToken.None);

        return MapToAuthResponse(user, jwtToken, refreshToken.Token);
    }

    public async Task<AuthResponse> RefreshTokenAsync(string token, string ipAddress)
    {
        try
        {
            var user = await _context.Users
                .Include(u => u.RefreshTokens)
                .FirstOrDefaultAsync(u => u.RefreshTokens.Any(t => t.Token == token));

            if (user == null) throw new ApiException("Invalid refresh token.", 401);

            var refreshToken = user.RefreshTokens.First(x => x.Token == token);

            if (!refreshToken.IsActive) throw new ApiException("Inactive refresh token.", 401);

            // Rotate token
            var newRefreshToken = _tokenService.GenerateRefreshToken(ipAddress);
            refreshToken.Revoked = DateTime.UtcNow;
            refreshToken.RevokedByIp = ipAddress;
            refreshToken.ReplacedByToken = newRefreshToken.Token;

            user.RefreshTokens.Add(newRefreshToken);
            await _context.SaveChangesAsync(CancellationToken.None);

            var jwtToken = _tokenService.CreateJwtToken(user);

            return MapToAuthResponse(user, jwtToken, newRefreshToken.Token);
        }
        catch (Exception ex) when (ex is Microsoft.Data.SqlClient.SqlException or InvalidOperationException)
        {
            _logger.LogError(ex, "Database error during token refresh");
            throw new ApiException("Authentication service is currently unavailable. Please try again later.", 503);
        }
    }

    public async Task RevokeTokenAsync(string token, string ipAddress)
    {
        var user = await _context.Users
            .Include(u => u.RefreshTokens)
            .FirstOrDefaultAsync(u => u.RefreshTokens.Any(t => t.Token == token));

        if (user == null) throw new ApiException("Invalid token.", 400);

        var refreshToken = user.RefreshTokens.First(x => x.Token == token);
        if (!refreshToken.IsActive) return;

        refreshToken.Revoked = DateTime.UtcNow;
        refreshToken.RevokedByIp = ipAddress;
        refreshToken.ReasonRevoked = "Logout";

        await _context.SaveChangesAsync(CancellationToken.None);
    }

    public async Task<User> UpdateUserProfileAsync(string userId, UpdateProfileRequest request)
    {
        var user = await _context.Users.FindAsync(Guid.Parse(userId));
        
        if (user == null)
        {
            throw new ApiException("User not found.", 404);
        }

        // Update fields if provided
        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            user.Name = request.Name.Trim();
        }

        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            user.Email = request.Email.Trim();
        }

        if (request.ProfileCompleted.HasValue)
        {
            user.ProfileCompleted = request.ProfileCompleted.Value;
            // After profile completion, user is no longer a guest
            if (request.ProfileCompleted.Value)
            {
                user.IsGuest = false;
            }
        }

        await _context.SaveChangesAsync(CancellationToken.None);
        
        _logger.LogInformation("User profile updated for {UserId}", userId);
        
        return user;
    }

    private AuthResponse MapToAuthResponse(User user, string jwtToken, string refreshToken)
    {
        var expiryMinutes = double.Parse(_config["Jwt:ExpirationInMinutes"] ?? "60");
        return new AuthResponse(
            jwtToken,
            refreshToken,
            DateTime.UtcNow.AddMinutes(expiryMinutes),
            new UserDto(
                user.Id,
                user.PhoneNumber,
                user.Name,
                user.Email,
                user.Role,
                user.IsGuest,
                user.ProfileCompleted
            )
        );
    }
}
