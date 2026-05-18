using FirstCry.Domain.Entities;

namespace FirstCry.Application.Common.Interfaces;

public interface IProductRepository : IRepository<Product>
{
    Task<Product?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<IEnumerable<Product>> GetFeaturedProductsAsync(int count, CancellationToken cancellationToken = default);
    
    // Product Image Management
    Task<IEnumerable<ProductImage>> GetProductImagesAsync(Guid productId, CancellationToken cancellationToken = default);
    Task<ProductImage?> GetProductImageByIdAsync(Guid imageId, CancellationToken cancellationToken = default);
    Task<ProductImage> AddProductImageAsync(ProductImage image, CancellationToken cancellationToken = default);
    Task UpdateProductImageAsync(ProductImage image, CancellationToken cancellationToken = default);
    Task DeleteProductImageAsync(Guid imageId, CancellationToken cancellationToken = default);
    Task ReorderProductImagesAsync(Guid productId, IEnumerable<Guid> imageIds, CancellationToken cancellationToken = default);
    Task SetPrimaryImageAsync(Guid productId, Guid imageId, CancellationToken cancellationToken = default);
}
