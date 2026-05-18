namespace FirstCry.Application.Common.Interfaces;

public interface IDeliveryService
{
    Task<DeliveryCheckResult> CheckPincodeAsync(string pincode, CancellationToken cancellationToken = default);
}

public record DeliveryCheckResult(
    bool IsServiceable,
    string Label,
    bool IsExpress,
    int? EstimatedMinutes,
    int DeliveryDaysMin,
    int DeliveryDaysMax,
    string? ZoneName);
