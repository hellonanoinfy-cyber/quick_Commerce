using FirstCry.Application.Common.Exceptions;
using FirstCry.Application.Common.Interfaces;
using FirstCry.Domain.Entities.Orders;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FirstCry.Application.Features.Orders.Commands;

public record PlaceOrderCommand(
    Guid UserId,
    ShippingAddress ShippingAddress,
    PaymentMethod PaymentMethod
) : IRequest<Guid>;

public class PlaceOrderCommandHandler : IRequestHandler<PlaceOrderCommand, Guid>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICartService _cartService;
    private readonly INotificationService _notificationService;

    public PlaceOrderCommandHandler(
        IUnitOfWork unitOfWork,
        ICartService cartService,
        INotificationService notificationService)
    {
        _unitOfWork = unitOfWork;
        _cartService = cartService;
        _notificationService = notificationService;
    }

    public async Task<Guid> Handle(PlaceOrderCommand request, CancellationToken cancellationToken)
    {
        // 1. Validate Shipping Address
        ValidateShippingAddress(request.ShippingAddress);

        // 2. Validate Payment Method
        if (!Enum.IsDefined(typeof(PaymentMethod), request.PaymentMethod))
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["paymentMethod"] = new[] { "Please select a valid payment method." }
            });

        // 3. Get Cart with Items and Products
        var cart = await _unitOfWork.Carts.GetQueryable()
            .Include(c => c.Items)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p!.Images)
            .FirstOrDefaultAsync(c => c.UserId == request.UserId, cancellationToken);

        if (cart == null || !cart.Items.Any())
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["cart"] = new[] { "Your cart is empty. Add items before checking out." }
            });

        // 4. Validate stock for all items
        var outOfStockItems = new List<string>();
        var insufficientStockItems = new List<string>();

        foreach (var item in cart.Items)
        {
            var product = item.Product;
            if (product == null)
            {
                outOfStockItems.Add("A product in your cart is no longer available.");
                continue;
            }

            if (!product.IsActive)
            {
                outOfStockItems.Add($"{product.Name} is no longer available.");
                continue;
            }

            if (product.StockQuantity < item.Quantity)
            {
                insufficientStockItems.Add($"{product.Name} - only {product.StockQuantity} available");
            }
        }

        if (outOfStockItems.Any())
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["stock"] = outOfStockItems.ToArray()
            });

        if (insufficientStockItems.Any())
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["stock"] = insufficientStockItems.ToArray()
            });

        // 5. Generate Order Number
        var orderNumber = $"FC-{DateTime.UtcNow:yyyy}-{Guid.NewGuid().ToString("N").Substring(0, 6).ToUpper()}";

        // 6. Calculate Totals
        var subTotal = cart.Items.Sum(i => i.Price * i.Quantity);
        var deliveryCharge = subTotal >= 499 ? 0 : 49;
        var discount = 0m;

        // 7. Create Order
        var order = Order.Create(
            request.UserId,
            orderNumber,
            request.ShippingAddress,
            request.PaymentMethod,
            subTotal,
            deliveryCharge,
            discount
        );

        // 8. Add Items & Deduct Stock in a transaction
        await _unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            foreach (var item in cart.Items)
            {
                var product = item.Product!;

                var imageUrl = product.Images
                    .OrderByDescending(i => i.IsPrimary)
                    .ThenBy(i => i.DisplayOrder)
                    .FirstOrDefault()?.Url;

                order.AddItem(product.Id, product.Name, imageUrl, item.Price, item.Quantity);

                // Deduct Stock
                product.UpdateStock(product.StockQuantity - item.Quantity);
            }

            // 9. Save Order
            await _unitOfWork.Orders.AddAsync(order, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // 10. Clear Cart
            await _cartService.ClearCartAsync(request.UserId);
        }, cancellationToken);

        // 11. Push SignalR Notification (non-blocking)
        _ = Task.Run(async () =>
        {
            try
            {
                await _notificationService.SendOrderNotificationAsync(
                    request.UserId,
                    order.Id,
                    "Order Confirmed",
                    $"Your order {order.OrderNumber} has been placed successfully!"
                );
                
                await _notificationService.BroadcastToAdminsAsync(new FirstCry.Application.Common.Interfaces.NotificationDto
                {
                    Id = Guid.NewGuid(),
                    UserId = Guid.Empty,
                    Title = "New Order Placed",
                    Body = $"Order {order.OrderNumber} for {order.TotalAmount:C} has been placed.",
                    Type = "Order",
                    Status = "Pending",
                    Priority = "High",
                    ReferenceId = order.Id,
                    ReferenceType = "Order",
                    ReferenceUrl = $"/admin/orders/{order.Id}",
                    CreatedAt = DateTime.UtcNow
                });
            }
            catch
            {
                // Don't fail the order for notification failure
            }
        }, cancellationToken);

        return order.Id;
    }

    private static void ValidateShippingAddress(ShippingAddress address)
    {
        var errors = new Dictionary<string, List<string>>();

        if (string.IsNullOrWhiteSpace(address.FullName))
            AddError(errors, "fullName", "Full name is required.");

        if (string.IsNullOrWhiteSpace(address.Phone))
            AddError(errors, "phoneNumber", "Phone number is required.");
        else if (address.Phone.Length < 10)
            AddError(errors, "phoneNumber", "Phone number must be at least 10 digits.");

        if (string.IsNullOrWhiteSpace(address.AddressLine1))
            AddError(errors, "addressLine1", "Address is required.");

        if (string.IsNullOrWhiteSpace(address.City))
            AddError(errors, "city", "City is required.");

        if (string.IsNullOrWhiteSpace(address.State))
            AddError(errors, "state", "State is required.");

        if (string.IsNullOrWhiteSpace(address.ZipCode))
            AddError(errors, "postalCode", "Postal code is required.");
        else if (!address.ZipCode.All(char.IsDigit) || address.ZipCode.Length < 6)
            AddError(errors, "postalCode", "Invalid postal code format.");

        if (string.IsNullOrWhiteSpace(address.Country))
            AddError(errors, "country", "Country is required.");

        if (errors.Any())
        {
            var formattedErrors = errors.ToDictionary(
                kvp => kvp.Key,
                kvp => kvp.Value.ToArray()
            );
            throw new ValidationException(formattedErrors);
        }
    }

    private static void AddError(Dictionary<string, List<string>> errors, string field, string message)
    {
        if (!errors.ContainsKey(field))
            errors[field] = new List<string>();
        errors[field].Add(message);
    }
}
