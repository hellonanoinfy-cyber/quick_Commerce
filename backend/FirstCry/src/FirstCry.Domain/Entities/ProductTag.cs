namespace FirstCry.Domain.Entities;

using FirstCry.Domain.Common;

public class ProductTag : BaseEntity
{
    public Guid? ProductId { get; set; }
    public string TagName { get; set; } = string.Empty;

    // Navigation properties
    public virtual Product? Product { get; set; }
}
