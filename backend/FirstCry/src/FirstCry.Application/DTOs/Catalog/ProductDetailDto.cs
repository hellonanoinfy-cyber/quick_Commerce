namespace FirstCry.Application.DTOs.Catalog;

public class ProductDetailDto
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
    public bool IsFeatured { get; set; }
    public bool IsTrending { get; set; }
    public decimal Rating { get; set; }
    public int ReviewCount { get; set; }
    public int DiscountPercentage => (DiscountPrice.HasValue && Price > 0) 
        ? (int)Math.Round((Price - DiscountPrice.Value) / Price * 100) 
        : 0;
    public bool IsActive { get; set; }
    
    public CategoryDto Category { get; set; } = null!;
    public BrandDto Brand { get; set; } = null!;
    public List<string> ImageUrls { get; set; } = new();
    public List<string> Tags { get; set; } = new();
}
