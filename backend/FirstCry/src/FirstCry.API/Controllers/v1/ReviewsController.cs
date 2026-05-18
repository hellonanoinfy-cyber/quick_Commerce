using System.Security.Claims;
using FirstCry.Application.DTOs;
using FirstCry.Application.DTOs.Reviews;
using FirstCry.Application.Features.Reviews.Commands;
using FirstCry.Application.Features.Reviews.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FirstCry.API.Controllers.v1;

[ApiController]
[Route("api/v1/reviews")]
public class ReviewsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ReviewsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("product/{productId}")]
    public async Task<ActionResult<ApiResponse<List<ProductReviewDto>>>> GetProductReviews(Guid productId)
    {
        var result = await _mediator.Send(new GetProductReviewsQuery(productId));
        return Ok(ApiResponse<List<ProductReviewDto>>.SuccessResponse(result));
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<ProductReviewDto>>> Create([FromBody] ReviewRequest request)
    {
        var result = await _mediator.Send(new CreateReviewCommand(GetUserId(), request.ProductId, request.Rating, request.Title, request.Comment));
        return Ok(ApiResponse<ProductReviewDto>.SuccessResponse(result, "Review submitted successfully"));
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> Update(Guid id, [FromBody] ReviewUpdateRequest request)
    {
        var result = await _mediator.Send(new UpdateReviewCommand(GetUserId(), id, request.Rating, request.Title, request.Comment));
        return result
            ? Ok(ApiResponse<object>.SuccessResponse(null, "Review updated successfully"))
            : NotFound(ApiResponse<object>.ErrorResponse("Review not found"));
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
    {
        var result = await _mediator.Send(new DeleteReviewCommand(GetUserId(), id));
        return result
            ? Ok(ApiResponse<object>.SuccessResponse(null, "Review deleted successfully"))
            : NotFound(ApiResponse<object>.ErrorResponse("Review not found"));
    }

    private Guid GetUserId()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userIdString)) throw new UnauthorizedAccessException("Unauthorized");
        return Guid.Parse(userIdString);
    }
}

public record ReviewRequest(Guid ProductId, int Rating, string Title, string Comment);
public record ReviewUpdateRequest(int Rating, string Title, string Comment);
