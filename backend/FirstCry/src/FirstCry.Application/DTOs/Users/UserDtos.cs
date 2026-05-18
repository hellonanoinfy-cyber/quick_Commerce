using FirstCry.Application.DTOs.Catalog;

namespace FirstCry.Application.DTOs.Users;

public class UserAddressDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? Landmark { get; set; }
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Pincode { get; set; } = string.Empty;
    public string Type { get; set; } = "Home";
    public bool IsDefault { get; set; }
}

public class WishlistItemDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string? Note { get; set; }
    public ProductListDto Product { get; set; } = new();
}
