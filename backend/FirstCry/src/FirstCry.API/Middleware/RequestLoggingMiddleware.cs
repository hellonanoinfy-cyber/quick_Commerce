namespace FirstCry.API.Middleware;

using System.Diagnostics;

/// <summary>
/// Logs request/response details with timing.
/// Uses Serilog structured logging for easy querying.
/// </summary>
public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        var requestPath = context.Request.Path;
        var method = context.Request.Method;

        try
        {
            await _next(context);
            stopwatch.Stop();

            _logger.LogInformation(
                "HTTP {Method} {Path} responded {StatusCode} in {ElapsedMs}ms",
                method,
                requestPath,
                context.Response.StatusCode,
                stopwatch.ElapsedMilliseconds);
        }
        catch
        {
            stopwatch.Stop();
            _logger.LogError(
                "HTTP {Method} {Path} failed after {ElapsedMs}ms",
                method,
                requestPath,
                stopwatch.ElapsedMilliseconds);
            throw; // Re-throw for ExceptionHandlingMiddleware
        }
    }
}
