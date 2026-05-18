namespace FirstCry.Infrastructure.Services.Warehouse;

using FirstCry.Application.Common.Interfaces;
using FirstCry.Domain.Entities.Warehouse;
using FirstCry.Infrastructure.Data.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

public class WarehouseService : IWarehouseService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<WarehouseService> _logger;

    public WarehouseService(ApplicationDbContext context, ILogger<WarehouseService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<WarehouseDto?> GetByIdAsync(Guid warehouseId)
    {
        var warehouse = await _context.Warehouses.FindAsync(warehouseId);
        return warehouse == null ? null : MapToDto(warehouse);
    }

    public async Task<IEnumerable<WarehouseDto>> GetAllAsync(bool activeOnly = true)
    {
        var query = _context.Warehouses.AsQueryable();
        if (activeOnly)
            query = query.Where(w => w.IsActive);

        return await query
            .OrderBy(w => w.Priority)
            .Select(w => MapToDto(w))
            .ToListAsync();
    }

    public async Task<WarehouseDto?> GetDefaultAsync()
    {
        var warehouse = await _context.Warehouses
            .Where(w => w.IsDefault && w.IsActive)
            .FirstOrDefaultAsync();

        if (warehouse == null)
            warehouse = await _context.Warehouses
                .Where(w => w.IsActive)
                .OrderBy(w => w.Priority)
                .FirstOrDefaultAsync();

        return warehouse == null ? null : MapToDto(warehouse);
    }

    public async Task<WarehouseDto?> FindBestWarehouseAsync(string pincode, Guid productId, int quantity)
    {
        // Find warehouses that can deliver to this pincode and have enough stock
        var warehouses = await _context.Warehouses
            .Include(w => w.Inventories)
            .Where(w => w.IsActive)
            .ToListAsync();

        return warehouses
            .Where(w => w.CanDeliverTo(pincode))
            .Where(w => w.Inventories.Any(i => i.ProductId == productId && i.AvailableQuantity >= quantity))
            .OrderBy(w => w.Priority)
            .Select(w => MapToDto(w))
            .FirstOrDefault();
    }

    public async Task<IEnumerable<WarehouseInventoryDto>> GetWarehouseInventoryAsync(Guid warehouseId, int page = 1, int pageSize = 50)
    {
        return await _context.WarehouseInventories
            .Include(wi => wi.Product)
            .Where(wi => wi.WarehouseId == warehouseId)
            .OrderBy(wi => wi.Product != null ? wi.Product.Name : "")
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(wi => new WarehouseInventoryDto
            {
                Id = wi.Id,
                WarehouseId = wi.WarehouseId,
                ProductId = wi.ProductId,
                ProductName = wi.Product != null ? wi.Product.Name : "",
                ProductSku = wi.Product != null ? wi.Product.Sku : null,
                AvailableQuantity = wi.AvailableQuantity,
                ReservedQuantity = wi.ReservedQuantity,
                ReorderLevel = wi.ReorderLevel,
                LastUpdated = wi.LastUpdated
            })
            .ToListAsync();
    }

    public async Task<bool> UpdateWarehouseStockAsync(Guid warehouseId, Guid productId, int available, int reserved)
    {
        var inventory = await _context.WarehouseInventories
            .FirstOrDefaultAsync(wi => wi.WarehouseId == warehouseId && wi.ProductId == productId);

        if (inventory == null)
        {
            inventory = WarehouseInventory.Create(warehouseId, productId, available);
            inventory.UpdateQuantity(available, reserved);
            _context.WarehouseInventories.Add(inventory);
        }
        else
        {
            inventory.UpdateQuantity(available, reserved);
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<WarehouseTransferDto> CreateTransferAsync(
        string transferNumber,
        Guid sourceId,
        Guid destId,
        List<TransferItemDto> items,
        string? notes = null)
    {
        var transfer = WarehouseTransfer.Create(transferNumber, sourceId, destId, notes);

        foreach (var item in items)
        {
            transfer.AddItem(item.ProductId, item.Quantity);
        }

        _context.WarehouseTransfers.Add(transfer);
        await _context.SaveChangesAsync();

        return await GetTransferDtoAsync(transfer.Id);
    }

    public async Task<bool> ApproveTransferAsync(Guid transferId, string approvedBy)
    {
        var transfer = await _context.WarehouseTransfers.FindAsync(transferId);
        if (transfer == null) return false;

        transfer.Approve(approvedBy);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ShipTransferAsync(Guid transferId, string shippedBy, string? trackingNumber = null)
    {
        var transfer = await _context.WarehouseTransfers.FindAsync(transferId);
        if (transfer == null) return false;

        transfer.Ship(shippedBy, trackingNumber);

        // Deduct from source warehouse
        foreach (var item in transfer.Items)
        {
            var inv = await _context.WarehouseInventories
                .FirstOrDefaultAsync(wi => wi.WarehouseId == transfer.SourceWarehouseId && wi.ProductId == item.ProductId);
            if (inv != null)
            {
                inv.UpdateQuantity(Math.Max(0, inv.AvailableQuantity - item.Quantity), inv.ReservedQuantity);
            }
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ReceiveTransferAsync(Guid transferId, string receivedBy)
    {
        var transfer = await _context.WarehouseTransfers.FindAsync(transferId);
        if (transfer == null) return false;

        transfer.Receive(receivedBy);

        // Add to destination warehouse
        foreach (var item in transfer.Items)
        {
            var inv = await _context.WarehouseInventories
                .FirstOrDefaultAsync(wi => wi.WarehouseId == transfer.DestinationWarehouseId && wi.ProductId == item.ProductId);

            if (inv == null)
            {
                inv = WarehouseInventory.Create(transfer.DestinationWarehouseId, item.ProductId, item.Quantity);
                _context.WarehouseInventories.Add(inv);
            }
            else
            {
                inv.UpdateQuantity(inv.AvailableQuantity + item.Quantity, inv.ReservedQuantity);
            }
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> CancelTransferAsync(Guid transferId, string? reason = null)
    {
        var transfer = await _context.WarehouseTransfers.FindAsync(transferId);
        if (transfer == null) return false;

        transfer.Cancel(reason);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<Guid> CreateWarehouseAsync(CreateWarehouseRequest request)
    {
        var warehouse = Warehouse.Create(
            request.Name,
            request.Code,
            request.City,
            request.State,
            request.ZipCode,
            request.AddressLine1,
            request.ContactName,
            request.ContactPhone);

        warehouse.SetPriority(request.Priority);

        _context.Warehouses.Add(warehouse);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created warehouse {WarehouseCode} - {WarehouseName}", request.Code, request.Name);
        return warehouse.Id;
    }

    public async Task<bool> UpdateWarehouseAsync(Guid warehouseId, UpdateWarehouseRequest request)
    {
        var warehouse = await _context.Warehouses.FindAsync(warehouseId);
        if (warehouse == null) return false;

        if (!string.IsNullOrWhiteSpace(request.Name))
            warehouse = Warehouse.Create(request.Name, warehouse.Code, warehouse.City, warehouse.State, warehouse.ZipCode);

        if (request.Priority.HasValue)
            warehouse.SetPriority(request.Priority.Value);

        if (request.IsActive.HasValue)
        {
            if (request.IsActive.Value) warehouse.Activate();
            else warehouse.Deactivate();
        }

        if (request.IsDefault == true)
        {
            // Clear other defaults
            await _context.Warehouses.Where(w => w.IsDefault).ExecuteUpdateAsync(s => s.SetProperty(w => w.IsDefault, false));
            warehouse.SetAsDefault();
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteWarehouseAsync(Guid warehouseId)
    {
        var warehouse = await _context.Warehouses.FindAsync(warehouseId);
        if (warehouse == null) return false;

        warehouse.Deactivate();
        await _context.SaveChangesAsync();
        return true;
    }

    private async Task<WarehouseTransferDto> GetTransferDtoAsync(Guid transferId)
    {
        var transfer = await _context.WarehouseTransfers
            .Include(t => t.SourceWarehouse)
            .Include(t => t.DestinationWarehouse)
            .Include(t => t.Items)
            .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(t => t.Id == transferId);

        return MapTransferToDto(transfer!);
    }

    private WarehouseDto MapToDto(Warehouse warehouse)
    {
        return new WarehouseDto
        {
            Id = warehouse.Id,
            Name = warehouse.Name,
            Code = warehouse.Code,
            Description = warehouse.Description,
            IsActive = warehouse.IsActive,
            IsDefault = warehouse.IsDefault,
            AddressLine1 = warehouse.AddressLine1,
            AddressLine2 = warehouse.AddressLine2,
            City = warehouse.City,
            State = warehouse.State,
            ZipCode = warehouse.ZipCode,
            Country = warehouse.Country,
            Latitude = warehouse.Latitude,
            Longitude = warehouse.Longitude,
            ContactName = warehouse.ContactName,
            ContactPhone = warehouse.ContactPhone,
            ContactEmail = warehouse.ContactEmail,
            MaxCapacity = warehouse.MaxCapacity,
            CurrentCapacity = warehouse.CurrentCapacity,
            Priority = warehouse.Priority,
            DeliveryDaysMin = warehouse.DeliveryDaysMin,
            DeliveryDaysMax = warehouse.DeliveryDaysMax
        };
    }

    private WarehouseTransferDto MapTransferToDto(WarehouseTransfer transfer)
    {
        return new WarehouseTransferDto
        {
            Id = transfer.Id,
            TransferNumber = transfer.TransferNumber,
            SourceWarehouseId = transfer.SourceWarehouseId,
            SourceWarehouseName = transfer.SourceWarehouse?.Name ?? "",
            DestinationWarehouseId = transfer.DestinationWarehouseId,
            DestinationWarehouseName = transfer.DestinationWarehouse?.Name ?? "",
            Status = transfer.Status.ToString(),
            Notes = transfer.Notes,
            Items = transfer.Items.Select(i => new TransferItemDto
            {
                ProductId = i.ProductId,
                ProductName = i.Product?.Name ?? "",
                Quantity = i.Quantity
            }).ToList(),
            ApprovedBy = transfer.ApprovedBy,
            ApprovedAt = transfer.ApprovedAt,
            ShippedBy = transfer.ShippedBy,
            ShippedAt = transfer.ShippedAt,
            ReceivedBy = transfer.ReceivedBy,
            ReceivedAt = transfer.ReceivedAt,
            TrackingNumber = transfer.TrackingNumber,
            CreatedAt = transfer.CreatedAt
        };
    }
}