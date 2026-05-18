namespace FirstCry.Domain.Entities.Inventory;

using FirstCry.Domain.Common;
using FirstCry.Domain.Entities;
using WarehouseEntity = FirstCry.Domain.Entities.Warehouse.Warehouse;

// ============================================================
// INVENTORY MANAGEMENT ENTITIES
// ============================================================

/// <summary>
/// Represents inventory at a specific warehouse for a specific product/SKU
/// </summary>
public class Inventory : AuditableEntity
{
    public Guid ProductId { get; private set; }
    public Guid? WarehouseId { get; private set; }

    // Stock quantities
    public int AvailableQuantity { get; private set; }
    public int ReservedQuantity { get; private set; }
    public int ReorderLevel { get; private set; }
    public int ReorderQuantity { get; private set; }

    // Stock tracking
    public DateTime? LastRestockedAt { get; private set; }
    public string? LastRestockedBy { get; private set; }

    // Low stock alert
    public bool IsLowStock => AvailableQuantity <= ReorderLevel;
    public bool NeedsReorder => AvailableQuantity <= ReorderLevel;

    // Navigation properties
    public virtual Product? Product { get; private set; }
    public virtual WarehouseEntity? Warehouse { get; private set; }

    private readonly List<InventoryTransaction> _transactions = new();
    public virtual IReadOnlyCollection<InventoryTransaction> Transactions => _transactions.AsReadOnly();

    // Total = Available + Reserved (what we promise to customers)
    public int TotalQuantity => AvailableQuantity + ReservedQuantity;

    protected Inventory() { }

    public static Inventory Create(Guid productId, Guid? warehouseId = null, int initialQuantity = 0, int reorderLevel = 10)
    {
        return new Inventory
        {
            Id = Guid.NewGuid(),
            ProductId = productId,
            WarehouseId = warehouseId,
            AvailableQuantity = initialQuantity,
            ReservedQuantity = 0,
            ReorderLevel = reorderLevel,
            ReorderQuantity = 50,
            CreatedAt = DateTime.UtcNow
        };
    }

    // Reserve inventory during checkout
    public bool Reserve(int quantity, string? reason = null)
    {
        if (AvailableQuantity < quantity)
            return false;

        AvailableQuantity -= quantity;
        ReservedQuantity += quantity;

        _transactions.Add(InventoryTransaction.Create(
            Id, "reserved", quantity, reason ?? "Reserved for order", AvailableQuantity, ReservedQuantity));

        return true;
    }

    // Release reserved inventory (cancelled orders, etc.)
    public void Release(int quantity, string? reason = null)
    {
        var toRelease = Math.Min(quantity, ReservedQuantity);
        ReservedQuantity -= toRelease;
        AvailableQuantity += toRelease;

        _transactions.Add(InventoryTransaction.Create(
            Id, "released", toRelease, reason ?? "Released reservation", AvailableQuantity, ReservedQuantity));
    }

    // Commit reserved inventory (order shipped)
    public void Commit(int quantity, string? reason = null)
    {
        var toCommit = Math.Min(quantity, ReservedQuantity);
        ReservedQuantity -= toCommit;
        // No change to available - committed means shipped/deducted

        _transactions.Add(InventoryTransaction.Create(
            Id, "committed", toCommit, reason ?? "Committed for shipment", AvailableQuantity, ReservedQuantity));
    }

    // Add stock (restock)
    public void Restock(int quantity, string? reason = null, string? restockedBy = null)
    {
        AvailableQuantity += quantity;
        LastRestockedAt = DateTime.UtcNow;
        LastRestockedBy = restockedBy;

        _transactions.Add(InventoryTransaction.Create(
            Id, "restocked", quantity, reason ?? "Stock restocked", AvailableQuantity, ReservedQuantity));
    }

    // Adjust inventory (manual correction)
    public void Adjust(int quantity, string reason, string adjustedBy)
    {
        AvailableQuantity += quantity;

        _transactions.Add(InventoryTransaction.Create(
            Id, "adjusted", Math.Abs(quantity), reason, AvailableQuantity, ReservedQuantity));

        LastRestockedBy = adjustedBy;
    }

    // Set reorder levels
    public void SetReorderLevels(int reorderLevel, int reorderQuantity)
    {
        ReorderLevel = reorderLevel;
        ReorderQuantity = reorderQuantity;
    }
}

/// <summary>
/// Tracks all inventory movements for audit and analytics
/// </summary>
public class InventoryTransaction : BaseEntity
{
    public Guid InventoryId { get; private set; }
    public string TransactionType { get; private set; } = string.Empty;
    // Types: reserved, released, committed, restocked, adjusted, sold, returned

    public int Quantity { get; private set; }
    public string? Reason { get; private set; }

    // Snapshot of inventory state at this time
    public int AvailableAfter { get; private set; }
    public int ReservedAfter { get; private set; }

    public string? ReferenceId { get; private set; } // Order ID, etc.
    public string? ReferenceType { get; private set; } // Order, Return, Adjustment

    public new DateTime CreatedAt { get; private set; }

    public virtual Inventory? Inventory { get; private set; }

    private InventoryTransaction() { }

    public static InventoryTransaction Create(
        Guid inventoryId,
        string transactionType,
        int quantity,
        string? reason,
        int availableAfter,
        int reservedAfter,
        string? referenceId = null,
        string? referenceType = null)
    {
        return new InventoryTransaction
        {
            Id = Guid.NewGuid(),
            InventoryId = inventoryId,
            TransactionType = transactionType,
            Quantity = quantity,
            Reason = reason,
            AvailableAfter = availableAfter,
            ReservedAfter = reservedAfter,
            ReferenceId = referenceId,
            ReferenceType = referenceType,
            CreatedAt = DateTime.UtcNow
        };
    }
}