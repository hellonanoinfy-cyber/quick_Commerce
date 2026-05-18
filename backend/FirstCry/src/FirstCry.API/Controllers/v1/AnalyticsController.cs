namespace FirstCry.API.Controllers.v1;

using FirstCry.Application.Common.Interfaces;
using FirstCry.Application.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/v1/analytics")]
public class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsService _analyticsService;
    private readonly ILogger<AnalyticsController> _logger;

    public AnalyticsController(IAnalyticsService analyticsService, ILogger<AnalyticsController> logger)
    {
        _analyticsService = analyticsService;
        _logger = logger;
    }

    /// <summary>
    /// Get dashboard metrics (Admin only)
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpGet("dashboard")]
    public async Task<ActionResult<ApiResponse<DashboardMetricsDto>>> GetDashboardMetrics(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        var metrics = await _analyticsService.GetDashboardMetricsAsync(fromDate, toDate);
        return Ok(ApiResponse<DashboardMetricsDto>.SuccessResponse(metrics));
    }

    /// <summary>
    /// Get revenue analytics (Admin only)
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpGet("revenue")]
    public async Task<ActionResult<ApiResponse<IEnumerable<MetricDto>>>> GetRevenueAnalytics(
        [FromQuery] DateTime fromDate,
        [FromQuery] DateTime toDate,
        [FromQuery] string? granularity = "day")
    {
        var data = await _analyticsService.GetRevenueAnalyticsAsync(fromDate, toDate, granularity);
        return Ok(ApiResponse<IEnumerable<MetricDto>>.SuccessResponse(data));
    }

    /// <summary>
    /// Get sales analytics (Admin only)
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpGet("sales")]
    public async Task<ActionResult<ApiResponse<IEnumerable<MetricDto>>>> GetSalesAnalytics(
        [FromQuery] DateTime fromDate,
        [FromQuery] DateTime toDate,
        [FromQuery] string? groupBy = "product")
    {
        var data = await _analyticsService.GetSalesAnalyticsAsync(fromDate, toDate, groupBy);
        return Ok(ApiResponse<IEnumerable<MetricDto>>.SuccessResponse(data));
    }

    /// <summary>
    /// Get top products (Admin only)
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpGet("top-products")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ProductPerformanceDto>>>> GetTopProducts(
        [FromQuery] DateTime fromDate,
        [FromQuery] DateTime toDate,
        [FromQuery] int top = 10,
        [FromQuery] string? sortBy = "revenue")
    {
        var products = await _analyticsService.GetTopProductsAsync(fromDate, toDate, top, sortBy);
        return Ok(ApiResponse<IEnumerable<ProductPerformanceDto>>.SuccessResponse(products));
    }

    /// <summary>
    /// Get customer analytics (Admin only)
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpGet("customers")]
    public async Task<ActionResult<ApiResponse<CustomerAnalyticsDto>>> GetCustomerAnalytics(
        [FromQuery] DateTime fromDate,
        [FromQuery] DateTime toDate)
    {
        var data = await _analyticsService.GetCustomerAnalyticsAsync(fromDate, toDate);
        return Ok(ApiResponse<CustomerAnalyticsDto>.SuccessResponse(data));
    }

    /// <summary>
    /// Get customer segments (Admin only)
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpGet("customers/segments")]
    public async Task<ActionResult<ApiResponse<IEnumerable<CustomerSegmentDto>>>> GetCustomerSegments()
    {
        var segments = await _analyticsService.GetCustomerSegmentsAsync();
        return Ok(ApiResponse<IEnumerable<CustomerSegmentDto>>.SuccessResponse(segments));
    }

    /// <summary>
    /// Get recent customers (Admin only)
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpGet("customers/recent")]
    public async Task<ActionResult<ApiResponse<IEnumerable<RecentCustomerDto>>>> GetRecentCustomers(
        [FromQuery] int count = 20)
    {
        var customers = await _analyticsService.GetRecentCustomersAsync(count);
        return Ok(ApiResponse<IEnumerable<RecentCustomerDto>>.SuccessResponse(customers));
    }

    /// <summary>
    /// Get inventory analytics (Admin only)
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpGet("inventory")]
    public async Task<ActionResult<ApiResponse<InventoryAnalyticsDto>>> GetInventoryAnalytics()
    {
        var data = await _analyticsService.GetInventoryAnalyticsAsync();
        return Ok(ApiResponse<InventoryAnalyticsDto>.SuccessResponse(data));
    }

    /// <summary>
    /// Get low stock products (Admin only)
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpGet("inventory/low-stock")]
    public async Task<ActionResult<ApiResponse<IEnumerable<LowStockProductDto>>>> GetLowStockProducts()
    {
        var products = await _analyticsService.GetLowStockProductsAsync();
        return Ok(ApiResponse<IEnumerable<LowStockProductDto>>.SuccessResponse(products));
    }

    /// <summary>
    /// Get top searches (Admin only)
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpGet("searches")]
    public async Task<ActionResult<ApiResponse<IEnumerable<SearchQueryDto>>>> GetTopSearches(
        [FromQuery] int count = 20)
    {
        var searches = await _analyticsService.GetTopSearchesAsync(count);
        return Ok(ApiResponse<IEnumerable<SearchQueryDto>>.SuccessResponse(searches));
    }

    /// <summary>
    /// Get trending searches (Admin only)
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpGet("searches/trending")]
    public async Task<ActionResult<ApiResponse<IEnumerable<SearchQueryDto>>>> GetTrendingSearches(
        [FromQuery] int count = 10)
    {
        var searches = await _analyticsService.GetTrendingSearchesAsync(count);
        return Ok(ApiResponse<IEnumerable<SearchQueryDto>>.SuccessResponse(searches));
    }

    /// <summary>
    /// Get checkout funnel (Admin only)
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpGet("funnel/checkout")]
    public async Task<ActionResult<ApiResponse<IEnumerable<FunnelStepDto>>>> GetCheckoutFunnel(
        [FromQuery] DateTime fromDate,
        [FromQuery] DateTime toDate)
    {
        var funnel = await _analyticsService.GetCheckoutFunnelAsync(fromDate, toDate);
        return Ok(ApiResponse<IEnumerable<FunnelStepDto>>.SuccessResponse(funnel));
    }
}