namespace FirstCry.Domain.Entities.Analytics;

using FirstCry.Domain.Common;

// ============================================================
// ANALYTICS & BUSINESS INTELLIGENCE ENTITIES
// ============================================================

/// <summary>
/// Aggregated daily metrics
/// </summary>
public class DailyMetric : BaseEntity
{
    public DateTime Date { get; private set; }
    public string MetricType { get; private set; } = string.Empty; // Revenue, Orders, Visitors, etc.

    public decimal Value { get; private set; }
    public decimal? PreviousValue { get; private set; } // For comparison

    // Breakdown
    public string? Category { get; private set; }
    public Guid? ProductId { get; private set; }

    // Metadata
    public string? Metadata { get; private set; } // JSON for extra data

    private DailyMetric() { }

    public static DailyMetric Create(DateTime date, string metricType, decimal value)
    {
        return new DailyMetric
        {
            Id = Guid.NewGuid(),
            Date = date.Date,
            MetricType = metricType,
            Value = value,
            CreatedAt = DateTime.UtcNow
        };
    }

    public decimal GetGrowthPercentage()
    {
        if (!PreviousValue.HasValue || PreviousValue.Value == 0)
            return 0;
        return ((Value - PreviousValue.Value) / PreviousValue.Value) * 100;
    }

    public void UpdateValue(decimal newValue)
    {
        PreviousValue = Value;
        Value = newValue;
    }
}

/// <summary>
/// Product performance tracking
/// </summary>
public class ProductPerformance : BaseEntity
{
    public Guid ProductId { get; private set; }
    public DateTime Date { get; private set; }

    // Views and engagement
    public int Views { get; private set; }
    public int UniqueVisitors { get; private set; }
    public int AddToCartCount { get; private set; }

    // Conversion
    public int OrdersCount { get; private set; }
    public int UnitsSold { get; private set; }
    public decimal Revenue { get; private set; }

    // Conversion rates
    public decimal CartToViewRate => Views > 0 ? (decimal)AddToCartCount / Views * 100 : 0;
    public decimal OrderToCartRate => AddToCartCount > 0 ? (decimal)OrdersCount / AddToCartCount * 100 : 0;

    // Inventory
    public int StockLevel { get; private set; }
    public bool IsLowStock { get; private set; }

    // Navigation
    public virtual Product? Product { get; private set; }

    private ProductPerformance() { }

    public static ProductPerformance Create(Guid productId, DateTime date)
    {
        return new ProductPerformance
        {
            Id = Guid.NewGuid(),
            ProductId = productId,
            Date = date.Date,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void RecordView(int count = 1) => Views += count;
    public void RecordCartAdd(int count = 1) => AddToCartCount += count;
    public void RecordSale(int units, decimal revenue)
    {
        OrdersCount++;
        UnitsSold += units;
        Revenue += revenue;
    }
    public void UpdateStock(int level)
    {
        StockLevel = level;
        IsLowStock = level <= 5;
    }
}

/// <summary>
/// Customer analytics
/// </summary>
public class CustomerMetric : BaseEntity
{
    public Guid UserId { get; private set; }
    public DateTime Date { get; private set; }

    public int TotalOrders { get; private set; }
    public decimal TotalSpend { get; private set; }
    public int TotalItems { get; private set; }
    public decimal AverageOrderValue => TotalOrders > 0 ? TotalSpend / TotalOrders : 0;

    public DateTime? FirstOrderDate { get; private set; }
    public DateTime? LastOrderDate { get; private set; }
    public int DaysSinceLastOrder => LastOrderDate.HasValue ? (DateTime.UtcNow - LastOrderDate.Value).Days : 999;

    public string CustomerSegment { get; private set; } = "New"; // New, Regular, VIP, AtRisk, Churned
    public int LoyaltyPoints { get; private set; }

    // Engagement
    public int WishlistCount { get; private set; }
    public int ReviewsCount { get; private set; }
    public int ReturnsCount { get; private set; }
    public decimal ReturnRate => TotalOrders > 0 ? (decimal)ReturnsCount / TotalOrders * 100 : 0;

    public virtual User? User { get; private set; }

    private CustomerMetric() { }

    public static CustomerMetric Create(Guid userId, DateTime date)
    {
        return new CustomerMetric
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Date = date.Date,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void UpdateSegment()
    {
        CustomerSegment = TotalOrders switch
        {
            0 => "New",
            <= 2 => "Regular",
            <= 5 => "Loyal",
            _ => "VIP"
        };

        if (DaysSinceLastOrder > 90 && TotalOrders > 0)
            CustomerSegment = "AtRisk";
        if (DaysSinceLastOrder > 180 && TotalOrders > 0)
            CustomerSegment = "Churned";
    }
}

/// <summary>
/// Search analytics
/// </summary>
public class SearchQuery : BaseEntity
{
    public string Query { get; private set; } = string.Empty;
    public string NormalizedQuery { get; private set; } = string.Empty;
    public string? Category { get; private set; }

    public int SearchCount { get; private set; }
    public int ResultsCount { get; private set; }

    public int ClickCount { get; private set; }
    public Guid? ClickedProductId { get; private set; }

    public int AddToCartCount { get; private set; }
    public int OrdersFromSearch { get; private set; }

    // Conversion funnels
    public decimal ClickThroughRate => SearchCount > 0 ? (decimal)ClickCount / SearchCount * 100 : 0;
    public decimal ConversionRate => ClickCount > 0 ? (decimal)OrdersFromSearch / ClickCount * 100 : 0;

    public bool IsTrending { get; private set; }
    public DateTime? TrendingSince { get; private set; }

    private SearchQuery() { }

    public static SearchQuery Create(string query, string? category = null)
    {
        return new SearchQuery
        {
            Id = Guid.NewGuid(),
            Query = query,
            NormalizedQuery = query.ToLowerInvariant().Trim(),
            Category = category,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void RecordSearch(int resultCount)
    {
        SearchCount++;
        ResultsCount = resultCount;
    }

    public void RecordClick(Guid productId)
    {
        ClickCount++;
        ClickedProductId = productId;
    }

    public void RecordConversion()
    {
        OrdersFromSearch++;
    }

    public void MarkAsTrending()
    {
        IsTrending = true;
        TrendingSince = DateTime.UtcNow;
    }
}

/// <summary>
/// Funnel analytics
/// </summary>
public class FunnelStep : BaseEntity
{
    public string FunnelName { get; private set; } = string.Empty; // e.g., "Checkout", "Search to Purchase"
    public string StepName { get; private set; } = string.Empty;

    public DateTime Date { get; private set; }
    public int StepOrder { get; private set; }

    public long EnteredCount { get; private set; }
    public long ExitedCount { get; private set; }
    public long ConvertedCount { get; private set; }

    public decimal ConversionRate => EnteredCount > 0 ? (decimal)ConvertedCount / EnteredCount * 100 : 0;
    public decimal DropOffRate => EnteredCount > 0 ? (decimal)ExitedCount / EnteredCount * 100 : 0;

    public decimal? AverageTimeInStepSeconds { get; private set; }

    private FunnelStep() { }

    public static FunnelStep Create(string funnelName, string stepName, int order)
    {
        return new FunnelStep
        {
            Id = Guid.NewGuid(),
            FunnelName = funnelName,
            StepName = stepName,
            StepOrder = order,
            Date = DateTime.UtcNow.Date,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void RecordEntry() => EnteredCount++;
    public void RecordExit() => ExitedCount++;
    public void RecordConversion() => ConvertedCount++;
}