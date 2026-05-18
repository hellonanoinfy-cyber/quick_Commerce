namespace FirstCry.Domain.Entities.Shipping;

using FirstCry.Domain.Common;
using FirstCry.Domain.Entities;
using FirstCry.Domain.Entities.Orders;
using WarehouseEntity = FirstCry.Domain.Entities.Warehouse.Warehouse;

// ============================================================
// SHIPPING & SHIPMENT TRACKING ENTITIES
// ============================================================

/// <summary>
/// Represents a shipment for an order
/// </summary>
public class Shipment : AuditableEntity
{
    public Guid? OrderId { get; private set; }
    public Guid? OrderItemId { get; private set; }

    public string AwbNumber { get; private set; } = string.Empty; // Air Waybill Number
    public string? CourierPartner { get; private set; } // Shiprocket, Delhivery, etc.

    public ShipmentStatus Status { get; private set; } = ShipmentStatus.Created;
    public string? StatusReason { get; private set; }

    // Warehouse
    public Guid? WarehouseId { get; private set; }

    // Tracking
    public string? TrackingUrl { get; private set; }
    public DateTime? ShippedAt { get; private set; }
    public DateTime? DeliveredAt { get; private set; }
    public DateTime? EstimatedDeliveryDate { get; private set; }

    // Dimensions & Weight
    public decimal? WeightKg { get; private set; }
    public decimal? LengthCm { get; private set; }
    public decimal? WidthCm { get; private set; }
    public decimal? HeightCm { get; private set; }

    // Labels & Docs
    public string? LabelUrl { get; private set; }
    public string? InvoiceUrl { get; private set; }

    // Return tracking
    public bool IsReturn { get; private set; }
    public Guid? ReturnReasonId { get; private set; }
    public string? ReturnNotes { get; private set; }

    // Navigation
    public virtual Order? Order { get; private set; }
    public virtual WarehouseEntity? Warehouse { get; private set; }

    private readonly List<ShipmentTrackingEvent> _trackingEvents = new();
    public virtual IReadOnlyCollection<ShipmentTrackingEvent> TrackingEvents => _trackingEvents.AsReadOnly();

    protected Shipment() { }

    public static Shipment Create(
        Guid orderId,
        string awbNumber,
        string courierPartner,
        Guid? warehouseId = null,
        Guid? orderItemId = null)
    {
        return new Shipment
        {
            Id = Guid.NewGuid(),
            OrderId = orderId,
            OrderItemId = orderItemId,
            AwbNumber = awbNumber,
            CourierPartner = courierPartner,
            WarehouseId = warehouseId,
            Status = ShipmentStatus.Created,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void UpdateStatus(ShipmentStatus status, string? reason = null)
    {
        Status = status;
        StatusReason = reason;

        if (status == ShipmentStatus.InTransit)
            ShippedAt = DateTime.UtcNow;
        else if (status == ShipmentStatus.Delivered)
            DeliveredAt = DateTime.UtcNow;
    }

    public void AddTrackingEvent(string status, string? location = null, string? description = null)
    {
        _trackingEvents.Add(ShipmentTrackingEvent.Create(Id, status, location, description));
    }

    public void SetEstimatedDelivery(DateTime date)
    {
        EstimatedDeliveryDate = date;
    }

    public void SetDimensions(decimal weight, decimal? length = null, decimal? width = null, decimal? height = null)
    {
        WeightKg = weight;
        LengthCm = length;
        WidthCm = width;
        HeightCm = height;
    }

    public void MarkAsReturn(Guid reasonId, string? notes = null)
    {
        IsReturn = true;
        ReturnReasonId = reasonId;
        ReturnNotes = notes;
    }
}

/// <summary>
/// Tracks each update from the courier
/// </summary>
public class ShipmentTrackingEvent : BaseEntity
{
    public Guid ShipmentId { get; private set; }
    public string Status { get; private set; } = string.Empty;
    public string? Location { get; private set; }
    public string? Description { get; private set; }
    public DateTime EventTime { get; private set; }
    public new DateTime CreatedAt { get; private set; }

    public virtual Shipment? Shipment { get; private set; }

    private ShipmentTrackingEvent() { }

    public static ShipmentTrackingEvent Create(
        Guid shipmentId,
        string status,
        string? location = null,
        string? description = null)
    {
        return new ShipmentTrackingEvent
        {
            Id = Guid.NewGuid(),
            ShipmentId = shipmentId,
            Status = status,
            Location = location,
            Description = description,
            EventTime = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };
    }
}

public enum ShipmentStatus
{
    Created = 0,
    ManifestGenerated = 1,
    PickedUp = 2,
    InTransit = 3,
    OutForDelivery = 4,
    Delivered = 5,
    ReturnInitiated = 6,
    Returned = 7,
    RTO = 8, // Return to Origin
    Cancelled = 9
}

/// <summary>
/// Integration settings for shipping partners
/// </summary>
public class ShippingPartner : BaseEntity
{
    public string Name { get; private set; } = string.Empty; // Shiprocket, Delhivery, etc.
    public string Code { get; private set; } = string.Empty; // SR, DL, etc.
    public bool IsActive { get; private set; }
    public bool IsDefault { get; private set; }

    // API credentials (encrypted in production)
    public string? ApiKey { get; private set; }
    public string? ApiSecret { get; private set; }
    public string? AccountId { get; private set; }

    // API endpoints
    public string? BaseUrl { get; private set; }

    // Settings
    public int Priority { get; private set; } // Lower = higher priority
    public decimal? BaseDeliveryCharge { get; private set; }
    public decimal? FreeDeliveryThreshold { get; private set; }
    public int? MaxWeightKg { get; private set; }

    // Service types
    public bool SupportsSurface { get; private set; } = true;
    public bool SupportsAir { get; private set; } = true;
    public bool SupportsExpress { get; private set; }

    protected ShippingPartner() { }

    public static ShippingPartner Create(
        string name,
        string code,
        string? baseUrl = null,
        int priority = 100)
    {
        return new ShippingPartner
        {
            Id = Guid.NewGuid(),
            Name = name,
            Code = code,
            BaseUrl = baseUrl,
            Priority = priority,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void UpdateCredentials(string apiKey, string apiSecret, string? accountId = null)
    {
        ApiKey = apiKey;
        ApiSecret = apiSecret;
        AccountId = accountId;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}

/// <summary>
/// Shipping rates based on zones
/// </summary>
public class ShippingZone : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;

    // Pincode ranges
    public string PincodePrefixes { get; private set; } = string.Empty; // Comma-separated

    // Delivery expectations
    public int DeliveryDaysMin { get; private set; } = 3;
    public int DeliveryDaysMax { get; private set; } = 7;

    // Rates
    public decimal CodCharge { get; private set; }
    public decimal PrepaidCharge { get; private set; }
    public decimal? WeightSlab { get; private set; } // e.g., 0.5kg
    public decimal? AdditionalWeightCharge { get; private set; }

    public bool IsActive { get; private set; } = true;

    protected ShippingZone() { }

    public static ShippingZone Create(
        string name,
        string pincodePrefixes,
        int deliveryDaysMin,
        int deliveryDaysMax,
        decimal codCharge,
        decimal prepaidCharge)
    {
        return new ShippingZone
        {
            Id = Guid.NewGuid(),
            Name = name,
            PincodePrefixes = pincodePrefixes,
            DeliveryDaysMin = deliveryDaysMin,
            DeliveryDaysMax = deliveryDaysMax,
            CodCharge = codCharge,
            PrepaidCharge = prepaidCharge,
            CreatedAt = DateTime.UtcNow
        };
    }

    public bool ContainsPincode(string pincode)
    {
        if (string.IsNullOrWhiteSpace(PincodePrefixes))
            return false;

        var prefixes = PincodePrefixes.Split(',', StringSplitOptions.RemoveEmptyEntries);
        return prefixes.Any(p => pincode.Trim().StartsWith(p.Trim()));
    }

    public decimal CalculateCharge(bool isCod, decimal weightKg = 0)
    {
        var baseCharge = isCod ? CodCharge : PrepaidCharge;

        if (WeightSlab.HasValue && AdditionalWeightCharge.HasValue && weightKg > WeightSlab.Value)
        {
            var extraWeight = Math.Ceiling((weightKg - WeightSlab.Value) / 0.5m);
            baseCharge += extraWeight * AdditionalWeightCharge.Value;
        }

        return baseCharge;
    }
}