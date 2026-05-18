using FirstCry.Application.Common.Interfaces;
using FirstCry.Application.DTOs.Catalog;
using FirstCry.Application.DTOs;
using FirstCry.Domain.Entities.Orders;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FirstCry.Application.Features.Orders.Queries;

public record GetMyOrdersQuery(Guid UserId, int Page = 1, int PageSize = 10) : IRequest<PagedListDto<MyOrderDto>>;

public record MyOrderDto(
    Guid Id,
    string OrderNumber,
    OrderStatus Status,
    decimal TotalAmount,
    DateTime CreatedAt,
    List<MyOrderItemDto> Items
);

public record MyOrderItemDto(
    Guid ProductId,
    string ProductName,
    string? ProductImageUrl,
    decimal UnitPrice,
    int Quantity
);

public class GetMyOrdersQueryHandler : IRequestHandler<GetMyOrdersQuery, PagedListDto<MyOrderDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetMyOrdersQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedListDto<MyOrderDto>> Handle(GetMyOrdersQuery request, CancellationToken cancellationToken)
    {
        var query = _unitOfWork.Orders.GetQueryable()
            .Where(o => o.UserId == request.UserId)
            .OrderByDescending(o => o.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);
        
        var orders = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(o => new MyOrderDto(
                o.Id,
                o.OrderNumber,
                o.Status,
                o.TotalAmount,
                o.CreatedAt,
                o.Items.Select(i => new MyOrderItemDto(
                    i.ProductId,
                    i.ProductName,
                    i.ProductImageUrl,
                    i.UnitPrice,
                    i.Quantity
                )).ToList()
            ))
            .ToListAsync(cancellationToken);

        return PagedListDto<MyOrderDto>.Create(orders, totalCount, request.Page, request.PageSize);
    }
}
