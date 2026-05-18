namespace FirstCry.Application.Common.Interfaces;

// ============================================================
// WAREHOUSE MANAGEMENT SERVICE INTERFACE
// ============================================================

public interface IWarehouseService
{
    // Warehouse queries
    Task<WarehouseDto?> GetByIdAsync(Guid warehouseId);
    Task<IEnumerable<WarehouseDto>> GetAllAsync(bool activeOnly = true);
    Task<WarehouseDto?> GetDefaultAsync();

    // Smart allocation
    Task<WarehouseDto?> FindBestWarehouseAsync(string pincode, Guid productId, int quantity);

    // Inventory at warehouse
    Task<IEnumerable<WarehouseInventoryDto>> GetWarehouseInventoryAsync(Guid warehouseId, int page = 1, int pageSize = 50);
    Task<bool> UpdateWarehouseStockAsync(Guid warehouseId, Guid productId, int available, int reserved);

    // Transfers
    Task<WarehouseTransferDto> CreateTransferAsync(string transferNumber, Guid sourceId, Guid destId, List<TransferItemDto> items, string? notes = null);
    Task<bool> ApproveTransferAsync(Guid transferId, string approvedBy);
    Task<bool> ShipTransferAsync(Guid transferId, string shippedBy, string? trackingNumber = null);
    Task<bool> ReceiveTransferAsync(Guid transferId, string receivedBy);
    Task<bool> CancelTransferAsync(Guid transferId, string? reason = null);

    // CRUD
    Task<Guid> CreateWarehouseAsync(CreateWarehouseRequest request);
    Task<bool> UpdateWarehouseAsync(Guid warehouseId, UpdateWarehouseRequest request);
    Task<bool> DeleteWarehouseAsync(Guid warehouseId);
}

public class WarehouseDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
    public string? Description { get; init; }
    public bool IsActive { get; init; }
    public bool IsDefault { get; init; }

    public string? AddressLine1 { get; init; }
    public string? AddressLine2 { get; init; }
    public string City { get; init; } = string.Empty;
    public string State { get; init; } = string.Empty;
    public string ZipCode { get; init; } = string.Empty;
    public string Country { get; init; } = "India";

    public double? Latitude { get; init; }
    public double? Longitude { get; init; }

    public string? ContactName { get; init; }
    public string? ContactPhone { get; init; }
    public string? ContactEmail { get; init; }

    public int? MaxCapacity { get; init; }
    public int? CurrentCapacity { get; init; }

    public int Priority { get; init; }

    public int? DeliveryDaysMin { get; init; }
    public int? DeliveryDaysMax { get; init; }
}

public class WarehouseInventoryDto
{
    public Guid Id { get; init; }
    public Guid WarehouseId { get; init; }
    public Guid ProductId { get; init; }
    public string ProductName { get; init; } = string.Empty;
    public string? ProductSku { get; init; }

    public int AvailableQuantity { get; init; }
    public int ReservedQuantity { get; init; }
    public int ReorderLevel { get; init; }
    public bool IsLowStock => AvailableQuantity <= ReorderLevel;

    public DateTime? LastUpdated { get; init; }
}

public class WarehouseTransferDto
{
    public Guid Id { get; init; }
    public string TransferNumber { get; init; } = string.Empty;
    public Guid SourceWarehouseId { get; init; }
    public string SourceWarehouseName { get; init; } = string.Empty;
    public Guid DestinationWarehouseId { get; init; }
    public string DestinationWarehouseName { get; init; } = string.Empty;

    public string Status { get; init; } = string.Empty;
    public string? Notes { get; init; }

    public List<TransferItemDto> Items { get; init; } = new();

    public string? ApprovedBy { get; init; }
    public DateTime? ApprovedAt { get; init; }
    public string? ShippedBy { get; init; }
    public DateTime? ShippedAt { get; init; }
    public string? ReceivedBy { get; init; }
    public DateTime? ReceivedAt { get; init; }
    public string? TrackingNumber { get; init; }

    public DateTime CreatedAt { get; init; }
}

public class TransferItemDto
{
    public Guid ProductId { get; init; }
    public string ProductName { get; init; } = string.Empty;
    public int Quantity { get; init; }
}

// Request DTOs
public record CreateWarehouseRequest(
    string Name,
    string Code,
    string City,
    string State,
    string ZipCode,
    string? AddressLine1 = null,
    string? ContactName = null,
    string? ContactPhone = null,
    int Priority = 100
);

public record UpdateWarehouseRequest(
    string? Name = null,
    string? Description = null,
    string? AddressLine1 = null,
    string? AddressLine2 = null,
    string? City = null,
    string? State = null,
    string? ZipCode = null,
    string? ContactName = null,
    string? ContactPhone = null,
    string? ContactEmail = null,
    int? Priority = null,
    bool? IsActive = null,
    bool? IsDefault = null
);