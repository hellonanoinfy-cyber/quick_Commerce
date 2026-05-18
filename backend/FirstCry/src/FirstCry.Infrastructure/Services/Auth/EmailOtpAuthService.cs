namespace FirstCry.Infrastructure.Services.Auth;

using FirstCry.Application.Common;
using FirstCry.Application.Common.Exceptions;
using FirstCry.Application.Common.Interfaces;
using FirstCry.Application.DTOs.Auth;
using FirstCry.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

public sealed class EmailOtpAuthService : IEmailOtpAuthService
{
    private readonly IApplicationDbContext _context;
    private readonly IEmailOtpStore _emailOtpStore;
    private readonly IEmailService _emailService;
    private readonly ITokenService _tokenService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailOtpAuthService> _logger;

    public EmailOtpAuthService(
        IApplicationDbContext context,
        IEmailOtpStore emailOtpStore,
        IEmailService emailService,
        ITokenService tokenService,
        IConfiguration configuration,
        ILogger<EmailOtpAuthService> logger)
    {
        _context = context;
        _emailOtpStore = emailOtpStore;
        _emailService = emailService;
        _tokenService = tokenService;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendEmailOtpAsync(SendEmailOtpRequest request, CancellationToken cancellationToken = default)
    {
        var email = AuthIdentifiers.NormalizeEmail(request.Email);
        var phoneTen = AuthIdentifiers.NormalizePhoneToTenDigits(request.PhoneNumber);

        var cooldown = await _emailOtpStore.GetRemainingCooldownSecondsAsync(email, cancellationToken);
        if (cooldown > 0)
        {
            throw new ApiException($"Please wait {cooldown} seconds before requesting a new OTP.", 429);
        }

        var otp = await _emailOtpStore.CreateOtpAsync(email, cancellationToken);
        var sent = await _emailService.SendLoginOtpAsync(email, otp, cancellationToken);

        if (!sent)
        {
            throw new ApiException("Failed to send OTP. Please try again later.", 500);
        }

        _logger.LogInformation(
            "Email OTP requested for {Email} (phone on file: {Phone})",
            AuthIdentifiers.MaskEmail(email),
            MaskPhone(phoneTen));
    }

    public async Task<AuthResponse> VerifyEmailOtpAsync(VerifyEmailOtpRequest request, string ipAddress, CancellationToken cancellationToken = default)
    {
        var email = AuthIdentifiers.NormalizeEmail(request.Email);
        var phoneTen = AuthIdentifiers.NormalizePhoneToTenDigits(request.PhoneNumber);

        var isValid = await _emailOtpStore.ValidateOtpAsync(email, request.Otp, cancellationToken);
        if (!isValid)
        {
            throw new ApiException("Invalid or expired OTP.", 400);
        }

        var user = await ResolveUserAsync(phoneTen, email, cancellationToken);
        if (user is null)
        {
            user = new User
            {
                PhoneNumber = phoneTen,
                Email = email,
                IsGuest = true,
                Role = "User",
                ProfileCompleted = false,
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("Created user via email OTP for {Email}", AuthIdentifiers.MaskEmail(email));
        }
        else
        {
            var updated = false;
            if (string.IsNullOrWhiteSpace(user.Email))
            {
                user.Email = email;
                updated = true;
            }

            if (string.IsNullOrWhiteSpace(user.PhoneNumber) || user.PhoneNumber.Length < 10)
            {
                user.PhoneNumber = phoneTen;
                updated = true;
            }

            if (updated)
            {
                await _context.SaveChangesAsync(cancellationToken);
            }
        }

        var jwtToken = _tokenService.CreateJwtToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken(ipAddress);

        user.RefreshTokens.Add(refreshToken);
        if (user.RefreshTokens.Count > 5)
        {
            user.RefreshTokens.RemoveAt(0);
        }

        await _context.SaveChangesAsync(cancellationToken);

        return MapToAuthResponse(user, jwtToken, refreshToken.Token);
    }

    private AuthResponse MapToAuthResponse(User user, string jwtToken, string refreshToken)
    {
        var expiryMinutes = double.Parse(_configuration["Jwt:ExpirationInMinutes"] ?? "60");
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
                user.ProfileCompleted));
    }

    private async Task<User?> ResolveUserAsync(string phoneTen, string email, CancellationToken cancellationToken)
    {
        var byEmail = await _context.Users
            .Include(u => u.RefreshTokens)
            .FirstOrDefaultAsync(u => u.Email != null && u.Email.ToLower() == email, cancellationToken);

        var phoneVariants = new[] { phoneTen, $"+91{phoneTen}", $"91{phoneTen}" };
        var byPhone = await _context.Users
            .Include(u => u.RefreshTokens)
            .FirstOrDefaultAsync(u => phoneVariants.Contains(u.PhoneNumber), cancellationToken);

        if (byEmail is not null && byPhone is not null && byEmail.Id != byPhone.Id)
        {
            throw new ApiException(
                "This email and phone number belong to different accounts. Contact support.",
                409);
        }

        return byEmail ?? byPhone;
    }

    private static string MaskPhone(string phone) =>
        phone.Length <= 4 ? phone : new string('*', phone.Length - 4) + phone[^4..];
}
