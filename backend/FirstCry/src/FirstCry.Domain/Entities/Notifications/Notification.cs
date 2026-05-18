namespace FirstCry.Domain.Entities.Notifications;

using FirstCry.Domain.Common;

// ============================================================
// NOTIFICATION SYSTEM ENTITIES
// ============================================================

/// <summary>
/// Represents a notification sent to a user
/// </summary>
public class Notification : BaseEntity
{
    public Guid? UserId { get; private set; }
    public NotificationType Type { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string Body { get; private set; } = string.Empty;

    // Delivery status
    public NotificationStatus Status { get; private set; } = NotificationStatus.Pending;
    public DateTime? ReadAt { get; private set; }

    // Channels
    public bool IsPushEnabled { get; private set; } = true;
    public bool IsEmailEnabled { get; private set; }
    public bool IsSmsEnabled { get; private set; }

    // Delivery tracking
    public DateTime? PushedAt { get; private set; }
    public DateTime? EmailedAt { get; private set; }
    public DateTime? SmsSentAt { get; private set; }

    public string? PushMessageId { get; private set; }
    public string? EmailMessageId { get; private set; }

    // Reference to related entity
    public Guid? ReferenceId { get; private set; }
    public string? ReferenceType { get; private set; } // Order, Product, etc.
    public string? ReferenceUrl { get; private set; }

    // Priority and metadata
    public NotificationPriority Priority { get; private set; } = NotificationPriority.Normal;
    public string? Metadata { get; private set; } // JSON for extra data

    // Scheduling (for delayed notifications)
    public DateTime? ScheduledAt { get; private set; }

    // Delivery failure tracking
    public string? DeliveryError { get; private set; }
    public int RetryCount { get; private set; }

    // Expires at (auto-delete old notifications)
    public DateTime? ExpiresAt { get; private set; }

    public virtual User? User { get; private set; }

    protected Notification() { }

    public static Notification Create(
        Guid userId,
        NotificationType type,
        string title,
        string body,
        NotificationPriority priority = NotificationPriority.Normal)
    {
        return new Notification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = type,
            Title = title,
            Body = body,
            Priority = priority,
            Status = NotificationStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };
    }

    // Factory methods for common notification types
    public static Notification ForOrder(Guid userId, Guid orderId, string title, string body)
    {
        return Create(userId, NotificationType.OrderUpdate, title, body)
            .WithReference(orderId, "Order", $"/orders/{orderId}");
    }

    public static Notification ForPayment(Guid userId, Guid orderId, string title, string body)
    {
        return Create(userId, NotificationType.PaymentUpdate, title, body, NotificationPriority.High)
            .WithReference(orderId, "Order");
    }

    public static Notification ForAdmin(string title, string body, NotificationPriority priority = NotificationPriority.High)
    {
        return new Notification
        {
            Id = Guid.NewGuid(),
            UserId = Guid.Empty, // Admin notifications don't have specific user
            Type = NotificationType.SystemAlert,
            Title = title,
            Body = body,
            Priority = priority,
            Status = NotificationStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };
    }

    public Notification WithReference(Guid referenceId, string referenceType, string? referenceUrl = null)
    {
        ReferenceId = referenceId;
        ReferenceType = referenceType;
        ReferenceUrl = referenceUrl;
        return this;
    }

    public Notification WithScheduling(DateTime scheduledAt)
    {
        ScheduledAt = scheduledAt;
        return this;
    }

    public Notification WithExpiry(int days = 30)
    {
        ExpiresAt = DateTime.UtcNow.AddDays(days);
        return this;
    }

    public void MarkAsRead()
    {
        Status = NotificationStatus.Read;
        ReadAt = DateTime.UtcNow;
    }

    public void MarkAsPushed(string? pushMessageId = null)
    {
        Status = NotificationStatus.Delivered;
        PushedAt = DateTime.UtcNow;
        PushMessageId = pushMessageId;
    }

    public void MarkAsFailed(string error)
    {
        Status = NotificationStatus.Failed;
        DeliveryError = error;
        RetryCount++;
    }

    public void MarkAsReadEmail()
    {
        EmailedAt = DateTime.UtcNow;
    }

    public void MarkAsReadSms()
    {
        SmsSentAt = DateTime.UtcNow;
    }
}

public enum NotificationType
{
    OrderUpdate = 0,
    PaymentUpdate = 1,
    ShippingUpdate = 2,
    ReturnUpdate = 3,
    ReviewReminder = 4,
    Promotional = 5,
    LowStockAlert = 6,
    AdminAlert = 7,
    SystemAlert = 8
}

public enum NotificationStatus
{
    Pending = 0,
    Queued = 1,
    Delivered = 2,
    Read = 3,
    Failed = 4
}

public enum NotificationPriority
{
    Low = 0,
    Normal = 1,
    High = 2,
    Urgent = 3
}

/// <summary>
/// Template for reusable notifications
/// </summary>
public class NotificationTemplate : BaseEntity
{
    public NotificationType Type { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string TitleTemplate { get; private set; } = string.Empty;
    public string BodyTemplate { get; private set; } = string.Empty;

    public bool IsActive { get; private set; } = true;
    public int Priority { get; private set; } = 1;

    // Channels
    public bool PushEnabled { get; private set; } = true;
    public bool EmailEnabled { get; private set; }
    public bool SmsEnabled { get; private set; }

    // Scheduling preferences
    public bool SendImmediately { get; private set; } = true;
    public int? DelayMinutes { get; private set; }

    // Usage tracking
    public int UsageCount { get; private set; }
    public DateTime? LastUsedAt { get; private set; }

    protected NotificationTemplate() { }

    public static NotificationTemplate Create(
        NotificationType type,
        string name,
        string titleTemplate,
        string bodyTemplate)
    {
        return new NotificationTemplate
        {
            Id = Guid.NewGuid(),
            Type = type,
            Name = name,
            TitleTemplate = titleTemplate,
            BodyTemplate = bodyTemplate,
            CreatedAt = DateTime.UtcNow
        };
    }

    public string RenderTitle(Dictionary<string, string> placeholders)
    {
        var result = TitleTemplate;
        foreach (var kvp in placeholders)
        {
            result = result.Replace($"{{{{{kvp.Key}}}}}", kvp.Value);
        }
        return result;
    }

    public string RenderBody(Dictionary<string, string> placeholders)
    {
        var result = BodyTemplate;
        foreach (var kvp in placeholders)
        {
            result = result.Replace($"{{{{{kvp.Key}}}}}", kvp.Value);
        }
        return result;
    }

    public void RecordUsage()
    {
        UsageCount++;
        LastUsedAt = DateTime.UtcNow;
    }
}