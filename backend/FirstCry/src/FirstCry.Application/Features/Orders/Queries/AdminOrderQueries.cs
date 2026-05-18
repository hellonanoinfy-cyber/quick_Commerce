namespace FirstCry.Application.Features.Orders.Queries;

using FirstCry.Application.DTOs;
using FirstCry.Application.DTOs.Orders;
using FirstCry.Application.Common.Interfaces;
using FirstCry.Domain.Entities.Orders;
using MediatR;
using Microsoft.EntityFrameworkCore;

// Make extension methods accessible
using static FirstCry.Application.DTOs.Orders.OrderMappingExtensions;

public record GetAllOrdersQuery(
    int Page = 1,
    int PageSize = 20,
    string? Status = null,
    string? Search = null,
    DateTime? FromDate = null,
    DateTime? ToDate = null
) : IRequest<PagedListDto<AdminOrderDto>>;

// Admin-specific OrderDto (separate from user's OrderDto)
public class AdminOrderDto
{
    public Guid Id { get; init; }
    public string OrderNumber { get; init; } = string.Empty;
    public Guid UserId { get; init; }
    public string? UserPhone { get; init; }
    public string Status { get; init; } = string.Empty;
    public string PaymentMethod { get; init; } = string.Empty;
    public string PaymentStatus { get; init; } = string.Empty;
    public decimal TotalAmount { get; init; }
    public int ItemCount { get; init; }
    public string? ShippingCity { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}

public class GetAllOrdersQueryHandler : IRequestHandler<GetAllOrdersQuery, PagedListDto<AdminOrderDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAllOrdersQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PagedListDto<AdminOrderDto>> Handle(GetAllOrdersQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            if (Enum.TryParse<OrderStatus>(request.Status, true, out var status))
            {
                query = query.Where(o => o.Status == status);
            }
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.ToLower();
            query = query.Where(o => 
                o.OrderNumber.ToLower().Contains(search) ||
                o.ShippingAddress.Phone.Contains(search) ||
                o.ShippingAddress.FullName.ToLower().Contains(search)
            );
        }

        if (request.FromDate.HasValue)
        {
            query = query.Where(o => o.CreatedAt >= request.FromDate.Value);
        }

        if (request.ToDate.HasValue)
        {
            query = query.Where(o => o.CreatedAt <= request.ToDate.Value);
        }

        // Get total count
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply pagination
        var orders = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        // Map to DTOs
        var items = orders.Select(o => new AdminOrderDto
        {
            Id = o.Id,
            OrderNumber = o.OrderNumber,
            UserId = o.UserId,
            UserPhone = o.ShippingAddress.Phone,
            Status = o.Status.ToString(),
            PaymentMethod = o.PaymentMethod.ToString(),
            PaymentStatus = o.PaymentStatus.ToString(),
            TotalAmount = o.TotalAmount,
            ItemCount = o.Items.Count,
            ShippingCity = o.ShippingAddress.City,
            CreatedAt = o.CreatedAt,
            UpdatedAt = o.UpdatedAt
        }).ToList();

        return PagedListDto<AdminOrderDto>.Create(items, totalCount, request.Page, request.PageSize);
    }
}

public record GetAdminOrderByIdQuery(Guid OrderId) : IRequest<DTOs.Orders.OrderDetailDto?>;

public class GetAdminOrderByIdQueryHandler : IRequestHandler<GetAdminOrderByIdQuery, DTOs.Orders.OrderDetailDto?>
{
    private readonly IApplicationDbContext _context;

    public GetAdminOrderByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DTOs.Orders.OrderDetailDto?> Handle(GetAdminOrderByIdQuery request, CancellationToken cancellationToken)
    {
        var order = await _context.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .Include(o => o.StatusHistory)
            .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);

        return order?.ToDetailDto();
    }
}

public record GetOrderTimelineQuery(Guid OrderId) : IRequest<IEnumerable<DTOs.Orders.OrderStatusHistoryDto>>;

public class GetOrderTimelineQueryHandler : IRequestHandler<GetOrderTimelineQuery, IEnumerable<DTOs.Orders.OrderStatusHistoryDto>>
{
    private readonly IApplicationDbContext _context;

    public GetOrderTimelineQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<DTOs.Orders.OrderStatusHistoryDto>> Handle(GetOrderTimelineQuery request, CancellationToken cancellationToken)
    {
        var history = await _context.Orders
            .AsNoTracking()
            .Where(o => o.Id == request.OrderId)
            .SelectMany(o => o.StatusHistory)
            .OrderByDescending(h => h.CreatedAt)
            .ToListAsync(cancellationToken);

        return history.Select(h => h.ToDto());
    }
}