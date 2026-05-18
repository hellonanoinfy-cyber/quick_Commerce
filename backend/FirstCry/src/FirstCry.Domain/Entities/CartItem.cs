namespace FirstCry.Domain.Entities;

using FirstCry.Domain.Common;

// NEW
public class CartItem : BaseEntity
{
    public Guid CartId { get; set; }
    public Cart Cart { get; set; } = null!;
    
    public Guid? ProductId { get; set; }
    public Product? Product { get; set; }
    
    public int Quantity { get; set; }
    public decimal Price { get; set; } // Price at the time of adding to cart
}
