namespace FirstCry.Infrastructure.Services.Notifications;

using FirstCry.Application.Common.Interfaces;
using FirstCry.Domain.Entities.Notifications;
using FirstCry.Infrastructure.Data.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

// ============================================================
// Infrastructure NotificationService
// Handles DB persistence + admin alerts.
// Real-time SignalR delivery is handled by ApiNotificationService
// in the API layer (which has access to IHubContext).
// ============================================================

public class NotificationService : INotificationService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        ApplicationDbContext context,
        ILogger<NotificationService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(Guid userId, int page = 1, int pageSize = 20)
    {
        return await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(n => MapToDto(n))
            .ToListAsync();
    }

    public async Task<IEnumerable<NotificationDto>> GetUnreadNotificationsAsync(Guid userId)
    {
        return await _context.Notifications
            .Where(n => n.UserId == userId && n.Status != NotificationStatus.Read)
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .Select(n => MapToDto(n))
            .ToListAsync();
    }

    public async Task<int> GetUnreadCountAsync(Guid userId)
    {
        return await _context.Notifications
            .CountAsync(n => n.UserId == userId && n.Status != NotificationStatus.Read);
    }

    public async Task<bool> MarkAsReadAsync(Guid notificationId)
    {
        var notification = await _context.Notifications.FindAsync(notificationId);
        if (notification == null) return false;

        notification.MarkAsRead();
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> MarkAllAsReadAsync(Guid userId)
    {
        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId && n.Status != NotificationStatus.Read)
            .ToListAsync();

        foreach (var notification in notifications)
        {
            notification.MarkAsRead();
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteNotificationAsync(Guid notificationId)
    {
        var notification = await _context.Notifications.FindAsync(notificationId);
        if (notification == null) return false;

        _context.Notifications.Remove(notification);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<Guid> SendNotificationAsync(CreateNotificationRequest request)
    {
        var notification = Notification.Create(
            request.UserId,
            Enum.Parse<NotificationType>(request.Type, true),
            request.Title,
            request.Body,
            Enum.Parse<NotificationPriority>(request.Priority, true));

        if (request.ReferenceId.HasValue)
            notification.WithReference(request.ReferenceId.Value, request.ReferenceType ?? "", request.ReferenceUrl);

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Persisted notification for user {UserId}: {Title}", request.UserId, request.Title);
        return notification.Id;
    }

    public async Task<bool> SendOrderNotificationAsync(Guid userId, Guid orderId, string title, string body)
    {
        var request = new CreateNotificationRequest(
            userId,
            "OrderUpdate",
            title,
            body,
            "Normal",
            orderId,
            "Order",
            $"/orders/{orderId}");

        await SendNotificationAsync(request);
        return true;
    }

    public async Task<bool> SendPaymentNotificationAsync(Guid userId, Guid orderId, string title, string body)
    {
        var request = new CreateNotificationRequest(
            userId,
            "PaymentUpdate",
            title,
            body,
            "High",
            orderId,
            "Order");

        await SendNotificationAsync(request);
        return true;
    }

    public async Task<bool> SendAdminAlertAsync(string title, string body, string? targetUserId = null)
    {
        var adminUserIds = await _context.Users
            .Where(u => u.Role == "Admin")
            .Select(u => u.Id)
            .ToListAsync();

        foreach (var adminId in adminUserIds)
        {
            var request = new CreateNotificationRequest(
                adminId,
                "AdminAlert",
                title,
                body,
                "High");

            await SendNotificationAsync(request);
        }

        return true;
    }

    // Real-time delivery via SignalR is NOT available in Infrastructure.
    // ApiNotificationService in the API layer overrides this to send via SignalR.
    public Task SendRealTimeNotificationAsync(Guid userId, NotificationDto notification)
    {
        _logger.LogDebug("Real-time SignalR delivery not available in Infrastructure layer — skipping for user {UserId}", userId);
        return Task.CompletedTask;
    }

    public Task BroadcastToAdminsAsync(NotificationDto notification)
    {
        _logger.LogDebug("BroadcastToAdminsAsync SignalR not available in Infrastructure layer");
        return Task.CompletedTask;
    }

    public async Task<bool> SendToUserAsync(Guid userId, string title, string body, object? metadata = null)
    {
        var request = new CreateNotificationRequest(
            UserId: userId,
            Type: "Order",
            Title: title,
            Body: body
        );
        await SendNotificationAsync(request);
        return true;
    }

    private NotificationDto MapToDto(Notification notification)
    {
        return new NotificationDto
        {
            Id = notification.Id,
            UserId = notification.UserId ?? Guid.Empty,
            Type = notification.Type.ToString(),
            Title = notification.Title,
            Body = notification.Body,
            Status = notification.Status.ToString(),
            ReadAt = notification.ReadAt,
            ReferenceId = notification.ReferenceId,
            ReferenceType = notification.ReferenceType,
            ReferenceUrl = notification.ReferenceUrl,
            Priority = notification.Priority.ToString(),
            CreatedAt = notification.CreatedAt
        };
    }
}