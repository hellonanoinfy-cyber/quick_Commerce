namespace FirstCry.API.Controllers.v1;

using Asp.Versioning;
using FirstCry.Application.Common.Interfaces;
using FirstCry.Application.DTOs;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/delivery")]
public class DeliveryController : ControllerBase
{
    private readonly IDeliveryService _deliveryService;

    public DeliveryController(IDeliveryService deliveryService)
    {
        _deliveryService = deliveryService;
    }

    /// <summary>
    /// Check delivery serviceability and ETA for a pincode.
    /// </summary>
    [HttpGet("check")]
    public async Task<ActionResult<ApiResponse<object>>> Check([FromQuery] string pincode)
    {
        if (string.IsNullOrWhiteSpace(pincode))
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("Pincode is required."));
        }

        var result = await _deliveryService.CheckPincodeAsync(pincode);

        return Ok(ApiResponse<object>.SuccessResponse(new
        {
            result.IsServiceable,
            result.Label,
            result.IsExpress,
            result.EstimatedMinutes,
            result.DeliveryDaysMin,
            result.DeliveryDaysMax,
            result.ZoneName,
        }));
    }
}
