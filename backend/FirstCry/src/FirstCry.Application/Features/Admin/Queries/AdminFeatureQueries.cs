using FirstCry.Application.Common.Interfaces;
using FirstCry.Application.DTOs;
using FirstCry.Application.DTOs.Admin;
using FirstCry.Application.DTOs.Catalog;
using MediatR;
using Microsoft.EntityFrameworkCore;
using FirstCry.Domain.Entities;

namespace FirstCry.Application.Features.Admin.Queries;

#region Categories

public record GetAdminCategoriesQuery(string? Search = null, int PageNumber = 1, int PageSize = 20) : IRequest<PagedListDto<AdminCategoryDto>>;

public class GetAdminCategoriesQueryHandler : IRequestHandler<GetAdminCategoriesQuery, PagedListDto<AdminCategoryDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAdminCategoriesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PagedListDto<AdminCategoryDto>> Handle(GetAdminCategoriesQuery request, CancellationToken cancellationToken)
    {
        var pageNumber = Math.Max(1, request.PageNumber);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);

        var query = _context.Categories
            .AsNoTracking()
            .Include(c => c.ParentCategory)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            query = query.Where(c => EF.Functions.Like(c.Name, $"%{request.Search}%") ||
                                     EF.Functions.Like(c.Slug, $"%{request.Search}%"));
        }

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderBy(c => c.DisplayOrder)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new AdminCategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Slug = c.Slug,
                Description = c.Description,
                ParentCategoryId = c.ParentCategoryId,
                ParentCategoryName = c.ParentCategory != null ? c.ParentCategory.Name : null,
                ImageUrl = c.ImageUrl,
                DisplayOrder = c.DisplayOrder,
                IsActive = c.IsActive,
                ProductCount = c.Products != null ? c.Products.Count(p => !p.IsDeleted) : 0,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return PagedListDto<AdminCategoryDto>.Create(items, total, pageNumber, pageSize);
    }
}

public record GetAdminCategoryByIdQuery(Guid Id) : IRequest<AdminCategoryDto?>;

public class GetAdminCategoryByIdQueryHandler : IRequestHandler<GetAdminCategoryByIdQuery, AdminCategoryDto?>
{
    private readonly IApplicationDbContext _context;

    public GetAdminCategoryByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AdminCategoryDto?> Handle(GetAdminCategoryByIdQuery request, CancellationToken cancellationToken)
    {
        var category = await _context.Categories
            .AsNoTracking()
            .Include(c => c.ParentCategory)
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (category == null) return null;

        return new AdminCategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Slug = category.Slug,
            Description = category.Description,
            ParentCategoryId = category.ParentCategoryId,
            ParentCategoryName = category.ParentCategory?.Name,
            ImageUrl = category.ImageUrl,
            DisplayOrder = category.DisplayOrder,
            IsActive = category.IsActive,
            ProductCount = category.Products?.Count(p => !p.IsDeleted) ?? 0,
            CreatedAt = category.CreatedAt
        };
    }
}

#endregion

#region Reviews

public record GetAdminReviewsQuery(string? Status = null, int PageNumber = 1, int PageSize = 20) : IRequest<PagedListDto<AdminReviewDto>>;

public class GetAdminReviewsQueryHandler : IRequestHandler<GetAdminReviewsQuery, PagedListDto<AdminReviewDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAdminReviewsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PagedListDto<AdminReviewDto>> Handle(GetAdminReviewsQuery request, CancellationToken cancellationToken)
    {
        var pageNumber = Math.Max(1, request.PageNumber);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);

        var query = _context.ProductReviews
            .AsNoTracking()
            .Include(r => r.Product)
            .Include(r => r.User)
            .AsQueryable();

        // Filter by status if provided
        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            if (!Enum.TryParse<ReviewStatus>(request.Status, true, out var statusEnum))
            {
                return PagedListDto<AdminReviewDto>.Create(new List<AdminReviewDto>(), 0, pageNumber, pageSize);
            }

            query = query.Where(r => r.Status == statusEnum);
        }

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new AdminReviewDto
            {
                Id = r.Id,
                ProductId = r.ProductId,
                ProductName = r.Product != null ? r.Product.Name : "Unknown",
                UserId = r.UserId,
                CustomerName = r.User != null ? r.User.Name ?? r.User.PhoneNumber : "Unknown",
                CustomerPhone = r.User != null ? r.User.PhoneNumber : null,
                Rating = r.Rating,
                Title = r.Title,
                Comment = r.Comment,
                Status = r.Status.ToString(),
                CreatedAt = r.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return PagedListDto<AdminReviewDto>.Create(items, total, pageNumber, pageSize);
    }
}

public record UpdateReviewStatusCommand(Guid ReviewId, string Status) : IRequest<bool>;

public class UpdateReviewStatusCommandHandler : IRequestHandler<UpdateReviewStatusCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public UpdateReviewStatusCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateReviewStatusCommand request, CancellationToken cancellationToken)
    {
        var review = await _context.ProductReviews.FindAsync(new object[] { request.ReviewId }, cancellationToken);
        if (review == null) return false;

        if (!Enum.TryParse<ReviewStatus>(request.Status, true, out var status))
        {
            return false;
        }

        review.Status = status;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}

public record DeleteReviewCommand(Guid ReviewId) : IRequest<bool>;

public class DeleteReviewCommandHandler : IRequestHandler<DeleteReviewCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public DeleteReviewCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteReviewCommand request, CancellationToken cancellationToken)
    {
        var review = await _context.ProductReviews.FindAsync(new object[] { request.ReviewId }, cancellationToken);
        if (review == null) return false;

        _context.ProductReviews.Remove(review);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}

#endregion

#region Inventory

public record GetAdminInventoryQuery(
    string? Search = null,
    string? Status = null, // Healthy, LowStock, OutOfStock
    int PageNumber = 1,
    int PageSize = 50
) : IRequest<PagedListDto<AdminInventoryDto>>;

public class GetAdminInventoryQueryHandler : IRequestHandler<GetAdminInventoryQuery, PagedListDto<AdminInventoryDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAdminInventoryQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PagedListDto<AdminInventoryDto>> Handle(GetAdminInventoryQuery request, CancellationToken cancellationToken)
    {
        var pageNumber = Math.Max(1, request.PageNumber);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);

        var query = _context.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Where(p => !p.IsDeleted)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            query = query.Where(p => EF.Functions.Like(p.Name, $"%{request.Search}%") ||
                                    EF.Functions.Like(p.Sku, $"%{request.Search}%"));
        }

        // Default threshold is 10
        var lowStockThreshold = 10;

        // Apply status filter
        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            query = request.Status switch
            {
                "LowStock" => query.Where(p => p.StockQuantity > 0 && p.StockQuantity <= lowStockThreshold),
                "OutOfStock" => query.Where(p => p.StockQuantity <= 0),
                "Healthy" => query.Where(p => p.StockQuantity > lowStockThreshold),
                _ => query
            };
        }

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderBy(p => p.StockQuantity)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new AdminInventoryDto
            {
                ProductId = p.Id,
                ProductName = p.Name,
                Sku = p.Sku,
                CategoryName = p.Category != null ? p.Category.Name : null,
                CurrentStock = p.StockQuantity,
                ReservedStock = 0, // Would come from Orders if implemented
                AvailableStock = p.StockQuantity,
                LowStockThreshold = lowStockThreshold,
                IsLowStock = p.StockQuantity <= lowStockThreshold && p.StockQuantity > 0,
                Status = p.StockQuantity <= 0 ? "OutOfStock" :
                         p.StockQuantity <= lowStockThreshold ? "LowStock" : "Healthy",
                LastRestockedAt = p.UpdatedAt
            })
            .ToListAsync(cancellationToken);

        return PagedListDto<AdminInventoryDto>.Create(items, total, pageNumber, pageSize);
    }
}

public record GetAdminInventoryAlertsQuery : IRequest<List<AdminInventoryAlertDto>>;

public class GetAdminInventoryAlertsQueryHandler : IRequestHandler<GetAdminInventoryAlertsQuery, List<AdminInventoryAlertDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAdminInventoryAlertsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<AdminInventoryAlertDto>> Handle(GetAdminInventoryAlertsQuery request, CancellationToken cancellationToken)
    {
        var lowStockThreshold = 10;

        var lowStockProducts = await _context.Products
            .AsNoTracking()
            .Where(p => !p.IsDeleted && p.StockQuantity <= lowStockThreshold && p.StockQuantity > 0)
            .Select(p => new AdminInventoryAlertDto
            {
                ProductId = p.Id,
                ProductName = p.Name,
                Sku = p.Sku,
                CurrentStock = p.StockQuantity,
                Threshold = lowStockThreshold,
                AlertType = "LowStock",
                Message = $"Low stock alert: only {p.StockQuantity} units remaining"
            })
            .ToListAsync(cancellationToken);

        var outOfStockProducts = await _context.Products
            .AsNoTracking()
            .Where(p => !p.IsDeleted && p.StockQuantity <= 0)
            .Select(p => new AdminInventoryAlertDto
            {
                ProductId = p.Id,
                ProductName = p.Name,
                Sku = p.Sku,
                CurrentStock = 0,
                Threshold = lowStockThreshold,
                AlertType = "OutOfStock",
                Message = "Out of stock - needs immediate restocking"
            })
            .ToListAsync(cancellationToken);

        return lowStockProducts.Concat(outOfStockProducts).ToList();
    }
}

#endregion
#region Products

public record GetAdminProductByIdQuery(Guid Id) : IRequest<AdminProductDto?>;

public class GetAdminProductByIdQueryHandler : IRequestHandler<GetAdminProductByIdQuery, AdminProductDto?>
{
    private readonly IApplicationDbContext _context;

    public GetAdminProductByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AdminProductDto?> Handle(GetAdminProductByIdQuery request, CancellationToken cancellationToken)
    {
        var p = await _context.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (p == null) return null;

        return new AdminProductDto
        {
            Id = p.Id,
            Name = p.Name,
            Slug = p.Slug,
            Sku = p.Sku,
            ShortDescription = p.ShortDescription,
            Description = p.Description,
            Price = p.Price,
            DiscountPrice = p.DiscountPrice,
            StockQuantity = p.StockQuantity,
            CategoryId = p.CategoryId,
            CategoryName = p.Category?.Name ?? string.Empty,
            BrandId = p.BrandId,
            BrandName = p.Brand?.Name ?? string.Empty,
            IsActive = p.IsActive,
            IsFeatured = p.IsFeatured,
            IsTrending = p.IsTrending,
            Rating = p.Rating,
            CreatedAt = p.CreatedAt
        };
    }
}

#endregion

#region Coupons

public record AdminCouponQuery(string? Search = null, int PageNumber = 1, int PageSize = 20) : IRequest<PagedListDto<AdminCouponDto>>;

public class GetAdminCouponsQueryHandler : IRequestHandler<AdminCouponQuery, PagedListDto<AdminCouponDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAdminCouponsQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<PagedListDto<AdminCouponDto>> Handle(AdminCouponQuery request, CancellationToken cancellationToken)
    {
        var pageNumber = Math.Max(1, request.PageNumber);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);

        var query = _context.Coupons.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            query = query.Where(c => EF.Functions.Like(c.Code, $"%{request.Search}%"));
        }

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new AdminCouponDto
            {
                Id = c.Id,
                Code = c.Code,
                Type = c.Type.ToString(),
                Value = c.Value,
                MinOrderAmount = c.MinOrderAmount,
                MaxDiscountAmount = c.MaxDiscountAmount,
                UsageLimit = c.UsageLimit,
                UsedCount = c.UsedCount,
                MaxUsesPerUser = c.MaxUsesPerUser,
                StartDate = c.StartDate,
                ExpiresAt = c.ExpiresAt,
                IsActive = c.IsActive,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return PagedListDto<AdminCouponDto>.Create(items, total, pageNumber, pageSize);
    }
}

#endregion

#region Banners

public record AdminBannerQuery(string? Search = null, int PageNumber = 1, int PageSize = 20) : IRequest<PagedListDto<AdminBannerDto>>;

public class GetAdminBannersQueryHandler : IRequestHandler<AdminBannerQuery, PagedListDto<AdminBannerDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAdminBannersQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<PagedListDto<AdminBannerDto>> Handle(AdminBannerQuery request, CancellationToken cancellationToken)
    {
        var pageNumber = Math.Max(1, request.PageNumber);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);

        var query = _context.Banners.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            query = query.Where(b => EF.Functions.Like(b.Title, $"%{request.Search}%"));
        }

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderBy(b => b.DisplayOrder)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(b => new AdminBannerDto
            {
                Id = b.Id,
                Title = b.Title,
                Subtitle = b.Subtitle,
                ImageUrl = b.ImageUrl,
                TargetUrl = b.TargetUrl,
                TargetType = b.TargetType,
                DisplayOrder = b.DisplayOrder,
                IsActive = b.IsActive,
                StartDate = b.StartDate,
                EndDate = b.EndDate,
                ClickCount = b.ClickCount,
                CreatedAt = b.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return PagedListDto<AdminBannerDto>.Create(items, total, pageNumber, pageSize);
    }
}

#endregion
