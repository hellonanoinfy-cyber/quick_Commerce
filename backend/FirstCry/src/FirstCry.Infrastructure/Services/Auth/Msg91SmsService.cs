namespace FirstCry.Infrastructure.Services.Auth;

using System.Net.Http.Headers;
using FirstCry.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

/// <summary>
/// SMS Service supporting both MSG91 production and Demo modes.
/// 
/// Mode Selection:
/// - If Msg91:AuthKey is empty → logs to console only (Dev-only)
/// - If Msg91:AuthKey is set but Msg91:TemplateId is empty → DEMO MODE
///   (prints OTP to console AND backend logs)
/// - If both are set → Production MSG91 API (real SMS)
/// </summary>
public class Msg91SmsService : ISmsService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;
    private readonly ILogger<Msg91SmsService> _logger;

    private const string Msg91OtpUrl = "https://api.msg91.com/api/v5/otp";
    private const string Msg91WhatsAppOtpUrl = "https://api.msg91.com/api/v5/whatsapp/whatsapp-otp";

    public Msg91SmsService(HttpClient httpClient, IConfiguration config, ILogger<Msg91SmsService> logger)
    {
        _httpClient = httpClient;
        _config = config;
        _logger = logger;
    }

    public Task<bool> SendWhatsAppAsync(string phoneNumber, string message)
    {
        var authKey = _config["Sms:Msg91:AuthKey"];
        var templateName = _config["Sms:Msg91:WhatsAppTemplateName"];
        var integratedNumber = _config["Sms:Msg91:WhatsAppIntegratedNumber"];

        if (string.IsNullOrWhiteSpace(authKey)
            || string.IsNullOrWhiteSpace(templateName)
            || string.IsNullOrWhiteSpace(integratedNumber))
        {
            _logger.LogWarning(
                "MSG91 WhatsApp not fully configured — using demo mode (console). Set Sms:Msg91:WhatsAppTemplateName and WhatsAppIntegratedNumber.");
            return SendDemoWhatsAppAsync(phoneNumber, message);
        }

        return SendProductionWhatsAppAsync(phoneNumber, message, authKey!, templateName!, integratedNumber!);
    }

    public async Task<bool> SendSmsAsync(string phoneNumber, string message)
    {
        var authKey = _config["Sms:Msg91:AuthKey"];
        var templateId = _config["Sms:Msg91:TemplateId"];

        // Check for demo mode: AuthKey exists but TemplateId is missing
        if (!string.IsNullOrWhiteSpace(authKey) && string.IsNullOrWhiteSpace(templateId))
        {
            return await SendDemoSmsAsync(phoneNumber, message, authKey);
        }

        // Full production mode: both AuthKey and TemplateId required
        if (string.IsNullOrWhiteSpace(authKey) || string.IsNullOrWhiteSpace(templateId))
        {
            _logger.LogWarning("MSG91 AuthKey or TemplateId not configured — using demo mode.");
            return await SendDemoSmsAsync(phoneNumber, message, null);
        }

        // Production SMS via MSG91 API
        return await SendProductionSmsAsync(phoneNumber, message, authKey!, templateId!);
    }

    /// <summary>
    /// Demo mode: Print OTP to console/logs only (no real SMS)
    /// </summary>
    private Task<bool> SendDemoSmsAsync(string phoneNumber, string message, string? authKey)
    {
        var otp = ExtractOtp(message);
        var mobile = NormalizePhone(phoneNumber);

        // Print prominently to backend console/terminal
        _logger.LogInformation("");
        _logger.LogInformation("═══════════════════════════════════════════════════════════════");
        _logger.LogInformation("                    📱 DEMO OTP MESSAGE 📱");
        _logger.LogInformation("═══════════════════════════════════════════════════════════════");
        _logger.LogInformation("  📞 To:       {PhoneNumber}", MaskPhone(mobile));
        _logger.LogInformation("  🔐 OTP:      {Otp}", otp);
        _logger.LogInformation("  💬 Message:  {Message}", message);
        _logger.LogInformation("═══════════════════════════════════════════════════════════════");
        _logger.LogInformation("");

        // Also log with masked phone for server logs
        _logger.LogInformation("[DEMO MODE] OTP sent to {MaskedPhone}. Check terminal for OTP.", MaskPhone(mobile));

        return Task.FromResult(true);
    }

    private Task<bool> SendDemoWhatsAppAsync(string phoneNumber, string message)
    {
        var otp = ExtractOtp(message);
        var mobile = NormalizePhone(phoneNumber);

        _logger.LogInformation("");
        _logger.LogInformation("═══════════════════════════════════════════════════════════════");
        _logger.LogInformation("                 📱 DEMO WHATSAPP OTP 📱");
        _logger.LogInformation("═══════════════════════════════════════════════════════════════");
        _logger.LogInformation("  📞 To:       {PhoneNumber}", MaskPhone(mobile));
        _logger.LogInformation("  🔐 OTP:      {Otp}", otp);
        _logger.LogInformation("  💬 Message:  {Message}", message);
        _logger.LogInformation("═══════════════════════════════════════════════════════════════");
        _logger.LogInformation("");

        return Task.FromResult(true);
    }

    /// <summary>
    /// Production: MSG91 WhatsApp OTP (template must include OTP variable).
    /// </summary>
    private async Task<bool> SendProductionWhatsAppAsync(
        string phoneNumber,
        string message,
        string authKey,
        string templateName,
        string integratedNumber)
    {
        var otp = ExtractOtp(message);
        if (string.IsNullOrEmpty(otp))
        {
            _logger.LogError("Could not extract OTP from message: {Message}", message);
            return false;
        }

        var mobile = NormalizePhone(phoneNumber);
        var integrated = NormalizePhone(integratedNumber);

        var payload = new
        {
            integrated_number = integrated,
            content_type = "template",
            payload = new
            {
                messaging_product = "whatsapp",
                type = "template",
                template = new
                {
                    name = templateName,
                    language = new { code = "en" },
                    to_and_components = new[]
                    {
                        new
                        {
                            to = new[] { mobile },
                            components = new
                            {
                                body_1 = new { type = "text", value = otp }
                            }
                        }
                    }
                }
            }
        };

        var json = System.Text.Json.JsonSerializer.Serialize(payload);
        var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");

        var request = new HttpRequestMessage(HttpMethod.Post, Msg91WhatsAppOtpUrl);
        request.Headers.Add("authkey", authKey);
        request.Content = content;

        try
        {
            var response = await _httpClient.SendAsync(request);
            var body = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation(
                    "WhatsApp OTP sent to {Mobile} via MSG91. Response: {Body}",
                    MaskPhone(mobile),
                    body);
                return true;
            }

            _logger.LogError(
                "MSG91 WhatsApp Error. Status: {Status}. Body: {Body}. Mobile: {Mobile}",
                (int)response.StatusCode,
                body,
                MaskPhone(mobile));
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send WhatsApp OTP to {Mobile}", MaskPhone(mobile));
            return false;
        }
    }

    /// <summary>
    /// Production mode: Send real SMS via MSG91 API
    /// </summary>
    private async Task<bool> SendProductionSmsAsync(string phoneNumber, string message, string authKey, string templateId)
    {
        var otp = ExtractOtp(message);
        if (string.IsNullOrEmpty(otp))
        {
            _logger.LogError("Could not extract OTP from message: {Message}", message);
            return false;
        }

        var mobile = NormalizePhone(phoneNumber);

        var payload = new
        {
            template_id = templateId,
            mobile = mobile,
            otp = otp
        };

        var json = System.Text.Json.JsonSerializer.Serialize(payload);
        var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");

        var request = new HttpRequestMessage(HttpMethod.Post, Msg91OtpUrl);
        request.Headers.Add("authkey", authKey);
        request.Content = content;

        try
        {
            var response = await _httpClient.SendAsync(request);
            var body = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode && body.Contains("\"type\":\"success\""))
            {
                _logger.LogInformation("OTP sent to {Mobile} via MSG91. Response: {Body}", MaskPhone(mobile), body);
                return true;
            }

            _logger.LogError("MSG91 Error. Status: {Status}. Body: {Body}. Mobile: {Mobile}",
                (int)response.StatusCode, body, MaskPhone(mobile));
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send OTP to {Mobile} via MSG91", MaskPhone(mobile));
            return false;
        }
    }

    // ── Helpers ────────────────────────────────────────────────

    /// <summary>Extracts 6-digit OTP from the SMS message string.</summary>
    private static string ExtractOtp(string message)
    {
        var match = System.Text.RegularExpressions.Regex.Match(message, @"\b\d{6}\b");
        return match.Success ? match.Value : string.Empty;
    }

    /// <summary>Normalizes to MSG91 format: 91XXXXXXXXXX (India only, for now).</summary>
    private static string NormalizePhone(string phone)
    {
        var digits = System.Text.RegularExpressions.Regex.Replace(phone, @"\D", "");
        // If already has country code (12 digits starting with 91)
        if (digits.Length == 12 && digits.StartsWith("91")) return digits;
        // If 10-digit Indian number, prepend 91
        if (digits.Length == 10) return "91" + digits;
        return digits;
    }

    private static string MaskPhone(string phone) =>
        phone.Length > 4 ? new string('*', phone.Length - 4) + phone[^4..] : phone;
}
