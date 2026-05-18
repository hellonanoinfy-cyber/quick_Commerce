using FirstCry.Application.DTOs;
using FirstCry.Application.DTOs.Catalog;
using FirstCry.Application.Features.Brands.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace FirstCry.API.Controllers.v1;

[ApiController]
[Route("api/v1/[controller]")]
public class BrandsController : ControllerBase
{
    private readonly IMediator _mediator;

    public BrandsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<BrandDto>>>> GetBrands()
    {
        var result = await _mediator.Send(new GetBrandsQuery());
        return Ok(ApiResponse<IEnumerable<BrandDto>>.SuccessResponse(result));
    }
}
