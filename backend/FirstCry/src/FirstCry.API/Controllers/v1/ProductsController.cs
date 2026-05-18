using FirstCry.Application.DTOs.Catalog;
using FirstCry.Application.Features.Products.Commands;
using FirstCry.Application.Features.Products.Queries;
using FirstCry.Application.DTOs;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FirstCry.API.Controllers.v1;

[ApiController]
[Route("api/v1/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProductsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedListDto<ProductListDto>>>> GetProducts([FromQuery] GetProductsQuery query)
    {
        var result = await _mediator.Send(query);
        return Ok(ApiResponse<PagedListDto<ProductListDto>>.SuccessResponse(result));
    }

    [HttpGet("featured")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ProductListDto>>>> GetFeaturedProducts([FromQuery] int count = 10)
    {
        var safeCount = Math.Clamp(count, 1, 12);
        var result = await _mediator.Send(new GetFeaturedProductsQuery(safeCount));
        return Ok(ApiResponse<IEnumerable<ProductListDto>>.SuccessResponse(result));
    }

    [HttpGet("trending")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ProductListDto>>>> GetTrendingProducts([FromQuery] int count = 12)
    {
        var safeCount = Math.Clamp(count, 1, 12);
        var result = await _mediator.Send(new GetTrendingProductsQuery(safeCount));
        return Ok(ApiResponse<IEnumerable<ProductListDto>>.SuccessResponse(result));
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<ApiResponse<ProductDetailDto>>> GetProductBySlug(string slug)
    {
        var result = await _mediator.Send(new GetProductBySlugQuery(slug));
        if (result == null) return NotFound(ApiResponse<object>.ErrorResponse("Product not found"));
        return Ok(ApiResponse<ProductDetailDto>.SuccessResponse(result));
    }

    [HttpGet("{slug}/related")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ProductListDto>>>> GetRelatedProducts(string slug, [FromQuery] int count = 8)
    {
        var safeCount = Math.Clamp(count, 1, 12);
        var result = await _mediator.Send(new GetRelatedProductsQuery(slug, safeCount));
        return Ok(ApiResponse<IEnumerable<ProductListDto>>.SuccessResponse(result));
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<Guid>>> CreateProduct(CreateProductCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(ApiResponse<Guid>.SuccessResponse(result, "Product created successfully"));
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPut("{id}/stock")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateStock(Guid id, [FromBody] int newStock)
    {
        await _mediator.Send(new UpdateProductStockCommand(id, newStock));
        return Ok(ApiResponse<object>.SuccessResponse(null, "Stock updated successfully"));
    }
    
}
