using FirstCry.Domain.Common;

namespace FirstCry.Domain.Entities;

public class UserAddress : AuditableEntity
{
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? Landmark { get; set; }
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Pincode { get; set; } = string.Empty;
    public string Type { get; set; } = "Home";
    public bool IsDefault { get; set; }

    public virtual User User { get; set; } = null!;
}
