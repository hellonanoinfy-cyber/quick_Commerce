namespace FirstCry.Domain.Entities.Orders;

using FirstCry.Domain.Common;

public class OrderItem : AuditableEntity
{
    public Guid OrderId { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? ProductImageUrl { get; set; }
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal TotalPrice => UnitPrice * Quantity;

    // Navigation properties
    public virtual Order Order { get; set; } = null!;
}
