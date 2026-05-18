namespace FirstCry.Application.Common.Interfaces;

public interface ISmsService
{
    Task<bool> SendSmsAsync(string phoneNumber, string message);

    /// <summary>Sends OTP via WhatsApp (MSG91 WhatsApp template / demo console).</summary>
    Task<bool> SendWhatsAppAsync(string phoneNumber, string message);
}
