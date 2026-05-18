namespace FirstCry.Application.Common.Interfaces;

// ============================================================
// ANALYTICS & BUSINESS INTELLIGENCE SERVICE INTERFACE
// ============================================================

public interface IAnalyticsService
{
    // Dashboard metrics
    Task<DashboardMetricsDto> GetDashboardMetricsAsync(DateTime? fromDate = null, DateTime? toDate = null);
    Task<IEnumerable<MetricDto>> GetRevenueAnalyticsAsync(DateTime fromDate, DateTime toDate, string? granularity = "day");
    Task<IEnumerable<MetricDto>> GetSalesAnalyticsAsync(DateTime fromDate, DateTime toDate, string? groupBy = "product");

    // Product performance
    Task<IEnumerable<ProductPerformanceDto>> GetTopProductsAsync(DateTime fromDate, DateTime toDate, int top = 10, string? sortBy = "revenue");
    Task<IEnumerable<ProductPerformanceDto>> GetBottomProductsAsync(DateTime fromDate, DateTime toDate, int bottom = 10);

    // Customer analytics
    Task<CustomerAnalyticsDto> GetCustomerAnalyticsAsync(DateTime fromDate, DateTime toDate);
    Task<IEnumerable<CustomerSegmentDto>> GetCustomerSegmentsAsync();
    Task<IEnumerable<RecentCustomerDto>> GetRecentCustomersAsync(int count = 20);

    // Inventory analytics
    Task<InventoryAnalyticsDto> GetInventoryAnalyticsAsync();
    Task<IEnumerable<LowStockProductDto>> GetLowStockProductsAsync();

    // Search analytics
    Task<IEnumerable<SearchQueryDto>> GetTopSearchesAsync(int count = 20);
    Task<IEnumerable<SearchQueryDto>> GetTrendingSearchesAsync(int count = 10);

    // Funnel analytics
    Task<IEnumerable<FunnelStepDto>> GetCheckoutFunnelAsync(DateTime fromDate, DateTime toDate);
}

public class DashboardMetricsDto
{
    public decimal TodayRevenue { get; init; }
    public decimal YesterdayRevenue { get; init; }
    public decimal RevenueGrowthPercentage { get; init; }

    public int TodayOrders { get; init; }
    public int YesterdayOrders { get; init; }
    public decimal OrdersGrowthPercentage { get; init; }

    public int TotalCustomers { get; init; }
    public int NewCustomersToday { get; init; }
    public int NewCustomersThisMonth { get; init; }

    public decimal AverageOrderValue { get; init; }
    public decimal ConversionRate { get; init; }

    public int TotalProducts { get; init; }
    public int LowStockProducts { get; init; }
    public int OutOfStockProducts { get; init; }

    public List<RecentOrderDto> RecentOrders { get; init; } = new();
    public List<TopProductDto> TopProducts { get; init; } = new();
}

public class MetricDto
{
    public string Label { get; init; } = string.Empty;
    public decimal Value { get; init; }
    public decimal? ChangePercentage { get; init; }
    public DateTime? Date { get; init; }
}

public class ProductPerformanceDto
{
    public Guid ProductId { get; init; }
    public string ProductName { get; init; } = string.Empty;
    public string? ImageUrl { get; init; }

    public int Views { get; init; }
    public int UnitsSold { get; init; }
    public decimal Revenue { get; init; }
    public int OrdersCount { get; init; }

    public decimal CartToViewRate { get; init; }
    public decimal ConversionRate { get; init; }
}

public class CustomerAnalyticsDto
{
    public int TotalCustomers { get; init; }
    public int NewThisMonth { get; init; }
    public int ActiveThisMonth { get; init; }

    public decimal AverageOrderValue { get; init; }
    public decimal AverageLifetimeValue { get; init; }

    public decimal RetentionRate { get; init; }
    public int ChurnedCustomers { get; init; }

    public Dictionary<string, int> Segments { get; init; } = new();
}

public class CustomerSegmentDto
{
    public string Segment { get; init; } = string.Empty;
    public int Count { get; init; }
    public decimal AverageSpend { get; init; }
    public decimal Percentage { get; init; }
}

public class RecentCustomerDto
{
    public Guid UserId { get; init; }
    public string? Name { get; init; }
    public string? Phone { get; init; }
    public int TotalOrders { get; init; }
    public decimal TotalSpend { get; init; }
    public DateTime? LastOrderDate { get; init; }
}

public class InventoryAnalyticsDto
{
    public int TotalProducts { get; init; }
    public int InStockProducts { get; init; }
    public int LowStockProducts { get; init; }
    public int OutOfStockProducts { get; init; }

    public decimal TotalInventoryValue { get; init; }
    public decimal AverageStockLevel { get; init; }

    public int PendingRestocks { get; init; }
}

public class LowStockProductDto
{
    public Guid ProductId { get; init; }
    public string ProductName { get; init; } = string.Empty;
    public string? Sku { get; init; }
    public int CurrentStock { get; init; }
    public int ReorderLevel { get; init; }
    public int RecommendedReorder { get; init; }
}

public class SearchQueryDto
{
    public string Query { get; init; } = string.Empty;
    public int SearchCount { get; init; }
    public int ClickCount { get; init; }
    public int OrdersCount { get; init; }
    public decimal ClickThroughRate { get; init; }
    public decimal ConversionRate { get; init; }
    public bool IsTrending { get; init; }
}

public class FunnelStepDto
{
    public string StepName { get; init; } = string.Empty;
    public int Entered { get; init; }
    public int Exited { get; init; }
    public int Converted { get; init; }
    public decimal ConversionRate { get; init; }
    public decimal DropOffRate { get; init; }
}

public class RecentOrderDto
{
    public Guid OrderId { get; init; }
    public string OrderNumber { get; init; } = string.Empty;
    public string CustomerName { get; init; } = string.Empty;
    public decimal TotalAmount { get; init; }
    public string Status { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
}

public class TopProductDto
{
    public Guid ProductId { get; init; }
    public string ProductName { get; init; } = string.Empty;
    public string? ImageUrl { get; init; }
    public int UnitsSold { get; init; }
    public decimal Revenue { get; init; }
}