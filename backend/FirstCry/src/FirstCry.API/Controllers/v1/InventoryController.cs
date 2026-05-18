namespace FirstCry.API.Controllers.v1;

using FirstCry.Application.Common.Interfaces;
using FirstCry.Application.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/v1/inventory")]
public class InventoryController : ControllerBase
{
    private readonly IInventoryService _inventoryService;
    private readonly ILogger<InventoryController> _logger;

    public InventoryController(IInventoryService inventoryService, ILogger<InventoryController> logger)
    {
        _inventoryService = inventoryService;
        _logger = logger;
    }

    /// <summary>
    /// Get inventory for a product
    /// </summary>
    [HttpGet("product/{productId}")]
    public async Task<ActionResult<ApiResponse<InventoryDto>>> GetProductInventory(
        Guid productId,
        [FromQuery] Guid? warehouseId = null)
    {
        var inventory = await _inventoryService.GetByProductIdAsync(productId, warehouseId);
        return inventory == null
            ? NotFound(ApiResponse<object>.ErrorResponse("Inventory not found"))
            : Ok(ApiResponse<InventoryDto>.SuccessResponse(inventory));
    }

    /// <summary>
    /// Get all warehouses for a product
    /// </summary>
    [HttpGet("product/{productId}/warehouses")]
    public async Task<ActionResult<ApiResponse<IEnumerable<InventoryDto>>>> GetProductAcrossWarehouses(Guid productId)
    {
        var inventories = await _inventoryService.GetProductInventoryAcrossWarehousesAsync(productId);
        return Ok(ApiResponse<IEnumerable<InventoryDto>>.SuccessResponse(inventories));
    }

    /// <summary>
    /// Get low stock items (Admin only)
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpGet("low-stock")]
    public async Task<ActionResult<ApiResponse<IEnumerable<InventoryDto>>>> GetLowStockItems()
    {
        var items = await _inventoryService.GetLowStockItemsAsync();
        return Ok(ApiResponse<IEnumerable<InventoryDto>>.SuccessResponse(items));
    }

    /// <summary>
    /// Get warehouse inventory (Admin only)
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpGet("warehouse/{warehouseId}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<InventoryDto>>>> GetWarehouseInventory(
        Guid warehouseId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var inventories = await _inventoryService.GetWarehouseInventoryAsync(warehouseId);
        return Ok(ApiResponse<IEnumerable<InventoryDto>>.SuccessResponse(inventories));
    }

    /// <summary>
    /// Adjust inventory (Admin only)
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpPost("{productId}/adjust")]
    public async Task<ActionResult<ApiResponse<bool>>> AdjustStock(
        Guid productId,
        [FromBody] AdjustStockRequest request)
    {
        var result = await _inventoryService.AdjustStockAsync(
            productId,
            request.Quantity,
            request.Reason,
            request.AdjustedBy);

        return result
            ? Ok(ApiResponse<bool>.SuccessResponse(true, "Stock adjusted successfully"))
            : BadRequest(ApiResponse<bool>.ErrorResponse("Failed to adjust stock"));
    }

    /// <summary>
    /// Restock product (Admin only)
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpPost("{productId}/restock")]
    public async Task<ActionResult<ApiResponse<bool>>> Restock(
        Guid productId,
        [FromBody] RestockRequest request)
    {
        var result = await _inventoryService.RestockAsync(
            productId,
            request.Quantity,
            request.Reason,
            request.RestockedBy);

        return result
            ? Ok(ApiResponse<bool>.SuccessResponse(true, "Product restocked successfully"))
            : BadRequest(ApiResponse<bool>.ErrorResponse("Failed to restock"));
    }

    /// <summary>
    /// Set reorder levels (Admin only)
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpPut("{productId}/reorder-levels")]
    public async Task<ActionResult<ApiResponse<bool>>> SetReorderLevels(
        Guid productId,
        [FromBody] SetReorderLevelsRequest request)
    {
        var result = await _inventoryService.SetReorderLevelsAsync(productId, request.ReorderLevel, request.ReorderQuantity);
        return result
            ? Ok(ApiResponse<bool>.SuccessResponse(true))
            : BadRequest(ApiResponse<bool>.ErrorResponse("Failed to set reorder levels"));
    }
}

public record AdjustStockRequest(int Quantity, string Reason, string AdjustedBy);
public record RestockRequest(int Quantity, string? Reason = null, string? RestockedBy = null);
public record SetReorderLevelsRequest(int ReorderLevel, int ReorderQuantity);