using FirstCry.Application.Common.Interfaces;
using FirstCry.Domain.Entities.Orders;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FirstCry.Application.Features.Orders.Commands;

public record CancelOrderCommand(Guid OrderId, Guid UserId) : IRequest<bool>;

public class CancelOrderCommandHandler : IRequestHandler<CancelOrderCommand, bool>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly INotificationService _notificationService;

    public CancelOrderCommandHandler(IUnitOfWork unitOfWork, INotificationService notificationService)
    {
        _unitOfWork = unitOfWork;
        _notificationService = notificationService;
    }

    public async Task<bool> Handle(CancelOrderCommand request, CancellationToken cancellationToken)
    {
        var order = await _unitOfWork.Orders.GetQueryable()
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == request.OrderId && o.UserId == request.UserId, cancellationToken);

        if (order == null) return false;

        // Business Rule: Only Pending or Confirmed orders can be cancelled
        if (order.Status != OrderStatus.Pending && order.Status != OrderStatus.Confirmed)
            throw new Exception("Order cannot be cancelled at this stage.");

        order.UpdateStatus(OrderStatus.Cancelled, "Cancelled by customer.");

        // Restore Stock
        foreach (var item in order.Items)
        {
            var product = await _unitOfWork.Products.GetByIdAsync(item.ProductId);
            if (product != null)
            {
                product.UpdateStock(product.StockQuantity + item.Quantity);
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _notificationService.SendOrderNotificationAsync(
            order.UserId,
            order.Id,
            "Order Cancelled",
            $"Your order {order.OrderNumber} has been cancelled."
        );

        return true;
    }
}
