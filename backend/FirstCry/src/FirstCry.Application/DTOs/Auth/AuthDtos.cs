namespace FirstCry.Application.DTOs.Auth;

/// <param name="Channel">OTP delivery: "sms" (default) or "whatsapp".</param>
public record LoginRequest(string PhoneNumber, string? Channel = null);

public record VerifyOtpRequest(string PhoneNumber, string Otp);

public record SendEmailOtpRequest(string PhoneNumber, string Email);

public record VerifyEmailOtpRequest(string PhoneNumber, string Email, string Otp);

public record RefreshTokenRequest(string? RefreshToken);

public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt,
    UserDto User
);

public record UserDto(
    Guid Id,
    string PhoneNumber,
    string? Name,
    string? Email,
    string Role,
    bool IsGuest,
    bool ProfileCompleted
);

public record UpdateProfileRequest(
    string? Name,
    string? Email,
    bool? ProfileCompleted
);
