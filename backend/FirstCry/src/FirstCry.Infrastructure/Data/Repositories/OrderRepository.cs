using FirstCry.Application.Common.Interfaces;
using FirstCry.Domain.Entities.Orders;
using FirstCry.Infrastructure.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace FirstCry.Infrastructure.Data.Repositories;

public class OrderRepository : BaseRepository<Order>, IOrderRepository
{
    public OrderRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Order>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AsNoTracking()
            .Include(o => o.Items)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(cancellationToken);
    }
}
