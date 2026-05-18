using FirstCry.Application.Common.Interfaces;
using FirstCry.Domain.Entities.Orders;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FirstCry.Application.Features.Orders.Queries;

public record GetOrderByIdQuery(Guid OrderId, Guid UserId) : IRequest<OrderDetailDto?>;

public record OrderDetailDto(
    Guid Id,
    string OrderNumber,
    OrderStatus Status,
    decimal TotalAmount,
    decimal SubTotal,
    decimal DeliveryCharge,
    decimal Discount,
    DateTime CreatedAt,
    ShippingAddress ShippingAddress,
    PaymentMethod PaymentMethod,
    List<OrderDetailItemDto> Items,
    List<OrderStatusHistoryDto> StatusHistory
);

public record OrderStatusHistoryDto(
    OrderStatus Status,
    string? Note,
    DateTime CreatedAt
);

public record OrderDetailItemDto(
    Guid ProductId,
    string ProductName,
    string? ProductImageUrl,
    decimal UnitPrice,
    int Quantity
);

public class GetOrderByIdQueryHandler : IRequestHandler<GetOrderByIdQuery, OrderDetailDto?>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetOrderByIdQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<OrderDetailDto?> Handle(GetOrderByIdQuery request, CancellationToken cancellationToken)
    {
        var order = await _unitOfWork.Orders.GetQueryable()
            .Include(o => o.Items)
            .Include(o => o.StatusHistory)
            .FirstOrDefaultAsync(o => o.Id == request.OrderId && o.UserId == request.UserId, cancellationToken);

        if (order == null) return null;

        return new OrderDetailDto(
            order.Id,
            order.OrderNumber,
            order.Status,
            order.TotalAmount,
            order.SubTotal,
            order.DeliveryCharge,
            order.Discount,
            order.CreatedAt,
            order.ShippingAddress,
            order.PaymentMethod,
            order.Items.Select(i => new OrderDetailItemDto(
                i.ProductId,
                i.ProductName,
                i.ProductImageUrl,
                i.UnitPrice,
                i.Quantity
            )).ToList(),
            order.StatusHistory.Select(h => new OrderStatusHistoryDto(
                h.Status,
                h.Note,
                h.CreatedAt
            )).OrderByDescending(h => h.CreatedAt).ToList()
        );
    }
}
