namespace FirstCry.Application.Common.Interfaces;

using FirstCry.Domain.Entities.Orders;
using FirstCry.Domain.Entities.Payments;

public interface IPaymentService
{
    /// <summary>
    /// Create a Razorpay order for online payment
    /// </summary>
    Task<PaymentOrderResult> CreatePaymentOrderAsync(Guid orderId, decimal amount, string currency = "INR");
    
    /// <summary>
    /// Verify payment signature from frontend
    /// </summary>
    Task<bool> VerifyPaymentSignatureAsync(string razorpayOrderId, string razorpayPaymentId, string razorpaySignature);
    
    /// <summary>
    /// Handle Razorpay webhook event
    /// </summary>
    Task<WebhookResult> HandleWebhookEventAsync(string payload, string signature);
    
    /// <summary>
    /// Process refund for an order
    /// </summary>
    Task<RefundResult> ProcessRefundAsync(Guid orderId, decimal? amount = null, string? reason = null);
    
    /// <summary>
    /// Get payment status for an order
    /// </summary>
    Task<PaymentStatusResult> GetPaymentStatusAsync(Guid orderId);
    
    /// <summary>
    /// Capture payment after verification
    /// </summary>
    Task<bool> CapturePaymentAsync(string razorpayPaymentId, decimal amount);

    /// <summary>
    /// Complete a dummy Razorpay payment (dev/demo when live keys are not configured).
    /// </summary>
    Task<DemoPaymentResult> CompleteDemoPaymentAsync(string razorpayOrderId);

    /// <summary>
    /// Whether the app is running without live Razorpay credentials.
    /// </summary>
    bool IsDemoMode { get; }
}

public record PaymentOrderResult(
    string RazorpayOrderId,
    decimal Amount,
    string Currency,
    string Status,
    bool IsDemoMode = false
);

public record DemoPaymentResult(
    bool Success,
    string? RazorpayPaymentId,
    string? RazorpaySignature,
    string? Message
);

public record WebhookResult(
    bool Success,
    string Event,
    string? PaymentId,
    string? OrderId,
    string? Error
);

public record RefundResult(
    bool Success,
    string? RefundId,
    decimal? RefundAmount,
    string? Status,
    string? Error
);

public record PaymentStatusResult(
    string Status,
    string? RazorpayPaymentId,
    string? RazorpayOrderId,
    decimal? Amount,
    DateTime? PaidAt
);