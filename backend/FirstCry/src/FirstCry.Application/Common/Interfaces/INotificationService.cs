namespace FirstCry.Application.Common.Interfaces;

// ============================================================
// ENHANCED NOTIFICATION SERVICE INTERFACE
// ============================================================

public interface INotificationService
{
    // User notifications
    Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(Guid userId, int page = 1, int pageSize = 20);
    Task<IEnumerable<NotificationDto>> GetUnreadNotificationsAsync(Guid userId);
    Task<int> GetUnreadCountAsync(Guid userId);

    // Notification actions
    Task<bool> MarkAsReadAsync(Guid notificationId);
    Task<bool> MarkAllAsReadAsync(Guid userId);
    Task<bool> DeleteNotificationAsync(Guid notificationId);

    // Send notifications
    Task<Guid> SendNotificationAsync(CreateNotificationRequest request);
    Task<bool> SendOrderNotificationAsync(Guid userId, Guid orderId, string title, string body);
    Task<bool> SendPaymentNotificationAsync(Guid userId, Guid orderId, string title, string body);
    Task<bool> SendAdminAlertAsync(string title, string body, string? targetUserId = null);

    // Real-time
    Task SendRealTimeNotificationAsync(Guid userId, NotificationDto notification);
    Task BroadcastToAdminsAsync(NotificationDto notification);

    // Convenience: send a generic notification (wraps existing methods)
    Task<bool> SendToUserAsync(Guid userId, string title, string body, object? metadata = null);
}

public class NotificationDto
{
    public Guid Id { get; init; }
    public Guid UserId { get; init; }
    public string Type { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string Body { get; init; } = string.Empty;

    public string Status { get; init; } = string.Empty;
    public DateTime? ReadAt { get; init; }
    public bool IsRead => ReadAt.HasValue;

    public Guid? ReferenceId { get; init; }
    public string? ReferenceType { get; init; }
    public string? ReferenceUrl { get; init; }

    public string Priority { get; init; } = "Normal";

    public DateTime CreatedAt { get; init; }
}

public record CreateNotificationRequest(
    Guid UserId,
    string Type,
    string Title,
    string Body,
    string Priority = "Normal",
    Guid? ReferenceId = null,
    string? ReferenceType = null,
    string? ReferenceUrl = null
);