namespace FirstCry.Infrastructure.Services.Inventory;

using FirstCry.Application.Common.Interfaces;
using FirstCry.Domain.Entities.Inventory;
using FirstCry.Infrastructure.Data.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

public class InventoryService : IInventoryService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<InventoryService> _logger;
    private readonly ICacheService _cacheService;

    private const string INVENTORY_KEY_PREFIX = "inventory:";

    public InventoryService(
        ApplicationDbContext context,
        ILogger<InventoryService> logger,
        ICacheService cacheService)
    {
        _context = context;
        _logger = logger;
        _cacheService = cacheService;
    }

    public async Task<InventoryDto?> GetByProductIdAsync(Guid productId, Guid? warehouseId = null)
    {
        var cacheKey = $"{INVENTORY_KEY_PREFIX}{productId}:{warehouseId}";
        var cached = await _cacheService.GetAsync<InventoryDto>(cacheKey);
        if (cached != null) return cached;

        var query = _context.Inventories
            .Include(i => i.Warehouse)
            .Where(i => i.ProductId == productId);

        if (warehouseId.HasValue)
            query = query.Where(i => i.WarehouseId == warehouseId);

        var inventory = await query.FirstOrDefaultAsync();

        if (inventory == null)
        {
            // Create default inventory if not exists
            inventory = await CreateDefaultInventoryAsync(productId);
        }

        var dto = MapToDto(inventory);
        await _cacheService.SetAsync(cacheKey, dto, TimeSpan.FromMinutes(5));
        return dto;
    }

    public async Task<IEnumerable<InventoryDto>> GetLowStockItemsAsync()
    {
        return await _context.Inventories
            .Include(i => i.Product)
            .Include(i => i.Warehouse)
            .Where(i => i.AvailableQuantity <= i.ReorderLevel && i.Product != null && i.Product.IsActive)
            .OrderBy(i => i.AvailableQuantity)
            .Select(i => MapToDto(i))
            .ToListAsync();
    }

    public async Task<IEnumerable<InventoryDto>> GetProductInventoryAcrossWarehousesAsync(Guid productId)
    {
        return await _context.Inventories
            .Include(i => i.Warehouse)
            .Where(i => i.ProductId == productId)
            .Select(i => MapToDto(i))
            .ToListAsync();
    }

    public async Task<IEnumerable<InventoryDto>> GetWarehouseInventoryAsync(Guid warehouseId)
    {
        return await _context.Inventories
            .Include(i => i.Product)
            .Where(i => i.WarehouseId == warehouseId)
            .Select(i => MapToDto(i))
            .ToListAsync();
    }

    public async Task<bool> ReserveStockAsync(Guid productId, int quantity, string? referenceId = null, string? referenceType = null)
    {
        try
        {
            // Lock row for concurrent safety
            var inventory = await _context.Inventories
                .Where(i => i.ProductId == productId && i.WarehouseId == null)
                .FirstOrDefaultAsync();

            if (inventory == null)
            {
                inventory = await CreateDefaultInventoryAsync(productId);
            }

            if (!inventory.Reserve(quantity, $"Reserved for {referenceType}: {referenceId}"))
            {
                _logger.LogWarning("Failed to reserve {Quantity} units for product {ProductId}. Available: {Available}",
                    quantity, productId, inventory.AvailableQuantity);
                return false;
            }

            await _context.SaveChangesAsync();
            await InvalidateCacheAsync(productId);

            _logger.LogInformation("Reserved {Quantity} units for product {ProductId}", quantity, productId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reserving stock for product {ProductId}", productId);
            return false;
        }
    }

    public async Task<bool> ReleaseStockAsync(Guid productId, int quantity, string? referenceId = null, string? referenceType = null)
    {
        try
        {
            var inventory = await _context.Inventories
                .Where(i => i.ProductId == productId && i.WarehouseId == null)
                .FirstOrDefaultAsync();

            if (inventory == null)
            {
                _logger.LogWarning("No inventory found for product {ProductId} when releasing stock", productId);
                return false;
            }

            inventory.Release(quantity, $"Released from {referenceType}: {referenceId}");
            await _context.SaveChangesAsync();
            await InvalidateCacheAsync(productId);

            _logger.LogInformation("Released {Quantity} units for product {ProductId}", quantity, productId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error releasing stock for product {ProductId}", productId);
            return false;
        }
    }

    public async Task<bool> CommitStockAsync(Guid productId, int quantity, string? referenceId = null, string? referenceType = null)
    {
        try
        {
            var inventory = await _context.Inventories
                .Where(i => i.ProductId == productId && i.WarehouseId == null)
                .FirstOrDefaultAsync();

            if (inventory == null)
                return false;

            inventory.Commit(quantity, $"Committed from {referenceType}: {referenceId}");
            await _context.SaveChangesAsync();
            await InvalidateCacheAsync(productId);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error committing stock for product {ProductId}", productId);
            return false;
        }
    }

    public async Task<bool> AdjustStockAsync(Guid productId, int quantity, string reason, string adjustedBy)
    {
        try
        {
            var inventory = await _context.Inventories
                .Where(i => i.ProductId == productId && i.WarehouseId == null)
                .FirstOrDefaultAsync();

            if (inventory == null)
                inventory = await CreateDefaultInventoryAsync(productId);

            inventory.Adjust(quantity, reason, adjustedBy);
            await _context.SaveChangesAsync();
            await InvalidateCacheAsync(productId);

            _logger.LogInformation("Adjusted stock for product {ProductId}: {Quantity}. Reason: {Reason}",
                productId, quantity, reason);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adjusting stock for product {ProductId}", productId);
            return false;
        }
    }

    public async Task<bool> RestockAsync(Guid productId, int quantity, string? reason = null, string? restockedBy = null)
    {
        try
        {
            var inventory = await _context.Inventories
                .Where(i => i.ProductId == productId && i.WarehouseId == null)
                .FirstOrDefaultAsync();

            if (inventory == null)
                inventory = await CreateDefaultInventoryAsync(productId);

            inventory.Restock(quantity, reason, restockedBy);
            await _context.SaveChangesAsync();
            await InvalidateCacheAsync(productId);

            _logger.LogInformation("Restocked product {ProductId} with {Quantity} units", productId, quantity);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error restocking product {ProductId}", productId);
            return false;
        }
    }

    public async Task<bool> SetReorderLevelsAsync(Guid productId, int reorderLevel, int reorderQuantity)
    {
        try
        {
            var inventory = await _context.Inventories
                .Where(i => i.ProductId == productId && i.WarehouseId == null)
                .FirstOrDefaultAsync();

            if (inventory == null)
                return false;

            inventory.SetReorderLevels(reorderLevel, reorderQuantity);
            await _context.SaveChangesAsync();
            await InvalidateCacheAsync(productId);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting reorder levels for product {ProductId}", productId);
            return false;
        }
    }

    public async Task<Dictionary<Guid, bool>> ReserveStockBulkAsync(Dictionary<Guid, int> productQuantities, string? orderId = null)
    {
        var results = new Dictionary<Guid, bool>();

        foreach (var (productId, quantity) in productQuantities)
        {
            results[productId] = await ReserveStockAsync(productId, quantity, orderId, "Order");
        }

        return results;
    }

    public async Task<bool> ReleaseStockBulkAsync(List<Guid> productIds, List<int> quantities, string? orderId = null)
    {
        for (int i = 0; i < productIds.Count; i++)
        {
            var success = await ReleaseStockAsync(productIds[i], quantities[i], orderId, "OrderCancellation");
            if (!success)
            {
                _logger.LogWarning("Failed to release stock for product {ProductId} during bulk release", productIds[i]);
            }
        }
        return true;
    }

    private async Task<Inventory> CreateDefaultInventoryAsync(Guid productId)
    {
        var inventory = Inventory.Create(productId, null, 0, 10);
        _context.Inventories.Add(inventory);
        await _context.SaveChangesAsync();
        return inventory;
    }

    private async Task InvalidateCacheAsync(Guid productId)
    {
        await _cacheService.RemoveAsync($"{INVENTORY_KEY_PREFIX}{productId}:*");
    }

    private InventoryDto MapToDto(Inventory inventory)
    {
        return new InventoryDto
        {
            Id = inventory.Id,
            ProductId = inventory.ProductId,
            WarehouseId = inventory.WarehouseId,
            WarehouseName = inventory.Warehouse?.Name,
            AvailableQuantity = inventory.AvailableQuantity,
            ReservedQuantity = inventory.ReservedQuantity,
            ReorderLevel = inventory.ReorderLevel,
            LastRestockedAt = inventory.LastRestockedAt,
            LastRestockedBy = inventory.LastRestockedBy,
            RecentTransactions = inventory.Transactions
                .OrderByDescending(t => t.CreatedAt)
                .Take(10)
                .Select(t => new InventoryTransactionDto
                {
                    Id = t.Id,
                    TransactionType = t.TransactionType,
                    Quantity = t.Quantity,
                    Reason = t.Reason,
                    AvailableAfter = t.AvailableAfter,
                    ReservedAfter = t.ReservedAfter,
                    CreatedAt = t.CreatedAt
                }).ToList()
        };
    }
}