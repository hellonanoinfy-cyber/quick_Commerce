namespace FirstCry.Application.Common;

/// <summary>
/// Delivery channel for one-time passwords.
/// </summary>
public static class OtpChannel
{
    public const string Sms = "sms";
    public const string WhatsApp = "whatsapp";

    public static string Normalize(string? channel)
    {
        if (string.IsNullOrWhiteSpace(channel))
        {
            return Sms;
        }

        return channel.Trim().ToLowerInvariant() switch
        {
            "whatsapp" or "wa" => WhatsApp,
            _ => Sms
        };
    }

    public static bool IsWhatsApp(string? channel) =>
        Normalize(channel) == WhatsApp;
}
