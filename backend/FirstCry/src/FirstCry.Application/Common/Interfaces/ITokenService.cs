namespace FirstCry.Application.Common.Interfaces;

using System.Security.Claims;
using FirstCry.Domain.Entities;

public interface ITokenService
{
    string CreateJwtToken(User user);
    RefreshToken GenerateRefreshToken(string ipAddress);
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
}
