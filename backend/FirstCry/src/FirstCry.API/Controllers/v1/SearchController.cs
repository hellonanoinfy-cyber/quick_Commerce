using FirstCry.Application.DTOs;
using FirstCry.Application.DTOs.Catalog;
using FirstCry.Application.Common.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FirstCry.API.Controllers.v1;

public record SearchResultDto(
    List<ProductListDto> Products,
    List<CategoryDto> Categories,
    List<BrandDto> Brands
);

[ApiController]
[Route("api/v1/[controller]")]
public class SearchController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public SearchController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<SearchResultDto>>> Search([FromQuery] string q, [FromQuery] int limit = 10)
    {
        if (string.IsNullOrWhiteSpace(q)) return BadRequest(ApiResponse<object>.ErrorResponse("Query is required"));

        try 
        {
            var normalizedQuery = q.Trim().ToLower();
            var safeLimit = Math.Clamp(limit, 1, 10);

            // 1. Search Products with Ranking
            var products = await _unitOfWork.Products.GetQueryable()
                .AsNoTracking()
                .Where(p => p.IsActive && (
                    EF.Functions.Like(p.Name, $"%{normalizedQuery}%") || 
                    EF.Functions.Like(p.Description, $"%{normalizedQuery}%") ||
                    p.Tags.Any(t => EF.Functions.Like(t.TagName, $"%{normalizedQuery}%"))
                ))
                .OrderByDescending(p => p.Name.ToLower() == normalizedQuery)
                .ThenByDescending(p => p.Name.ToLower().Contains(normalizedQuery))
                .Take(safeLimit)
                .Select(p => new ProductListDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Slug = p.Slug,
                    Price = p.Price,
                    DiscountPrice = p.DiscountPrice,
                    BrandName = p.Brand.Name,
                    PrimaryImageUrl = p.Images.Where(i => i.IsPrimary).Select(i => i.Url).FirstOrDefault()
                })
                .ToListAsync();

            // 2. Search Categories
            var categories = await _unitOfWork.Categories.GetQueryable()
                .AsNoTracking()
                .Where(c => c.IsActive && EF.Functions.Like(c.Name, $"%{q}%"))
                .Take(3)
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Slug = c.Slug,
                    ImageUrl = c.ImageUrl
                })
                .ToListAsync();

            // 3. Search Brands
            var brands = await _unitOfWork.Brands.GetQueryable()
                .AsNoTracking()
                .Where(b => b.IsActive && EF.Functions.Like(b.Name, $"%{q}%"))
                .Take(2)
                .Select(b => new BrandDto
                {
                    Id = b.Id,
                    Name = b.Name,
                    Slug = b.Slug,
                    LogoUrl = b.LogoUrl
                })
                .ToListAsync();

            var result = new SearchResultDto(products, categories, brands);
            return Ok(ApiResponse<SearchResultDto>.SuccessResponse(result));
        }
        catch (Exception ex)
        {
            // Log and return empty result set to maintain "degraded" functionality
            Console.WriteLine($"DB Error in Search: {ex.Message}");
            var emptyResult = new SearchResultDto(new List<ProductListDto>(), new List<CategoryDto>(), new List<BrandDto>());
            return Ok(ApiResponse<SearchResultDto>.SuccessResponse(emptyResult));
        }
    }
}
