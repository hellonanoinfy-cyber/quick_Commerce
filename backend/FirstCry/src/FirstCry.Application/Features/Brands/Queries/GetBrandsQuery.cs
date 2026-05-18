using FirstCry.Application.Common.Interfaces;
using FirstCry.Application.DTOs.Catalog;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FirstCry.Application.Features.Brands.Queries;

public record GetBrandsQuery() : IRequest<IEnumerable<BrandDto>>;

public class GetBrandsQueryHandler : IRequestHandler<GetBrandsQuery, IEnumerable<BrandDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetBrandsQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<BrandDto>> Handle(GetBrandsQuery request, CancellationToken cancellationToken)
    {
        var brands = await _unitOfWork.Brands.GetQueryable()
            .Where(b => b.IsActive)
            .Select(b => new BrandDto
            {
                Id = b.Id,
                Name = b.Name,
                Slug = b.Slug,
                LogoUrl = b.LogoUrl
            })
            .ToListAsync(cancellationToken);

        return brands;
    }
}
