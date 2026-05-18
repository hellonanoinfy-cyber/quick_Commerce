using FirstCry.Application.Common.Interfaces;
using MediatR;

namespace FirstCry.Application.Features.Products.Commands;

public record UpdateProductCommand(
    Guid Id,
    string Name,
    string Slug,
    string? ShortDescription,
    string? Description,
    decimal Price,
    decimal? DiscountPrice,
    int StockQuantity,
    Guid CategoryId,
    Guid BrandId,
    bool IsFeatured
) : IRequest<bool>;

public class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand, bool>
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdateProductCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(request.Id, cancellationToken);
        if (product == null) return false;

        product.Name = request.Name;
        product.Slug = request.Slug;
        product.ShortDescription = request.ShortDescription;
        product.Description = request.Description;
        product.Price = request.Price;
        product.DiscountPrice = request.DiscountPrice;
        product.StockQuantity = request.StockQuantity;
        product.CategoryId = request.CategoryId;
        product.BrandId = request.BrandId;
        product.IsFeatured = request.IsFeatured;

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}
