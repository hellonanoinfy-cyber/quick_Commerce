using FirstCry.Application.Common.Interfaces;
using FirstCry.Application.DTOs.Users;
using FirstCry.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FirstCry.Application.Features.Users.Commands;

public record UpsertUserAddressCommand(
    Guid UserId,
    Guid? AddressId,
    string FullName,
    string Phone,
    string Address,
    string? Landmark,
    string City,
    string State,
    string Pincode,
    string Type,
    bool IsDefault
) : IRequest<UserAddressDto>;

public class UpsertUserAddressCommandHandler : IRequestHandler<UpsertUserAddressCommand, UserAddressDto>
{
    private readonly IApplicationDbContext _context;

    public UpsertUserAddressCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UserAddressDto> Handle(UpsertUserAddressCommand request, CancellationToken cancellationToken)
    {
        var shouldDefault = request.IsDefault || !await _context.UserAddresses.AnyAsync(a => a.UserId == request.UserId, cancellationToken);
        if (shouldDefault)
        {
            var existingDefaults = await _context.UserAddresses
                .Where(a => a.UserId == request.UserId)
                .ToListAsync(cancellationToken);
            foreach (var existing in existingDefaults)
            {
                existing.IsDefault = false;
            }
        }

        UserAddress address;
        if (request.AddressId.HasValue)
        {
            address = await _context.UserAddresses.FirstAsync(a => a.Id == request.AddressId && a.UserId == request.UserId, cancellationToken);
        }
        else
        {
            address = new UserAddress { UserId = request.UserId };
            _context.UserAddresses.Add(address);
        }

        address.FullName = request.FullName.Trim();
        address.Phone = request.Phone.Trim();
        address.Address = request.Address.Trim();
        address.Landmark = request.Landmark?.Trim();
        address.City = request.City.Trim();
        address.State = request.State.Trim();
        address.Pincode = request.Pincode.Trim();
        address.Type = string.IsNullOrWhiteSpace(request.Type) ? "Home" : request.Type.Trim();
        address.IsDefault = shouldDefault;

        await _context.SaveChangesAsync(cancellationToken);
        return new UserAddressDto
        {
            Id = address.Id,
            FullName = address.FullName,
            Phone = address.Phone,
            Address = address.Address,
            Landmark = address.Landmark,
            City = address.City,
            State = address.State,
            Pincode = address.Pincode,
            Type = address.Type,
            IsDefault = address.IsDefault
        };
    }
}

public record DeleteUserAddressCommand(Guid UserId, Guid AddressId) : IRequest<bool>;

public class DeleteUserAddressCommandHandler : IRequestHandler<DeleteUserAddressCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public DeleteUserAddressCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteUserAddressCommand request, CancellationToken cancellationToken)
    {
        var address = await _context.UserAddresses.FirstOrDefaultAsync(a => a.Id == request.AddressId && a.UserId == request.UserId, cancellationToken);
        if (address == null) return false;

        _context.UserAddresses.Remove(address);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
