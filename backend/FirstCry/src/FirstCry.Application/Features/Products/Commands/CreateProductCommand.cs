using FirstCry.Application.Common.Interfaces;
using FirstCry.Domain.Entities;
using MediatR;

namespace FirstCry.Application.Features.Products.Commands;

public record CreateProductCommand(
    string Name,
    string Slug,
    string? ShortDescription,
    string? Description,
    decimal Price,
    int StockQuantity,
    Guid CategoryId,
    Guid BrandId,
    List<string> ImageUrls,
    List<string> Tags
) : IRequest<Guid>;

public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, Guid>
{
    private readonly IUnitOfWork _unitOfWork;

    public CreateProductCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        var product = Product.Create(
            request.Name,
            request.Slug,
            request.ShortDescription,
            request.Description,
            request.Price,
            request.StockQuantity,
            request.CategoryId,
            request.BrandId
        );

        foreach (var url in request.ImageUrls)
        {
            product.AddImage(url, request.Name, url == request.ImageUrls.First());
        }

        foreach (var tag in request.Tags)
        {
            product.AddTag(tag);
        }

        await _unitOfWork.Products.AddAsync(product, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return product.Id;
    }
}
