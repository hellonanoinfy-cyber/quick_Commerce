namespace FirstCry.Application.DTOs.Payments;

// Payment request/response DTOs for API contracts
public record PaymentOrderDto
{
    public Guid Id { get; init; }
    public Guid OrderId { get; init; }
    public string RazorpayOrderId { get; init; } = string.Empty;
    public string? RazorpayPaymentId { get; init; }
    public decimal Amount { get; init; }
    public string Currency { get; init; } = "INR";
    public string Status { get; init; } = string.Empty;
    public string PaymentMethod { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
}

public record PaymentListDto
{
    public Guid PaymentId { get; init; }
    public string OrderNumber { get; init; } = string.Empty;
    public decimal Amount { get; init; }
    public string Status { get; init; } = string.Empty;
    public string PaymentMethod { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public DateTime? RefundedAt { get; init; }
}

public record PaymentTransactionDto
{
    public string TransactionType { get; init; } = string.Empty;
    public string? Details { get; init; }
    public decimal? Amount { get; init; }
    public DateTime CreatedAt { get; init; }
}