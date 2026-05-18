namespace FirstCry.Domain.Entities.Orders;

public enum OrderStatus
{
    Pending = 0,
    Confirmed = 1,
    Processing = 2,
    Packed = 3,
    ReadyToShip = 4,
    Shipped = 5,
    OutForDelivery = 6,
    Delivered = 7,
    Cancelled = 8,
    Returned = 9,
    Refunded = 10
}

public enum PaymentMethod
{
    COD = 0,
    UPI = 1,
    Card = 2,
    NetBanking = 3,
    Wallet = 4
}

public enum PaymentStatus
{
    Pending = 0,
    Created = 1,
    Attempted = 2,
    Verified = 3,
    Completed = 4,
    Failed = 5,
    Refunded = 6,
    PartiallyRefunded = 7,
    Cancelled = 8
}
