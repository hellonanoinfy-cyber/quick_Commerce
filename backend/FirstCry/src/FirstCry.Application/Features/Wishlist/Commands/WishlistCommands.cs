using FirstCry.Application.Common.Interfaces;
using FirstCry.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FirstCry.Application.Features.Wishlist.Commands;

public record AddWishlistItemCommand(Guid UserId, Guid ProductId) : IRequest<bool>;

public class AddWishlistItemCommandHandler : IRequestHandler<AddWishlistItemCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public AddWishlistItemCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(AddWishlistItemCommand request, CancellationToken cancellationToken)
    {
        var exists = await _context.WishlistItems.AnyAsync(w => w.UserId == request.UserId && w.ProductId == request.ProductId, cancellationToken);
        if (exists) return true;

        _context.WishlistItems.Add(new WishlistItem { UserId = request.UserId, ProductId = request.ProductId });
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}

public record UpdateWishlistItemCommand(Guid UserId, Guid ProductId, string? Note) : IRequest<bool>;

public class UpdateWishlistItemCommandHandler : IRequestHandler<UpdateWishlistItemCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public UpdateWishlistItemCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateWishlistItemCommand request, CancellationToken cancellationToken)
    {
        var item = await _context.WishlistItems.FirstOrDefaultAsync(w => w.UserId == request.UserId && w.ProductId == request.ProductId, cancellationToken);
        if (item == null) return false;

        item.Note = request.Note;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}

public record RemoveWishlistItemCommand(Guid UserId, Guid ProductId) : IRequest<bool>;

public class RemoveWishlistItemCommandHandler : IRequestHandler<RemoveWishlistItemCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public RemoveWishlistItemCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(RemoveWishlistItemCommand request, CancellationToken cancellationToken)
    {
        var item = await _context.WishlistItems.FirstOrDefaultAsync(w => w.UserId == request.UserId && w.ProductId == request.ProductId, cancellationToken);
        if (item == null) return false;

        _context.WishlistItems.Remove(item);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
