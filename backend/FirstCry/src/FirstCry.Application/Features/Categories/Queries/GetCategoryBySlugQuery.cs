using FirstCry.Application.Common.Interfaces;
using FirstCry.Application.DTOs.Catalog;
using MediatR;

namespace FirstCry.Application.Features.Categories.Queries;

public record GetCategoryBySlugQuery(string Slug) : IRequest<CategoryDto?>;

public class GetCategoryBySlugQueryHandler : IRequestHandler<GetCategoryBySlugQuery, CategoryDto?>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetCategoryBySlugQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<CategoryDto?> Handle(GetCategoryBySlugQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var category = await _unitOfWork.Categories.GetBySlugAsync(request.Slug, cancellationToken);
            if (category == null) return null;

            return MapCategory(category);
        }
        catch (Exception ex) when (ex.GetType().Name == "SqlException" || ex is InvalidOperationException)
        {
            Console.WriteLine($"DB Error in GetCategoryBySlug: {ex.Message}");
            return null;
        }
    }

    private CategoryDto MapCategory(FirstCry.Domain.Entities.Category category)
    {
        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Slug = category.Slug,
            ImageUrl = category.ImageUrl,
            Children = category.SubCategories?.Select(MapCategory).ToList() ?? new()
        };
    }
}
