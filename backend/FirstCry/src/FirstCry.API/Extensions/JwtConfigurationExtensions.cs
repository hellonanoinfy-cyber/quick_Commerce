namespace FirstCry.API.Extensions;

using Serilog;

public static class JwtConfigurationExtensions
{
    private static readonly string[] WeakSecretMarkers =
    [
        "CHANGE_THIS",
        "DevOnly",
        "NotForProduction",
        "your_secret",
        "replace_me"
    ];

    public static void ValidateJwtConfiguration(IConfiguration configuration, IHostEnvironment environment)
    {
        var secret = configuration["Jwt:Secret"];

        if (string.IsNullOrWhiteSpace(secret))
        {
            throw new InvalidOperationException(
                "JWT Secret is required. Set Jwt__Secret or Jwt:Secret via environment variables.");
        }

        if (secret.Length < 32)
        {
            throw new InvalidOperationException("JWT Secret must be at least 32 characters.");
        }

        if (!environment.IsDevelopment())
        {
            foreach (var marker in WeakSecretMarkers)
            {
                if (secret.Contains(marker, StringComparison.OrdinalIgnoreCase))
                {
                    throw new InvalidOperationException(
                        "JWT Secret appears to be a placeholder. Use a strong random secret in production.");
                }
            }
        }
        else if (WeakSecretMarkers.Any(m => secret.Contains(m, StringComparison.OrdinalIgnoreCase)))
        {
            Log.Warning("Using a development JWT secret — never use this in production.");
        }
    }
}
