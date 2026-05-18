namespace FirstCry.Domain.Entities.Warehouse;

using FirstCry.Domain.Common;

// ============================================================
// WAREHOUSE MANAGEMENT ENTITIES
// ============================================================

/// <summary>
/// Represents a warehouse/fulfillment center
/// </summary>
public class Warehouse : AuditableEntity
{
    public string Name { get; private set; } = string.Empty;
    public string Code { get; private set; } = string.Empty; // Unique code like "WH-001"

    public string? Description { get; private set; }
    public bool IsActive { get; private set; } = true;
    public bool IsDefault { get; private set; }

    // Location
    public string? AddressLine1 { get; private set; }
    public string? AddressLine2 { get; private set; }
    public string City { get; private set; } = string.Empty;
    public string State { get; private set; } = string.Empty;
    public string ZipCode { get; private set; } = string.Empty;
    public string Country { get; private set; } = "India";

    public double? Latitude { get; private set; }
    public double? Longitude { get; private set; }

    // Contact
    public string? ContactName { get; private set; }
    public string? ContactPhone { get; private set; }
    public string? ContactEmail { get; private set; }

    // Delivery zones (comma-separated pincode prefixes)
    public string? DeliveryPincodePrefixes { get; private set; }
    public int? DeliveryDaysMin { get; private set; }
    public int? DeliveryDaysMax { get; private set; }

    // Capacity
    public int? MaxCapacity { get; private set; }
    public int? CurrentCapacity { get; private set; }

    // Priority (lower = higher priority for allocation)
    public int Priority { get; private set; } = 100;

    private readonly List<WarehouseInventory> _inventories = new();
    public virtual IReadOnlyCollection<WarehouseInventory> Inventories => _inventories.AsReadOnly();

    private readonly List<WarehouseTransfer> _outgoingTransfers = new();
    private readonly List<WarehouseTransfer> _incomingTransfers = new();
    public virtual IReadOnlyCollection<WarehouseTransfer> OutgoingTransfers => _outgoingTransfers.AsReadOnly();
    public virtual IReadOnlyCollection<WarehouseTransfer> IncomingTransfers => _incomingTransfers.AsReadOnly();

    protected Warehouse() { }

    public static Warehouse Create(
        string name,
        string code,
        string city,
        string state,
        string zipCode,
        string? addressLine1 = null,
        string? contactName = null,
        string? contactPhone = null)
    {
        return new Warehouse
        {
            Id = Guid.NewGuid(),
            Name = name,
            Code = code,
            City = city,
            State = state,
            ZipCode = zipCode,
            AddressLine1 = addressLine1,
            ContactName = contactName,
            ContactPhone = contactPhone,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void UpdateLocation(string addressLine1, string? addressLine2, string city, string state, string zipCode)
    {
        AddressLine1 = addressLine1;
        AddressLine2 = addressLine2;
        City = city;
        State = state;
        ZipCode = zipCode;
    }

    public void UpdateContact(string? name, string? phone, string? email)
    {
        ContactName = name;
        ContactPhone = phone;
        ContactEmail = email;
    }

    public void SetDeliveryZones(string? pincodePrefixes, int? minDays, int? maxDays)
    {
        DeliveryPincodePrefixes = pincodePrefixes;
        DeliveryDaysMin = minDays;
        DeliveryDaysMax = maxDays;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
    public void SetAsDefault() => IsDefault = true;
    public void ClearDefault() => IsDefault = false;

    public void SetPriority(int priority) => Priority = priority;

    /// <summary>
    /// Check if this warehouse can deliver to a pincode
    /// </summary>
    public bool CanDeliverTo(string pincode)
    {
        if (string.IsNullOrWhiteSpace(DeliveryPincodePrefixes))
            return true; // Default: deliver everywhere

        var prefixes = DeliveryPincodePrefixes.Split(',', StringSplitOptions.RemoveEmptyEntries);
        return prefixes.Any(prefix => pincode.StartsWith(prefix.Trim()));
    }

    /// <summary>
    /// Estimate delivery days for a pincode
    /// </summary>
    public (int min, int max) GetEstimatedDeliveryDays(string pincode)
    {
        return (DeliveryDaysMin ?? 3, DeliveryDaysMax ?? 7);
    }
}

/// <summary>
/// Tracks inventory at a specific warehouse
/// </summary>
public class WarehouseInventory : BaseEntity
{
    public Guid WarehouseId { get; private set; }
    public Guid ProductId { get; private set; }

    public int AvailableQuantity { get; private set; }
    public int ReservedQuantity { get; private set; }
    public int ReorderLevel { get; private set; }

    public DateTime? LastUpdated { get; private set; }

    // Navigation
    public virtual Warehouse Warehouse { get; private set; } = null!;
    public virtual Product? Product { get; private set; }

    private WarehouseInventory() { }

    public static WarehouseInventory Create(Guid warehouseId, Guid productId, int quantity = 0)
    {
        return new WarehouseInventory
        {
            Id = Guid.NewGuid(),
            WarehouseId = warehouseId,
            ProductId = productId,
            AvailableQuantity = quantity,
            ReservedQuantity = 0,
            ReorderLevel = 10,
            LastUpdated = DateTime.UtcNow
        };
    }

    public void UpdateQuantity(int available, int reserved = 0)
    {
        AvailableQuantity = available;
        ReservedQuantity = reserved;
        LastUpdated = DateTime.UtcNow;
    }

    public void Reserve(int quantity)
    {
        AvailableQuantity -= quantity;
        ReservedQuantity += quantity;
        LastUpdated = DateTime.UtcNow;
    }

    public void Release(int quantity)
    {
        ReservedQuantity -= quantity;
        AvailableQuantity += quantity;
        LastUpdated = DateTime.UtcNow;
    }
}

/// <summary>
/// Tracks stock transfers between warehouses
/// </summary>
public class WarehouseTransfer : AuditableEntity
{
    public string TransferNumber { get; private set; } = string.Empty;

    public Guid SourceWarehouseId { get; private set; }
    public Guid DestinationWarehouseId { get; private set; }

    public WarehouseTransferStatus Status { get; private set; } = WarehouseTransferStatus.Pending;

    public string? Notes { get; private set; }
    public string? ApprovedBy { get; private set; }
    public DateTime? ApprovedAt { get; private set; }
    public string? ShippedBy { get; private set; }
    public DateTime? ShippedAt { get; private set; }
    public string? ReceivedBy { get; private set; }
    public DateTime? ReceivedAt { get; private set; }

    public string? TrackingNumber { get; private set; }

    // Navigation
    public virtual Warehouse SourceWarehouse { get; private set; } = null!;
    public virtual Warehouse DestinationWarehouse { get; private set; } = null!;

    private readonly List<WarehouseTransferItem> _items = new();
    public virtual IReadOnlyCollection<WarehouseTransferItem> Items => _items.AsReadOnly();

    protected WarehouseTransfer() { }

    public static WarehouseTransfer Create(
        string transferNumber,
        Guid sourceWarehouseId,
        Guid destinationWarehouseId,
        string? notes = null)
    {
        return new WarehouseTransfer
        {
            Id = Guid.NewGuid(),
            TransferNumber = transferNumber,
            SourceWarehouseId = sourceWarehouseId,
            DestinationWarehouseId = destinationWarehouseId,
            Notes = notes,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void AddItem(Guid productId, int quantity)
    {
        _items.Add(WarehouseTransferItem.Create(Id, productId, quantity));
    }

    public void Approve(string approvedBy)
    {
        Status = WarehouseTransferStatus.Approved;
        ApprovedBy = approvedBy;
        ApprovedAt = DateTime.UtcNow;
    }

    public void Ship(string shippedBy, string? trackingNumber = null)
    {
        Status = WarehouseTransferStatus.Shipped;
        ShippedBy = shippedBy;
        ShippedAt = DateTime.UtcNow;
        TrackingNumber = trackingNumber;
    }

    public void Receive(string receivedBy)
    {
        Status = WarehouseTransferStatus.Received;
        ReceivedBy = receivedBy;
        ReceivedAt = DateTime.UtcNow;
    }

    public void Cancel(string? reason = null)
    {
        Status = WarehouseTransferStatus.Cancelled;
        Notes = string.IsNullOrEmpty(Notes) ? reason : $"{Notes}\nCancelled: {reason}";
    }
}

public class WarehouseTransferItem : BaseEntity
{
    public Guid TransferId { get; private set; }
    public Guid ProductId { get; private set; }
    public int Quantity { get; private set; }
    public int ReceivedQuantity { get; private set; }

    public virtual WarehouseTransfer? Transfer { get; private set; }
    public virtual Product? Product { get; private set; }

    private WarehouseTransferItem() { }

    public static WarehouseTransferItem Create(Guid transferId, Guid productId, int quantity)
    {
        return new WarehouseTransferItem
        {
            Id = Guid.NewGuid(),
            TransferId = transferId,
            ProductId = productId,
            Quantity = quantity
        };
    }
}

public enum WarehouseTransferStatus
{
    Pending = 0,
    Approved = 1,
    Shipped = 2,
    InTransit = 3,
    Received = 4,
    Cancelled = 5
}