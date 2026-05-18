using FirstCry.Application.Common.Interfaces;
using FirstCry.API.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace FirstCry.API.Services;

public class ApiNotificationService : INotificationService
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public ApiNotificationService(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(Guid userId, int page = 1, int pageSize = 20)
        => Task.FromResult(Enumerable.Empty<NotificationDto>());

    public Task<IEnumerable<NotificationDto>> GetUnreadNotificationsAsync(Guid userId)
        => Task.FromResult(Enumerable.Empty<NotificationDto>());

    public Task<int> GetUnreadCountAsync(Guid userId) => Task.FromResult(0);

    public Task<bool> MarkAsReadAsync(Guid notificationId) => Task.FromResult(true);

    public Task<bool> MarkAllAsReadAsync(Guid userId) => Task.FromResult(true);

    public Task<bool> DeleteNotificationAsync(Guid notificationId) => Task.FromResult(true);

    public async Task<Guid> SendNotificationAsync(CreateNotificationRequest request)
    {
        await SendToUserAsync(request.UserId, request.Title, request.Body, null);
        return Guid.NewGuid();
    }

    public async Task<bool> SendOrderNotificationAsync(Guid userId, Guid orderId, string title, string body)
    {
        await SendToUserAsync(userId, title, body, new { orderId });
        return true;
    }

    public async Task<bool> SendPaymentNotificationAsync(Guid userId, Guid orderId, string title, string body)
    {
        await SendToUserAsync(userId, title, body, new { orderId });
        return true;
    }

    public Task<bool> SendAdminAlertAsync(string title, string body, string? targetUserId = null)
        => Task.FromResult(true);

    public async Task SendRealTimeNotificationAsync(Guid userId, NotificationDto notification)
    {
        await _hubContext.Clients.User(userId.ToString()).SendAsync("ReceiveNotification", notification);
    }

    public async Task BroadcastToAdminsAsync(NotificationDto notification)
        => await _hubContext.Clients.Group("Admins").SendAsync("ReceiveNotification", notification);

    public async Task<bool> SendToUserAsync(Guid userId, string title, string body, object? metadata = null)
    {
        await _hubContext.Clients.User(userId.ToString()).SendAsync("ReceiveNotification", new
        {
            Title = title,
            Body = body,
            Metadata = metadata,
            Timestamp = DateTime.UtcNow
        });

        return true;
    }

    public async Task BroadcastAsync(string title, string message, object? data = null)
    {
        await _hubContext.Clients.All.SendAsync("ReceiveNotification", new
        {
            Title = title,
            Message = message,
            Data = data,
            Timestamp = DateTime.UtcNow
        });
    }
}
