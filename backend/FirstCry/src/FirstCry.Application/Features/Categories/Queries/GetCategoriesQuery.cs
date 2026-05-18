using FirstCry.Application.Common.Interfaces;
using FirstCry.Application.DTOs.Catalog;
using FirstCry.Domain.Entities;
using MediatR;

namespace FirstCry.Application.Features.Categories.Queries;

public record GetCategoriesQuery() : IRequest<IEnumerable<CategoryDto>>;

public class GetCategoriesQueryHandler : IRequestHandler<GetCategoriesQuery, IEnumerable<CategoryDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetCategoriesQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<CategoryDto>> Handle(GetCategoriesQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var categories = await _unitOfWork.Categories.GetRootCategoriesAsync(cancellationToken);
            var result = categories.Select(MapCategory).ToList();
            return result;
        }
        catch (Exception ex)
        {
            // Log and return empty list to maintain "degraded" functionality
            Console.WriteLine($"DB Error in GetCategories: {ex.Message}");
            return Enumerable.Empty<CategoryDto>();
        }
    }

    private CategoryDto MapCategory(Category category)
    {
        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Slug = category.Slug,
            ImageUrl = category.ImageUrl,
            Children = (category.SubCategories ?? Enumerable.Empty<Category>()).Select(MapCategory).ToList()
        };
    }
}
