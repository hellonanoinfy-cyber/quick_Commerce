namespace FirstCry.Application.Features.Orders.Commands;

using FirstCry.Application.Common.Exceptions;
using FirstCry.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

public record UpdateOrderStatusCommand(
    Guid OrderId,
    string NewStatus,
    string? Note = null
) : IRequest<bool>;

public class UpdateOrderStatusCommandHandler : IRequestHandler<UpdateOrderStatusCommand, bool>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly INotificationService _notificationService;

    public UpdateOrderStatusCommandHandler(IUnitOfWork unitOfWork, INotificationService notificationService)
    {
        _unitOfWork = unitOfWork;
        _notificationService = notificationService;
    }

    public async Task<bool> Handle(UpdateOrderStatusCommand request, CancellationToken cancellationToken)
    {
        var order = await _unitOfWork.Orders.GetQueryable()
            .Include(o => o.ShippingAddress)
            .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);

        if (order == null)
            throw new NotFoundException("Order", request.OrderId);

        // Parse new status
        if (!Enum.TryParse<Domain.Entities.Orders.OrderStatus>(request.NewStatus, true, out var newStatus))
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["status"] = new[] { $"Invalid order status: {request.NewStatus}. Valid values: {string.Join(", ", Enum.GetNames<Domain.Entities.Orders.OrderStatus>())}" }
            });

        // Validate status transition
        if (!IsValidTransition(order.Status, newStatus))
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["status"] = new[] { $"Cannot transition from {order.Status} to {newStatus}. Check order status flow." }
            });

        // Update status
        var oldStatus = order.Status;
        order.UpdateStatus(newStatus, request.Note ?? $"Status updated to {newStatus}");

        await _unitOfWork.Orders.UpdateAsync(order, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Send notification to user
        _ = Task.Run(async () =>
        {
            try
            {
                await _notificationService.SendOrderNotificationAsync(
                    order.UserId,
                    order.Id,
                    $"Order {order.Status}",
                    $"Your order {order.OrderNumber} is now {order.Status}"
                );
            }
            catch { /* Don't fail for notification */ }
        }, cancellationToken);

        return true;
    }

    private static bool IsValidTransition(Domain.Entities.Orders.OrderStatus current, Domain.Entities.Orders.OrderStatus next)
    {
        // Define valid status transitions
        var validTransitions = new Dictionary<Domain.Entities.Orders.OrderStatus, Domain.Entities.Orders.OrderStatus[]>
        {
            [Domain.Entities.Orders.OrderStatus.Pending] = new[] 
            { 
                Domain.Entities.Orders.OrderStatus.Confirmed, 
                Domain.Entities.Orders.OrderStatus.Cancelled 
            },
            [Domain.Entities.Orders.OrderStatus.Confirmed] = new[]
            {
                Domain.Entities.Orders.OrderStatus.Processing,
                Domain.Entities.Orders.OrderStatus.Packed,
                Domain.Entities.Orders.OrderStatus.Cancelled
            },
            [Domain.Entities.Orders.OrderStatus.Processing] = new[]
            {
                Domain.Entities.Orders.OrderStatus.Packed,
                Domain.Entities.Orders.OrderStatus.Cancelled
            },
            [Domain.Entities.Orders.OrderStatus.Packed] = new[]
            {
                Domain.Entities.Orders.OrderStatus.ReadyToShip,
                Domain.Entities.Orders.OrderStatus.Shipped,
                Domain.Entities.Orders.OrderStatus.Cancelled
            },
            [Domain.Entities.Orders.OrderStatus.ReadyToShip] = new[]
            {
                Domain.Entities.Orders.OrderStatus.Shipped
            },
            [Domain.Entities.Orders.OrderStatus.Shipped] = new[]
            {
                Domain.Entities.Orders.OrderStatus.OutForDelivery,
                Domain.Entities.Orders.OrderStatus.Delivered
            },
            [Domain.Entities.Orders.OrderStatus.OutForDelivery] = new[]
            {
                Domain.Entities.Orders.OrderStatus.Delivered
            },
            [Domain.Entities.Orders.OrderStatus.Delivered] = new[]
            {
                Domain.Entities.Orders.OrderStatus.Returned
            },
            [Domain.Entities.Orders.OrderStatus.Cancelled] = Array.Empty<Domain.Entities.Orders.OrderStatus>(),
            [Domain.Entities.Orders.OrderStatus.Returned] = Array.Empty<Domain.Entities.Orders.OrderStatus>(),
            [Domain.Entities.Orders.OrderStatus.Refunded] = Array.Empty<Domain.Entities.Orders.OrderStatus>()
        };

        return validTransitions.TryGetValue(current, out var allowed) && allowed.Contains(next);
    }
}