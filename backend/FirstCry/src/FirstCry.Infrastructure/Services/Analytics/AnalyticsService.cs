namespace FirstCry.Infrastructure.Services.Analytics;

using FirstCry.Application.Common.Interfaces;
using FirstCry.Infrastructure.Data.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

public class AnalyticsService : IAnalyticsService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AnalyticsService> _logger;
    private readonly ICacheService _cacheService;

    public AnalyticsService(
        ApplicationDbContext context,
        ILogger<AnalyticsService> logger,
        ICacheService cacheService)
    {
        _context = context;
        _logger = logger;
        _cacheService = cacheService;
    }

    public async Task<DashboardMetricsDto> GetDashboardMetricsAsync(DateTime? fromDate = null, DateTime? toDate = null)
    {
        var today = DateTime.UtcNow.Date;
        var yesterday = today.AddDays(-1);
        var startOfMonth = new DateTime(today.Year, today.Month, 1);

        // Revenue
        var todayRevenue = await _context.Orders
            .Where(o => o.CreatedAt.Date == today && o.Status != Domain.Entities.Orders.OrderStatus.Cancelled)
            .SumAsync(o => o.TotalAmount);

        var yesterdayRevenue = await _context.Orders
            .Where(o => o.CreatedAt.Date == yesterday && o.Status != Domain.Entities.Orders.OrderStatus.Cancelled)
            .SumAsync(o => o.TotalAmount);

        // Orders
        var todayOrders = await _context.Orders
            .CountAsync(o => o.CreatedAt.Date == today && o.Status != Domain.Entities.Orders.OrderStatus.Cancelled);

        var yesterdayOrders = await _context.Orders
            .CountAsync(o => o.CreatedAt.Date == yesterday && o.Status != Domain.Entities.Orders.OrderStatus.Cancelled);

        // Customers
        var totalCustomers = await _context.Users.CountAsync();
        var newCustomersToday = await _context.Users.CountAsync(u => u.CreatedAt.Date == today);
        var newCustomersThisMonth = await _context.Users.CountAsync(u => u.CreatedAt.Date >= startOfMonth);

        // Products
        var totalProducts = await _context.Products.CountAsync(p => p.IsActive);
        var lowStockProducts = await _context.Products.CountAsync(p => p.IsActive && p.StockQuantity <= 10);
        var outOfStockProducts = await _context.Products.CountAsync(p => p.IsActive && p.StockQuantity == 0);

        // Recent orders
        var recentOrders = await _context.Orders
            .Include(o => o.ShippingAddress)
            .Where(o => o.Status != Domain.Entities.Orders.OrderStatus.Cancelled)
            .OrderByDescending(o => o.CreatedAt)
            .Take(5)
            .Select(o => new RecentOrderDto
            {
                OrderId = o.Id,
                OrderNumber = o.OrderNumber,
                CustomerName = o.ShippingAddress != null ? o.ShippingAddress.FullName : "Unknown",
                TotalAmount = o.TotalAmount,
                Status = o.Status.ToString(),
                CreatedAt = o.CreatedAt
            })
            .ToListAsync();

        // Top products
        var topProducts = await _context.OrderItems
            .GroupBy(oi => oi.ProductId)
            .Select(g => new
            {
                ProductId = g.Key,
                UnitsSold = g.Sum(oi => oi.Quantity)
            })
            .OrderByDescending(x => x.UnitsSold)
            .Take(5)
            .Join(_context.Products, x => x.ProductId, p => p.Id, (x, p) => new TopProductDto
            {
                ProductId = p.Id,
                ProductName = p.Name,
                ImageUrl = p.Images.FirstOrDefault(i => i.IsPrimary) != null
                    ? p.Images.First(i => i.IsPrimary).Url
                    : p.Images.FirstOrDefault()!.Url,
                UnitsSold = x.UnitsSold,
                Revenue = x.UnitsSold * p.Price
            })
            .ToListAsync();

        return new DashboardMetricsDto
        {
            TodayRevenue = todayRevenue,
            YesterdayRevenue = yesterdayRevenue,
            RevenueGrowthPercentage = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0,
            TodayOrders = todayOrders,
            YesterdayOrders = yesterdayOrders,
            OrdersGrowthPercentage = yesterdayOrders > 0 ? (decimal)((todayOrders - yesterdayOrders) / (double)yesterdayOrders) * 100 : 0,
            TotalCustomers = totalCustomers,
            NewCustomersToday = newCustomersToday,
            NewCustomersThisMonth = newCustomersThisMonth,
            AverageOrderValue = todayOrders > 0 ? todayRevenue / todayOrders : 0,
            TotalProducts = totalProducts,
            LowStockProducts = lowStockProducts,
            OutOfStockProducts = outOfStockProducts,
            RecentOrders = recentOrders,
            TopProducts = topProducts,
            ConversionRate = 2.5m // Mock for now
        };
    }

    public async Task<IEnumerable<MetricDto>> GetRevenueAnalyticsAsync(DateTime fromDate, DateTime toDate, string? granularity = "day")
    {
        var days = (toDate - fromDate).Days + 1;

        var revenueData = await _context.Orders
            .Where(o => o.CreatedAt.Date >= fromDate && o.CreatedAt.Date <= toDate)
            .GroupBy(o => granularity == "day" ? o.CreatedAt.Date : o.CreatedAt)
            .Select(g => new MetricDto
            {
                Label = g.Key.ToString("yyyy-MM-dd"),
                Value = g.Sum(o => o.TotalAmount),
                Date = g.Key
            })
            .OrderBy(m => m.Date)
            .ToListAsync();

        return revenueData;
    }

    public async Task<IEnumerable<MetricDto>> GetSalesAnalyticsAsync(DateTime fromDate, DateTime toDate, string? groupBy = "product")
    {
        // This would be more complex in production with proper OLAP
        var salesData = await _context.OrderItems
            .Include(oi => oi.Order)
            .Where(oi => oi.Order.CreatedAt >= fromDate && oi.Order.CreatedAt <= toDate)
            .GroupBy(oi => groupBy == "product" ? oi.ProductName : oi.ProductId.ToString())
            .Select(g => new MetricDto
            {
                Label = g.Key,
                Value = g.Sum(oi => oi.UnitPrice * oi.Quantity),
                Date = null
            })
            .OrderByDescending(m => m.Value)
            .Take(50)
            .ToListAsync();

        return salesData;
    }

    public async Task<IEnumerable<ProductPerformanceDto>> GetTopProductsAsync(
        DateTime fromDate, DateTime toDate, int top = 10, string? sortBy = "revenue")
    {
        var products = await _context.Products
            .Include(p => p.Images)
            .ToListAsync();

        var productStats = await _context.OrderItems
            .Include(oi => oi.Order)
            .Where(oi => oi.Order.CreatedAt >= fromDate && oi.Order.CreatedAt <= toDate)
            .GroupBy(oi => oi.ProductId)
            .Select(g => new
            {
                ProductId = g.Key,
                Views = 0, // Would come from analytics table
                UnitsSold = g.Sum(oi => oi.Quantity),
                Revenue = g.Sum(oi => oi.UnitPrice * oi.Quantity),
                OrdersCount = g.Count()
            })
            .ToListAsync();

        return productStats
            .OrderByDescending(p => sortBy == "revenue" ? p.Revenue : p.UnitsSold)
            .Take(top)
            .Join(products, ps => ps.ProductId, p => p.Id, (ps, p) => new ProductPerformanceDto
            {
                ProductId = p.Id,
                ProductName = p.Name,
                ImageUrl = p.Images.FirstOrDefault(i => i.IsPrimary)?.Url,
                Views = ps.Views,
                UnitsSold = ps.UnitsSold,
                Revenue = ps.Revenue,
                OrdersCount = ps.OrdersCount,
                ConversionRate = ps.Views > 0 ? (decimal)ps.OrdersCount / ps.Views * 100 : 0
            })
            .ToList();
    }

    public async Task<IEnumerable<ProductPerformanceDto>> GetBottomProductsAsync(DateTime fromDate, DateTime toDate, int bottom = 10)
    {
        var productStats = await _context.OrderItems
            .Include(oi => oi.Order)
            .Where(oi => oi.Order.CreatedAt >= fromDate && oi.Order.CreatedAt <= toDate)
            .GroupBy(oi => oi.ProductId)
            .Select(g => new
            {
                ProductId = g.Key,
                UnitsSold = g.Sum(oi => oi.Quantity)
            })
            .OrderBy(p => p.UnitsSold)
            .Take(bottom)
            .ToListAsync();

        var products = await _context.Products
            .Include(p => p.Images)
            .Where(p => productStats.Select(ps => ps.ProductId).Contains(p.Id))
            .ToListAsync();

        return productStats
            .Join(products, ps => ps.ProductId, p => p.Id, (ps, p) => new ProductPerformanceDto
            {
                ProductId = p.Id,
                ProductName = p.Name,
                ImageUrl = p.Images.FirstOrDefault(i => i.IsPrimary)?.Url,
                UnitsSold = ps.UnitsSold,
                Revenue = 0
            })
            .ToList();
    }

    public async Task<CustomerAnalyticsDto> GetCustomerAnalyticsAsync(DateTime fromDate, DateTime toDate)
    {
        var customers = await _context.Users.ToListAsync();
        var orders = await _context.Orders
            .Where(o => o.CreatedAt >= fromDate && o.CreatedAt <= toDate)
            .ToListAsync();

        var totalCustomers = customers.Count;
        var newThisMonth = customers.Count(c => c.CreatedAt >= fromDate);
        var activeThisMonth = orders.Select(o => o.UserId).Distinct().Count();

        var segmentCounts = new Dictionary<string, int>
        {
            ["New"] = customers.Count(c => orders.Count(o => o.UserId == c.Id) == 0),
            ["Regular"] = customers.Count(c => orders.Count(o => o.UserId == c.Id) is > 0 and <= 3),
            ["Loyal"] = customers.Count(c => orders.Count(o => o.UserId == c.Id) is > 3 and <= 10),
            ["VIP"] = customers.Count(c => orders.Count(o => o.UserId == c.Id) > 10)
        };

        return new CustomerAnalyticsDto
        {
            TotalCustomers = totalCustomers,
            NewThisMonth = newThisMonth,
            ActiveThisMonth = activeThisMonth,
            AverageOrderValue = orders.Any() ? (decimal)orders.Average(o => o.TotalAmount) : 0,
            RetentionRate = totalCustomers > 0 ? (decimal)activeThisMonth / totalCustomers * 100 : 0,
            Segments = segmentCounts
        };
    }

    public async Task<IEnumerable<CustomerSegmentDto>> GetCustomerSegmentsAsync()
    {
        var customers = await _context.Users.ToListAsync();
        var orders = await _context.Orders.ToListAsync();

        var segments = customers
            .GroupBy(c => orders.Count(o => o.UserId == c.Id) switch
            {
                0 => "New",
                <= 2 => "Regular",
                <= 5 => "Loyal",
                _ => "VIP"
            })
            .Select(g => new CustomerSegmentDto
            {
                Segment = g.Key,
                Count = g.Count(),
                AverageSpend = g.Average(c => orders.Where(o => o.UserId == c.Id).Sum(o => o.TotalAmount)),
                Percentage = customers.Count > 0 ? (decimal)g.Count() / customers.Count * 100 : 0
            })
            .ToList();

        return segments;
    }

    public async Task<IEnumerable<RecentCustomerDto>> GetRecentCustomersAsync(int count = 20)
    {
        return await _context.Users
            .OrderByDescending(u => u.CreatedAt)
            .Take(count)
            .Select(u => new RecentCustomerDto
            {
                UserId = u.Id,
                Name = u.Name,
                Phone = u.PhoneNumber,
                TotalOrders = _context.Orders.Count(o => o.UserId == u.Id),
                TotalSpend = _context.Orders.Where(o => o.UserId == u.Id).Sum(o => o.TotalAmount),
                LastOrderDate = _context.Orders.Where(o => o.UserId == u.Id).Max(o => (DateTime?)o.CreatedAt)
            })
            .ToListAsync();
    }

    public async Task<InventoryAnalyticsDto> GetInventoryAnalyticsAsync()
    {
        var products = await _context.Products.Where(p => p.IsActive).ToListAsync();

        return new InventoryAnalyticsDto
        {
            TotalProducts = products.Count,
            InStockProducts = products.Count(p => p.StockQuantity > 10),
            LowStockProducts = products.Count(p => p.StockQuantity is > 0 and <= 10),
            OutOfStockProducts = products.Count(p => p.StockQuantity == 0),
            TotalInventoryValue = products.Sum(p => p.Price * p.StockQuantity),
            AverageStockLevel = products.Any() ? (decimal)products.Average(p => p.StockQuantity) : 0
        };
    }

    public async Task<IEnumerable<LowStockProductDto>> GetLowStockProductsAsync()
    {
        return await _context.Products
            .Where(p => p.IsActive && p.StockQuantity <= 10)
            .OrderBy(p => p.StockQuantity)
            .Take(20)
            .Select(p => new LowStockProductDto
            {
                ProductId = p.Id,
                ProductName = p.Name,
                Sku = p.Sku,
                CurrentStock = p.StockQuantity,
                ReorderLevel = 10,
                RecommendedReorder = 50
            })
            .ToListAsync();
    }

    public Task<IEnumerable<SearchQueryDto>> GetTopSearchesAsync(int count = 20)
    {
        // Mock for now - would use analytics/search query table
        return Task.FromResult(Enumerable.Empty<SearchQueryDto>());
    }

    public Task<IEnumerable<SearchQueryDto>> GetTrendingSearchesAsync(int count = 10)
    {
        return Task.FromResult(Enumerable.Empty<SearchQueryDto>());
    }

    public async Task<IEnumerable<FunnelStepDto>> GetCheckoutFunnelAsync(DateTime fromDate, DateTime toDate)
    {
        var totalCartViews = await _context.Carts.CountAsync();
        var totalCheckoutStarts = await _context.Orders.CountAsync(o => o.CreatedAt >= fromDate && o.CreatedAt <= toDate);

        return new List<FunnelStepDto>
        {
            new() { StepName = "Product View", Entered = totalCartViews * 10, Exited = 0, Converted = totalCartViews, ConversionRate = 10 },
            new() { StepName = "Add to Cart", Entered = totalCartViews, Exited = 0, Converted = totalCartViews / 2, ConversionRate = 50 },
            new() { StepName = "Checkout Started", Entered = totalCartViews / 2, Exited = 0, Converted = totalCheckoutStarts, ConversionRate = totalCartViews > 0 ? (decimal)totalCheckoutStarts / (totalCartViews / 2) * 100 : 0 },
            new() { StepName = "Payment", Entered = totalCheckoutStarts, Exited = 0, Converted = totalCheckoutStarts, ConversionRate = 100 }
        };
    }
}