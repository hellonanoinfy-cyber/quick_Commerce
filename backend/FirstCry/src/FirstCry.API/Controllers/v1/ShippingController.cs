namespace FirstCry.API.Controllers.v1;

using FirstCry.Application.Common.Interfaces;
using FirstCry.Application.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/v1/shipping")]
public class ShippingController : ControllerBase
{
    private readonly IShippingService _shippingService;
    private readonly ILogger<ShippingController> _logger;

    public ShippingController(IShippingService shippingService, ILogger<ShippingController> logger)
    {
        _shippingService = shippingService;
        _logger = logger;
    }

    /// <summary>
    /// Track a shipment
    /// </summary>
    [HttpGet("track/{awbNumber}")]
    public async Task<ActionResult<ApiResponse<ShipmentDto>>> TrackShipment(string awbNumber)
    {
        var shipment = await _shippingService.TrackShipmentAsync(awbNumber);
        return shipment == null
            ? NotFound(ApiResponse<object>.ErrorResponse("Shipment not found"))
            : Ok(ApiResponse<ShipmentDto>.SuccessResponse(shipment));
    }

    /// <summary>
    /// Get shipment by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<ShipmentDto>>> GetById(Guid id)
    {
        var shipment = await _shippingService.GetByIdAsync(id);
        return shipment == null
            ? NotFound(ApiResponse<object>.ErrorResponse("Shipment not found"))
            : Ok(ApiResponse<ShipmentDto>.SuccessResponse(shipment));
    }

    /// <summary>
    /// Get shipments for an order
    /// </summary>
    [HttpGet("order/{orderId}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ShipmentDto>>>> GetByOrderId(Guid orderId)
    {
        var shipments = await _shippingService.GetByOrderIdAsync(orderId);
        return Ok(ApiResponse<IEnumerable<ShipmentDto>>.SuccessResponse(shipments));
    }

    /// <summary>
    /// Get pending shipments (Admin only)
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpGet("pending")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ShipmentDto>>>> GetPendingShipments(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var shipments = await _shippingService.GetPendingShipmentsAsync(page, pageSize);
        return Ok(ApiResponse<IEnumerable<ShipmentDto>>.SuccessResponse(shipments));
    }

    /// <summary>
    /// Create shipment (Admin only)
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<ShipmentDto>>> CreateShipment([FromBody] CreateShipmentRequest request)
    {
        var shipment = await _shippingService.CreateShipmentAsync(request);
        return Created($"/api/v1/shipping/{shipment.Id}", ApiResponse<ShipmentDto>.SuccessResponse(shipment, "Shipment created"));
    }

    /// <summary>
    /// Update shipment status (Admin only)
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpPut("{id}/status")]
    public async Task<ActionResult<ApiResponse<bool>>> UpdateStatus(
        Guid id,
        [FromBody] UpdateStatusRequest request)
    {
        var result = await _shippingService.UpdateShipmentStatusAsync(id, request.Status, request.Reason);
        return result
            ? Ok(ApiResponse<bool>.SuccessResponse(true, "Status updated"))
            : BadRequest(ApiResponse<bool>.ErrorResponse("Failed to update status"));
    }

    /// <summary>
    /// Generate AWB (Admin only)
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpPost("generate-awb")]
    public async Task<ActionResult<ApiResponse<AwbGenerationResult>>> GenerateAwb([FromBody] GenerateAwbRequest request)
    {
        var result = await _shippingService.GenerateAwbAsync(request);
        return result.Success
            ? Ok(ApiResponse<AwbGenerationResult>.SuccessResponse(result, "AWB generated"))
            : BadRequest(ApiResponse<AwbGenerationResult>.SuccessResponse(result, result.Error ?? "Failed to generate AWB"));
    }

    /// <summary>
    /// Get label URL (Admin only)
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpGet("labels/{awbNumber}")]
    public async Task<ActionResult<ApiResponse<string>>> GetLabel(string awbNumber)
    {
        var url = await _shippingService.GetLabelUrlAsync(awbNumber);
        return Ok(ApiResponse<string>.SuccessResponse(url));
    }

    /// <summary>
    /// Handle shipping webhook (no auth - webhook from courier)
    /// </summary>
    [HttpPost("webhook")]
    public async Task<ActionResult> HandleWebhook([FromQuery] string courier)
    {
        using var reader = new StreamReader(Request.Body);
        var payload = await reader.ReadToEndAsync();

        var result = await _shippingService.ProcessTrackingWebhookAsync(courier, payload);

        return result ? Ok() : BadRequest();
    }
}

public record UpdateStatusRequest(string Status, string? Reason = null);