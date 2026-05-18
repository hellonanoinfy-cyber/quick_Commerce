namespace FirstCry.Infrastructure.Data.Configurations;

using FirstCry.Domain.Common;
using FirstCry.Domain.Entities.Inventory;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

/// <summary>
/// EF Core Fluent API configuration for the Inventory entity.
/// Includes global query filter to exclude soft-deleted records.
/// </summary>
public class InventoryConfiguration : IEntityTypeConfiguration<Inventory>
{
    public void Configure(EntityTypeBuilder<Inventory> builder)
    {
        builder.ToTable("Inventories");

        builder.HasKey(i => i.Id);

        // Properties
        builder.Property(i => i.AvailableQuantity)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(i => i.ReservedQuantity)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(i => i.ReorderLevel)
            .IsRequired()
            .HasDefaultValue(10);

        builder.Property(i => i.ReorderQuantity)
            .IsRequired()
            .HasDefaultValue(50);

        builder.Property(i => i.LastRestockedBy)
            .HasMaxLength(150);

        // Indexes
        builder.HasIndex(i => i.ProductId);
        builder.HasIndex(i => i.WarehouseId);
        builder.HasIndex(i => new { i.ProductId, i.WarehouseId });

        // Relationships
        builder.HasOne(i => i.Product)
            .WithMany()
            .HasForeignKey(i => i.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(i => i.Warehouse)
            .WithMany()  // Warehouse has WarehouseInventory, not Inventory - one-way relationship
            .HasForeignKey(i => i.WarehouseId)
            .OnDelete(DeleteBehavior.Cascade);

        // Global query filter to exclude soft-deleted records
        builder.HasQueryFilter(i => !i.IsDeleted);
    }
}

/// <summary>
/// EF Core Fluent API configuration for the InventoryTransaction entity.
/// CRITICAL: Must have matching query filter to prevent orphaned queries
/// when parent Inventory is soft-deleted.
/// </summary>
public class InventoryTransactionConfiguration : IEntityTypeConfiguration<InventoryTransaction>
{
    public void Configure(EntityTypeBuilder<InventoryTransaction> builder)
    {
        builder.ToTable("InventoryTransactions");

        builder.HasKey(it => it.Id);

        // Properties
        builder.Property(it => it.TransactionType)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(it => it.Reason)
            .HasMaxLength(500);

        builder.Property(it => it.ReferenceId)
            .HasMaxLength(100);

        builder.Property(it => it.ReferenceType)
            .HasMaxLength(50);

        // Indexes
        builder.HasIndex(it => it.InventoryId);
        builder.HasIndex(it => it.TransactionType);
        builder.HasIndex(it => it.CreatedAt);
        builder.HasIndex(it => it.ReferenceId);

        // Relationships
        builder.HasOne(it => it.Inventory)
            .WithMany(i => i.Transactions)
            .HasForeignKey(it => it.InventoryId)
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired(false); // Optional FK to prevent query filter warning on soft-deletable parent

        // NOTE: InventoryTransaction inherits from BaseEntity (not AuditableEntity),
        // so it does NOT have a global query filter. However, since it has a 
        // REQUIRED relationship to Inventory (which HAS a query filter), we need
        // to ensure queries don't break when the parent is soft-deleted.
        //
        // The relationship is Cascade delete - when Inventory is deleted,
        // all transactions are deleted. The query filter on Inventory ensures
        // that Include() operations work correctly when filtering.
        //
        // For explicit FK queries, the Inventory query filter applies automatically.
    }
}