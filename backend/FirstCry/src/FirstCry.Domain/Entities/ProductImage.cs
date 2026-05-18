namespace FirstCry.Domain.Entities;

using FirstCry.Domain.Common;

public class ProductImage : BaseEntity
{
    public Guid? ProductId { get; set; }
    public string Url { get; set; } = string.Empty;
    public string? AltText { get; set; }
    public bool IsPrimary { get; set; }
    public int DisplayOrder { get; set; }

    // Navigation properties
    public virtual Product? Product { get; set; }

    /// <summary>
    /// Factory method to create a new ProductImage
    /// </summary>
    public static ProductImage Create(
        Guid? productId,
        string url,
        string? altText = null,
        bool isPrimary = false,
        int displayOrder = 0)
    {
        return new ProductImage
        {
            Id = Guid.NewGuid(),
            ProductId = productId,
            Url = url,
            AltText = altText,
            IsPrimary = isPrimary,
            DisplayOrder = displayOrder,
            CreatedAt = DateTime.UtcNow
        };
    }

    /// <summary>
    /// Mark this image as primary, unmarking all others for the same product
    /// </summary>
    public void SetAsPrimary()
    {
        IsPrimary = true;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Update image metadata
    /// </summary>
    public void Update(string? altText, bool? isPrimary = null, int? displayOrder = null)
    {
        if (altText != null)
            AltText = altText;
        if (isPrimary.HasValue)
            IsPrimary = isPrimary.Value;
        if (displayOrder.HasValue)
            DisplayOrder = displayOrder.Value;
        UpdatedAt = DateTime.UtcNow;
    }
}
