using FirstCry.Domain.Common;

namespace FirstCry.Domain.Entities;

public enum ReviewStatus
{
    Pending,
    Approved,
    Rejected
}

public class ProductReview : AuditableEntity
{
    public Guid ProductId { get; set; }
    public Guid UserId { get; set; }
    public int Rating { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Comment { get; set; } = string.Empty;
    public ReviewStatus Status { get; set; } = ReviewStatus.Pending;

    public virtual Product Product { get; set; } = null!;
    public virtual User User { get; set; } = null!;
}
