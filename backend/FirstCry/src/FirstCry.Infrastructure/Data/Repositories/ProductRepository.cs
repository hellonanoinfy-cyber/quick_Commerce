using FirstCry.Application.Common.Interfaces;
using FirstCry.Domain.Entities;
using FirstCry.Infrastructure.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace FirstCry.Infrastructure.Data.Repositories;

public class ProductRepository : BaseRepository<Product>, IProductRepository
{
    public ProductRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Product?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Images)
            .Include(p => p.Tags)
            .FirstOrDefaultAsync(p => p.Slug == slug, cancellationToken);
    }

    public async Task<IEnumerable<Product>> GetFeaturedProductsAsync(int count, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AsNoTracking()
            .Where(p => p.IsFeatured && p.IsActive)
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Images)
            .Take(count)
            .ToListAsync(cancellationToken);
    }

    // Product Image Management
    public async Task<IEnumerable<ProductImage>> GetProductImagesAsync(Guid productId, CancellationToken cancellationToken = default)
    {
        return await _context.ProductImages
            .AsNoTracking()
            .Where(i => i.ProductId == productId)
            .OrderBy(i => i.DisplayOrder)
            .ThenBy(i => i.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<ProductImage?> GetProductImageByIdAsync(Guid imageId, CancellationToken cancellationToken = default)
    {
        return await _context.ProductImages
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.Id == imageId, cancellationToken);
    }

    public async Task<ProductImage> AddProductImageAsync(ProductImage image, CancellationToken cancellationToken = default)
    {
        _context.ProductImages.Add(image);
        await _context.SaveChangesAsync(cancellationToken);
        return image;
    }

    public async Task UpdateProductImageAsync(ProductImage image, CancellationToken cancellationToken = default)
    {
        _context.ProductImages.Update(image);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteProductImageAsync(Guid imageId, CancellationToken cancellationToken = default)
    {
        var image = await _context.ProductImages.FindAsync(new object[] { imageId }, cancellationToken);
        if (image != null)
        {
            _context.ProductImages.Remove(image);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task ReorderProductImagesAsync(Guid productId, IEnumerable<Guid> imageIds, CancellationToken cancellationToken = default)
    {
        var images = await _context.ProductImages
            .Where(i => i.ProductId == productId)
            .ToListAsync(cancellationToken);

        int order = 0;
        foreach (var id in imageIds)
        {
            var image = images.FirstOrDefault(i => i.Id == id);
            if (image != null)
            {
                image.DisplayOrder = ++order;
                image.UpdatedAt = DateTime.UtcNow;
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task SetPrimaryImageAsync(Guid productId, Guid imageId, CancellationToken cancellationToken = default)
    {
        // Unmark all images for this product
        var productImages = await _context.ProductImages
            .Where(i => i.ProductId == productId)
            .ToListAsync(cancellationToken);

        foreach (var image in productImages)
        {
            image.IsPrimary = image.Id == imageId;
            image.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync(cancellationToken);
    }
}
