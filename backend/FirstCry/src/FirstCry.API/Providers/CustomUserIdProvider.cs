using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace FirstCry.API.Providers;

public class CustomUserIdProvider : IUserIdProvider
{
    public string? GetUserId(HubConnectionContext connection)
    {
        // Try to get userId from ClaimTypes.NameIdentifier or 'sub' claim
        return connection.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value 
            ?? connection.User?.FindFirst("sub")?.Value;
    }
}
