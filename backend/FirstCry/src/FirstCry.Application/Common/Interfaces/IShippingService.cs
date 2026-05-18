namespace FirstCry.Application.Common.Interfaces;

// ============================================================
// SHIPPING & SHIPMENT TRACKING SERVICE INTERFACE
// ============================================================

public interface IShippingService
{
    // Shipment queries
    Task<ShipmentDto?> GetByIdAsync(Guid shipmentId);
    Task<IEnumerable<ShipmentDto>> GetByOrderIdAsync(Guid orderId);
    Task<ShipmentDto?> TrackShipmentAsync(string awbNumber);
    Task<IEnumerable<ShipmentDto>> GetPendingShipmentsAsync(int page = 1, int pageSize = 20);

    // Shipment creation
    Task<ShipmentDto> CreateShipmentAsync(CreateShipmentRequest request);
    Task<bool> UpdateShipmentStatusAsync(Guid shipmentId, string status, string? reason = null);

    // AWB generation (external integration)
    Task<AwbGenerationResult> GenerateAwbAsync(GenerateAwbRequest request);

    // Label generation
    Task<string> GetLabelUrlAsync(string awbNumber);
    Task<string> GetInvoiceUrlAsync(string awbNumber);

    // Webhook processing
    Task<bool> ProcessTrackingWebhookAsync(string courier, string payload);
}

public class ShipmentDto
{
    public Guid Id { get; init; }
    public Guid? OrderId { get; init; }
    public string OrderNumber { get; init; } = string.Empty;

    public string AwbNumber { get; init; } = string.Empty;
    public string? CourierPartner { get; init; }

    public string Status { get; init; } = string.Empty;
    public string? StatusReason { get; init; }

    public Guid? WarehouseId { get; init; }
    public string? WarehouseName { get; init; }

    public string? TrackingUrl { get; init; }
    public DateTime? ShippedAt { get; init; }
    public DateTime? DeliveredAt { get; init; }
    public DateTime? EstimatedDeliveryDate { get; init; }

    public decimal? WeightKg { get; init; }
    public decimal? LengthCm { get; init; }
    public decimal? WidthCm { get; init; }
    public decimal? HeightCm { get; init; }

    public string? LabelUrl { get; init; }
    public string? InvoiceUrl { get; init; }

    public bool IsReturn { get; init; }
    public string? ReturnReason { get; init; }

    public List<ShipmentTrackingEventDto> TrackingEvents { get; init; } = new();
}

public class ShipmentTrackingEventDto
{
    public Guid Id { get; init; }
    public string Status { get; init; } = string.Empty;
    public string? Location { get; init; }
    public string? Description { get; init; }
    public DateTime EventTime { get; init; }
}

public record CreateShipmentRequest(
    Guid OrderId,
    List<Guid> OrderItemIds,
    string CourierPartner,
    Guid? WarehouseId = null,
    decimal? WeightKg = null,
    decimal? LengthCm = null,
    decimal? WidthCm = null,
    decimal? HeightCm = null
);

public record GenerateAwbRequest(
    Guid OrderId,
    string Courier,
    string SenderName,
    string SenderAddress,
    string SenderCity,
    string SenderPincode,
    string SenderPhone,
    string ReceiverName,
    string ReceiverAddress,
    string ReceiverCity,
    string ReceiverPincode,
    string ReceiverPhone,
    decimal Weight,
    decimal? Length = null,
    decimal? Width = null,
    decimal? Height = null,
    bool IsCod = false,
    decimal? CodAmount = null
);

public class AwbGenerationResult
{
    public bool Success { get; init; }
    public string? AwbNumber { get; init; }
    public string? LabelUrl { get; init; }
    public string? TrackingUrl { get; init; }
    public string? Error { get; init; }
}