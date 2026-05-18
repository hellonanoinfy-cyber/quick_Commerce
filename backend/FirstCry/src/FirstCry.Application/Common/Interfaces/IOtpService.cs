namespace FirstCry.Application.Common.Interfaces;

public interface IOtpService
{
    Task<string> GenerateOtpAsync(string phoneNumber);
    Task<bool> ValidateOtpAsync(string phoneNumber, string otp);
    Task<int> GetRemainingCooldownAsync(string phoneNumber);
}
