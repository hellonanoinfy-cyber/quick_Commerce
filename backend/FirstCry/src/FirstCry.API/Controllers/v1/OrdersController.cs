using FirstCry.Application.DTOs;
using FirstCry.Application.DTOs.Orders;
using FirstCry.Application.Features.Orders.Commands;
using FirstCry.Application.Features.Orders.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using DtosOrders = FirstCry.Application.DTOs.Orders;

namespace FirstCry.API.Controllers.v1;

[Authorize]
[ApiController]
[Route("api/v1/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IMediator _mediator;

    public OrdersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Place a new order from cart
    /// FIX: Uses proper DTO with explicit ShippingAddress to fix 400 Bad Request
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<Guid>>> PlaceOrder([FromBody] PlaceOrderRequestDto request)
    {
        if (request?.ShippingAddress == null)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("Shipping address is required."));
        }

        if (string.IsNullOrWhiteSpace(request.PaymentMethod))
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("Payment method is required."));
        }

        var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value 
            ?? User.FindFirst("sub")?.Value;
            
        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId)) 
        {
            return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));
        }
        
        // Convert DTO to domain ShippingAddress and parse payment method
        var shippingAddress = request.ShippingAddress.ToEntity();
        var paymentMethod = request.PaymentMethod.ToPaymentMethod();
        
        var command = new PlaceOrderCommand(userId, shippingAddress, paymentMethod);
        var result = await _mediator.Send(command);
        
        return Ok(ApiResponse<Guid>.SuccessResponse(result, "Order placed successfully"));
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedListDto<MyOrderDto>>>> GetMyOrders([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString)) return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));

        var userId = Guid.Parse(userIdString);
        var query = new GetMyOrdersQuery(userId, page, pageSize);
        var result = await _mediator.Send(query);
        return Ok(ApiResponse<PagedListDto<MyOrderDto>>.SuccessResponse(result));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<DtosOrders.OrderDetailDto>>> GetOrderById(Guid id)
    {
        var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value 
            ?? User.FindFirst("sub")?.Value;
            
        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId)) 
        {
            return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));
        }

        var query = new GetOrderByIdQuery(id, userId);
        var result = await _mediator.Send(query);
        return result != null 
            ? Ok(ApiResponse<Application.Features.Orders.Queries.OrderDetailDto>.SuccessResponse(result)) 
            : NotFound(ApiResponse<object>.ErrorResponse("Order not found"));
    }

    [HttpPut("{id}/cancel")]
    public async Task<ActionResult<ApiResponse<bool>>> CancelOrder(Guid id)
    {
        var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value 
            ?? User.FindFirst("sub")?.Value;
            
        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId)) 
        {
            return Unauthorized(ApiResponse<object>.ErrorResponse("Unauthorized"));
        }

        var command = new CancelOrderCommand(id, userId);
        var result = await _mediator.Send(command);
        return result 
            ? Ok(ApiResponse<bool>.SuccessResponse(true, "Order cancelled successfully")) 
            : NotFound(ApiResponse<bool>.ErrorResponse("Order not found or cannot be cancelled"));
    }

    /// <summary>
    /// Admin: Update order status
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpPut("{id}/status")]
    public async Task<ActionResult<ApiResponse<bool>>> UpdateOrderStatus(
        Guid id, 
        [FromBody] UpdateOrderStatusRequest request)
    {
        var command = new UpdateOrderStatusCommand(id, request.Status, request.Note);
        var result = await _mediator.Send(command);
        return result
            ? Ok(ApiResponse<bool>.SuccessResponse(true, "Order status updated successfully"))
            : BadRequest(ApiResponse<bool>.ErrorResponse("Failed to update order status"));
    }

    /// <summary>
    /// Admin: Get all orders with filtering
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpGet("admin/all")]
    public async Task<ActionResult<ApiResponse<PagedListDto<AdminOrderDto>>>> GetAllOrders(
        [FromQuery] GetAllOrdersQuery query)
    {
        var result = await _mediator.Send(query);
        return Ok(ApiResponse<PagedListDto<AdminOrderDto>>.SuccessResponse(result));
    }

    /// <summary>
    /// Admin: Get order details for management
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpGet("admin/{id}")]
    public async Task<ActionResult<ApiResponse<DtosOrders.OrderDetailDto>>> GetAdminOrderById(Guid id)
    {
        var result = await _mediator.Send(new GetAdminOrderByIdQuery(id));
        return result != null
            ? Ok(ApiResponse<DtosOrders.OrderDetailDto>.SuccessResponse(result))
            : NotFound(ApiResponse<object>.ErrorResponse("Order not found"));
    }

    /// <summary>
    /// Admin: Get order status timeline
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpGet("{id}/timeline")]
    public async Task<ActionResult<ApiResponse<IEnumerable<DtosOrders.OrderStatusHistoryDto>>>> GetOrderTimeline(Guid id)
    {
        var query = new GetOrderTimelineQuery(id);
        var result = await _mediator.Send(query);
        return Ok(ApiResponse<IEnumerable<DtosOrders.OrderStatusHistoryDto>>.SuccessResponse(result));
    }
}

public record UpdateOrderStatusRequest(string Status, string? Note = null);
