namespace FirstCry.Infrastructure.Services.Payments;

using System.Security.Cryptography;
using System.Text;
using FirstCry.Application.Common.Interfaces;
using FirstCry.Domain.Entities.Orders;
using FirstCry.Domain.Entities.Payments;
using FirstCry.Infrastructure.Data.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

public class RazorpayService : IPaymentService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<RazorpayService> _logger;
    private readonly IConfiguration _configuration;
    
    private string? _keyId;
    private string? _keySecret;
    private string? _webhookSecret;
    private bool _isConfigured;

    public bool IsDemoMode => !_isConfigured;
    
    public RazorpayService(
        ApplicationDbContext context,
        ILogger<RazorpayService> logger,
        IConfiguration configuration)
    {
        _context = context;
        _logger = logger;
        _configuration = configuration;
        
        _keyId = _configuration["Razorpay:KeyId"];
        _keySecret = _configuration["Razorpay:KeySecret"];
        _webhookSecret = _configuration["Razorpay:WebhookSecret"];
        _isConfigured = !string.IsNullOrWhiteSpace(_keyId) && !string.IsNullOrWhiteSpace(_keySecret);
        
        if (!_isConfigured)
        {
            _logger.LogWarning("Razorpay is not configured. Payment operations will use mock mode.");
        }
    }

    public async Task<PaymentOrderResult> CreatePaymentOrderAsync(Guid orderId, decimal amount, string currency = "INR")
    {
        try
        {
            if (!_isConfigured)
            {
                var mockOrderId = $"order_mock_{Guid.NewGuid():N}";
                _logger.LogInformation("Mock Razorpay order created for Order {OrderId}: {RazorpayOrderId}", orderId, mockOrderId);
                
                var payment = Payment.CreateForOrder(orderId, mockOrderId, amount, currency);
                _context.Payments.Add(payment);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("");
                _logger.LogInformation("═══════════════════════════════════════════════════════════════");
                _logger.LogInformation("              💳 DEMO RAZORPAY ORDER CREATED 💳");
                _logger.LogInformation("═══════════════════════════════════════════════════════════════");
                _logger.LogInformation("  Order ID:          {OrderId}", orderId);
                _logger.LogInformation("  Razorpay Order ID: {RazorpayOrderId}", mockOrderId);
                _logger.LogInformation("  Amount:            {Amount} {Currency}", amount, currency);
                _logger.LogInformation("  → Complete payment from the checkout UI (demo modal).");
                _logger.LogInformation("═══════════════════════════════════════════════════════════════");
                _logger.LogInformation("");

                return new PaymentOrderResult(mockOrderId, amount, currency, "created", IsDemoMode: true);
            }
            
            using var httpClient = new HttpClient();
            var credentials = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{_keyId}:{_keySecret}"));
            httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", credentials);
            
            var requestBody = new
            {
                amount = (long)(amount * 100),
                currency = currency,
                receipt = $"rcpt_{orderId:N}",
                notes = new { order_id = orderId.ToString(), platform = "FirstCry" }
            };
            
            var content = new StringContent(JsonConvert.SerializeObject(requestBody), Encoding.UTF8, "application/json");
            var response = await httpClient.PostAsync("https://api.razorpay.com/v1/orders", content);
            var responseContent = await response.Content.ReadAsStringAsync();
            
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Razorpay order creation failed: {Response}", responseContent);
                throw new Exception($"Razorpay API error: {responseContent}");
            }
            
            var result = JObject.Parse(responseContent);
            var razorpayOrderId = result["id"]?.ToString() ?? throw new Exception("No order ID returned");
            
            var newPayment = Payment.CreateForOrder(orderId, razorpayOrderId, amount, currency);
            _context.Payments.Add(newPayment);
            await _context.SaveChangesAsync();
            
            return new PaymentOrderResult(
                razorpayOrderId,
                amount,
                currency,
                result["status"]?.ToString() ?? "created",
                IsDemoMode: false);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create Razorpay order for Order {OrderId}", orderId);
            throw;
        }
    }

    public async Task<DemoPaymentResult> CompleteDemoPaymentAsync(string razorpayOrderId)
    {
        if (string.IsNullOrWhiteSpace(razorpayOrderId))
        {
            return new DemoPaymentResult(false, null, null, "Razorpay order ID is required.");
        }

        if (_isConfigured && !razorpayOrderId.StartsWith("order_mock_", StringComparison.OrdinalIgnoreCase))
        {
            return new DemoPaymentResult(false, null, null, "Demo payments are only available without live Razorpay keys.");
        }

        var payment = await _context.Payments
            .FirstOrDefaultAsync(p => p.RazorpayOrderId == razorpayOrderId);

        if (payment == null)
        {
            return new DemoPaymentResult(false, null, null, "Payment order not found.");
        }

        if (payment.Status == Domain.Entities.Payments.PaymentStatus.Completed)
        {
            return new DemoPaymentResult(true, payment.RazorpayPaymentId, payment.Signature, "Payment already completed.");
        }

        var mockPaymentId = $"pay_demo_{Guid.NewGuid():N}";
        var mockSignature = ComputeDemoSignature(razorpayOrderId, mockPaymentId);

        payment.MarkAsPaid(mockPaymentId, mockSignature);
        payment.AddTransaction("demo_completed", $"Demo Razorpay payment {mockPaymentId}");

        var order = await _context.Orders.FindAsync(payment.OrderId);
        if (order != null)
        {
            order.MarkPaymentComplete();
            if (order.Status == OrderStatus.Pending)
            {
                order.UpdateStatus(OrderStatus.Confirmed, "Demo Razorpay payment received.");
            }
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("");
        _logger.LogInformation("═══════════════════════════════════════════════════════════════");
        _logger.LogInformation("           ✅ DEMO RAZORPAY PAYMENT SUCCESSFUL ✅");
        _logger.LogInformation("═══════════════════════════════════════════════════════════════");
        _logger.LogInformation("  Razorpay Order ID:   {RazorpayOrderId}", razorpayOrderId);
        _logger.LogInformation("  Razorpay Payment ID: {PaymentId}", mockPaymentId);
        _logger.LogInformation("  FirstCry Order ID:   {OrderId}", payment.OrderId);
        _logger.LogInformation("  Amount:              {Amount} {Currency}", payment.Amount, payment.Currency);
        _logger.LogInformation("═══════════════════════════════════════════════════════════════");
        _logger.LogInformation("");

        return new DemoPaymentResult(true, mockPaymentId, mockSignature, "Demo payment completed successfully.");
    }

    public async Task<bool> VerifyPaymentSignatureAsync(string razorpayOrderId, string razorpayPaymentId, string razorpaySignature)
    {
        if (!_isConfigured)
        {
            var demo = await CompleteDemoPaymentAsync(razorpayOrderId);
            return demo.Success;
        }

        if (string.IsNullOrWhiteSpace(_keySecret)) return false;
        
        try
        {
            var payload = $"{razorpayOrderId}|{razorpayPaymentId}";
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_keySecret));
            var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
            var expectedSignature = BitConverter.ToString(hash).Replace("-", "").ToLowerInvariant();
            
            var isValid = expectedSignature == razorpaySignature;
            
            if (isValid)
            {
                var paymentEntity = await _context.Payments
                    .FirstOrDefaultAsync(p => p.RazorpayOrderId == razorpayOrderId);
                    
                if (paymentEntity != null)
                {
                    paymentEntity.MarkAsPaid(razorpayPaymentId, razorpaySignature);
                    paymentEntity.AddTransaction("verified", $"Payment {razorpayPaymentId} verified");
                    await _context.SaveChangesAsync();
                }
            }
            else
            {
                _logger.LogWarning("Signature verification failed for Razorpay order {RazorpayOrderId}", razorpayOrderId);
            }
            
            return isValid;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying payment signature");
            return false;
        }
    }

    public async Task<WebhookResult> HandleWebhookEventAsync(string payload, string signature)
    {
        try
        {
            if (!string.IsNullOrWhiteSpace(_webhookSecret) && !string.IsNullOrWhiteSpace(signature))
            {
                var expectedSignature = ComputeHmacSha256(payload, _webhookSecret);
                if (expectedSignature != signature)
                {
                    return new WebhookResult(false, "invalid_signature", null, null, "Invalid webhook signature");
                }
            }
            
            var webhookEvent = JObject.Parse(payload);
            var eventType = webhookEvent["event"]?.ToString() ?? "";
            var payloadData = webhookEvent["payload"];
            
            _logger.LogInformation("Processing Razorpay webhook event: {EventType}", eventType);
            
            switch (eventType)
            {
                case "payment.authorized":
                    return await HandlePaymentAuthorized(payloadData);
                case "payment.captured":
                    return await HandlePaymentCaptured(payloadData);
                case "payment.failed":
                    return await HandlePaymentFailed(payloadData);
                default:
                    return new WebhookResult(true, eventType, null, null, "Event handled (no action)");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing webhook");
            return new WebhookResult(false, "error", null, null, ex.Message);
        }
    }

    private async Task<WebhookResult> HandlePaymentAuthorized(JToken? payloadData)
    {
        try
        {
            var paymentData = payloadData?["payment"]?["entity"];
            var razorpayPaymentId = paymentData?["id"]?.ToString();
            var razorpayOrderId = paymentData?["order_id"]?.ToString();
            
            if (string.IsNullOrEmpty(razorpayPaymentId) || string.IsNullOrEmpty(razorpayOrderId))
            {
                return new WebhookResult(false, "payment.authorized", null, null, "Missing IDs");
            }
            
            var paymentEntity = await _context.Payments
                .FirstOrDefaultAsync(p => p.RazorpayOrderId == razorpayOrderId);
                
            if (paymentEntity != null)
            {
                paymentEntity.MarkAsPaid(razorpayPaymentId);
                paymentEntity.AddTransaction("webhook_authorized", $"Authorized: {razorpayPaymentId}");
                await _context.SaveChangesAsync();
            }
            
            return new WebhookResult(true, "payment.authorized", razorpayPaymentId, razorpayOrderId, null);
        }
        catch (Exception ex)
        {
            return new WebhookResult(false, "payment.authorized", null, null, ex.Message);
        }
    }

    private Task<WebhookResult> HandlePaymentCaptured(JToken? payloadData)
    {
        var paymentData = payloadData?["payment"]?["entity"];
        var razorpayPaymentId = paymentData?["id"]?.ToString();
        var razorpayOrderId = paymentData?["order_id"]?.ToString();
        
        _logger.LogInformation("Payment captured: {PaymentId}", razorpayPaymentId);
        
        return Task.FromResult(new WebhookResult(true, "payment.captured", razorpayPaymentId, razorpayOrderId, null));
    }

    private async Task<WebhookResult> HandlePaymentFailed(JToken? payloadData)
    {
        var paymentData = payloadData?["payment"]?["entity"];
        var razorpayPaymentId = paymentData?["id"]?.ToString();
        var razorpayOrderId = paymentData?["order_id"]?.ToString();
        var errorDescription = paymentData?["error_description"]?.ToString();
        var errorCode = paymentData?["error_code"]?.ToString();
        
        _logger.LogWarning("Payment failed: {PaymentId}, Error: {Error}", razorpayPaymentId, errorDescription);
        
        if (string.IsNullOrEmpty(razorpayOrderId)) 
            return new WebhookResult(false, "payment.failed", null, null, "Missing order ID");
        
        var paymentEntity = await _context.Payments.FirstOrDefaultAsync(p => p.RazorpayOrderId == razorpayOrderId);
        if (paymentEntity != null)
        {
            paymentEntity.MarkAsFailed(errorDescription, errorCode, errorDescription);
            paymentEntity.AddTransaction("failed", $"Failed: {errorDescription}");
            await _context.SaveChangesAsync();
        }
        
        return new WebhookResult(true, "payment.failed", razorpayPaymentId, razorpayOrderId, null);
    }

    public async Task<RefundResult> ProcessRefundAsync(Guid orderId, decimal? amount = null, string? reason = null)
    {
        try
        {
            if (!_isConfigured)
            {
                var mockRefundId = $"refund_mock_{Guid.NewGuid():N}";
                _logger.LogInformation("Mock refund for Order {OrderId}: {RefundId}", orderId, mockRefundId);
                return new RefundResult(true, mockRefundId, amount ?? 0, "processed", null);
            }
            
            var payment = await _context.Payments
                .FirstOrDefaultAsync(p => p.OrderId == orderId && p.Status == Domain.Entities.Payments.PaymentStatus.Completed);
                
            if (payment == null)
            {
                return new RefundResult(false, null, null, null, "Payment not found or not completed");
            }
            
            using var httpClient = new HttpClient();
            var credentials = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{_keyId}:{_keySecret}"));
            httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", credentials);
            
            var refundAmount = (long?)((amount ?? payment.Amount) * 100);
            var requestBody = new { amount = refundAmount, notes = new { order_id = orderId.ToString(), reason = reason ?? "Customer requested" } };
            
            var content = new StringContent(JsonConvert.SerializeObject(requestBody), Encoding.UTF8, "application/json");
            var response = await httpClient.PostAsync($"https://api.razorpay.com/v1/orders/{payment.RazorpayOrderId}/refund", content);
            var responseContent = await response.Content.ReadAsStringAsync();
            
            if (!response.IsSuccessStatusCode)
            {
                return new RefundResult(false, null, null, null, $"Refund API error: {responseContent}");
            }
            
            var result = JObject.Parse(responseContent);
            var refundId = result["id"]?.ToString() ?? "";
            var refundAmountActual = (result["amount"]?.Value<decimal>() ?? 0) / 100;
            
            if (amount.HasValue)
                payment.PartialRefund(amount.Value);
            else
                payment.MarkRefunded(refundId, refundAmountActual);
                
            payment.AddTransaction("refund_initiated", $"Refund {refundId} initiated");
            await _context.SaveChangesAsync();
            
            return new RefundResult(true, refundId, refundAmountActual, "processed", null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing refund for Order {OrderId}", orderId);
            return new RefundResult(false, null, null, null, ex.Message);
        }
    }

    public async Task<PaymentStatusResult> GetPaymentStatusAsync(Guid orderId)
    {
        var payment = await _context.Payments
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.OrderId == orderId);
            
        if (payment == null)
        {
            return new PaymentStatusResult("not_found", null, null, null, null);
        }
        
        return new PaymentStatusResult(
            payment.Status.ToString(),
            payment.RazorpayPaymentId,
            payment.RazorpayOrderId,
            payment.Amount,
            payment.UpdatedAt
        );
    }

    public async Task<bool> CapturePaymentAsync(string razorpayPaymentId, decimal amount)
    {
        try
        {
            if (!_isConfigured) return true;
            
            using var httpClient = new HttpClient();
            var credentials = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{_keyId}:{_keySecret}"));
            httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", credentials);
            
            var requestBody = new { amount = (long)(amount * 100), currency = "INR" };
            var content = new StringContent(JsonConvert.SerializeObject(requestBody), Encoding.UTF8, "application/json");
            var response = await httpClient.PostAsync($"https://api.razorpay.com/v1/payments/{razorpayPaymentId}/capture", content);
            
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error capturing payment {PaymentId}", razorpayPaymentId);
            return false;
        }
    }

    private static string ComputeHmacSha256(string data, string secret)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
        return BitConverter.ToString(hash).Replace("-", "").ToLowerInvariant();
    }

    private static string ComputeDemoSignature(string razorpayOrderId, string razorpayPaymentId)
    {
        var payload = $"{razorpayOrderId}|{razorpayPaymentId}|demo";
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes("firstcry_demo_razorpay_secret"));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
        return BitConverter.ToString(hash).Replace("-", "").ToLowerInvariant();
    }
}