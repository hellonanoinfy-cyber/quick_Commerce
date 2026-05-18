namespace FirstCry.Application.Common.Interfaces;

using FirstCry.Domain.Entities;

// NEW
public interface ICartService
{
    Task<Cart> GetCartByUserIdAsync(Guid userId);
    Task<Cart> AddItemAsync(Guid userId, Guid productId, int quantity);
    Task<Cart> UpdateItemQuantityAsync(Guid userId, Guid productId, int quantity);
    Task<Cart> RemoveItemAsync(Guid userId, Guid productId);
    Task ClearCartAsync(Guid userId);
    Task MergeGuestCartAsync(Guid userId, List<GuestCartItemDto> guestItems);
}

public class GuestCartItemDto
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
}
