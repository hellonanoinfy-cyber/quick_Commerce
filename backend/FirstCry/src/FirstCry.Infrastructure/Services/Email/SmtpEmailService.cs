namespace FirstCry.Infrastructure.Services.Email;

using FirstCry.Application.Common.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;

/// <summary>
/// Sends OTP emails via SMTP (Resend: smtp.resend.com). Falls back to demo logging when not configured.
/// </summary>
public sealed class SmtpEmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<SmtpEmailService> _logger;

    public SmtpEmailService(IConfiguration configuration, ILogger<SmtpEmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public bool IsLiveConfigured =>
        !string.IsNullOrWhiteSpace(_configuration["Smtp:Host"])
        && !string.IsNullOrWhiteSpace(_configuration["Smtp:FromEmail"]);

    public async Task<bool> SendLoginOtpAsync(string toEmail, string otp, CancellationToken cancellationToken = default)
    {
        if (!IsLiveConfigured)
        {
            LogDemoOtp(toEmail, otp);
            return true;
        }

        var host = _configuration["Smtp:Host"]!;
        var port = int.TryParse(_configuration["Smtp:Port"], out var p) ? p : 587;
        var username = _configuration["Smtp:Username"] ?? "resend";
        var password = _configuration["Smtp:Password"];
        var fromEmail = _configuration["Smtp:FromEmail"]!;
        var fromName = _configuration["Smtp:FromName"] ?? "MummaXpress";
        var expiryMinutes = int.TryParse(_configuration["Otp:EmailExpiryMinutes"], out var em) ? em : 5;

        var (subject, plain, html) = EmailOtpTemplateBuilder.Build(otp, expiryMinutes);

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(fromName, fromEmail));
        message.To.Add(MailboxAddress.Parse(toEmail));
        message.Subject = subject;

        var body = new BodyBuilder { TextBody = plain, HtmlBody = html };
        message.Body = body.ToMessageBody();

        try
        {
            using var client = new SmtpClient();
            await client.ConnectAsync(host, port, SecureSocketOptions.StartTlsWhenAvailable, cancellationToken);

            if (!string.IsNullOrWhiteSpace(password))
            {
                await client.AuthenticateAsync(username, password, cancellationToken);
            }

            await client.SendAsync(message, cancellationToken);
            await client.DisconnectAsync(true, cancellationToken);

            _logger.LogInformation("Email OTP sent to {Email}", MaskEmail(toEmail));
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email OTP to {Email}", MaskEmail(toEmail));
            return false;
        }
    }

    private void LogDemoOtp(string toEmail, string otp)
    {
        _logger.LogWarning(
            "SMTP not configured — email OTP demo mode for {Email}. Configure Smtp:Host + Smtp:FromEmail (Resend).",
            MaskEmail(toEmail));

        _logger.LogInformation("");
        _logger.LogInformation("═══════════════════════════════════════════════════════════════");
        _logger.LogInformation("                    DEMO EMAIL OTP");
        _logger.LogInformation("═══════════════════════════════════════════════════════════════");
        _logger.LogInformation("  To:   {Email}", toEmail);
        _logger.LogInformation("  OTP:  {Otp}", otp);
        _logger.LogInformation("═══════════════════════════════════════════════════════════════");
        _logger.LogInformation("");
    }

    private static string MaskEmail(string email)
    {
        var at = email.IndexOf('@');
        return at <= 1 ? "***" : $"{email[0]}***{email[at..]}";
    }
}
