namespace FirstCry.API.Controllers.v1;

using FirstCry.Application.Common.Interfaces;
using FirstCry.Application.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/v1/warehouse")]
public class WarehouseController : ControllerBase
{
    private readonly IWarehouseService _warehouseService;
    private readonly ILogger<WarehouseController> _logger;

    public WarehouseController(IWarehouseService warehouseService, ILogger<WarehouseController> logger)
    {
        _warehouseService = warehouseService;
        _logger = logger;
    }

    /// <summary>
    /// Get all warehouses
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<WarehouseDto>>>> GetAll([FromQuery] bool activeOnly = true)
    {
        var warehouses = await _warehouseService.GetAllAsync(activeOnly);
        return Ok(ApiResponse<IEnumerable<WarehouseDto>>.SuccessResponse(warehouses));
    }

    /// <summary>
    /// Get warehouse by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<WarehouseDto>>> GetById(Guid id)
    {
        var warehouse = await _warehouseService.GetByIdAsync(id);
        return warehouse == null
            ? NotFound(ApiResponse<object>.ErrorResponse("Warehouse not found"))
            : Ok(ApiResponse<WarehouseDto>.SuccessResponse(warehouse));
    }

    /// <summary>
    /// Get default warehouse
    /// </summary>
    [HttpGet("default")]
    public async Task<ActionResult<ApiResponse<WarehouseDto>>> GetDefault()
    {
        var warehouse = await _warehouseService.GetDefaultAsync();
        return warehouse == null
            ? NotFound(ApiResponse<object>.ErrorResponse("No default warehouse configured"))
            : Ok(ApiResponse<WarehouseDto>.SuccessResponse(warehouse));
    }

    /// <summary>
    /// Find best warehouse for delivery (Admin only)
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpGet("find")]
    public async Task<ActionResult<ApiResponse<WarehouseDto>>> FindBestWarehouse(
        [FromQuery] string pincode,
        [FromQuery] Guid productId,
        [FromQuery] int quantity)
    {
        var warehouse = await _warehouseService.FindBestWarehouseAsync(pincode, productId, quantity);
        return warehouse == null
            ? NotFound(ApiResponse<object>.ErrorResponse("No suitable warehouse found"))
            : Ok(ApiResponse<WarehouseDto>.SuccessResponse(warehouse));
    }

    /// <summary>
    /// Get warehouse inventory (Admin only)
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpGet("{id}/inventory")]
    public async Task<ActionResult<ApiResponse<IEnumerable<WarehouseInventoryDto>>>> GetInventory(
        Guid id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var inventory = await _warehouseService.GetWarehouseInventoryAsync(id, page, pageSize);
        return Ok(ApiResponse<IEnumerable<WarehouseInventoryDto>>.SuccessResponse(inventory));
    }

    /// <summary>
    /// Create warehouse (Admin only)
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<Guid>>> Create([FromBody] CreateWarehouseRequest request)
    {
        var id = await _warehouseService.CreateWarehouseAsync(request);
        return Created($"/api/v1/warehouse/{id}", ApiResponse<Guid>.SuccessResponse(id, "Warehouse created successfully"));
    }

    /// <summary>
    /// Update warehouse (Admin only)
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> Update(Guid id, [FromBody] UpdateWarehouseRequest request)
    {
        var result = await _warehouseService.UpdateWarehouseAsync(id, request);
        return result
            ? Ok(ApiResponse<bool>.SuccessResponse(true, "Warehouse updated successfully"))
            : BadRequest(ApiResponse<bool>.ErrorResponse("Failed to update warehouse"));
    }

    /// <summary>
    /// Delete warehouse (Admin only)
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(Guid id)
    {
        var result = await _warehouseService.DeleteWarehouseAsync(id);
        return result
            ? Ok(ApiResponse<bool>.SuccessResponse(true, "Warehouse deleted successfully"))
            : BadRequest(ApiResponse<bool>.ErrorResponse("Failed to delete warehouse"));
    }

    /// <summary>
    /// Create transfer (Admin only)
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpPost("transfers")]
    public async Task<ActionResult<ApiResponse<WarehouseTransferDto>>> CreateTransfer([FromBody] CreateTransferRequest request)
    {
        var transfer = await _warehouseService.CreateTransferAsync(
            request.TransferNumber,
            request.SourceWarehouseId,
            request.DestinationWarehouseId,
            request.Items,
            request.Notes);

        return Created($"/api/v1/warehouse/transfers/{transfer.Id}", ApiResponse<WarehouseTransferDto>.SuccessResponse(transfer, "Transfer created successfully"));
    }

    /// <summary>
    /// Approve transfer (Admin only)
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpPost("transfers/{id}/approve")]
    public async Task<ActionResult<ApiResponse<bool>>> ApproveTransfer(Guid id)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "System";
        var result = await _warehouseService.ApproveTransferAsync(id, userId);
        return result
            ? Ok(ApiResponse<bool>.SuccessResponse(true, "Transfer approved"))
            : BadRequest(ApiResponse<bool>.ErrorResponse("Failed to approve transfer"));
    }

    /// <summary>
    /// Ship transfer (Admin only)
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpPost("transfers/{id}/ship")]
    public async Task<ActionResult<ApiResponse<bool>>> ShipTransfer(Guid id, [FromBody] ShipTransferRequest? request = null)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "System";
        var result = await _warehouseService.ShipTransferAsync(id, userId, request?.TrackingNumber);
        return result
            ? Ok(ApiResponse<bool>.SuccessResponse(true, "Transfer shipped"))
            : BadRequest(ApiResponse<bool>.ErrorResponse("Failed to ship transfer"));
    }

    /// <summary>
    /// Receive transfer (Admin only)
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpPost("transfers/{id}/receive")]
    public async Task<ActionResult<ApiResponse<bool>>> ReceiveTransfer(Guid id)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "System";
        var result = await _warehouseService.ReceiveTransferAsync(id, userId);
        return result
            ? Ok(ApiResponse<bool>.SuccessResponse(true, "Transfer received"))
            : BadRequest(ApiResponse<bool>.ErrorResponse("Failed to receive transfer"));
    }
}

public record CreateTransferRequest(
    string TransferNumber,
    Guid SourceWarehouseId,
    Guid DestinationWarehouseId,
    List<TransferItemDto> Items,
    string? Notes = null
);

public record ShipTransferRequest(string? TrackingNumber = null);