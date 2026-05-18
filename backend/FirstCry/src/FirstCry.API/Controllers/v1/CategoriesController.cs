using FirstCry.Application.DTOs;
using FirstCry.Application.DTOs.Catalog;
using FirstCry.Application.Features.Categories.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace FirstCry.API.Controllers.v1;

[ApiController]
[Route("api/v1/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly IMediator _mediator;

    public CategoriesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<CategoryDto>>>> GetCategories()
    {
        var result = await _mediator.Send(new GetCategoriesQuery());
        return Ok(ApiResponse<IEnumerable<CategoryDto>>.SuccessResponse(result));
    }

    [HttpGet("featured")]
    public async Task<ActionResult<ApiResponse<IEnumerable<CategoryDto>>>> GetFeaturedCategories()
    {
        // Currently using the same query but could be specialized later
        var result = await _mediator.Send(new GetCategoriesQuery());
        return Ok(ApiResponse<IEnumerable<CategoryDto>>.SuccessResponse(result.Take(6)));
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> GetCategoryBySlug(string slug)
    {
        var result = await _mediator.Send(new GetCategoryBySlugQuery(slug));
        if (result == null) return NotFound(ApiResponse<object>.ErrorResponse("Category not found"));
        return Ok(ApiResponse<CategoryDto>.SuccessResponse(result));
    }
}
