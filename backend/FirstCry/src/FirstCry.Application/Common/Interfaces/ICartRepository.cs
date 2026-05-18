namespace FirstCry.Application.Common.Interfaces;

using FirstCry.Domain.Entities;

// NEW
public interface ICartRepository : IRepository<Cart>
{
    Task<Cart?> GetByUserIdAsync(Guid userId);
    Task<Cart?> GetWithItemsAsync(Guid cartId);
}
