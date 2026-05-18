namespace FirstCry.Domain.Entities;

using FirstCry.Domain.Common;

public class Brand : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsFeatured { get; set; }

    public static Brand Create(string name, string slug, string? logoUrl = null)
    {
        return new Brand
        {
            Id = Guid.NewGuid(),
            Name = name,
            Slug = slug,
            LogoUrl = logoUrl,
            IsActive = true
        };
    }

    // Navigation properties
    public virtual ICollection<Product> Products { get; set; } = new List<Product>();
}
