namespace FirstCry.Application.Common.Interfaces;

public interface IMediaUploadService
{
    /// <summary>
    /// Upload a product image
    /// </summary>
    Task<MediaUploadResult> UploadProductImageAsync(Stream fileStream, string fileName, string? altText = null);
    
    /// <summary>
    /// Delete a product image
    /// </summary>
    Task<bool> DeleteProductImageAsync(string publicId);
    
    /// <summary>
    /// Generate a signed URL for direct browser upload
    /// </summary>
    Task<SignedUploadResult> GenerateSignedUploadUrlAsync(string fileName, string contentType);
    
    /// <summary>
    /// Optimize an existing image
    /// </summary>
    Task<bool> OptimizeImageAsync(string publicId);
}

public record MediaUploadResult(
    string PublicId,
    string Url,
    string ThumbnailUrl,
    int Width,
    int Height,
    long FileSize
);

public record SignedUploadResult(
    string UploadUrl,
    string PublicId,
    DateTime ExpiresAt
);