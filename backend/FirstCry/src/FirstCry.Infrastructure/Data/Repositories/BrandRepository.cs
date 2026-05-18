using FirstCry.Application.Common.Interfaces;
using FirstCry.Domain.Entities;
using FirstCry.Infrastructure.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace FirstCry.Infrastructure.Data.Repositories;

public class BrandRepository : BaseRepository<Brand>, IBrandRepository
{
    public BrandRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Brand?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(b => b.Slug == slug, cancellationToken);
    }
}
