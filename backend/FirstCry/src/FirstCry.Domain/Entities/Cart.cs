namespace FirstCry.Domain.Entities;

using FirstCry.Domain.Common;

// NEW
public class Cart : BaseEntity
{
    public Guid? UserId { get; set; }
    public User? User { get; set; }
    
    public ICollection<CartItem> Items { get; set; } = new List<CartItem>();
}
