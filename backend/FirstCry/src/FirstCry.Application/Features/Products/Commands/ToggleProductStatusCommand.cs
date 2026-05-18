using FirstCry.Application.Common.Interfaces;
using MediatR;

namespace FirstCry.Application.Features.Products.Commands;

public record ToggleProductStatusCommand(Guid Id) : IRequest<bool>;

public class ToggleProductStatusCommandHandler : IRequestHandler<ToggleProductStatusCommand, bool>
{
    private readonly IUnitOfWork _unitOfWork;

    public ToggleProductStatusCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(ToggleProductStatusCommand request, CancellationToken cancellationToken)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(request.Id, cancellationToken);
        if (product == null) return false;

        product.IsActive = !product.IsActive;

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}
