namespace FirstCry.Application.DTOs;

/// <summary>
/// Standardized API response wrapper.
/// All API endpoints return this shape for consistency.
/// </summary>
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public T? Data { get; set; }
    public string? Error { get; set; }
    public object? Details { get; set; }
    public object? Pagination { get; set; }
    public IDictionary<string, string[]>? Errors { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    /// <summary>Creates a success response.</summary>
    public static ApiResponse<T> SuccessResponse(T? data, string? message = null)
    {
        return new ApiResponse<T>
        {
            Success = true,
            Message = message ?? "Request completed successfully.",
            Data = data,
            Pagination = TryGetPagination(data)
        };
    }

    /// <summary>Creates an error response.</summary>
    public static ApiResponse<T> ErrorResponse(string message, IDictionary<string, string[]>? errors = null)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Message = message,
            Error = message,
            Details = errors,
            Errors = errors
        };
    }

    private static object? TryGetPagination(T? data)
    {
        if (data == null) return null;
        var type = data.GetType();
        if (!type.IsGenericType || type.GetGenericTypeDefinition() != typeof(PagedListDto<>)) return null;

        return new
        {
            PageNumber = type.GetProperty("PageNumber")?.GetValue(data),
            TotalPages = type.GetProperty("TotalPages")?.GetValue(data),
            TotalCount = type.GetProperty("TotalCount")?.GetValue(data),
            HasPreviousPage = type.GetProperty("HasPreviousPage")?.GetValue(data),
            HasNextPage = type.GetProperty("HasNextPage")?.GetValue(data)
        };
    }
}

/// <summary>
/// Paginated response wrapper for list endpoints.
/// </summary>
public class PaginatedResponse<T>
{
    public IReadOnlyList<T> Items { get; set; } = [];
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    public bool HasNext => Page < TotalPages;
    public bool HasPrevious => Page > 1;
}
