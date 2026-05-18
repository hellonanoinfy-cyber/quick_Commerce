namespace FirstCry.Domain.Entities.Payments;

using FirstCry.Domain.Common;

// ============================================================
// RAZORPAY PAYMENT ENTITIES
// ============================================================

public class Payment : AuditableEntity
{
    public Guid OrderId { get; private set; }
    public string RazorpayOrderId { get; private set; } = string.Empty;
    public string? RazorpayPaymentId { get; private set; }
    public string? RazorpayRefundId { get; private set; }
    
    public decimal Amount { get; private set; }
    public string Currency { get; private set; } = "INR";
    
    public PaymentStatus Status { get; private set; } = PaymentStatus.Pending;
    
    public string? FailureReason { get; private set; }
    public string? ErrorCode { get; private set; }
    public string? ErrorDescription { get; private set; }
    
    public string? Signature { get; private set; }
    public string? CardId { get; private set; }
    public string? CardNetwork { get; private set; }
    public string? CardType { get; private set; }
    public string? CardIssuer { get; private set; }
    
    public string PaymentMethod { get; private set; } = string.Empty;
    
    // IP address for security tracking
    public string? IpAddress { get; private set; }
    public string? UserAgent { get; private set; }

    // Refund tracking
    public decimal? RefundedAmount { get; private set; }
    public DateTime? RefundedAt { get; private set; }

    // Navigation property
    private readonly List<PaymentTransaction> _transactions = new();
    public virtual IReadOnlyCollection<PaymentTransaction> Transactions => _transactions.AsReadOnly();

    private readonly List<Refund> _refunds = new();
    public virtual IReadOnlyCollection<Refund> Refunds => _refunds.AsReadOnly();

    protected Payment() { } // EF Core

    public static Payment CreateForOrder(Guid orderId, string razorpayOrderId, decimal amount, string currency = "INR")
    {
        return new Payment
        {
            Id = Guid.NewGuid(),
            OrderId = orderId,
            RazorpayOrderId = razorpayOrderId,
            Amount = amount,
            Currency = currency,
            Status = PaymentStatus.Created,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void MarkAsPaid(string razorpayPaymentId, string? signature = null)
    {
        RazorpayPaymentId = razorpayPaymentId;
        Status = PaymentStatus.Completed;
        Signature = signature;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkAsFailed(string? reason, string? errorCode = null, string? errorDescription = null)
    {
        Status = PaymentStatus.Failed;
        FailureReason = reason;
        ErrorCode = errorCode;
        ErrorDescription = errorDescription;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdatePaymentDetails(string paymentMethod, string? cardId = null, string? cardNetwork = null)
    {
        PaymentMethod = paymentMethod;
        CardId = cardId;
        CardNetwork = cardNetwork;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkRefunded(string razorpayRefundId, decimal refundAmount)
    {
        RazorpayRefundId = razorpayRefundId;
        Status = PaymentStatus.Refunded;
        RefundedAmount = refundAmount;
        RefundedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void PartialRefund(decimal refundAmount)
    {
        RefundedAmount = (RefundedAmount ?? 0) + refundAmount;
        Status = RefundedAmount >= Amount ? PaymentStatus.Refunded : PaymentStatus.PartiallyRefunded;
        UpdatedAt = DateTime.UtcNow;
    }

    public void AddTransaction(string type, string? details = null, decimal? amount = null)
    {
        _transactions.Add(PaymentTransaction.Create(Id, type, details, amount));
    }

    public void SetSecurityInfo(string? ipAddress, string? userAgent)
    {
        IpAddress = ipAddress;
        UserAgent = userAgent;
    }
}

public class PaymentTransaction : BaseEntity
{
    public Guid PaymentId { get; private set; }
    public string TransactionType { get; private set; } = string.Empty; // created, attempted, verified, captured, failed, refunded
    public string? Details { get; private set; }
    public decimal? Amount { get; private set; }
    public new DateTime CreatedAt { get; private set; }

    // Navigation
    public virtual Payment Payment { get; private set; } = null!;

    private PaymentTransaction() { }

    public static PaymentTransaction Create(Guid paymentId, string type, string? details, decimal? amount)
    {
        return new PaymentTransaction
        {
            Id = Guid.NewGuid(),
            PaymentId = paymentId,
            TransactionType = type,
            Details = details,
            Amount = amount,
            CreatedAt = DateTime.UtcNow
        };
    }
}

public class Refund : AuditableEntity
{
    public Guid PaymentId { get; private set; }
    public Guid? OrderId { get; private set; }
    public string RazorpayRefundId { get; private set; } = string.Empty;
    public decimal Amount { get; private set; }
    public string Status { get; private set; } = "pending";
    public string? Reason { get; private set; }
    public string? Receipt { get; private set; }
    public new DateTime CreatedAt { get; private set; }
    public DateTime? ProcessedAt { get; private set; }

    // Navigation
    public virtual Payment Payment { get; private set; } = null!;

    protected Refund() { }

    public static Refund Create(Guid paymentId, Guid? orderId, string razorpayRefundId, decimal amount, string? reason)
    {
        return new Refund
        {
            Id = Guid.NewGuid(),
            PaymentId = paymentId,
            OrderId = orderId,
            RazorpayRefundId = razorpayRefundId,
            Amount = amount,
            Status = "processed",
            Reason = reason,
            CreatedAt = DateTime.UtcNow,
            ProcessedAt = DateTime.UtcNow
        };
    }
}

// ============================================================
// ENUMS
// ============================================================

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