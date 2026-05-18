namespace FirstCry.Application.Common.Exceptions;

/// <summary>
/// Thrown when a user tries to access a resource they don't have permission for.
/// Maps to HTTP 403.
/// </summary>
public class ForbiddenException : ApiException
{
    public ForbiddenException(string message = "You do not have permission to access this resource.")
        : base(message, 403, "FORBIDDEN")
    {
    }
}
