using FirstCry.Application.Common.Interfaces;
using FirstCry.Application.DTOs.Users;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FirstCry.Application.Features.Users.Queries;

public record GetUserAddressesQuery(Guid UserId) : IRequest<List<UserAddressDto>>;

public class GetUserAddressesQueryHandler : IRequestHandler<GetUserAddressesQuery, List<UserAddressDto>>
{
    private readonly IApplicationDbContext _context;

    public GetUserAddressesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<UserAddressDto>> Handle(GetUserAddressesQuery request, CancellationToken cancellationToken)
    {
        return await _context.UserAddresses.AsNoTracking()
            .Where(a => a.UserId == request.UserId)
            .OrderByDescending(a => a.IsDefault)
            .ThenByDescending(a => a.CreatedAt)
            .Select(a => new UserAddressDto
            {
                Id = a.Id,
                FullName = a.FullName,
                Phone = a.Phone,
                Address = a.Address,
                Landmark = a.Landmark,
                City = a.City,
                State = a.State,
                Pincode = a.Pincode,
                Type = a.Type,
                IsDefault = a.IsDefault
            })
            .ToListAsync(cancellationToken);
    }
}
