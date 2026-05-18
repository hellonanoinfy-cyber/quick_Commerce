using FirstCry.Application.Common.Interfaces;
using MediatR;

namespace FirstCry.Application.Features.Products.Commands;

public record UpdateProductStockCommand(Guid ProductId, int NewStock) : IRequest;

public class UpdateProductStockCommandHandler : IRequestHandler<UpdateProductStockCommand>
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdateProductStockCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(UpdateProductStockCommand request, CancellationToken cancellationToken)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(request.ProductId, cancellationToken);
        if (product == null) throw new Exception("Product not found");

        product.UpdateStock(request.NewStock);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
