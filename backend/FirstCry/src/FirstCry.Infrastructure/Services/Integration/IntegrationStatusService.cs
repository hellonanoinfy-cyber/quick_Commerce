namespace FirstCry.Infrastructure.Services.Integration;

using FirstCry.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;

public class IntegrationStatusService : IIntegrationStatusService
{
    private readonly IConfiguration _configuration;

    public IntegrationStatusService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public IntegrationStatusSnapshot GetStatus()
    {
        return new IntegrationStatusSnapshot(
            BuildMsg91(),
            BuildEmailOtp(),
            BuildRazorpay(),
            BuildCloudinary(),
            BuildRedis(),
            BuildMeilisearch());
    }

    private IntegrationModuleStatus BuildEmailOtp()
    {
        var host = _configuration["Smtp:Host"];
        var from = _configuration["Smtp:FromEmail"];
        var password = _configuration["Smtp:Password"];

        if (string.IsNullOrWhiteSpace(host) || string.IsNullOrWhiteSpace(from))
        {
            return Module(
                "Email OTP (Resend SMTP)",
                "demo",
                false,
                "Email OTP works in demo mode — code printed to API logs. Set Smtp:* for live delivery.",
                "Smtp:Host",
                "Smtp:FromEmail",
                "Smtp:Password");
        }

        var missing = new List<string>();
        if (string.IsNullOrWhiteSpace(password))
        {
            missing.Add("Smtp:Password");
        }

        return Module(
            "Email OTP (Resend SMTP)",
            missing.Count == 0 ? "live" : "demo",
            missing.Count == 0,
            missing.Count == 0
                ? "Live email OTP via SMTP (Resend)."
                : "SMTP host set — add Smtp:Password (Resend API key) for delivery.",
            missing);
    }

    private IntegrationModuleStatus BuildMsg91()
    {
        var authKey = _configuration["Sms:Msg91:AuthKey"];
        var templateId = _configuration["Sms:Msg91:TemplateId"];
        var whatsAppTemplate = _configuration["Sms:Msg91:WhatsAppTemplateName"];
        var whatsAppNumber = _configuration["Sms:Msg91:WhatsAppIntegratedNumber"];

        if (string.IsNullOrWhiteSpace(authKey))
        {
            return Module(
                "MSG91 OTP",
                "demo",
                false,
                "OTP printed to API logs (no SMS/WhatsApp).",
                "Sms:Msg91:AuthKey");
        }

        if (string.IsNullOrWhiteSpace(templateId))
        {
            var missing = new List<string> { "Sms:Msg91:TemplateId" };
            if (string.IsNullOrWhiteSpace(whatsAppTemplate))
            {
                missing.Add("Sms:Msg91:WhatsAppTemplateName");
            }

            if (string.IsNullOrWhiteSpace(whatsAppNumber))
            {
                missing.Add("Sms:Msg91:WhatsAppIntegratedNumber");
            }

            return Module(
                "MSG91 OTP",
                "demo",
                true,
                "Auth key set — SMS/WhatsApp still in demo until templates are configured.",
                missing);
        }

        var whatsAppReady =
            !string.IsNullOrWhiteSpace(whatsAppTemplate) && !string.IsNullOrWhiteSpace(whatsAppNumber);

        return Module(
            "MSG91 OTP",
            "live",
            true,
            whatsAppReady
                ? "Live SMS and WhatsApp OTP."
                : "Live SMS OTP. Add WhatsApp template keys for WhatsApp channel.",
            whatsAppReady ? Array.Empty<string>() : new[] { "Sms:Msg91:WhatsAppTemplateName", "Sms:Msg91:WhatsAppIntegratedNumber" });
    }

    private IntegrationModuleStatus BuildRazorpay()
    {
        var keyId = _configuration["Razorpay:KeyId"];
        var keySecret = _configuration["Razorpay:KeySecret"];
        var webhook = _configuration["Razorpay:WebhookSecret"];

        if (string.IsNullOrWhiteSpace(keyId) || string.IsNullOrWhiteSpace(keySecret))
        {
            return Module(
                "Razorpay",
                "demo",
                false,
                "Demo checkout modal — no real charges.",
                "Razorpay:KeyId",
                "Razorpay:KeySecret");
        }

        var missing = new List<string>();
        if (string.IsNullOrWhiteSpace(webhook))
        {
            missing.Add("Razorpay:WebhookSecret");
        }

        return Module(
            "Razorpay",
            "live",
            true,
            missing.Count == 0
                ? "Live Razorpay checkout enabled."
                : "Live checkout enabled. Set webhook secret and register POST /api/v1/payments/webhook in Razorpay dashboard.",
            missing);
    }

    private IntegrationModuleStatus BuildCloudinary()
    {
        var cloud = _configuration["Cloudinary:CloudName"];
        var key = _configuration["Cloudinary:ApiKey"];
        var secret = _configuration["Cloudinary:ApiSecret"];

        if (string.IsNullOrWhiteSpace(cloud) || string.IsNullOrWhiteSpace(key) || string.IsNullOrWhiteSpace(secret))
        {
            return Module(
                "Cloudinary",
                "fallback",
                false,
                "Product images stored locally on the API server.",
                "Cloudinary:CloudName",
                "Cloudinary:ApiKey",
                "Cloudinary:ApiSecret");
        }

        return Module("Cloudinary", "live", true, "Cloud image uploads enabled.", Array.Empty<string>());
    }

    private IntegrationModuleStatus BuildRedis()
    {
        var redis = _configuration.GetConnectionString("Redis");
        if (string.IsNullOrWhiteSpace(redis))
        {
            return Module(
                "Redis",
                "optional",
                false,
                "In-memory OTP and cache (fine for single-server beta).",
                "ConnectionStrings:Redis");
        }

        return Module("Redis", "configured", true, "Redis connection string set.", Array.Empty<string>());
    }

    private IntegrationModuleStatus BuildMeilisearch()
    {
        var url = _configuration["Meilisearch:Url"];
        var key = _configuration["Meilisearch:ApiKey"];

        if (string.IsNullOrWhiteSpace(url))
        {
            return Module(
                "Meilisearch",
                "not_used",
                false,
                "Search uses SQL Server (no Meilisearch required for beta).",
                "Meilisearch:Url");
        }

        return Module(
            "Meilisearch",
            string.IsNullOrWhiteSpace(key) ? "optional" : "configured",
            !string.IsNullOrWhiteSpace(key),
            "Meilisearch URL set — wire indexing when you scale search.",
            string.IsNullOrWhiteSpace(key) ? new[] { "Meilisearch:ApiKey" } : Array.Empty<string>());
    }

    private static IntegrationModuleStatus Module(
        string name,
        string mode,
        bool isConfigured,
        string summary,
        params string[] missingKeys) =>
        new(name, mode, isConfigured, summary, missingKeys);

    private static IntegrationModuleStatus Module(
        string name,
        string mode,
        bool isConfigured,
        string summary,
        IReadOnlyList<string> missingKeys) =>
        new(name, mode, isConfigured, summary, missingKeys);
}
