using FirstCry.Application.DTOs;
using FirstCry.Application.DTOs.Admin;
using FirstCry.Application.Features.Admin.Commands;
using FirstCry.Application.Features.Admin.Queries;
using FirstCry.Application.Features.Products.Commands;
using FirstCry.Application.DTOs.Catalog;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FirstCry.Application.Common.Interfaces;
using FirstCry.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FirstCry.API.Controllers.v1;

[Authorize(Policy = "AdminOnly")]
[ApiController]
[Route("api/v1/admin")]
public class AdminController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IApplicationDbContext _context;
    private readonly ILogger<AdminController> _logger;

    public AdminController(IMediator mediator, IApplicationDbContext context, ILogger<AdminController> logger)
    {
        _mediator = mediator;
        _context = context;
        _logger = logger;
    }

    private void LogAdminHit(string endpoint)
    {
        var userRole = User.FindFirst("role")?.Value ?? User.FindFirst(ClaimTypes.Role)?.Value ?? "(none)";
        _logger.LogInformation("ADMIN ENDPOINT HIT {Endpoint}", endpoint);
        _logger.LogInformation("USER ROLE: {Role}", userRole);
    }

    #region Dashboard

    [HttpGet("dashboard")]
    public async Task<ActionResult<ApiResponse<AdminDashboardDto>>> GetDashboard()
    {
        LogAdminHit("dashboard");

        var result = await _mediator.Send(new GetAdminDashboardQuery());
        return Ok(ApiResponse<AdminDashboardDto>.SuccessResponse(result));
    }

    #endregion

    #region Products

    [HttpGet("products")]
    public async Task<ActionResult<ApiResponse<PagedListDto<AdminProductDto>>>> GetProducts([FromQuery] GetAdminProductsQuery query)
    {
        LogAdminHit("products");

        var result = await _mediator.Send(query);
        return Ok(ApiResponse<PagedListDto<AdminProductDto>>.SuccessResponse(result));
    }

    [HttpGet("products/{id:guid}")]
    public async Task<ActionResult<ApiResponse<AdminProductDto>>> GetProduct(Guid id)
    {
        var result = await _mediator.Send(new GetAdminProductByIdQuery(id));
        return result != null
            ? Ok(ApiResponse<AdminProductDto>.SuccessResponse(result))
            : NotFound(ApiResponse<object>.ErrorResponse("Product not found"));
    }

    [HttpPost("products")]
    public async Task<ActionResult<ApiResponse<Guid>>> CreateProduct([FromBody] CreateProductCommand command)
    {
        LogAdminHit("products:create");

        var result = await _mediator.Send(command);
        return Ok(ApiResponse<Guid>.SuccessResponse(result, "Product created successfully"));
    }

    [HttpPut("products/{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateProduct(Guid id, [FromBody] UpdateProductCommand command)
    {
        LogAdminHit("products:update");

        if (id != command.Id) return BadRequest(ApiResponse<object>.ErrorResponse("ID mismatch"));
        var result = await _mediator.Send(command);
        return result
            ? Ok(ApiResponse<object>.SuccessResponse(null, "Product updated successfully"))
            : NotFound(ApiResponse<object>.ErrorResponse("Product not found"));
    }

    [HttpDelete("products/{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteProduct(Guid id)
    {
        var result = await _mediator.Send(new AdminDeleteProductCommand(id));
        return result
            ? Ok(ApiResponse<object>.SuccessResponse(null, "Product deleted successfully"))
            : NotFound(ApiResponse<object>.ErrorResponse("Product not found"));
    }

    [HttpPut("products/{id:guid}/stock")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateStock(Guid id, [FromBody] AdminStockRequest request)
    {
        LogAdminHit("products:stock");

        await _mediator.Send(new UpdateProductStockCommand(id, request.StockQuantity));
        return Ok(ApiResponse<object>.SuccessResponse(null, "Stock updated successfully"));
    }

    [HttpPatch("products/{id:guid}/toggle")]
    public async Task<ActionResult<ApiResponse<object>>> ToggleProduct(Guid id)
    {
        LogAdminHit("products:toggle");

        var result = await _mediator.Send(new ToggleProductStatusCommand(id));
        return result
            ? Ok(ApiResponse<object>.SuccessResponse(null, "Product status toggled successfully"))
            : NotFound(ApiResponse<object>.ErrorResponse("Product not found"));
    }

    #endregion

    #region Categories

    [HttpGet("categories")]
    public async Task<ActionResult<ApiResponse<PagedListDto<AdminCategoryDto>>>> GetCategories([FromQuery] GetAdminCategoriesQuery query)
    {
        LogAdminHit("categories");
        var result = await _mediator.Send(query);
        return Ok(ApiResponse<PagedListDto<AdminCategoryDto>>.SuccessResponse(result));
    }

    [HttpGet("categories/{id:guid}")]
    public async Task<ActionResult<ApiResponse<AdminCategoryDto>>> GetCategory(Guid id)
    {
        var result = await _mediator.Send(new GetAdminCategoryByIdQuery(id));
        return result != null
            ? Ok(ApiResponse<AdminCategoryDto>.SuccessResponse(result))
            : NotFound(ApiResponse<object>.ErrorResponse("Category not found"));
    }

    [HttpPost("categories")]
    public async Task<ActionResult<ApiResponse<Guid>>> CreateCategory([FromBody] CreateCategoryCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(ApiResponse<Guid>.SuccessResponse(result, "Category created successfully"));
    }

    [HttpPut("categories/{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateCategory(Guid id, [FromBody] UpdateCategoryCommand command)
    {
        if (id != command.Id) return BadRequest(ApiResponse<object>.ErrorResponse("ID mismatch"));
        var result = await _mediator.Send(command);
        return result
            ? Ok(ApiResponse<object>.SuccessResponse(null, "Category updated successfully"))
            : NotFound(ApiResponse<object>.ErrorResponse("Category not found"));
    }

    [HttpDelete("categories/{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteCategory(Guid id)
    {
        var result = await _mediator.Send(new DeleteCategoryCommand(id));
        return result
            ? Ok(ApiResponse<object>.SuccessResponse(null, "Category deleted successfully"))
            : NotFound(ApiResponse<object>.ErrorResponse("Category not found"));
    }

    #endregion

    #region Orders

    [HttpGet("orders")]
    public async Task<ActionResult<ApiResponse<PagedListDto<AdminOrderDto>>>> GetOrders([FromQuery] GetAdminOrdersQuery query)
    {
        LogAdminHit("orders");
        var result = await _mediator.Send(query);
        return Ok(ApiResponse<PagedListDto<AdminOrderDto>>.SuccessResponse(result));
    }

    [HttpPut("orders/{id:guid}/status")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateOrderStatus(Guid id, [FromBody] AdminOrderStatusRequest request)
    {
        LogAdminHit("orders:status");
        var result = await _mediator.Send(new AdminUpdateOrderStatusCommand(id, request.Status, request.Note));
        return result
            ? Ok(ApiResponse<object>.SuccessResponse(null, "Order status updated successfully"))
            : BadRequest(ApiResponse<object>.ErrorResponse("Order not found or invalid status"));
    }

    #endregion

    #region Customers

    [HttpGet("customers")]
    public async Task<ActionResult<ApiResponse<PagedListDto<AdminCustomerDto>>>> GetCustomers([FromQuery] GetAdminCustomersQuery query)
    {
        LogAdminHit("customers");
        var result = await _mediator.Send(query);
        return Ok(ApiResponse<PagedListDto<AdminCustomerDto>>.SuccessResponse(result));
    }

    [HttpPut("customers/{id:guid}/block")]
    public async Task<ActionResult<ApiResponse<object>>> SetCustomerBlocked(Guid id, [FromBody] AdminCustomerBlockRequest request)
    {
        LogAdminHit("customers:block");
        var result = await _mediator.Send(new AdminSetCustomerBlockedCommand(id, request.Blocked));
        return result
            ? Ok(ApiResponse<object>.SuccessResponse(null, request.Blocked ? "Customer blocked" : "Customer unblocked"))
            : NotFound(ApiResponse<object>.ErrorResponse("Customer not found"));
    }

    #endregion

    #region Reviews

    [HttpGet("reviews")]
    public async Task<ActionResult<ApiResponse<PagedListDto<AdminReviewDto>>>> GetReviews([FromQuery] GetAdminReviewsQuery query)
    {
        LogAdminHit("reviews");
        var result = await _mediator.Send(query);
        return Ok(ApiResponse<PagedListDto<AdminReviewDto>>.SuccessResponse(result));
    }

    [HttpPatch("reviews/{id:guid}/status")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateReviewStatus(Guid id, [FromBody] AdminReviewStatusRequest request)
    {
        LogAdminHit("reviews:status");
        var result = await _mediator.Send(new UpdateReviewStatusCommand(id, request.Status));
        return result
            ? Ok(ApiResponse<object>.SuccessResponse(null, "Review status updated"))
            : NotFound(ApiResponse<object>.ErrorResponse("Review not found"));
    }

    [HttpDelete("reviews/{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteReview(Guid id)
    {
        LogAdminHit("reviews:delete");
        var result = await _mediator.Send(new DeleteReviewCommand(id));
        return result
            ? Ok(ApiResponse<object>.SuccessResponse(null, "Review deleted successfully"))
            : NotFound(ApiResponse<object>.ErrorResponse("Review not found"));
    }

    #endregion

    #region Inventory

    [HttpGet("inventory")]
    public async Task<ActionResult<ApiResponse<PagedListDto<AdminInventoryDto>>>> GetInventory([FromQuery] GetAdminInventoryQuery query)
    {
        LogAdminHit("inventory");
        var result = await _mediator.Send(query);
        return Ok(ApiResponse<PagedListDto<AdminInventoryDto>>.SuccessResponse(result));
    }

    [HttpGet("inventory/alerts")]
    public async Task<ActionResult<ApiResponse<List<AdminInventoryAlertDto>>>> GetInventoryAlerts()
    {
        LogAdminHit("inventory:alerts");
        var result = await _mediator.Send(new GetAdminInventoryAlertsQuery());
        return Ok(ApiResponse<List<AdminInventoryAlertDto>>.SuccessResponse(result));
    }

    #endregion

    #region Coupons

    [HttpGet("coupons")]
    public async Task<ActionResult<ApiResponse<PagedListDto<AdminCouponDto>>>> GetCoupons([FromQuery] AdminCouponQuery query)
    {
        LogAdminHit("coupons");
        var result = await _mediator.Send(query);
        return Ok(ApiResponse<PagedListDto<AdminCouponDto>>.SuccessResponse(result));
    }

    [HttpPost("coupons")]
    public async Task<ActionResult<ApiResponse<Guid>>> CreateCoupon([FromBody] CreateCouponCommand command)
    {
        LogAdminHit("coupons:create");
        var result = await _mediator.Send(command);
        return Ok(ApiResponse<Guid>.SuccessResponse(result, "Coupon created successfully"));
    }

    [HttpPut("coupons/{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateCoupon(Guid id, [FromBody] UpdateCouponCommand command)
    {
        LogAdminHit("coupons:update");
        if (id != command.Id) return BadRequest(ApiResponse<object>.ErrorResponse("ID mismatch"));
        var result = await _mediator.Send(command);
        return result
            ? Ok(ApiResponse<object>.SuccessResponse(null, "Coupon updated successfully"))
            : NotFound(ApiResponse<object>.ErrorResponse("Coupon not found"));
    }

    [HttpDelete("coupons/{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteCoupon(Guid id)
    {
        LogAdminHit("coupons:delete");
        var result = await _mediator.Send(new DeleteCouponCommand(id));
        return result
            ? Ok(ApiResponse<object>.SuccessResponse(null, "Coupon deleted successfully"))
            : NotFound(ApiResponse<object>.ErrorResponse("Coupon not found"));
    }

    #endregion

    #region Banners

    [HttpGet("banners")]
    public async Task<ActionResult<ApiResponse<PagedListDto<AdminBannerDto>>>> GetBanners([FromQuery] AdminBannerQuery query)
    {
        LogAdminHit("banners");
        var result = await _mediator.Send(query);
        return Ok(ApiResponse<PagedListDto<AdminBannerDto>>.SuccessResponse(result));
    }

    [HttpPost("banners")]
    public async Task<ActionResult<ApiResponse<Guid>>> CreateBanner([FromBody] CreateBannerCommand command)
    {
        LogAdminHit("banners:create");
        var result = await _mediator.Send(command);
        return Ok(ApiResponse<Guid>.SuccessResponse(result, "Banner created successfully"));
    }

    [HttpPut("banners/{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateBanner(Guid id, [FromBody] UpdateBannerCommand command)
    {
        LogAdminHit("banners:update");
        if (id != command.Id) return BadRequest(ApiResponse<object>.ErrorResponse("ID mismatch"));
        var result = await _mediator.Send(command);
        return result
            ? Ok(ApiResponse<object>.SuccessResponse(null, "Banner updated successfully"))
            : NotFound(ApiResponse<object>.ErrorResponse("Banner not found"));
    }

    [HttpDelete("banners/{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteBanner(Guid id)
    {
        LogAdminHit("banners:delete");
        var result = await _mediator.Send(new DeleteBannerCommand(id));
        return result
            ? Ok(ApiResponse<object>.SuccessResponse(null, "Banner deleted successfully"))
            : NotFound(ApiResponse<object>.ErrorResponse("Banner not found"));
    }

    #endregion
}

public record AdminStockRequest(int StockQuantity);
public record AdminOrderStatusRequest(string Status, string? Note);
public record AdminCustomerBlockRequest(bool Blocked);
public record AdminReviewStatusRequest(string Status);
