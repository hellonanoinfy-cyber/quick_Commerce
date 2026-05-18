using FirstCry.Domain.Common;

namespace FirstCry.Domain.Entities.Orders;

public class Order : AuditableEntity
{
    private readonly List<OrderItem> _items = new();
    private readonly List<OrderStatusHistory> _statusHistory = new();

    public string OrderNumber { get; private set; } = string.Empty;
    public Guid UserId { get; private set; }
    public OrderStatus Status { get; private set; } = OrderStatus.Pending;
    public PaymentMethod PaymentMethod { get; private set; }
    public PaymentStatus PaymentStatus { get; private set; } = PaymentStatus.Pending;

    public decimal SubTotal { get; private set; }
    public decimal DeliveryCharge { get; private set; }
    public decimal Discount { get; private set; }
    public decimal TotalAmount { get; private set; }

    public ShippingAddress ShippingAddress { get; private set; } = null!;

    // Navigation properties
    public virtual IReadOnlyCollection<OrderItem> Items => _items.AsReadOnly();
    public virtual IReadOnlyCollection<OrderStatusHistory> StatusHistory => _statusHistory.AsReadOnly();

    protected Order() { } // EF Core

    // Factory
    public static Order Create(
        Guid userId,
        string orderNumber,
        ShippingAddress address,
        PaymentMethod paymentMethod,
        decimal subTotal,
        decimal deliveryCharge,
        decimal discount)
    {
        var order = new Order
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            OrderNumber = orderNumber,
            ShippingAddress = address,
            PaymentMethod = paymentMethod,
            SubTotal = subTotal,
            DeliveryCharge = deliveryCharge,
            Discount = discount,
            TotalAmount = subTotal + deliveryCharge - discount,
            Status = OrderStatus.Pending,
            PaymentStatus = PaymentStatus.Pending
        };

        order._statusHistory.Add(new OrderStatusHistory(order.Id, OrderStatus.Pending, "Order placed successfully."));
        // TODO: Add OrderPlacedEvent
        
        return order;
    }

    public void AddItem(Guid productId, string name, string? imageUrl, decimal price, int quantity)
    {
        _items.Add(new OrderItem
        {
            OrderId = Id,
            ProductId = productId,
            ProductName = name,
            ProductImageUrl = imageUrl,
            UnitPrice = price,
            Quantity = quantity
        });
    }

    public void UpdateStatus(OrderStatus newStatus, string? note = null)
    {
        if (Status == newStatus) return;

        Status = newStatus;
        _statusHistory.Add(new OrderStatusHistory(Id, newStatus, note ?? $"Status updated to {newStatus}"));
        
        // TODO: Add OrderStatusChangedEvent
    }

    public void MarkPaymentComplete()
    {
        PaymentStatus = PaymentStatus.Completed;
    }
}

public class OrderStatusHistory
{
    public Guid Id { get; private set; }
    public Guid OrderId { get; private set; }
    public OrderStatus Status { get; private set; }
    public string? Note { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private OrderStatusHistory() { }

    public OrderStatusHistory(Guid orderId, OrderStatus status, string? note)
    {
        Id = Guid.NewGuid();
        OrderId = orderId;
        Status = status;
        Note = note;
        CreatedAt = DateTime.UtcNow;
    }
}
