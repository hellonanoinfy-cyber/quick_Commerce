namespace FirstCry.Infrastructure.Data.Configurations;

using FirstCry.Domain.Entities.Warehouse;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

/// <summary>
/// EF Core Fluent API configuration for the WarehouseTransfer entity.
/// Handles the complex relationships where one transfer references two warehouses:
/// - SourceWarehouse (where inventory leaves)
/// - DestinationWarehouse (where inventory arrives)
/// Uses DeleteBehavior.Restrict on both to prevent cascade cycles.
/// </summary>
public class WarehouseTransferConfiguration : IEntityTypeConfiguration<WarehouseTransfer>
{
    public void Configure(EntityTypeBuilder<WarehouseTransfer> builder)
    {
        builder.ToTable("WarehouseTransfers");

        builder.HasKey(wt => wt.Id);

        // Basic Info
        builder.Property(wt => wt.TransferNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(wt => wt.Status)
            .HasConversion<string>()
            .HasMaxLength(20)
            .HasDefaultValue(WarehouseTransferStatus.Pending);

        builder.Property(wt => wt.Notes)
            .HasMaxLength(1000);

        builder.Property(wt => wt.ApprovedBy)
            .HasMaxLength(150);

        builder.Property(wt => wt.ShippedBy)
            .HasMaxLength(150);

        builder.Property(wt => wt.ReceivedBy)
            .HasMaxLength(150);

        builder.Property(wt => wt.TrackingNumber)
            .HasMaxLength(100);

        // Indexes
        builder.HasIndex(wt => wt.TransferNumber).IsUnique();
        builder.HasIndex(wt => wt.Status);
        builder.HasIndex(wt => wt.SourceWarehouseId);
        builder.HasIndex(wt => wt.DestinationWarehouseId);
        builder.HasIndex(wt => new { wt.SourceWarehouseId, wt.Status });
        builder.HasIndex(wt => new { wt.DestinationWarehouseId, wt.Status });

        // ================================================================
        // RELATIONSHIP 1: SourceWarehouse → OutgoingTransfers
        // A warehouse can have MANY transfers as the source (outgoing).
        // Each WarehouseTransfer has EXACTLY ONE source warehouse.
        // Using Restrict to prevent cascade delete cycles with destination.
        // ================================================================
        builder.HasOne(wt => wt.SourceWarehouse)
            .WithMany(w => w.OutgoingTransfers)
            .HasForeignKey(wt => wt.SourceWarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        // ================================================================
        // RELATIONSHIP 2: DestinationWarehouse → IncomingTransfers
        // A warehouse can have MANY transfers as the destination (incoming).
        // Each WarehouseTransfer has EXACTLY ONE destination warehouse.
        // Using Restrict to prevent cascade delete cycles with source.
        // ================================================================
        builder.HasOne(wt => wt.DestinationWarehouse)
            .WithMany(w => w.IncomingTransfers)
            .HasForeignKey(wt => wt.DestinationWarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        // ================================================================
        // RELATIONSHIP 3: Transfer → TransferItems
        // A transfer has MANY items (products being transferred).
        // ================================================================
        builder.HasMany(wt => wt.Items)
            .WithOne(wti => wti.Transfer)
            .HasForeignKey(wti => wti.TransferId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

/// <summary>
/// EF Core Fluent API configuration for the WarehouseTransferItem entity.
/// Tracks individual product items within a transfer.
/// </summary>
public class WarehouseTransferItemConfiguration : IEntityTypeConfiguration<WarehouseTransferItem>
{
    public void Configure(EntityTypeBuilder<WarehouseTransferItem> builder)
    {
        builder.ToTable("WarehouseTransferItems");

        builder.HasKey(wti => wti.Id);

        builder.Property(wti => wti.Quantity)
            .IsRequired();

        builder.Property(wti => wti.ReceivedQuantity)
            .HasDefaultValue(0);

        // Indexes
        builder.HasIndex(wti => wti.TransferId);
        builder.HasIndex(wti => wti.ProductId);
        builder.HasIndex(wti => new { wti.TransferId, wti.ProductId });

        // Relationships
        builder.HasOne(wti => wti.Transfer)
            .WithMany(wt => wt.Items)
            .HasForeignKey(wti => wti.TransferId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(wti => wti.Product)
            .WithMany()
            .HasForeignKey(wti => wti.ProductId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}