namespace FirstCry.API.Controllers.v1;

using System.Security.Claims;
using Asp.Versioning;
using FirstCry.Application.Common;
using FirstCry.Application.Common.Exceptions;
using FirstCry.Application.Common.Interfaces;
using FirstCry.Application.DTOs;
using FirstCry.Application.DTOs.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FluentValidation;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IEmailOtpAuthService _emailOtpAuthService;
    private readonly IValidator<SendEmailOtpRequest> _sendEmailOtpValidator;
    private readonly IValidator<VerifyEmailOtpRequest> _verifyEmailOtpValidator;
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        IAuthService authService,
        IEmailOtpAuthService emailOtpAuthService,
        IValidator<SendEmailOtpRequest> sendEmailOtpValidator,
        IValidator<VerifyEmailOtpRequest> verifyEmailOtpValidator,
        IWebHostEnvironment env,
        ILogger<AuthController> logger)
    {
        _authService = authService;
        _emailOtpAuthService = emailOtpAuthService;
        _sendEmailOtpValidator = sendEmailOtpValidator;
        _verifyEmailOtpValidator = verifyEmailOtpValidator;
        _env = env;
        _logger = logger;
    }

    /// <summary>
    /// Send OTP to email (phone collected for profile; OTP delivered by email).
    /// </summary>
    [HttpPost("send-email-otp")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> SendEmailOtp([FromBody] SendEmailOtpRequest request, CancellationToken cancellationToken)
    {
        await ValidateAsync(_sendEmailOtpValidator, request, cancellationToken);
        await _emailOtpAuthService.SendEmailOtpAsync(request, cancellationToken);

        var email = AuthIdentifiers.NormalizeEmail(request.Email);
        return Ok(ApiResponse<object>.SuccessResponse(
            new
            {
                Message = "If the details are valid, a verification code has been sent to your email.",
                Email = AuthIdentifiers.MaskEmail(email),
                Channel = "email",
            },
            "OTP sent successfully."));
    }

    /// <summary>
    /// Verify email OTP and login/register user.
    /// </summary>
    [HttpPost("verify-email-otp")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> VerifyEmailOtp([FromBody] VerifyEmailOtpRequest request, CancellationToken cancellationToken)
    {
        await ValidateAsync(_verifyEmailOtpValidator, request, cancellationToken);
        var ipAddress = GetClientIpAddress();
        var result = await _emailOtpAuthService.VerifyEmailOtpAsync(request, ipAddress, cancellationToken);
        SetRefreshTokenCookie(result.RefreshToken);

        _logger.LogInformation("User authenticated via email OTP for {Email}", AuthIdentifiers.MaskEmail(request.Email));

        return Ok(ApiResponse<AuthResponse>.SuccessResponse(result, "Authentication successful."));
    }

    /// <summary>
    /// Send OTP to phone number (SMS/WhatsApp) — coming soon.
    /// </summary>
    [HttpPost("send-otp")]
    [AllowAnonymous]
    public Task<IActionResult> SendOtp([FromBody] LoginRequest request)
    {
        _ = request;
        return Task.FromResult<IActionResult>(StatusCode(
            StatusCodes.Status503ServiceUnavailable,
            ApiResponse<object>.ErrorResponse(
                "Phone and WhatsApp login are coming soon. Please sign in with email OTP.")));
    }

    /// <summary>
    /// Legacy verify phone OTP — coming soon.
    /// </summary>
    [HttpPost("verify-otp")]
    [AllowAnonymous]
    public Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest request)
    {
        _ = request;
        return Task.FromResult<IActionResult>(StatusCode(
            StatusCodes.Status503ServiceUnavailable,
            ApiResponse<object>.ErrorResponse(
                "Phone and WhatsApp login are coming soon. Please sign in with email OTP.")));
    }

    /// <summary>
    /// Refresh access token using refresh token
    /// </summary>
    [HttpPost("refresh-token")]
    [AllowAnonymous]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        var refreshToken = request.RefreshToken ?? Request.Cookies["refreshToken"];
        
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("Refresh token is required."));
        }

        var ipAddress = GetClientIpAddress();
        var result = await _authService.RefreshTokenAsync(refreshToken, ipAddress);

        // Set new refresh token in HTTP-only cookie
        SetRefreshTokenCookie(result.RefreshToken);

        return Ok(ApiResponse<AuthResponse>.SuccessResponse(result, "Token refreshed successfully."));
    }

    /// <summary>
    /// Logout and revoke refresh token
    /// </summary>
    [HttpPost("logout")]
    [AllowAnonymous]
    public async Task<IActionResult> Logout([FromBody] RefreshTokenRequest request)
    {
        var refreshToken = request.RefreshToken ?? Request.Cookies["refreshToken"];
        
        if (!string.IsNullOrWhiteSpace(refreshToken))
        {
            var ipAddress = GetClientIpAddress();
            await _authService.RevokeTokenAsync(refreshToken, ipAddress);
        }

        // Clear refresh token cookie
        Response.Cookies.Delete("refreshToken");

        return Ok(ApiResponse<object>.SuccessResponse(new { }, "Logged out successfully."));
    }

    /// <summary>
    /// Get current authenticated user
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    public IActionResult GetCurrentUser()
    {
        // JWT was generated with short claim names ("sub", "role", "phone", "isGuest")
        // ClaimTypes.Role maps to the long URI — use the short key directly
        var userId = User.FindFirst("sub")?.Value;
        var phoneNumber = User.FindFirst("phone")?.Value;
        var role = User.FindFirst("role")?.Value;
        var isGuest = User.FindFirst("isGuest")?.Value;
        var profileCompleted = User.FindFirst("profileCompleted")?.Value;

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized(ApiResponse<object>.ErrorResponse("Invalid token claims."));
        }

        return Ok(ApiResponse<object>.SuccessResponse(new
        {
            Id = userId,
            PhoneNumber = phoneNumber,
            Role = role,
            IsGuest = bool.TryParse(isGuest, out var g) && g,
            ProfileCompleted = bool.TryParse(profileCompleted, out var p) && p
        }, "Current user retrieved."));
    }

    /// <summary>
    /// Update current user profile (name, email)
    /// </summary>
    [HttpPut("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
        
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized(ApiResponse<object>.ErrorResponse("Invalid token claims."));
        }

        var user = await _authService.UpdateUserProfileAsync(userId, request);
        
        return Ok(ApiResponse<object>.SuccessResponse(new
        {
            Id = user.Id,
            PhoneNumber = user.PhoneNumber,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            IsGuest = user.IsGuest,
            ProfileCompleted = user.ProfileCompleted
        }, "Profile updated successfully."));
    }



    #region Helper Methods

    private static async Task ValidateAsync<T>(IValidator<T> validator, T instance, CancellationToken cancellationToken)
    {
        var result = await validator.ValidateAsync(instance, cancellationToken);
        if (result.IsValid)
        {
            return;
        }

        var message = result.Errors.FirstOrDefault()?.ErrorMessage ?? "Validation failed.";
        throw new ApiException(message, 400);
    }

    private string GetClientIpAddress()
    {
        // Check for forwarded IP first (behind proxy/load balancer)
        var forwardedFor = Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(forwardedFor))
        {
            return forwardedFor.Split(',')[0].Trim();
        }

        return HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }

    private void SetRefreshTokenCookie(string token)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = !_env.IsDevelopment(),
            SameSite = SameSiteMode.Strict,
            Expires = DateTimeOffset.UtcNow.AddDays(7)
        };

        Response.Cookies.Append("refreshToken", token, cookieOptions);
    }

    private static string MaskPhoneNumber(string phoneNumber)
    {
        if (phoneNumber.Length <= 4) return phoneNumber;
        return new string('*', phoneNumber.Length - 4) + phoneNumber[^4..];
    }

    #endregion
}
