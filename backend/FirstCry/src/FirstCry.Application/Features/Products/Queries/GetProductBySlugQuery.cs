using FirstCry.Application.Common.Interfaces;
using FirstCry.Application.DTOs.Catalog;
using MediatR;

namespace FirstCry.Application.Features.Products.Queries;

public record GetProductBySlugQuery(string Slug) : IRequest<ProductDetailDto?>;

public class GetProductBySlugQueryHandler : IRequestHandler<GetProductBySlugQuery, ProductDetailDto?>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetProductBySlugQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ProductDetailDto?> Handle(GetProductBySlugQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var product = await _unitOfWork.Products.GetBySlugAsync(request.Slug, cancellationToken);

            if (product == null) return null;

            return new ProductDetailDto
            {
                Id = product.Id,
                Name = product.Name,
                Slug = product.Slug,
                Sku = product.Sku,
                ShortDescription = product.ShortDescription,
                Description = product.Description,
                Price = product.Price,
                DiscountPrice = product.DiscountPrice,
                StockQuantity = product.StockQuantity,
                IsFeatured = product.IsFeatured,
                IsTrending = product.IsTrending,
                Rating = product.Rating,
                ReviewCount = product.ReviewCount,
                IsActive = product.IsActive,
                Category = new CategoryDto
                {
                    Id = product.Category.Id,
                    Name = product.Category.Name,
                    Slug = product.Category.Slug
                },
                Brand = new BrandDto
                {
                    Id = product.Brand.Id,
                    Name = product.Brand.Name,
                    Slug = product.Brand.Slug,
                    LogoUrl = product.Brand.LogoUrl
                },
                ImageUrls = product.Images.OrderBy(i => i.DisplayOrder).Select(i => i.Url).ToList(),
                Tags = product.Tags.Select(t => t.TagName).ToList()
            };
        }
        catch (Exception ex) when (ex.GetType().Name == "SqlException" || ex is InvalidOperationException)
        {
            Console.WriteLine($"DB Error in GetProductBySlug: {ex.Message}");
            return null;
        }
    }
}
