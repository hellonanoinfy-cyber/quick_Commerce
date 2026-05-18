namespace FirstCry.Application.Common.Exceptions;

/// <summary>
/// Thrown when input validation fails. Maps to HTTP 400.
/// </summary>
public class ValidationException : ApiException
{
    public IDictionary<string, string[]> Errors { get; }

    public ValidationException(IDictionary<string, string[]> errors)
        : base("One or more validation errors occurred.", 400, "VALIDATION_ERROR")
    {
        Errors = errors;
    }
}
