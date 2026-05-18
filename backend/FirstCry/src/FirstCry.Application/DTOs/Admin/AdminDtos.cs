using FirstCry.Application.DTOs.Catalog;

namespace FirstCry.Application.DTOs.Admin;

public class AdminDashboardDto
{
    public decimal Revenue { get; set; }
    public int TotalOrders { get; set; }
    public int ActiveCustomers { get; set; }
    public int TotalProducts { get; set; }
    public List<AdminMetricPointDto> SalesTrend { get; set; } = new();
    public List<ProductListDto> TopProducts { get; set; } = new();
    public List<ProductListDto> LowStockProducts { get; set; } = new();
    public List<AdminOrderDto> RecentOrders { get; set; } = new();
}

public class AdminMetricPointDto
{
    public string Label { get; set; } = string.Empty;
    public decimal Value { get; set; }
}

public class AdminProductDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public string? ShortDescription { get; set; }
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public int StockQuantity { get; set; }
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public Guid BrandId { get; set; }
    public string BrandName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsTrending { get; set; }
    public decimal Rating { get; set; }
    public string? PrimaryImageUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AdminOrderDto
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public int ItemCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AdminCustomerDto
{
    public Guid Id { get; set; }
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string Role { get; set; } = string.Empty;
    public bool IsGuest { get; set; }
    public bool ProfileCompleted { get; set; }
    public bool IsBlocked { get; set; }
    public DateTime CreatedAt { get; set; }
}
