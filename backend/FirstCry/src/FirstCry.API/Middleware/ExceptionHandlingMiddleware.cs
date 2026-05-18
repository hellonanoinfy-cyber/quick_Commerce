namespace FirstCry.API.Middleware;

using System.Net;
using System.Text.Json;
using FirstCry.Application.Common.Exceptions;
using FirstCry.Application.DTOs;

/// <summary>
/// Global exception handling middleware.
/// Catches all unhandled exceptions and maps them to standardized API responses.
/// Custom ApiExceptions get their defined status code; unexpected errors get 500.
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    private static readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, response) = exception switch
        {
            Application.Common.Exceptions.ValidationException validationEx =>
                ((int)HttpStatusCode.BadRequest,
                 ApiResponse<object>.ErrorResponse(validationEx.Message, validationEx.Errors)),

            NotFoundException notFoundEx =>
                ((int)HttpStatusCode.NotFound,
                 ApiResponse<object>.ErrorResponse(notFoundEx.Message)),

            ForbiddenException forbiddenEx =>
                ((int)HttpStatusCode.Forbidden,
                 ApiResponse<object>.ErrorResponse(forbiddenEx.Message)),

            ApiException apiEx =>
                (apiEx.StatusCode,
                 ApiResponse<object>.ErrorResponse(apiEx.Message)),

            Microsoft.Data.SqlClient.SqlException =>
                ((int)HttpStatusCode.ServiceUnavailable,
                 ApiResponse<object>.ErrorResponse("The database service is currently offline. Some features may be unavailable.")),

            InvalidOperationException when IsDatabaseConnectivityException(exception) =>
                ((int)HttpStatusCode.ServiceUnavailable,
                 ApiResponse<object>.ErrorResponse("The database service is currently offline. Some features may be unavailable.")),

            _ =>
                ((int)HttpStatusCode.InternalServerError,
                 ApiResponse<object>.ErrorResponse("An unexpected error occurred."))
        };

        // Log based on severity
        if (statusCode >= 500)
            _logger.LogError(exception, "Unhandled exception: {Message}", exception.Message);
        else
            _logger.LogWarning("Handled exception ({StatusCode}): {Message}", statusCode, exception.Message);

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = statusCode;

        await context.Response.WriteAsync(
            JsonSerializer.Serialize(response, _jsonOptions));
    }

    private static bool IsDatabaseConnectivityException(Exception exception)
    {
        return exception.InnerException is Microsoft.Data.SqlClient.SqlException
            || exception.Source == "Microsoft.Data.SqlClient"
            || exception.Message.Contains("SQL Server", StringComparison.OrdinalIgnoreCase)
            || exception.Message.Contains("network-related", StringComparison.OrdinalIgnoreCase)
            || exception.Message.Contains("actively refused", StringComparison.OrdinalIgnoreCase);
    }
}
