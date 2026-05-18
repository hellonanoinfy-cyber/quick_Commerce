using FirstCry.Application.Common.Interfaces;
using FirstCry.Application.DTOs.Catalog;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FirstCry.Application.Features.Products.Queries;

public record GetRelatedProductsQuery(string Slug, int Count = 8) : IRequest<IEnumerable<ProductListDto>>;

public class GetRelatedProductsQueryHandler : IRequestHandler<GetRelatedProductsQuery, IEnumerable<ProductListDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetRelatedProductsQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<ProductListDto>> Handle(GetRelatedProductsQuery request, CancellationToken cancellationToken)
    {
        var count = Math.Clamp(request.Count, 1, 12);
        var product = await _unitOfWork.Products.GetQueryable()
            .AsNoTracking()
            .Where(p => p.Slug == request.Slug)
            .Select(p => new { p.Id, p.CategoryId, p.BrandId })
            .FirstOrDefaultAsync(cancellationToken);

        if (product == null) return new List<ProductListDto>();

        return await _unitOfWork.Products.GetQueryable()
            .AsNoTracking()
            .Where(p => p.IsActive && p.Id != product.Id && (p.CategoryId == product.CategoryId || p.BrandId == product.BrandId))
            .OrderByDescending(p => p.CategoryId == product.CategoryId)
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
