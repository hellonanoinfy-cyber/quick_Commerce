namespace FirstCry.Application.Common.Exceptions;

/// <summary>
/// Base API exception. All custom exceptions inherit from this.
/// The ExceptionHandlingMiddleware maps these to HTTP responses.
/// </summary>
public class ApiException : Exception
{
    public int StatusCode { get; }
    public string? ErrorCode { get; }

    public ApiException(string message, int statusCode = 500, string? errorCode = null)
        : base(message)
    {
        StatusCode = statusCode;
        ErrorCode = errorCode;
    }
}
