using FirstCry.Application.Common.Interfaces;
using FirstCry.Application.DTOs.Reviews;
using MediatR;
using Microsoft.EntityFrameworkCore;
using FirstCry.Domain.Entities;

namespace FirstCry.Application.Features.Reviews.Queries;

public record GetProductReviewsQuery(Guid ProductId) : IRequest<List<ProductReviewDto>>;

public class GetProductReviewsQueryHandler : IRequestHandler<GetProductReviewsQuery, List<ProductReviewDto>>
{
    private readonly IApplicationDbContext _context;

    public GetProductReviewsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProductReviewDto>> Handle(GetProductReviewsQuery request, CancellationToken cancellationToken)
    {
        return await _context.ProductReviews.AsNoTracking()
            .Where(r => r.ProductId == request.ProductId && r.Status == ReviewStatus.Approved)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ProductReviewDto
            {
                Id = r.Id,
                ProductId = r.ProductId,
                UserId = r.UserId,
                CustomerName = r.User.Name ?? "Customer",
                Rating = r.Rating,
                Title = r.Title,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }
}
