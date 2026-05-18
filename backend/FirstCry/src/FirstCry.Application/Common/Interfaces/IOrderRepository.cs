using FirstCry.Domain.Entities.Orders;

namespace FirstCry.Application.Common.Interfaces;

public interface IOrderRepository : IRepository<Order>
{
    Task<IEnumerable<Order>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
}
