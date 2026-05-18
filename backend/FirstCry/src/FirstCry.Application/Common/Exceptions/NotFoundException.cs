namespace FirstCry.Application.Common.Exceptions;

/// <summary>
/// Thrown when a requested resource is not found. Maps to HTTP 404.
/// </summary>
public class NotFoundException : ApiException
{
    public NotFoundException(string entityName, object key)
        : base($"{entityName} with key '{key}' was not found.", 404, "RESOURCE_NOT_FOUND")
    {
    }
}
