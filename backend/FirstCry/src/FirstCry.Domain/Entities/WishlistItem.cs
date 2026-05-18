using FirstCry.Domain.Common;

namespace FirstCry.Domain.Entities;

public class WishlistItem : AuditableEntity
{
    public Guid UserId { get; set; }
    public Guid ProductId { get; set; }
    public string? Note { get; set; }

    public virtual User User { get; set; } = null!;
    public virtual Product Product { get; set; } = null!;
}
