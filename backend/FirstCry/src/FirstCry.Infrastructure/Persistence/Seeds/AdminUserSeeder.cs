namespace FirstCry.Infrastructure.Persistence.Seeds;

using FirstCry.Domain.Entities;
using FirstCry.Infrastructure.Data.Context;
using Microsoft.EntityFrameworkCore;

/// <summary>
/// Seeds admin users from the <c>ADMIN_PHONE_NUMBERS</c> environment variable
/// (comma-separated list, e.g. "+919876543210,+919876500000"). Falls back to a
/// single dev placeholder when nothing is configured. No personal phone numbers
/// are hard-coded in source.
/// </summary>
public class AdminUserSeeder
{
    private const string DefaultDevAdminPhone = "+919876543210";

    private const string AdminName = "Admin User";
    private const string AdminEmail = "admin@mummaxpress.local";

    /// <summary>Reads admin phones from env; safe placeholder if missing.</summary>
    private static IEnumerable<string> ResolveAdminPhoneNumbers()
    {
        var fromEnv = Environment.GetEnvironmentVariable("ADMIN_PHONE_NUMBERS");
        if (!string.IsNullOrWhiteSpace(fromEnv))
        {
            return fromEnv
                .Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(p => p.Trim())
                .Where(p => p.Length > 0);
        }

        return new[] { DefaultDevAdminPhone };
    }

    /// <summary>
    /// Normalizes phone number to E.164 format for consistent storage.
    /// Accepts 10-digit, 11-digit (with leading 0), or 12-digit (with country code).
    /// </summary>
    private static string NormalizePhoneNumber(string phoneNumber)
    {
        // Remove all non-digit characters
        var digitsOnly = new string(phoneNumber.Where(char.IsDigit).ToArray());

        // If already 12 digits starting with 91, return as-is with +
        if (digitsOnly.Length == 12 && digitsOnly.StartsWith("91"))
        {
            return "+" + digitsOnly;
        }

        // If 10 digits, assume Indian number and add +91
        if (digitsOnly.Length == 10)
        {
            return "+91" + digitsOnly;
        }

        // If 11 digits starting with 0, remove leading 0 and add +91
        if (digitsOnly.Length == 11 && digitsOnly.StartsWith("0"))
        {
            return "+91" + digitsOnly[1..];
        }

        // Otherwise return as-is
        return phoneNumber.StartsWith("+") ? phoneNumber : "+" + digitsOnly;
    }

    public static async Task SeedAsync(ApplicationDbContext context)
    {
        var normalizedPhones = ResolveAdminPhoneNumbers()
            .Select(NormalizePhoneNumber)
            .Distinct()
            .ToList();

        foreach (var phoneNumber in normalizedPhones)
        {
            // Check if admin user already exists (case-insensitive check for normalized phones)
            var adminExists = await context.Users
                .IgnoreQueryFilters()
                .AnyAsync(u => u.PhoneNumber == phoneNumber && u.Role == "Admin");

            if (adminExists)
            {
                Console.WriteLine($"Admin already exists: {phoneNumber}");
                continue; // Admin already seeded
            }

            // Create admin user
            var adminUser = new User
            {
                PhoneNumber = phoneNumber,
                Name = AdminName,
                Email = AdminEmail,
                Role = "Admin", // Admin role set here
                IsGuest = false,
                ProfileCompleted = true,
                CreatedAt = DateTime.UtcNow
            };

            await context.Users.AddAsync(adminUser);
            await context.SaveChangesAsync();

            Console.WriteLine($"Admin user seeded!");
            Console.WriteLine($"   Phone: {phoneNumber}");
            Console.WriteLine($"   Role: Admin");
        }

        Console.WriteLine($"Total admin users configured: {normalizedPhones.Count}");
    }
}