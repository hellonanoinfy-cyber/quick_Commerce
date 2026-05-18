using FirstCry.Application.DTOs.Catalog;

namespace FirstCry.Application.DTOs.Admin;

public class AdminCategoryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? ParentCategoryId { get; set; }
    public string? ParentCategoryName { get; set; }
    public string? ImageUrl { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
    public int ProductCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AdminReviewDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string? CustomerPhone { get; set; }
    public int Rating { get; set; }
    public string? Title { get; set; }
    public string? Comment { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected
    public DateTime CreatedAt { get; set; }
}

public class AdminCouponDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // Percentage, FixedAmount
    public decimal Value { get; set; }
    public decimal? MinOrderAmount { get; set; }
    public decimal? MaxDiscountAmount { get; set; }
    public int UsageLimit { get; set; }
    public int UsedCount { get; set; }
    public int? MaxUsesPerUser { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime ExpiresAt { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AdminBannerDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Subtitle { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string? TargetUrl { get; set; }
    public string? TargetType { get; set; } // Product, Category, URL
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int ClickCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AdminInventoryDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public string? CategoryName { get; set; }
    public int CurrentStock { get; set; }
    public int ReservedStock { get; set; }
    public int AvailableStock { get; set; }
    public int LowStockThreshold { get; set; }
    public bool IsLowStock { get; set; }
    public string Status { get; set; } = "Healthy"; // Healthy, LowStock, OutOfStock, Overstocked
    public DateTime? LastRestockedAt { get; set; }
}

public class AdminInventoryAlertDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public int CurrentStock { get; set; }
    public int Threshold { get; set; }
    public string AlertType { get; set; } = "LowStock"; // LowStock, OutOfStock, Overstocked
    public string Message { get; set; } = string.Empty;
}

// Request/Response DTOs
public record AdminCreateCategoryRequest(string Name, string Slug, string? Description, Guid? ParentCategoryId, string? ImageUrl, int DisplayOrder, bool IsActive);
public record AdminUpdateCategoryRequest(Guid Id, string Name, string Slug, string? Description, Guid? ParentCategoryId, string? ImageUrl, int DisplayOrder, bool IsActive);

public record AdminReviewStatusRequest(string Status); // Approved, Rejected

public record AdminCreateCouponRequest(
    string Code,
    string Type,
    decimal Value,
    decimal? MinOrderAmount,
    decimal? MaxDiscountAmount,
    int? UsageLimit,
    int? MaxUsesPerUser,
    DateTime? StartDate,
    DateTime ExpiresAt,
    bool IsActive
);

public record AdminUpdateCouponRequest(
    Guid Id,
    string Code,
    string Type,
    decimal Value,
    decimal? MinOrderAmount,
    decimal? MaxDiscountAmount,
    int? UsageLimit,
    int? MaxUsesPerUser,
    DateTime? StartDate,
    DateTime ExpiresAt,
    bool IsActive
);

public record AdminCreateBannerRequest(
    string Title,
    string? Subtitle,
    string ImageUrl,
    string? TargetUrl,
    string? TargetType,
    int DisplayOrder,
    bool IsActive,
    DateTime? StartDate,
    DateTime? EndDate
);

public record AdminUpdateBannerRequest(
    Guid Id,
    string Title,
    string? Subtitle,
    string ImageUrl,
    string? TargetUrl,
    string? TargetType,
    int DisplayOrder,
    bool IsActive,
    DateTime? StartDate,
    DateTime? EndDate
);

public record AdminStockAdjustmentRequest(int Quantity, string? Reason);