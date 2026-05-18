namespace FirstCry.API.Controllers.v1;

using Asp.Versioning;
using FirstCry.Application.Common.Interfaces;
using FirstCry.Application.DTOs;
using Microsoft.AspNetCore.Mvc;

/// <summary>
/// Reports which third-party integrations are configured vs demo mode.
/// Use this after deploy to see which API keys still need to be added.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/integrations")]
public class IntegrationsController : ControllerBase
{
    private readonly IIntegrationStatusService _integrationStatus;

    public IntegrationsController(IIntegrationStatusService integrationStatus)
    {
        _integrationStatus = integrationStatus;
    }

    [HttpGet]
    public ActionResult<ApiResponse<object>> Get()
    {
        var snapshot = _integrationStatus.GetStatus();

        var modules = new[]
        {
            snapshot.Msg91,
            snapshot.EmailOtp,
            snapshot.Razorpay,
            snapshot.Cloudinary,
            snapshot.Redis,
            snapshot.Meilisearch,
        };

        var pendingKeys = modules
            .SelectMany(m => m.MissingKeys)
            .Distinct()
            .OrderBy(k => k)
            .ToList();

        return Ok(ApiResponse<object>.SuccessResponse(new
        {
            ReadyForBeta = pendingKeys.Count == 0 || modules.All(m => m.Mode is "live" or "demo" or "fallback" or "configured" or "not_used"),
            PendingConfiguration = pendingKeys,
            Modules = modules.Select(m => new
            {
                m.Name,
                m.Mode,
                m.IsConfigured,
                m.Summary,
                m.MissingKeys,
            }),
        }));
    }
}
