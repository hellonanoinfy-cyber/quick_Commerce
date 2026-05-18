using FirstCry.Application.Common.Interfaces;
using FirstCry.Application.DTOs.Catalog;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FirstCry.Application.Features.Products.Queries;

public record GetTrendingProductsQuery(int Count = 12) : IRequest<IEnumerable<ProductListDto>>;

public class GetTrendingProductsQueryHandler : IRequestHandler<GetTrendingProductsQuery, IEnumerable<ProductListDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetTrendingProductsQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<ProductListDto>> Handle(GetTrendingProductsQuery request, CancellationToken cancellationToken)
    {
        var count = Math.Clamp(request.Count, 1, 12);
        return await _unitOfWork.Products.GetQueryable()
            .AsNoTracking()
            .Where(p => p.IsActive)
            .OrderByDescending(p => p.IsTrending)
            .ThenByDescending(p => p.ReviewCount)
            .ThenByDescending(p => p.Rating)
            .Take(count)
            .Select(p => new ProductListDto
            {
                Id = p.Id,
                Name = p.Name,
                Slug = p.Slug,
                Sku = p.Sku,
                Price = p.Price,
                DiscountPrice = p.DiscountPrice,
                BrandName = p.Brand.Name,
                CategorySlug = p.Category.Slug,
                IsFeatured = p.IsFeatured,
                IsTrending = p.IsTrending,
                Rating = p.Rating,
                ReviewCount = p.ReviewCount,
                StockQuantity = p.StockQuantity,
                PrimaryImageUrl = p.Images.Where(i => i.IsPrimary).Select(i => i.Url).FirstOrDefault()
                                  ?? p.Images.OrderBy(i => i.DisplayOrder).Select(i => i.Url).FirstOrDefault()
            })
            .ToListAsync(cancellationToken);
    }
}
