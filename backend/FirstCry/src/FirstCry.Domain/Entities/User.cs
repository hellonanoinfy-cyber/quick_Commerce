namespace FirstCry.Domain.Entities;

using FirstCry.Domain.Common;

/// <summary>
/// Represents a user in the system.
/// Supports both registered and guest users via OTP authentication.
/// </summary>
public class User : AuditableEntity
{
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string Role { get; set; } = "User"; // Default role
    public bool IsGuest { get; set; } = true;
    public bool ProfileCompleted { get; set; } = false;

    // Navigation property for refresh tokens
    public List<RefreshToken> RefreshTokens { get; set; } = new();
    public List<UserAddress> Addresses { get; set; } = new();
    public List<WishlistItem> WishlistItems { get; set; } = new();
    public List<ProductReview> Reviews { get; set; } = new();
}
