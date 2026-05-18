using FirstCry.Application.Common.Interfaces;
using FirstCry.Application.DTOs.Catalog;
using FirstCry.Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FirstCry.Application.Features.Products.Queries;

public record GetProductsQuery(
    Guid? CategoryId = null,
    string? Category = null,
    string? Subcategory = null,
    Guid? BrandId = null,
    string? Brand = null,
    decimal? MinPrice = null,
    decimal? MaxPrice = null,
    string? PriceRange = null,
    string? Search = null,
    bool? IsFeatured = null,
    bool? IsTrending = null,
    bool? InStock = null,
    decimal? MinRating = null,
    string? SortBy = null,
    int PageNumber = 1,
    int PageSize = 10
) : IRequest<PagedListDto<ProductListDto>>;

public class GetProductsQueryHandler : IRequestHandler<GetProductsQuery, PagedListDto<ProductListDto>>
{
    private static readonly Dictionary<string, string[]> CategoryNavAliases = new(StringComparer.OrdinalIgnoreCase)
    {
        ["fashion"] = ["baby-clothing", "kids-footwear"],
        ["toys"] = ["toys"],
        ["school"] = ["school-supplies"],
        ["mom"] = ["maternity-care"],
        ["mom-care"] = ["maternity-care"],
        ["baby"] = ["diapers-and-wipes", "baby-food", "baby-skin-care", "feeding-essentials", "bath-and-hygiene"],
        ["baby-care"] = ["diapers-and-wipes", "baby-food", "baby-skin-care", "feeding-essentials", "bath-and-hygiene"],
        ["pharmacy"] = ["baby-skin-care", "maternity-care"],
        ["ozi-pharmacy"] = ["baby-skin-care", "maternity-care"],
        ["food"] = ["baby-food"],
        ["furniture"] = ["maternity-care", "toys"],
        ["gear-furniture"] = ["maternity-care", "toys"],
        ["summer-break"] = ["baby-clothing", "kids-footwear", "toys"],
    };

    private readonly IUnitOfWork _unitOfWork;

    public GetProductsQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedListDto<ProductListDto>> Handle(GetProductsQuery request, CancellationToken cancellationToken)
    {
        var pageNumber = Math.Max(1, request.PageNumber);
        var pageSize = Math.Clamp(request.PageSize, 1, 48);

        try
        {
            var query = _unitOfWork.Products.GetQueryable()
                .AsNoTracking()
                .Where(p => p.IsActive);

            if (request.CategoryId.HasValue)
                query = query.Where(p => p.CategoryId == request.CategoryId);

            if (!string.IsNullOrWhiteSpace(request.Category))
            {
                if (CategoryNavAliases.TryGetValue(request.Category.Trim(), out var aliasSlugs))
                    query = query.Where(p => aliasSlugs.Contains(p.Category.Slug));
                else
                    query = query.Where(p => p.Category.Slug == request.Category);
            }

            if (!string.IsNullOrWhiteSpace(request.Subcategory))
            {
                var sub = request.Subcategory.Trim().ToLowerInvariant();
                var subSpaced = sub.Replace("-", " ");
                query = query.Where(p =>
                    p.Slug.Contains(sub) ||
                    EF.Functions.Like(p.Name, $"%{subSpaced}%") ||
                    EF.Functions.Like(p.Description, $"%{subSpaced}%"));
            }

            if (request.BrandId.HasValue)
                query = query.Where(p => p.BrandId == request.BrandId);

            if (!string.IsNullOrWhiteSpace(request.Brand))
                query = query.Where(p => p.Brand.Slug == request.Brand);

            if (!string.IsNullOrWhiteSpace(request.PriceRange))
            {
                var parts = request.PriceRange.Split('-', StringSplitOptions.RemoveEmptyEntries);
                if (parts.Length == 2 && decimal.TryParse(parts[0], out var rangeMin) && decimal.TryParse(parts[1], out var rangeMax))
                {
                    query = query.Where(p => p.Price >= rangeMin && p.Price <= rangeMax);
                }
            }

            if (request.MinPrice.HasValue)
                query = query.Where(p => p.Price >= request.MinPrice);

            if (request.MaxPrice.HasValue)
                query = query.Where(p => p.Price <= request.MaxPrice);

            if (!string.IsNullOrWhiteSpace(request.Search))
                query = query.Where(p => EF.Functions.Like(p.Name, $"%{request.Search}%") || 
                                         EF.Functions.Like(p.Description, $"%{request.Search}%"));

            if (request.IsFeatured.HasValue)
                query = query.Where(p => p.IsFeatured == request.IsFeatured);

            if (request.IsTrending.HasValue)
                query = query.Where(p => p.IsTrending == request.IsTrending);

            if (request.InStock.HasValue)
                query = request.InStock.Value
                    ? query.Where(p => p.StockQuantity > 0)
                    : query.Where(p => p.StockQuantity <= 0);

            if (request.MinRating.HasValue)
                query = query.Where(p => p.Rating >= request.MinRating.Value);

            query = request.SortBy?.ToLower() switch
            {
                "price_asc" => query.OrderBy(p => p.Price),
                "price_desc" => query.OrderByDescending(p => p.Price),
                "name_asc" => query.OrderBy(p => p.Name),
                "newest" => query.OrderByDescending(p => p.CreatedAt),
                "popularity" => query.OrderByDescending(p => p.ReviewCount).ThenByDescending(p => p.Rating),
                "featured" => query.OrderByDescending(p => p.IsFeatured).ThenByDescending(p => p.CreatedAt),
                "trending" => query.OrderByDescending(p => p.IsTrending).ThenByDescending(p => p.Rating),
                _ => query.OrderByDescending(p => p.CreatedAt)
            };

            var totalCount = await query.CountAsync(cancellationToken);
            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
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

            return PagedListDto<ProductListDto>.Create(items, totalCount, pageNumber, pageSize);
        }
        catch (Exception ex) when (ex.GetType().Name == "SqlException" || ex is InvalidOperationException)
        {
            // Log and return empty paged list to maintain "degraded" functionality
            Console.WriteLine($"DB Error in GetProducts: {ex.Message}");
            return PagedListDto<ProductListDto>.Create(new List<ProductListDto>(), 0, pageNumber, pageSize);
        }
    }
}
