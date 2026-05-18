namespace FirstCry.Application.Common.Interfaces;

public interface IIntegrationStatusService
{
    IntegrationStatusSnapshot GetStatus();
}

public record IntegrationStatusSnapshot(
    IntegrationModuleStatus Msg91,
    IntegrationModuleStatus EmailOtp,
    IntegrationModuleStatus Razorpay,
    IntegrationModuleStatus Cloudinary,
    IntegrationModuleStatus Redis,
    IntegrationModuleStatus Meilisearch);

public record IntegrationModuleStatus(
    string Name,
    string Mode,
    bool IsConfigured,
    string Summary,
    IReadOnlyList<string> MissingKeys);
