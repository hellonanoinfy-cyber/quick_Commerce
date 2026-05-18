namespace FirstCry.Infrastructure.Data.Configurations;

using FirstCry.Domain.Entities.Warehouse;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

/// <summary>
/// EF Core Fluent API configuration for the Warehouse entity.
/// Configures warehouse location, capacity, and relationships to inventory/transfers.
/// </summary>
public class WarehouseConfiguration : IEntityTypeConfiguration<Warehouse>
{
    public void Configure(EntityTypeBuilder<Warehouse> builder)
    {
        builder.ToTable("Warehouses");

        builder.HasKey(w => w.Id);

        // Basic Info
        builder.Property(w => w.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(w => w.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(w => w.Description)
            .HasMaxLength(1000);

        builder.Property(w => w.City)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(w => w.State)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(w => w.ZipCode)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(w => w.Country)
            .IsRequired()
            .HasMaxLength(100)
            .HasDefaultValue("India");

        // Location
        builder.Property(w => w.AddressLine1)
            .HasMaxLength(300);

        builder.Property(w => w.AddressLine2)
            .HasMaxLength(300);

        builder.Property(w => w.Latitude)
            .HasPrecision(10, 7);

        builder.Property(w => w.Longitude)
            .HasPrecision(10, 7);

        // Contact
        builder.Property(w => w.ContactName)
            .HasMaxLength(150);

        builder.Property(w => w.ContactPhone)
            .HasMaxLength(20);

        builder.Property(w => w.ContactEmail)
            .HasMaxLength(200);

        // Delivery zones
        builder.Property(w => w.DeliveryPincodePrefixes)
            .HasMaxLength(500);

        builder.Property(w => w.DeliveryDaysMin)
            .HasDefaultValue(3);

        builder.Property(w => w.DeliveryDaysMax)
            .HasDefaultValue(7);

        // Capacity
        builder.Property(w => w.MaxCapacity)
            .HasDefaultValue(10000);

        builder.Property(w => w.CurrentCapacity)
            .HasDefaultValue(0);

        // Priority
        builder.Property(w => w.Priority)
            .HasDefaultValue(100);

        // Boolean flags
        builder.Property(w => w.IsActive)
            .HasDefaultValue(true);

        builder.Property(w => w.IsDefault)
            .HasDefaultValue(false);

        // Indexes
        builder.HasIndex(w => w.Code).IsUnique();
        builder.HasIndex(w => w.IsActive);
        builder.HasIndex(w => w.IsDefault);
        builder.HasIndex(w => w.Priority);
        builder.HasIndex(w => new { w.City, w.State });

        // Global query filter to exclude soft-deleted records
        builder.HasQueryFilter(w => !w.IsDeleted);
    }
}

/// <summary>
/// EF Core Fluent API configuration for the WarehouseInventory entity.
/// Tracks product quantities at each warehouse location.
/// </summary>
public class WarehouseInventoryConfiguration : IEntityTypeConfiguration<WarehouseInventory>
{
    public void Configure(EntityTypeBuilder<WarehouseInventory> builder)
    {
        builder.ToTable("WarehouseInventories");

        builder.HasKey(wi => wi.Id);

        builder.Property(wi => wi.AvailableQuantity)
            .HasDefaultValue(0);

        builder.Property(wi => wi.ReservedQuantity)
            .HasDefaultValue(0);

        builder.Property(wi => wi.ReorderLevel)
            .HasDefaultValue(10);

        // Indexes
        builder.HasIndex(wi => new { wi.WarehouseId, wi.ProductId }).IsUnique();
        builder.HasIndex(wi => wi.WarehouseId);
        builder.HasIndex(wi => wi.ProductId);

        // Relationships
        builder.HasOne(wi => wi.Warehouse)
            .WithMany(w => w.Inventories)
            .HasForeignKey(wi => wi.WarehouseId)
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired(false); // Optional FK to prevent query filter warning on soft-deletable parent

        builder.HasOne(wi => wi.Product)
            .WithMany()
            .HasForeignKey(wi => wi.ProductId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false); // Optional FK to prevent query filter warning on soft-deletable parent
    }
}