namespace FirstCry.Domain.Entities;

using FirstCry.Domain.Common;
using FirstCry.Domain.Events;

public class Product : AuditableEntity
{
    private readonly List<ProductImage> _images = new();
    private readonly List<ProductTag> _tags = new();

    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public string? ShortDescription { get; set; }
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public int StockQuantity { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsFeatured { get; set; }
    public bool IsTrending { get; set; }
    public decimal Rating { get; set; }
    public int ReviewCount { get; set; }
    
    public Guid CategoryId { get; set; }
    public Guid BrandId { get; set; }

    // Navigation properties
    public virtual Category Category { get; set; } = null!;
    public virtual Brand Brand { get; set; } = null!;
    public virtual IReadOnlyCollection<ProductImage> Images => _images.AsReadOnly();
    public virtual IReadOnlyCollection<ProductTag> Tags => _tags.AsReadOnly();

    // Factory method
    public static Product Create(
        string name, 
        string slug, 
        string? shortDesc, 
        string? desc, 
        decimal price, 
        int stock, 
        Guid categoryId, 
        Guid brandId)
    {
        var product = new Product
        {
            Id = Guid.NewGuid(),
            Name = name,
            Slug = slug,
            ShortDescription = shortDesc,
            Description = desc,
            Price = price,
            StockQuantity = stock,
            CategoryId = categoryId,
            BrandId = brandId,
            IsActive = true
        };

        // Add Domain Event: ProductCreatedEvent
        product.AddDomainEvent(new ProductCreatedEvent(product));
        return product;
    }

    // Behaviours
    public void UpdatePrice(decimal newPrice, decimal? discountPrice = null)
    {
        Price = newPrice;
        DiscountPrice = discountPrice;
    }

    public void UpdateStock(int quantity)
    {
        StockQuantity = quantity;
        AddDomainEvent(new ProductStockUpdatedEvent(this));
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;

    public void AddImage(string url, string? altText = null, bool isPrimary = false)
    {
        _images.Add(new ProductImage 
        { 
            ProductId = Id, 
            Url = url, 
            AltText = altText, 
            IsPrimary = isPrimary,
            DisplayOrder = _images.Count + 1
        });
    }

    public void AddTag(string tagName)
    {
        _tags.Add(new ProductTag { ProductId = Id, TagName = tagName });
    }
}
