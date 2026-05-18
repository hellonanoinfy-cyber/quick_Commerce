using FirstCry.Domain.Entities;

namespace FirstCry.Application.Common.Interfaces;

public interface IBrandRepository : IRepository<Brand>
{
    Task<Brand?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
}
