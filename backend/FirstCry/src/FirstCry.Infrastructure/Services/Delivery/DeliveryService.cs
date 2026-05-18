namespace FirstCry.Infrastructure.Services.Delivery;

using FirstCry.Application.Common.Interfaces;
using FirstCry.Domain.Entities.Shipping;
using FirstCry.Infrastructure.Data.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

public class DeliveryService : IDeliveryService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<DeliveryService> _logger;

    public DeliveryService(ApplicationDbContext context, ILogger<DeliveryService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<DeliveryCheckResult> CheckPincodeAsync(
        string pincode,
        CancellationToken cancellationToken = default)
    {
        var normalized = new string(pincode.Where(char.IsDigit).ToArray());
        if (normalized.Length != 6)
        {
            return new DeliveryCheckResult(
                false,
                "Enter a valid 6-digit pincode",
                false,
                null,
                0,
                0,
                null);
        }

        var zones = await _context.Set<ShippingZone>()
            .AsNoTracking()
            .Where(z => z.IsActive)
            .OrderBy(z => z.DeliveryDaysMin)
            .ThenByDescending(z => z.PincodePrefixes.Length)
            .ToListAsync(cancellationToken);

        foreach (var zone in zones)
        {
            if (!zone.ContainsPincode(normalized))
            {
                continue;
            }

            var isExpress = zone.DeliveryDaysMin <= 0;
            var label = isExpress
                ? "60 min express"
                : zone.DeliveryDaysMin == zone.DeliveryDaysMax
                    ? $"Delivery in {zone.DeliveryDaysMin} day{(zone.DeliveryDaysMin == 1 ? "" : "s")}"
                    : $"Delivery in {zone.DeliveryDaysMin}–{zone.DeliveryDaysMax} days";

            return new DeliveryCheckResult(
                true,
                label,
                isExpress,
                isExpress ? 60 : null,
                zone.DeliveryDaysMin,
                zone.DeliveryDaysMax,
                zone.Name);
        }

        _logger.LogDebug("No shipping zone matched pincode {Pincode} — using default standard delivery.", normalized);

        return new DeliveryCheckResult(
            true,
            "Delivery in 3–5 days",
            false,
            null,
            3,
            5,
            "Standard");
    }
}
