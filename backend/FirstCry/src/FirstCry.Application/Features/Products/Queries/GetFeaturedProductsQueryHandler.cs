using FirstCry.Application.Common.Interfaces;
using FirstCry.Application.DTOs.Catalog;
using FirstCry.Domain.Entities;
using MediatR;

namespace FirstCry.Application.Features.Products.Queries;

public class GetFeaturedProductsQueryHandler : IRequestHandler<GetFeaturedProductsQuery, IEnumerable<ProductListDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetFeaturedProductsQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<ProductListDto>> Handle(GetFeaturedProductsQuery request, CancellationToken cancellationToken)
    {
        var products = await _unitOfWork.Products.GetFeaturedProductsAsync(request.Count, cancellationToken);
        return products.Select(MapProduct).ToList();
    }

    private static ProductListDto MapProduct(Product product)
    {
        return new ProductListDto
        {
            Id = product.Id,
            Name = product.Name,
            Slug = product.Slug,
            Sku = product.Sku,
            Price = product.Price,
            DiscountPrice = product.DiscountPrice,
            BrandName = product.Brand?.Name ?? string.Empty,
            CategorySlug = product.Category?.Slug ?? string.Empty,
            IsFeatured = product.IsFeatured,
            IsTrending = product.IsTrending,
            Rating = product.Rating,
            ReviewCount = product.ReviewCount,
            StockQuantity = product.StockQuantity,
            PrimaryImageUrl = product.Images.Where(i => i.IsPrimary).Select(i => i.Url).FirstOrDefault()
                              ?? product.Images.OrderBy(i => i.DisplayOrder).Select(i => i.Url).FirstOrDefault()
        };
    }
}
