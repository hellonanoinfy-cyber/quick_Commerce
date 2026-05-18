namespace FirstCry.Infrastructure.Data.Configurations;

using FirstCry.Domain.Common;
using FirstCry.Domain.Entities.Shipping;
using FirstCry.Domain.Entities.Warehouse;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

/// <summary>
/// EF Core Fluent API configuration for the Shipment entity.
/// Includes global query filter to exclude soft-deleted records.
/// </summary>
public class ShipmentConfiguration : IEntityTypeConfiguration<Shipment>
{
    public void Configure(EntityTypeBuilder<Shipment> builder)
    {
        builder.ToTable("Shipments");

        builder.HasKey(s => s.Id);

        // Properties
        builder.Property(s => s.AwbNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(s => s.CourierPartner)
            .HasMaxLength(100);

        builder.Property(s => s.StatusReason)
            .HasMaxLength(500);

        builder.Property(s => s.TrackingUrl)
            .HasMaxLength(500);

        builder.Property(s => s.LabelUrl)
            .HasMaxLength(500);

        builder.Property(s => s.InvoiceUrl)
            .HasMaxLength(500);

        builder.Property(s => s.ReturnNotes)
            .HasMaxLength(1000);

        // Enum conversion
        builder.Property(s => s.Status)
            .HasConversion<string>()
            .HasMaxLength(30);

        // Dimensions precision
        builder.Property(s => s.WeightKg)
            .HasPrecision(8, 2);

        builder.Property(s => s.LengthCm)
            .HasPrecision(8, 2);

        builder.Property(s => s.WidthCm)
            .HasPrecision(8, 2);

        builder.Property(s => s.HeightCm)
            .HasPrecision(8, 2);

        // Indexes
        builder.HasIndex(s => s.AwbNumber).IsUnique();
        builder.HasIndex(s => s.OrderId);
        builder.HasIndex(s => s.Status);
        builder.HasIndex(s => s.WarehouseId);
        builder.HasIndex(s => s.CourierPartner);
        builder.HasIndex(s => s.CreatedAt);

        // Relationships
        builder.HasOne(s => s.Order)
            .WithMany()
            .HasForeignKey(s => s.OrderId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(s => s.Warehouse)
            .WithMany()
            .HasForeignKey(s => s.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        // Global query filter to exclude soft-deleted records
        builder.HasQueryFilter(s => !s.IsDeleted);
    }
}

/// <summary>
/// EF Core Fluent API configuration for the ShipmentTrackingEvent entity.
/// CRITICAL: Must have matching query filter to prevent orphaned queries
/// when parent Shipment is soft-deleted.
/// </summary>
public class ShipmentTrackingEventConfiguration : IEntityTypeConfiguration<ShipmentTrackingEvent>
{
    public void Configure(EntityTypeBuilder<ShipmentTrackingEvent> builder)
    {
        builder.ToTable("ShipmentTrackingEvents");

        builder.HasKey(ste => ste.Id);

        // Properties
        builder.Property(ste => ste.Status)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(ste => ste.Location)
            .HasMaxLength(200);

        builder.Property(ste => ste.Description)
            .HasMaxLength(1000);

        // Indexes
        builder.HasIndex(ste => ste.ShipmentId);
        builder.HasIndex(ste => ste.EventTime);
        builder.HasIndex(ste => ste.Status);

        // Relationships
        builder.HasOne(ste => ste.Shipment)
            .WithMany(s => s.TrackingEvents)
            .HasForeignKey(ste => ste.ShipmentId)
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired(false); // Optional FK to prevent query filter warning on soft-deletable parent

        // NOTE: ShipmentTrackingEvent inherits from BaseEntity (not AuditableEntity),
        // so it does NOT have a global query filter. However, since it has a 
        // REQUIRED relationship to Shipment (which HAS a query filter), the
        // Shipment filter will apply when querying through Include().
        //
        // The relationship is Cascade delete - when Shipment is deleted,
        // all tracking events are deleted.
    }
}

/// <summary>
/// EF Core Fluent API configuration for the ShippingPartner entity.
/// </summary>
public class ShippingPartnerConfiguration : IEntityTypeConfiguration<ShippingPartner>
{
    public void Configure(EntityTypeBuilder<ShippingPartner> builder)
    {
        builder.ToTable("ShippingPartners");

        builder.HasKey(sp => sp.Id);

        // Properties
        builder.Property(sp => sp.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(sp => sp.Code)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(sp => sp.ApiKey)
            .HasMaxLength(500);

        builder.Property(sp => sp.ApiSecret)
            .HasMaxLength(500);

        builder.Property(sp => sp.AccountId)
            .HasMaxLength(100);

        builder.Property(sp => sp.BaseUrl)
            .HasMaxLength(200);

        builder.Property(sp => sp.BaseDeliveryCharge)
            .HasPrecision(10, 2);

        builder.Property(sp => sp.FreeDeliveryThreshold)
            .HasPrecision(10, 2);

        // Indexes
        builder.HasIndex(sp => sp.Code).IsUnique();
        builder.HasIndex(sp => sp.IsActive);
        builder.HasIndex(sp => sp.Priority);

        // NOTE: ShippingPartner extends BaseEntity (not AuditableEntity),
        // so it does NOT need a query filter. It's not soft-deletable.
    }
}

/// <summary>
/// EF Core Fluent API configuration for the ShippingZone entity.
/// </summary>
public class ShippingZoneConfiguration : IEntityTypeConfiguration<ShippingZone>
{
    public void Configure(EntityTypeBuilder<ShippingZone> builder)
    {
        builder.ToTable("ShippingZones");

        builder.HasKey(sz => sz.Id);

        // Properties
        builder.Property(sz => sz.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(sz => sz.Description)
            .HasMaxLength(500);

        builder.Property(sz => sz.PincodePrefixes)
            .HasMaxLength(500);

        builder.Property(sz => sz.CodCharge)
            .HasPrecision(10, 2);

        builder.Property(sz => sz.PrepaidCharge)
            .HasPrecision(10, 2);

        builder.Property(sz => sz.WeightSlab)
            .HasPrecision(8, 2);

        builder.Property(sz => sz.AdditionalWeightCharge)
            .HasPrecision(10, 2);

        // Indexes
        builder.HasIndex(sz => sz.IsActive);
        builder.HasIndex(sz => sz.Name);
    }
}