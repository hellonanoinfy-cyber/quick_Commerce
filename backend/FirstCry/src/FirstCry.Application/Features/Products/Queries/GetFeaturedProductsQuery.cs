using FirstCry.Application.DTOs.Catalog;
using MediatR;

namespace FirstCry.Application.Features.Products.Queries;

public record GetFeaturedProductsQuery(int Count) : IRequest<IEnumerable<ProductListDto>>;
