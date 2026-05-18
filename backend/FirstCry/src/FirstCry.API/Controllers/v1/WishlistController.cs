using System.Security.Claims;
using FirstCry.Application.DTOs;
using FirstCry.Application.DTOs.Users;
using FirstCry.Application.Features.Wishlist.Commands;
using FirstCry.Application.Features.Wishlist.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FirstCry.API.Controllers.v1;

[Authorize]
[ApiController]
[Route("api/v1/wishlist")]
public class WishlistController : ControllerBase
{
    private readonly IMediator _mediator;

    public WishlistController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<WishlistItemDto>>>> GetWishlist()
    {
        var result = await _mediator.Send(new GetWishlistQuery(GetUserId()));
        return Ok(ApiResponse<List<WishlistItemDto>>.SuccessResponse(result));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<object>>> Add([FromBody] WishlistRequest request)
    {
        await _mediator.Send(new AddWishlistItemCommand(GetUserId(), request.ProductId));
        return Ok(ApiResponse<object>.SuccessResponse(null, "Item added to wishlist"));
    }

    [HttpPatch("{productId}")]
    public async Task<ActionResult<ApiResponse<object>>> Update(Guid productId, [FromBody] WishlistUpdateRequest request)
    {
        var result = await _mediator.Send(new UpdateWishlistItemCommand(GetUserId(), productId, request.Note));
        return result
            ? Ok(ApiResponse<object>.SuccessResponse(null, "Wishlist item updated"))
            : NotFound(ApiResponse<object>.ErrorResponse("Wishlist item not found"));
    }

    [HttpDelete("{productId}")]
    public async Task<ActionResult<ApiResponse<object>>> Remove(Guid productId)
    {
        var result = await _mediator.Send(new RemoveWishlistItemCommand(GetUserId(), productId));
        return result
            ? Ok(ApiResponse<object>.SuccessResponse(null, "Item removed from wishlist"))
            : NotFound(ApiResponse<object>.ErrorResponse("Wishlist item not found"));
    }

    private Guid GetUserId()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userIdString)) throw new UnauthorizedAccessException("Unauthorized");
        return Guid.Parse(userIdString);
    }
}

public record WishlistRequest(Guid ProductId);
public record WishlistUpdateRequest(string? Note);
