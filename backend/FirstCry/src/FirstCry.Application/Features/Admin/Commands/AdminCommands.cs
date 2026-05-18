using FirstCry.Application.Common.Interfaces;
using FirstCry.Domain.Entities.Orders;
using MediatR;

namespace FirstCry.Application.Features.Admin.Commands;

public record AdminUpdateOrderStatusCommand(Guid OrderId, string Status, string? Note) : IRequest<bool>;

public class AdminUpdateOrderStatusCommandHandler : IRequestHandler<AdminUpdateOrderStatusCommand, bool>
{
    private readonly IUnitOfWork _unitOfWork;

    public AdminUpdateOrderStatusCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(AdminUpdateOrderStatusCommand request, CancellationToken cancellationToken)
    {
        var order = await _unitOfWork.Orders.GetByIdAsync(request.OrderId, cancellationToken);
        if (order == null || !Enum.TryParse<OrderStatus>(request.Status, true, out var status))
        {
            return false;
        }

        order.UpdateStatus(status, request.Note);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}

public record AdminDeleteProductCommand(Guid ProductId) : IRequest<bool>;

public class AdminDeleteProductCommandHandler : IRequestHandler<AdminDeleteProductCommand, bool>
{
    private readonly IUnitOfWork _unitOfWork;

    public AdminDeleteProductCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(AdminDeleteProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(request.ProductId, cancellationToken);
        if (product == null) return false;

        product.IsDeleted = true;
        product.IsActive = false;
        product.DeletedAt = DateTime.UtcNow;
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}

public record AdminSetCustomerBlockedCommand(Guid CustomerId, bool Blocked) : IRequest<bool>;

public class AdminSetCustomerBlockedCommandHandler : IRequestHandler<AdminSetCustomerBlockedCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public AdminSetCustomerBlockedCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(AdminSetCustomerBlockedCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users.FindAsync(new object[] { request.CustomerId }, cancellationToken);
        if (user == null) return false;

        user.Role = request.Blocked ? "Blocked" : "User";
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
