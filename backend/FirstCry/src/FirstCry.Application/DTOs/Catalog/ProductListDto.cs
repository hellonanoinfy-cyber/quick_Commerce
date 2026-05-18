namespace FirstCry.Application.DTOs.Catalog;

public class ProductListDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public string? PrimaryImageUrl { get; set; }
    public string BrandName { get; set; } = string.Empty;
    public string CategorySlug { get; set; } = string.Empty;
    public bool IsFeatured { get; set; }
    public bool IsTrending { get; set; }
    public decimal Rating { get; set; }
    public int ReviewCount { get; set; }
    public bool InStock => StockQuantity > 0;
    public int StockQuantity { get; set; }
    public int DiscountPercentage => (DiscountPrice.HasValue && Price > 0) 
        ? (int)Math.Round((Price - DiscountPrice.Value) / Price * 100) 
        : 0;
}
