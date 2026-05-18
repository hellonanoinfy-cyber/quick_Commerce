namespace FirstCry.Infrastructure.Data.Configurations;

using FirstCry.Domain.Common;
using FirstCry.Domain.Entities;
using FirstCry.Domain.Entities.Notifications;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

/// <summary>
/// EF Core Fluent API configuration for the Notification entity.
/// Includes global query filter to exclude soft-deleted records.
/// </summary>
public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("Notifications");

        builder.HasKey(n => n.Id);

        // Properties
        builder.Property(n => n.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(n => n.Body)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(n => n.ReferenceId)
            .HasMaxLength(100);

        builder.Property(n => n.ReferenceType)
            .HasMaxLength(50);

        builder.Property(n => n.ReferenceUrl)
            .HasMaxLength(500);

        builder.Property(n => n.PushMessageId)
            .HasMaxLength(100);

        builder.Property(n => n.EmailMessageId)
            .HasMaxLength(100);

        builder.Property(n => n.DeliveryError)
            .HasMaxLength(500);

        builder.Property(n => n.Metadata)
            .HasMaxLength(4000);

        // Enum conversions
        builder.Property(n => n.Type)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(n => n.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(n => n.Priority)
            .HasConversion<string>()
            .HasMaxLength(20);

        // Indexes
        builder.HasIndex(n => n.UserId);
        builder.HasIndex(n => n.Type);
        builder.HasIndex(n => n.Status);
        builder.HasIndex(n => n.CreatedAt);
        builder.HasIndex(n => n.ScheduledAt);
        builder.HasIndex(n => n.ExpiresAt);

        // Relationships
        builder.HasOne(n => n.User)
            .WithMany()
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // NOTE: Notification extends BaseEntity, not AuditableEntity, so it does NOT 
        // have an IsDeleted property. No query filter needed for soft-delete.
        // This entity is not soft-deletable - it's permanently deleted when user is deleted.
    }
}