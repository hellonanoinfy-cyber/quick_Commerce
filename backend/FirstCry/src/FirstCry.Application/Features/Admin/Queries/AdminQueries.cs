using FirstCry.Application.Common.Interfaces;
using FirstCry.Application.DTOs;
using FirstCry.Application.DTOs.Admin;
using FirstCry.Application.DTOs.Catalog;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FirstCry.Application.Features.Admin.Queries;

public record GetAdminDashboardQuery : IRequest<AdminDashboardDto>;

public class GetAdminDashboardQueryHandler : IRequestHandler<GetAdminDashboardQuery, AdminDashboardDto>
{
    private readonly IApplicationDbContext _context;

    public GetAdminDashboardQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AdminDashboardDto> Handle(GetAdminDashboardQuery request, CancellationToken cancellationToken)
    {
        var since = DateTime.UtcNow.Date.AddDays(-13);
        var orders = _context.Orders.IgnoreQueryFilters().AsNoTracking().Include(o => o.Items);
        var products = _context.Products.AsNoTracking().Include(p => p.Brand).Include(p => p.Category).Include(p => p.Images);

        var recentOrders = await orders
            .OrderByDescending(o => o.CreatedAt)
            .Take(8)
            .Select(o => new AdminOrderDto
            {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                CustomerName = o.ShippingAddress.FullName,
                CustomerPhone = o.ShippingAddress.Phone,
                Status = o.Status.ToString(),
                PaymentMethod = o.PaymentMethod.ToString(),
                PaymentStatus = o.PaymentStatus.ToString(),
                TotalAmount = o.TotalAmount,
                ItemCount = o.Items.Sum(i => i.Quantity),
                CreatedAt = o.CreatedAt
            })
            .ToListAsync(cancellationToken);

        var salesTrend = await orders
            .Where(o => o.CreatedAt >= since)
            .GroupBy(o => o.CreatedAt.Date)
            .Select(g => new AdminMetricPointDto
            {
                Label = g.Key.ToString("dd MMM"),
                Value = g.Sum(o => o.TotalAmount)
            })
            .ToListAsync(cancellationToken);

        var topProducts = await products
            .OrderByDescending(p => p.ReviewCount)
            .ThenByDescending(p => p.Rating)
            .Take(5)
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

        var lowStock = await products
            .Where(p => p.StockQuantity <= 10)
            .OrderBy(p => p.StockQuantity)
            .Take(6)
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

        return new AdminDashboardDto
        {
            Revenue = await orders.SumAsync(o => o.TotalAmount, cancellationToken),
            TotalOrders = await orders.CountAsync(cancellationToken),
            ActiveCustomers = await _context.Users.AsNoTracking().CountAsync(u => u.Role != "Blocked", cancellationToken),
            TotalProducts = await products.CountAsync(cancellationToken),
            SalesTrend = salesTrend,
            TopProducts = topProducts,
            LowStockProducts = lowStock,
            RecentOrders = recentOrders
        };
    }
}

public record GetAdminProductsQuery(
    string? Search = null,
    string? SortBy = null,
    int PageNumber = 1,
    int PageSize = 20
) : IRequest<PagedListDto<AdminProductDto>>;

public class GetAdminProductsQueryHandler : IRequestHandler<GetAdminProductsQuery, PagedListDto<AdminProductDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAdminProductsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PagedListDto<AdminProductDto>> Handle(GetAdminProductsQuery request, CancellationToken cancellationToken)
    {
        var pageNumber = Math.Max(1, request.PageNumber);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);
        var query = _context.Products.AsNoTracking().Include(p => p.Brand).Include(p => p.Category).Include(p => p.Images).AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            query = query.Where(p => EF.Functions.Like(p.Name, $"%{request.Search}%") || EF.Functions.Like(p.Sku, $"%{request.Search}%"));
        }

        query = request.SortBy?.ToLowerInvariant() switch
        {
            "stock_asc" => query.OrderBy(p => p.StockQuantity),
            "stock_desc" => query.OrderByDescending(p => p.StockQuantity),
            "price_asc" => query.OrderBy(p => p.Price),
            "price_desc" => query.OrderByDescending(p => p.Price),
            _ => query.OrderByDescending(p => p.CreatedAt)
        };

        var total = await query.CountAsync(cancellationToken);
        var items = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize)
            .Select(p => new AdminProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Slug = p.Slug,
                Sku = p.Sku,
                Price = p.Price,
                DiscountPrice = p.DiscountPrice,
                StockQuantity = p.StockQuantity,
                IsActive = p.IsActive,
                IsFeatured = p.IsFeatured,
                BrandName = p.Brand.Name,
                CategoryName = p.Category.Name,
                PrimaryImageUrl = p.Images.Where(i => i.IsPrimary).Select(i => i.Url).FirstOrDefault()
                                  ?? p.Images.OrderBy(i => i.DisplayOrder).Select(i => i.Url).FirstOrDefault()
            }).ToListAsync(cancellationToken);

        return PagedListDto<AdminProductDto>.Create(items, total, pageNumber, pageSize);
    }
}

public record GetAdminOrdersQuery(string? Search = null, string? Status = null, int PageNumber = 1, int PageSize = 20) : IRequest<PagedListDto<AdminOrderDto>>;

public class GetAdminOrdersQueryHandler : IRequestHandler<GetAdminOrdersQuery, PagedListDto<AdminOrderDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAdminOrdersQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PagedListDto<AdminOrderDto>> Handle(GetAdminOrdersQuery request, CancellationToken cancellationToken)
    {
        var pageNumber = Math.Max(1, request.PageNumber);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);
        var query = _context.Orders.IgnoreQueryFilters().AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var term = $"%{request.Search.Trim()}%";
            query = query.Where(o =>
                EF.Functions.Like(o.OrderNumber, term) ||
                EF.Functions.Like(o.ShippingAddress.FullName, term) ||
                EF.Functions.Like(o.ShippingAddress.Phone, term));
        }

        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            query = query.Where(o => o.Status.ToString() == request.Status);
        }

        query = query.OrderByDescending(o => o.CreatedAt);
        var total = await query.CountAsync(cancellationToken);
        var items = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize)
            .Select(o => new AdminOrderDto
            {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                CustomerName = o.ShippingAddress.FullName,
                CustomerPhone = o.ShippingAddress.Phone,
                Status = o.Status.ToString(),
                PaymentMethod = o.PaymentMethod.ToString(),
                PaymentStatus = o.PaymentStatus.ToString(),
                TotalAmount = o.TotalAmount,
                ItemCount = _context.OrderItems
                    .IgnoreQueryFilters()
                    .Where(i => i.OrderId == o.Id)
                    .Sum(i => (int?)i.Quantity) ?? 0,
                CreatedAt = o.CreatedAt
            }).ToListAsync(cancellationToken);

        return PagedListDto<AdminOrderDto>.Create(items, total, pageNumber, pageSize);
    }
}

public record GetAdminCustomersQuery(string? Search = null, int PageNumber = 1, int PageSize = 20) : IRequest<PagedListDto<AdminCustomerDto>>;

public class GetAdminCustomersQueryHandler : IRequestHandler<GetAdminCustomersQuery, PagedListDto<AdminCustomerDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAdminCustomersQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PagedListDto<AdminCustomerDto>> Handle(GetAdminCustomersQuery request, CancellationToken cancellationToken)
    {
        var pageNumber = Math.Max(1, request.PageNumber);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);
        var query = _context.Users.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            query = query.Where(u => EF.Functions.Like(u.PhoneNumber, $"%{request.Search}%") ||
                                     EF.Functions.Like(u.Name ?? "", $"%{request.Search}%") ||
                                     EF.Functions.Like(u.Email ?? "", $"%{request.Search}%"));
        }

        var total = await query.CountAsync(cancellationToken);
        var items = await query.OrderByDescending(u => u.CreatedAt).Skip((pageNumber - 1) * pageSize).Take(pageSize)
            .Select(u => new AdminCustomerDto
            {
                Id = u.Id,
                PhoneNumber = u.PhoneNumber,
                Name = u.Name,
                Email = u.Email,
                Role = u.Role,
                IsGuest = u.IsGuest,
                ProfileCompleted = u.ProfileCompleted,
                IsBlocked = u.Role == "Blocked",
                CreatedAt = u.CreatedAt
            }).ToListAsync(cancellationToken);

        return PagedListDto<AdminCustomerDto>.Create(items, total, pageNumber, pageSize);
    }
}
