namespace FirstCry.API.Controllers.v1;

using FirstCry.Application.Common.Interfaces;
using FirstCry.Application.DTOs;
using FirstCry.Application.DTOs.Payments;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.Extensions.Configuration;

[ApiController]
[Route("api/v1/payments")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<PaymentsController> _logger;

    public PaymentsController(
        IPaymentService paymentService,
        IConfiguration configuration,
        ILogger<PaymentsController> logger)
    {
        _paymentService = paymentService;
        _configuration = configuration;
        _logger = logger;
    }

    /// <summary>
    /// Get available payment methods
    /// </summary>
    [HttpGet("methods")]
    public ActionResult<ApiResponse<IEnumerable<PaymentMethodDto>>> GetMethods()
    {
        var isDemo = _paymentService.IsDemoMode;
        var methods = new[]
        {
            new PaymentMethodDto("COD", "Cash on Delivery", true, "Pay when you receive your order"),
            new PaymentMethodDto(
                "Card",
                isDemo ? "Razorpay Demo (Test Payment)" : "Online Payment (Card/UPI/NetBanking)",
                true,
                isDemo
                    ? "Simulated Razorpay checkout — no real money is charged."
                    : "Secure payment via Razorpay"),
            new PaymentMethodDto("Wallet", "Wallet", false, "Coming soon")
        };
        return Ok(ApiResponse<IEnumerable<PaymentMethodDto>>.SuccessResponse(methods));
    }

    /// <summary>
    /// Create a Razorpay order for online payment
    /// </summary>
    [Authorize]
    [HttpPost("create-order")]
    public async Task<ActionResult<ApiResponse<RazorpayOrderResponse>>> CreateOrder([FromBody] CreatePaymentOrderRequest request)
    {
        if (request.OrderId == Guid.Empty)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("Order ID is required."));
        }

        if (request.Amount <= 0)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("Amount must be greater than 0."));
        }

        try
        {
            var result = await _paymentService.CreatePaymentOrderAsync(request.OrderId, request.Amount, request.Currency ?? "INR");
            
            var response = new RazorpayOrderResponse(
                result.RazorpayOrderId,
                result.Amount,
                result.Currency,
                result.Status,
                result.IsDemoMode,
                _paymentService.IsDemoMode ? null : _configuration["Razorpay:KeyId"]
            );
            
            return Ok(ApiResponse<RazorpayOrderResponse>.SuccessResponse(response, "Payment order created successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating payment order for Order {OrderId}", request.OrderId);
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Failed to create payment order"));
        }
    }

    /// <summary>
    /// Complete a dummy Razorpay payment (demo mode — no live keys required).
    /// </summary>
    [Authorize]
    [HttpPost("demo/complete")]
    public async Task<ActionResult<ApiResponse<DemoPaymentResponse>>> CompleteDemoPayment(
        [FromBody] CompleteDemoPaymentRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.RazorpayOrderId))
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("Razorpay order ID is required."));
        }

        try
        {
            var result = await _paymentService.CompleteDemoPaymentAsync(request.RazorpayOrderId);

            if (!result.Success)
            {
                return BadRequest(ApiResponse<DemoPaymentResponse>.ErrorResponse(
                    result.Message ?? "Demo payment failed"));
            }

            return Ok(ApiResponse<DemoPaymentResponse>.SuccessResponse(
                new DemoPaymentResponse(
                    true,
                    request.RazorpayOrderId,
                    result.RazorpayPaymentId ?? "",
                    result.RazorpaySignature ?? "",
                    result.Message ?? "Demo payment completed"),
                "Demo payment completed"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error completing demo payment for {RazorpayOrderId}", request.RazorpayOrderId);
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Failed to complete demo payment"));
        }
    }

    /// <summary>
    /// Verify payment signature from frontend (after Razorpay checkout)
    /// </summary>
    [Authorize]
    [HttpPost("verify")]
    public async Task<ActionResult<ApiResponse<PaymentVerificationResult>>> VerifyPayment([FromBody] VerifyPaymentRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.RazorpayOrderId) || 
            string.IsNullOrWhiteSpace(request.RazorpayPaymentId) ||
            string.IsNullOrWhiteSpace(request.RazorpaySignature))
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("Missing required payment verification parameters."));
        }

        try
        {
            var isValid = await _paymentService.VerifyPaymentSignatureAsync(
                request.RazorpayOrderId,
                request.RazorpayPaymentId,
                request.RazorpaySignature
            );

            if (isValid)
            {
                return Ok(ApiResponse<PaymentVerificationResult>.SuccessResponse(
                    new PaymentVerificationResult(true, "Payment verified successfully"),
                    "Payment verified"
                ));
            }
            else
            {
                return BadRequest(ApiResponse<PaymentVerificationResult>.SuccessResponse(
                    new PaymentVerificationResult(false, "Signature verification failed"),
                    "Verification failed"
                ));
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying payment signature");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Payment verification failed"));
        }
    }

    /// <summary>
    /// Handle Razorpay webhook - NOTE: This should be configured as webhook URL in Razorpay dashboard
    /// It's intentionally without [Authorize] as Razorpay uses signature verification
    /// </summary>
    [HttpPost("webhook")]
    public async Task<ActionResult> HandleWebhook()
    {
        try
        {
            // Read raw body for signature verification
            using var reader = new StreamReader(Request.Body);
            var payload = await reader.ReadToEndAsync();
            var signature = Request.Headers["X-Razorpay-Signature"].FirstOrDefault() ?? "";

            var result = await _paymentService.HandleWebhookEventAsync(payload, signature);

            if (result.Success)
            {
                _logger.LogInformation("Webhook processed successfully: {Event}", result.Event);
                return Ok();
            }
            else
            {
                _logger.LogWarning("Webhook processing failed: {Error}", result.Error);
                return BadRequest(new { error = result.Error });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing webhook");
            return StatusCode(500, new { error = "Webhook processing failed" });
        }
    }

    /// <summary>
    /// Get payment status for an order
    /// </summary>
    [Authorize]
    [HttpGet("status/{orderId}")]
    public async Task<ActionResult<ApiResponse<PaymentStatusDto>>> GetPaymentStatus(Guid orderId)
    {
        try
        {
            var result = await _paymentService.GetPaymentStatusAsync(orderId);
            
            var statusDto = new PaymentStatusDto(
                result.Status,
                result.RazorpayPaymentId ?? "",
                result.RazorpayOrderId ?? "",
                result.Amount ?? 0,
                result.PaidAt
            );

            return Ok(ApiResponse<PaymentStatusDto>.SuccessResponse(statusDto));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting payment status for Order {OrderId}", orderId);
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Failed to get payment status"));
        }
    }

    /// <summary>
    /// Process refund for an order (Admin only)
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpPost("refund/{orderId}")]
    public async Task<ActionResult<ApiResponse<RefundResultDto>>> ProcessRefund(Guid orderId, [FromBody] RefundRequest? request = null)
    {
        try
        {
            var result = await _paymentService.ProcessRefundAsync(
                orderId, 
                request?.Amount, 
                request?.Reason
            );

            if (result.Success)
            {
                return Ok(ApiResponse<RefundResultDto>.SuccessResponse(
                    new RefundResultDto(true, result.RefundId ?? "", result.RefundAmount ?? 0, result.Status ?? "", result.Error),
                    "Refund processed successfully"
                ));
            }
            else
            {
                return BadRequest(ApiResponse<RefundResultDto>.SuccessResponse(
                    new RefundResultDto(false, "", 0, "", result.Error),
                    result.Error ?? "Refund failed"
                ));
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing refund for Order {OrderId}", orderId);
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Failed to process refund"));
        }
    }

    /// <summary>
    /// Capture payment (for authorized payments that need capture)
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpPost("capture")]
    public async Task<ActionResult<ApiResponse<CaptureResultDto>>> CapturePayment([FromBody] CapturePaymentRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.RazorpayPaymentId))
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("Payment ID is required."));
        }

        try
        {
            var success = await _paymentService.CapturePaymentAsync(request.RazorpayPaymentId, request.Amount);

            return Ok(ApiResponse<CaptureResultDto>.SuccessResponse(
                new CaptureResultDto(success, success ? "Payment captured successfully" : "Payment capture failed"),
                success ? "Captured" : "Capture failed"
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error capturing payment {PaymentId}", request.RazorpayPaymentId);
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Failed to capture payment"));
        }
    }
}

// ============================================================
// REQUEST/RESPONSE DTOs
// ============================================================

public record PaymentMethodDto(
    string Id,
    string Title,
    bool Enabled,
    string? Description = null
);

public record CreatePaymentOrderRequest(
    Guid OrderId,
    decimal Amount,
    string? Currency = "INR"
);

public record RazorpayOrderResponse(
    string RazorpayOrderId,
    decimal Amount,
    string Currency,
    string Status,
    bool IsDemoMode = false,
    string? RazorpayKeyId = null
);

public record CompleteDemoPaymentRequest(string RazorpayOrderId);

public record DemoPaymentResponse(
    bool Success,
    string RazorpayOrderId,
    string RazorpayPaymentId,
    string RazorpaySignature,
    string Message
);

public record VerifyPaymentRequest(
    string RazorpayOrderId,
    string RazorpayPaymentId,
    string RazorpaySignature
);

public record PaymentVerificationResult(
    bool Success,
    string Message
);

public record PaymentStatusDto(
    string Status,
    string? RazorpayPaymentId,
    string? RazorpayOrderId,
    decimal? Amount,
    DateTime? PaidAt
);

public record RefundRequest(
    decimal? Amount,
    string? Reason
);

public record RefundResultDto(
    bool Success,
    string RefundId,
    decimal RefundAmount,
    string Status,
    string? Error
);

public record CapturePaymentRequest(
    string RazorpayPaymentId,
    decimal Amount
);

public record CaptureResultDto(
    bool Success,
    string Message
);