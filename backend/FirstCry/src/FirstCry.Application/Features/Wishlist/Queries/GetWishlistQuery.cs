using FirstCry.Application.Common.Interfaces;
using FirstCry.Application.DTOs.Catalog;
using FirstCry.Application.DTOs.Users;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FirstCry.Application.Features.Wishlist.Queries;

public record GetWishlistQuery(Guid UserId) : IRequest<List<WishlistItemDto>>;

public class GetWishlistQueryHandler : IRequestHandler<GetWishlistQuery, List<WishlistItemDto>>
{
    private readonly IApplicationDbContext _context;

    public GetWishlistQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<WishlistItemDto>> Handle(GetWishlistQuery request, CancellationToken cancellationToken)
    {
        return await _context.WishlistItems.AsNoTracking()
            .Where(w => w.UserId == request.UserId)
            .OrderByDescending(w => w.CreatedAt)
            .Select(w => new WishlistItemDto
            {
                Id = w.Id,
                ProductId = w.ProductId,
                Note = w.Note,
                Product = new ProductListDto
                {
                    Id = w.Product.Id,
                    Name = w.Product.Name,
                    Slug = w.Product.Slug,
                    Sku = w.Product.Sku,
                    Price = w.Product.Price,
                    DiscountPrice = w.Product.DiscountPrice,
                    BrandName = w.Product.Brand.Name,
                    CategorySlug = w.Product.Category.Slug,
                    IsFeatured = w.Product.IsFeatured,
                    IsTrending = w.Product.IsTrending,
                    Rating = w.Product.Rating,
                    ReviewCount = w.Product.ReviewCount,
                    StockQuantity = w.Product.StockQuantity,
                    PrimaryImageUrl = w.Product.Images.Where(i => i.IsPrimary).Select(i => i.Url).FirstOrDefault()
                                      ?? w.Product.Images.OrderBy(i => i.DisplayOrder).Select(i => i.Url).FirstOrDefault()
                }
            })
            .ToListAsync(cancellationToken);
    }
}
