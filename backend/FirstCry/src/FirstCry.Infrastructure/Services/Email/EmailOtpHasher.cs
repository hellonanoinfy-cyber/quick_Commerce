namespace FirstCry.Infrastructure.Services.Email;

using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;

/// <summary>HMAC-SHA256 hashing for email OTP values at rest.</summary>
public sealed class EmailOtpHasher
{
    private readonly byte[] _keyBytes;

    public EmailOtpHasher(IConfiguration configuration)
    {
        var secret = configuration["Otp:EmailHashSecret"];
        if (string.IsNullOrWhiteSpace(secret))
        {
            secret = configuration["Jwt:Secret"];
        }

        if (string.IsNullOrWhiteSpace(secret))
        {
            secret = "firstcry-email-otp-dev-only-change-in-production";
        }

        _keyBytes = Encoding.UTF8.GetBytes(secret);
    }

    public string Hash(string otp) =>
        Convert.ToHexString(HMACSHA256.HashData(_keyBytes, Encoding.UTF8.GetBytes(otp)));

    public bool Verify(string otp, string storedHash)
    {
        var computed = Hash(otp);
        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(computed),
            Encoding.UTF8.GetBytes(storedHash));
    }
}
