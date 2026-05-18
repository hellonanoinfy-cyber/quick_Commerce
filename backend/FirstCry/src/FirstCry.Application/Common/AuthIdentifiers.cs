namespace FirstCry.Application.Common;

using System.Text.RegularExpressions;

/// <summary>Normalization helpers for auth identifiers (phone, email).</summary>
public static partial class AuthIdentifiers
{
    public static string NormalizeEmail(string email) =>
        email.Trim().ToLowerInvariant();

    /// <summary>Indian mobile: 10 digits (strips +91 / 91 prefix).</summary>
    public static string NormalizePhoneToTenDigits(string phone)
    {
        var digits = DigitsOnly().Replace(phone, string.Empty);
        if (digits.Length == 12 && digits.StartsWith("91", StringComparison.Ordinal))
        {
            return digits[2..];
        }

        if (digits.Length == 11 && digits.StartsWith('0'))
        {
            return digits[1..];
        }

        return digits;
    }

    public static bool IsValidTenDigitIndianPhone(string phone)
    {
        var ten = NormalizePhoneToTenDigits(phone);
        return ten.Length == 10 && ten.All(char.IsDigit);
    }

    public static string MaskEmail(string email)
    {
        var at = email.IndexOf('@');
        if (at <= 1)
        {
            return "***";
        }

        return $"{email[0]}***{email[at..]}";
    }

    [GeneratedRegex(@"\D")]
    private static partial Regex DigitsOnly();
}
