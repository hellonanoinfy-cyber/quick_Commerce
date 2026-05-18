using System.Security.Claims;
using FirstCry.Application.DTOs;
using FirstCry.Application.DTOs.Users;
using FirstCry.Application.Features.Users.Commands;
using FirstCry.Application.Features.Users.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FirstCry.API.Controllers.v1;

[Authorize]
[ApiController]
[Route("api/v1/users")]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;

    public UsersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("addresses")]
    public async Task<ActionResult<ApiResponse<List<UserAddressDto>>>> GetAddresses()
    {
        var userId = GetUserId();
        var result = await _mediator.Send(new GetUserAddressesQuery(userId));
        return Ok(ApiResponse<List<UserAddressDto>>.SuccessResponse(result));
    }

    [HttpPost("addresses")]
    public async Task<ActionResult<ApiResponse<UserAddressDto>>> CreateAddress([FromBody] UserAddressRequest request)
    {
        var result = await _mediator.Send(ToCommand(GetUserId(), null, request));
        return Ok(ApiResponse<UserAddressDto>.SuccessResponse(result, "Address saved successfully"));
    }

    [HttpPut("addresses/{id}")]
    public async Task<ActionResult<ApiResponse<UserAddressDto>>> UpdateAddress(Guid id, [FromBody] UserAddressRequest request)
    {
        var result = await _mediator.Send(ToCommand(GetUserId(), id, request));
        return Ok(ApiResponse<UserAddressDto>.SuccessResponse(result, "Address updated successfully"));
    }

    [HttpDelete("addresses/{id}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteAddress(Guid id)
    {
        var result = await _mediator.Send(new DeleteUserAddressCommand(GetUserId(), id));
        return result
            ? Ok(ApiResponse<object>.SuccessResponse(null, "Address deleted successfully"))
            : NotFound(ApiResponse<object>.ErrorResponse("Address not found"));
    }

    private Guid GetUserId()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userIdString)) throw new UnauthorizedAccessException("Unauthorized");
        return Guid.Parse(userIdString);
    }

    private static UpsertUserAddressCommand ToCommand(Guid userId, Guid? addressId, UserAddressRequest request) =>
        new(
            userId,
            addressId,
            request.FullName,
            request.Phone,
            request.Address,
            request.Landmark,
            request.City,
            request.State,
            request.Pincode,
            request.Type,
            request.IsDefault
        );
}

public record UserAddressRequest(
    string FullName,
    string Phone,
    string Address,
    string? Landmark,
    string City,
    string State,
    string Pincode,
    string Type,
    bool IsDefault
);
