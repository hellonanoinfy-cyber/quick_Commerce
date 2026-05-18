namespace FirstCry.Infrastructure.Services.Shipping;

using FirstCry.Application.Common.Interfaces;
using FirstCry.Domain.Entities.Shipping;
using FirstCry.Infrastructure.Data.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

public class ShippingService : IShippingService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ShippingService> _logger;
    private readonly IConfiguration _configuration;

    public ShippingService(
        ApplicationDbContext context,
        ILogger<ShippingService> logger,
        IConfiguration configuration)
    {
        _context = context;
        _logger = logger;
        _configuration = configuration;
    }

    public async Task<ShipmentDto?> GetByIdAsync(Guid shipmentId)
    {
        var shipment = await _context.Shipments
            .Include(s => s.Order)
            .Include(s => s.Warehouse)
            .Include(s => s.TrackingEvents)
            .FirstOrDefaultAsync(s => s.Id == shipmentId);

        return shipment == null ? null : MapToDto(shipment);
    }

    public async Task<IEnumerable<ShipmentDto>> GetByOrderIdAsync(Guid orderId)
    {
        var shipments = await _context.Shipments
            .Include(s => s.Order)
            .Include(s => s.Warehouse)
            .Include(s => s.TrackingEvents)
            .Where(s => s.OrderId == orderId)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

        return shipments.Select(MapToDto);
    }

    public async Task<ShipmentDto?> TrackShipmentAsync(string awbNumber)
    {
        var shipment = await _context.Shipments
            .Include(s => s.Order)
            .Include(s => s.Warehouse)
            .Include(s => s.TrackingEvents)
            .FirstOrDefaultAsync(s => s.AwbNumber == awbNumber);

        return shipment == null ? null : MapToDto(shipment);
    }

    public async Task<IEnumerable<ShipmentDto>> GetPendingShipmentsAsync(int page = 1, int pageSize = 20)
    {
        var shipments = await _context.Shipments
            .Include(s => s.Order)
            .Include(s => s.Warehouse)
            .Where(s => s.Status != ShipmentStatus.Delivered &&
                        s.Status != ShipmentStatus.Returned &&
                        s.Status != ShipmentStatus.Cancelled)
            .OrderBy(s => s.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return shipments.Select(MapToDto);
    }

    public async Task<ShipmentDto> CreateShipmentAsync(CreateShipmentRequest request)
    {
        // Generate AWB (mock for now, integrate with Shiprocket/Delhivery)
        var awbNumber = GenerateAwbNumber(request.CourierPartner);

        var shipment = Shipment.Create(
            request.OrderId,
            awbNumber,
            request.CourierPartner,
            request.WarehouseId);

        if (request.WeightKg.HasValue)
        {
            shipment.SetDimensions(
                request.WeightKg.Value,
                request.LengthCm,
                request.WidthCm,
                request.HeightCm);
        }

        _context.Shipments.Add(shipment);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created shipment {AwbNumber} for order {OrderId}", awbNumber, request.OrderId);

        return MapToDto(shipment);
    }

    public async Task<bool> UpdateShipmentStatusAsync(Guid shipmentId, string status, string? reason = null)
    {
        var shipment = await _context.Shipments.FindAsync(shipmentId);
        if (shipment == null) return false;

        if (Enum.TryParse<ShipmentStatus>(status, true, out var shipmentStatus))
        {
            shipment.UpdateStatus(shipmentStatus, reason);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Updated shipment {AwbNumber} to status {Status}", shipment.AwbNumber, status);
            return true;
        }

        return false;
    }

    public Task<AwbGenerationResult> GenerateAwbAsync(GenerateAwbRequest request)
    {
        try
        {
            // TODO: Integrate with actual shipping partner (Shiprocket/Delhivery)
            // For now, return mock AWB
            var mockAwbNumber = $"MOCK{DateTime.UtcNow:yyyyMMddHHmmss}";

            _logger.LogInformation("Generated mock AWB {AwbNumber} for order {OrderId}",
                mockAwbNumber, request.OrderId);

            return Task.FromResult(new AwbGenerationResult
            {
                Success = true,
                AwbNumber = mockAwbNumber,
                LabelUrl = $"/api/v1/shipping/labels/{mockAwbNumber}",
                TrackingUrl = $"https://track.shiprocket.in/{mockAwbNumber}"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate AWB for order {OrderId}", request.OrderId);
            return Task.FromResult(new AwbGenerationResult
            {
                Success = false,
                Error = ex.Message
            });
        }
    }

    public async Task<string> GetLabelUrlAsync(string awbNumber)
    {
        var shipment = await _context.Shipments
            .FirstOrDefaultAsync(s => s.AwbNumber == awbNumber);

        return shipment?.LabelUrl ?? $"/api/v1/shipping/labels/{awbNumber}";
    }

    public Task<string> GetInvoiceUrlAsync(string awbNumber)
    {
        return Task.FromResult($"/api/v1/shipping/invoices/{awbNumber}");
    }

    public Task<bool> ProcessTrackingWebhookAsync(string courier, string payload)
    {
        try
        {
            // Parse webhook payload based on courier
            // This would be implemented based on the courier's webhook format

            _logger.LogInformation("Processing {Courier} webhook: {Payload}", courier, payload);
            return Task.FromResult(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to process {Courier} webhook", courier);
            return Task.FromResult(false);
        }
    }

    private string GenerateAwbNumber(string courierPartner)
    {
        var prefix = courierPartner.ToUpperInvariant() switch
        {
            "SHIPROCKET" => "SR",
            "DELHIVERY" => "DL",
            _ => "FC"
        };

        return $"{prefix}{DateTime.UtcNow:yyyyMMddHHmmss}{new Random().Next(1000, 9999)}";
    }

    private ShipmentDto MapToDto(Shipment shipment)
    {
        return new ShipmentDto
        {
            Id = shipment.Id,
            OrderId = shipment.OrderId,
            OrderNumber = shipment.Order?.OrderNumber ?? "",
            AwbNumber = shipment.AwbNumber,
            CourierPartner = shipment.CourierPartner,
            Status = shipment.Status.ToString(),
            StatusReason = shipment.StatusReason,
            WarehouseId = shipment.WarehouseId,
            WarehouseName = shipment.Warehouse?.Name,
            TrackingUrl = shipment.TrackingUrl,
            ShippedAt = shipment.ShippedAt,
            DeliveredAt = shipment.DeliveredAt,
            EstimatedDeliveryDate = shipment.EstimatedDeliveryDate,
            WeightKg = shipment.WeightKg,
            LengthCm = shipment.LengthCm,
            WidthCm = shipment.WidthCm,
            HeightCm = shipment.HeightCm,
            LabelUrl = shipment.LabelUrl,
            InvoiceUrl = shipment.InvoiceUrl,
            IsReturn = shipment.IsReturn,
            TrackingEvents = shipment.TrackingEvents
                .OrderByDescending(e => e.EventTime)
                .Select(e => new ShipmentTrackingEventDto
                {
                    Id = e.Id,
                    Status = e.Status,
                    Location = e.Location,
                    Description = e.Description,
                    EventTime = e.EventTime
                }).ToList()
        };
    }
}