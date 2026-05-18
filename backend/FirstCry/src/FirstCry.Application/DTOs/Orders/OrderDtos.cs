namespace FirstCry.Application.DTOs.Orders;

using FirstCry.Domain.Entities.Orders;

// ============================================================
// ORDER REQUEST DTOs - Fixes POST /api/v1/orders 400 error
// ============================================================

public record PlaceOrderRequestDto
{
    public ShippingAddressDto ShippingAddress { get; init; } = null!;
    public string PaymentMethod { get; init; } = string.Empty;
}

public record ShippingAddressDto
{
    public string FullName { get; init; } = string.Empty;
    public string Phone { get; init; } = string.Empty;
    public string AddressLine1 { get; init; } = string.Empty;
    public string? AddressLine2 { get; init; }
    public string City { get; init; } = string.Empty;
    public string State { get; init; } = string.Empty;
    public string ZipCode { get; init; } = string.Empty;
    public string Country { get; init; } = "India";

    // Conversion to domain entity
    public ShippingAddress ToEntity() => new(
        FullName,
        Phone,
        AddressLine1,
        AddressLine2,
        City,
        State,
        ZipCode,
        Country
    );
}

// ============================================================
// ORDER RESPONSE DTOs
// ============================================================

public record OrderDto
{
    public Guid Id { get; init; }
    public string OrderNumber { get; init; } = string.Empty;
    public Guid UserId { get; init; }
    public string Status { get; init; } = string.Empty;
    public string PaymentMethod { get; init; } = string.Empty;
    public string PaymentStatus { get; init; } = string.Empty;
    public decimal SubTotal { get; init; }
    public decimal DeliveryCharge { get; init; }
    public decimal Discount { get; init; }
    public decimal TotalAmount { get; init; }
    public ShippingAddressDto ShippingAddress { get; init; } = null!;
    public List<OrderItemDto> Items { get; init; } = new();
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}

public record OrderItemDto
{
    public Guid Id { get; init; }
    public Guid ProductId { get; init; }
    public string ProductName { get; init; } = string.Empty;
    public string? ProductImageUrl { get; init; }
    public decimal UnitPrice { get; init; }
    public int Quantity { get; init; }
    public decimal TotalPrice => UnitPrice * Quantity;
}

public record OrderStatusHistoryDto
{
    public Guid Id { get; init; }
    public string Status { get; init; } = string.Empty;
    public string? Note { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record OrderDetailDto : OrderDto
{
    public List<OrderStatusHistoryDto> StatusHistory { get; init; } = new();
}

// ============================================================
// MAPPING EXTENSIONS
// ============================================================

public static class OrderMappingExtensions
{
    public static OrderDto ToDto(this Order order)
    {
        return new OrderDto
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            UserId = order.UserId,
            Status = order.Status.ToString(),
            PaymentMethod = order.PaymentMethod.ToString(),
            PaymentStatus = order.PaymentStatus.ToString(),
            SubTotal = order.SubTotal,
            DeliveryCharge = order.DeliveryCharge,
            Discount = order.Discount,
            TotalAmount = order.TotalAmount,
            ShippingAddress = new ShippingAddressDto
            {
                FullName = order.ShippingAddress.FullName,
                Phone = order.ShippingAddress.Phone,
                AddressLine1 = order.ShippingAddress.AddressLine1,
                AddressLine2 = order.ShippingAddress.AddressLine2,
                City = order.ShippingAddress.City,
                State = order.ShippingAddress.State,
                ZipCode = order.ShippingAddress.ZipCode,
                Country = order.ShippingAddress.Country
            },
            Items = order.Items.Select(i => i.ToDto()).ToList(),
            CreatedAt = order.CreatedAt,
            UpdatedAt = order.UpdatedAt
        };
    }

    public static OrderItemDto ToDto(this OrderItem item)
    {
        return new OrderItemDto
        {
            Id = item.Id,
            ProductId = item.ProductId,
            ProductName = item.ProductName,
            ProductImageUrl = item.ProductImageUrl,
            UnitPrice = item.UnitPrice,
            Quantity = item.Quantity
        };
    }

    public static OrderStatusHistoryDto ToDto(this OrderStatusHistory history)
    {
        return new OrderStatusHistoryDto
        {
            Id = history.Id,
            Status = history.Status.ToString(),
            Note = history.Note,
            CreatedAt = history.CreatedAt
        };
    }

    public static OrderDetailDto ToDetailDto(this Order order)
    {
        var dto = order.ToDto();
        return new OrderDetailDto
        {
            Id = dto.Id,
            OrderNumber = dto.OrderNumber,
            UserId = dto.UserId,
            Status = dto.Status,
            PaymentMethod = dto.PaymentMethod,
            PaymentStatus = dto.PaymentStatus,
            SubTotal = dto.SubTotal,
            DeliveryCharge = dto.DeliveryCharge,
            Discount = dto.Discount,
            TotalAmount = dto.TotalAmount,
            ShippingAddress = dto.ShippingAddress,
            Items = dto.Items,
            CreatedAt = dto.CreatedAt,
            UpdatedAt = dto.UpdatedAt,
            StatusHistory = order.StatusHistory.Select(h => h.ToDto()).ToList()
        };
    }

    public static PaymentMethod ToPaymentMethod(this string method)
    {
        return method.ToUpperInvariant() switch
        {
            "COD" => PaymentMethod.COD,
            "UPI" => PaymentMethod.UPI,
            "CARD" => PaymentMethod.Card,
            "NETBANKING" => PaymentMethod.NetBanking,
            _ => PaymentMethod.COD
        };
    }
}