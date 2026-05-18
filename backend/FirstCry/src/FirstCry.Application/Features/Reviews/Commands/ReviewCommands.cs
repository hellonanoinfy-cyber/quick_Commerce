using FirstCry.Application.Common.Interfaces;
using FirstCry.Application.DTOs.Reviews;
using FirstCry.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FirstCry.Application.Features.Reviews.Commands;

public record CreateReviewCommand(Guid UserId, Guid ProductId, int Rating, string Title, string Comment) : IRequest<ProductReviewDto>;

public class CreateReviewCommandHandler : IRequestHandler<CreateReviewCommand, ProductReviewDto>
{
    private readonly IApplicationDbContext _context;

    public CreateReviewCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ProductReviewDto> Handle(CreateReviewCommand request, CancellationToken cancellationToken)
    {
        var rating = Math.Clamp(request.Rating, 1, 5);
        var review = new ProductReview
        {
            UserId = request.UserId,
            ProductId = request.ProductId,
            Rating = rating,
            Title = request.Title.Trim(),
            Comment = request.Comment.Trim(),
            Status = ReviewStatus.Approved
        };

        _context.ProductReviews.Add(review);

        var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == request.ProductId, cancellationToken);
        if (product != null)
        {
            var existing = await _context.ProductReviews
                .Where(r => r.ProductId == request.ProductId && r.Status == ReviewStatus.Approved)
                .Select(r => r.Rating)
                .ToListAsync(cancellationToken);
            existing.Add(rating);
            product.ReviewCount = existing.Count;
            product.Rating = (decimal)existing.Average();
        }

        await _context.SaveChangesAsync(cancellationToken);

        var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);
        return new ProductReviewDto
        {
            Id = review.Id,
            ProductId = review.ProductId,
            UserId = review.UserId,
            CustomerName = user?.Name ?? "Customer",
            Rating = review.Rating,
            Title = review.Title,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt
        };
    }
}

public record UpdateReviewCommand(Guid UserId, Guid ReviewId, int Rating, string Title, string Comment) : IRequest<bool>;

public class UpdateReviewCommandHandler : IRequestHandler<UpdateReviewCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public UpdateReviewCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateReviewCommand request, CancellationToken cancellationToken)
    {
        var review = await _context.ProductReviews.FirstOrDefaultAsync(r => r.Id == request.ReviewId && r.UserId == request.UserId, cancellationToken);
        if (review == null) return false;

        review.Rating = Math.Clamp(request.Rating, 1, 5);
        review.Title = request.Title.Trim();
        review.Comment = request.Comment.Trim();
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}

public record DeleteReviewCommand(Guid UserId, Guid ReviewId) : IRequest<bool>;

public class DeleteReviewCommandHandler : IRequestHandler<DeleteReviewCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public DeleteReviewCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteReviewCommand request, CancellationToken cancellationToken)
    {
        var review = await _context.ProductReviews.FirstOrDefaultAsync(r => r.Id == request.ReviewId && r.UserId == request.UserId, cancellationToken);
        if (review == null) return false;

        _context.ProductReviews.Remove(review);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
