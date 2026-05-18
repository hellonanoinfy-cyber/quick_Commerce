namespace FirstCry.Application.Common.Interfaces;

// ============================================================
// INVENTORY MANAGEMENT SERVICE INTERFACE
// ============================================================

public interface IInventoryService
{
    // Inventory queries
    Task<InventoryDto?> GetByProductIdAsync(Guid productId, Guid? warehouseId = null);
    Task<IEnumerable<InventoryDto>> GetLowStockItemsAsync();
    Task<IEnumerable<InventoryDto>> GetProductInventoryAcrossWarehousesAsync(Guid productId);
    Task<IEnumerable<InventoryDto>> GetWarehouseInventoryAsync(Guid warehouseId);

    // Stock operations
    Task<bool> ReserveStockAsync(Guid productId, int quantity, string? referenceId = null, string? referenceType = null);
    Task<bool> ReleaseStockAsync(Guid productId, int quantity, string? referenceId = null, string? referenceType = null);
    Task<bool> CommitStockAsync(Guid productId, int quantity, string? referenceId = null, string? referenceType = null);

    // Inventory adjustments
    Task<bool> AdjustStockAsync(Guid productId, int quantity, string reason, string adjustedBy);
    Task<bool> RestockAsync(Guid productId, int quantity, string? reason = null, string? restockedBy = null);

    // Reorder levels
    Task<bool> SetReorderLevelsAsync(Guid productId, int reorderLevel, int reorderQuantity);

    // Bulk operations
    Task<Dictionary<Guid, bool>> ReserveStockBulkAsync(Dictionary<Guid, int> productQuantities, string? orderId = null);
    Task<bool> ReleaseStockBulkAsync(List<Guid> productIds, List<int> quantities, string? orderId = null);
}

public class InventoryDto
{
    public Guid Id { get; init; }
    public Guid ProductId { get; init; }
    public Guid? WarehouseId { get; init; }
    public string? WarehouseName { get; init; }

    public int AvailableQuantity { get; init; }
    public int ReservedQuantity { get; init; }
    public int TotalQuantity => AvailableQuantity + ReservedQuantity;

    public int ReorderLevel { get; init; }
    public bool IsLowStock => AvailableQuantity <= ReorderLevel;
    public bool NeedsReorder { get; init; }

    public DateTime? LastRestockedAt { get; init; }
    public string? LastRestockedBy { get; init; }

    public List<InventoryTransactionDto> RecentTransactions { get; init; } = new();
}

public class InventoryTransactionDto
{
    public Guid Id { get; init; }
    public string TransactionType { get; init; } = string.Empty;
    public int Quantity { get; init; }
    public string? Reason { get; init; }
    public int AvailableAfter { get; init; }
    public int ReservedAfter { get; init; }
    public DateTime CreatedAt { get; init; }
}