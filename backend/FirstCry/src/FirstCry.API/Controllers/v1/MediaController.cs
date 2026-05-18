namespace FirstCry.API.Controllers.v1;

using FirstCry.Application.Common.Interfaces;
using FirstCry.Application.DTOs;
using FirstCry.Application.DTOs.Media;
using FirstCry.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/v1/media")]
public class MediaController : ControllerBase
{
    private readonly IMediaUploadService _mediaService;
    private readonly IProductRepository _productRepository;
    private readonly ILogger<MediaController> _logger;

    // Allowed file types and sizes
    private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
    private const long MaxFileSize = 10 * 1024 * 1024; // 10MB

    public MediaController(
        IMediaUploadService mediaService,
        IProductRepository productRepository,
        ILogger<MediaController> logger)
    {
        _mediaService = mediaService;
        _productRepository = productRepository;
        _logger = logger;
    }

    /// <summary>
    /// Upload a product image (Admin only)
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpPost("upload")]
    [RequestSizeLimit(10 * 1024 * 1024)] // 10MB
    public async Task<ActionResult<ApiResponse<MediaUploadResponse>>> UploadImage(
        IFormFile file,
        [FromQuery] string? altText = null,
        [FromQuery] bool isPrimary = false)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("No file uploaded."));
        }

        // Validate file size
        if (file.Length > MaxFileSize)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse($"File size exceeds maximum allowed (10MB). Uploaded: {file.Length / (1024 * 1024):F2}MB"));
        }

        // Validate file extension
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(extension))
        {
            return BadRequest(ApiResponse<object>.ErrorResponse($"File type {extension} is not allowed. Allowed: {string.Join(", ", AllowedExtensions)}"));
        }

        try
        {
            using var stream = file.OpenReadStream();
            var result = await _mediaService.UploadProductImageAsync(stream, file.FileName, altText);

            var response = new MediaUploadResponse(
                result.PublicId,
                result.Url,
                result.ThumbnailUrl,
                result.Width,
                result.Height,
                result.FileSize,
                isPrimary
            );

            _logger.LogInformation("Product image uploaded: {PublicId}, Size: {Size}KB", result.PublicId, result.FileSize / 1024);

            return Ok(ApiResponse<MediaUploadResponse>.SuccessResponse(response, "Image uploaded successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to upload image: {FileName}", file.FileName);
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Failed to upload image"));
        }
    }

    /// <summary>
    /// Upload multiple product images (Admin only)
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpPost("upload/batch")]
    [RequestSizeLimit(50 * 1024 * 1024)] // 50MB total
    public async Task<ActionResult<ApiResponse<IEnumerable<MediaUploadResponse>>>> UploadImages(
        IFormFileCollection files,
        [FromQuery] bool setFirstAsPrimary = true)
    {
        if (files == null || !files.Any())
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("No files uploaded."));
        }

        if (files.Count > 10)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("Maximum 10 images allowed per batch."));
        }

        var results = new List<MediaUploadResponse>();

        for (int i = 0; i < files.Count; i++)
        {
            var file = files[i];
            
            // Validate
            if (file.Length > MaxFileSize)
            {
                _logger.LogWarning("Skipping oversized file: {FileName} ({Size}MB)", file.FileName, file.Length / (1024 * 1024));
                continue;
            }

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!AllowedExtensions.Contains(extension))
            {
                _logger.LogWarning("Skipping invalid file type: {FileName}", file.FileName);
                continue;
            }

            try
            {
                using var stream = file.OpenReadStream();
                var result = await _mediaService.UploadProductImageAsync(stream, file.FileName);

                results.Add(new MediaUploadResponse(
                    result.PublicId,
                    result.Url,
                    result.ThumbnailUrl,
                    result.Width,
                    result.Height,
                    result.FileSize,
                    setFirstAsPrimary && i == 0
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to upload image: {FileName}", file.FileName);
            }
        }

        if (!results.Any())
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("No images could be uploaded."));
        }

        return Ok(ApiResponse<IEnumerable<MediaUploadResponse>>.SuccessResponse(results, $"{results.Count} images uploaded successfully"));
    }

    /// <summary>
    /// Upload and attach image to a specific product
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpPost("product/{productId:guid}")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<ActionResult<ApiResponse<ProductImageDto>>> UploadProductImage(
        Guid productId,
        IFormFile file,
        [FromQuery] string? altText = null,
        [FromQuery] bool setAsPrimary = false)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("No file uploaded."));
        }

        if (file.Length > MaxFileSize)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse($"File size exceeds maximum allowed (10MB)."));
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(extension))
        {
            return BadRequest(ApiResponse<object>.ErrorResponse($"File type {extension} is not allowed."));
        }

        try
        {
            // Verify product exists
            var product = await _productRepository.GetByIdAsync(productId);
            if (product == null)
            {
                return NotFound(ApiResponse<object>.ErrorResponse($"Product with ID {productId} not found."));
            }

            // Upload image
            using var stream = file.OpenReadStream();
            var result = await _mediaService.UploadProductImageAsync(stream, file.FileName, altText);

            // Get current image count for ordering
            var existingImages = await _productRepository.GetProductImagesAsync(productId);
            var displayOrder = existingImages.Count() + 1;

            // If setting as primary, update existing images
            if (setAsPrimary)
            {
                await _productRepository.SetPrimaryImageAsync(productId, Guid.Empty);
            }

            // Create product image entity
            var productImage = ProductImage.Create(
                productId,
                result.Url,
                altText,
                setAsPrimary || !existingImages.Any(),
                displayOrder
            );

            // Save to database
            var savedImage = await _productRepository.AddProductImageAsync(productImage);

            var imageDto = new ProductImageDto
            {
                Id = savedImage.Id,
                ProductId = savedImage.ProductId,
                Url = savedImage.Url,
                AltText = savedImage.AltText,
                IsPrimary = savedImage.IsPrimary,
                DisplayOrder = savedImage.DisplayOrder,
                ThumbnailUrl = result.ThumbnailUrl,
                CreatedAt = savedImage.CreatedAt
            };

            _logger.LogInformation("Image uploaded and attached to product {ProductId}: {ImageId}", productId, savedImage.Id);

            return Ok(ApiResponse<ProductImageDto>.SuccessResponse(imageDto, "Image uploaded and attached to product"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to upload and attach image to product {ProductId}", productId);
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Failed to upload image"));
        }
    }

    /// <summary>
    /// Get all images for a product
    /// </summary>
    [AllowAnonymous]
    [HttpGet("product/{productId:guid}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ProductImageDto>>>> GetProductImages(Guid productId)
    {
        try
        {
            var images = await _productRepository.GetProductImagesAsync(productId);

            var imageDtos = images.Select(i => new ProductImageDto
            {
                Id = i.Id,
                ProductId = i.ProductId,
                Url = i.Url,
                AltText = i.AltText,
                IsPrimary = i.IsPrimary,
                DisplayOrder = i.DisplayOrder,
                CreatedAt = i.CreatedAt
            });

            return Ok(ApiResponse<IEnumerable<ProductImageDto>>.SuccessResponse(imageDtos, $"{images.Count()} images found"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get images for product {ProductId}", productId);
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Failed to retrieve images"));
        }
    }

    /// <summary>
    /// Update image metadata (alt text, primary status, display order)
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpPut("{imageId:guid}")]
    public async Task<ActionResult<ApiResponse<ProductImageDto>>> UpdateImage(
        Guid imageId,
        [FromBody] UpdateImageRequest request)
    {
        try
        {
            var existingImage = await _productRepository.GetProductImageByIdAsync(imageId);
            if (existingImage == null)
            {
                return NotFound(ApiResponse<object>.ErrorResponse($"Image with ID {imageId} not found."));
            }

            // Update fields
            existingImage.Update(request.AltText, request.IsPrimary, request.DisplayOrder);

            // If setting as primary, update all other images for this product
            if (request.IsPrimary == true && existingImage.ProductId.HasValue)
            {
                await _productRepository.SetPrimaryImageAsync(existingImage.ProductId.Value, imageId);
            }

            await _productRepository.UpdateProductImageAsync(existingImage);

            var imageDto = new ProductImageDto
            {
                Id = existingImage.Id,
                ProductId = existingImage.ProductId,
                Url = existingImage.Url,
                AltText = existingImage.AltText,
                IsPrimary = existingImage.IsPrimary,
                DisplayOrder = existingImage.DisplayOrder,
                CreatedAt = existingImage.CreatedAt
            };

            _logger.LogInformation("Image updated: {ImageId}", imageId);

            return Ok(ApiResponse<ProductImageDto>.SuccessResponse(imageDto, "Image updated successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update image {ImageId}", imageId);
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Failed to update image"));
        }
    }

    /// <summary>
    /// Delete an image
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpDelete("{imageId:guid}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteImage(Guid imageId)
    {
        try
        {
            var existingImage = await _productRepository.GetProductImageByIdAsync(imageId);
            if (existingImage == null)
            {
                return NotFound(ApiResponse<bool>.ErrorResponse($"Image with ID {imageId} not found."));
            }

            // Delete from media storage (Cloudinary or local)
            var publicId = existingImage.Url.Contains("cloudinary") 
                ? ExtractCloudinaryPublicId(existingImage.Url) 
                : existingImage.Id.ToString();
            
            await _mediaService.DeleteProductImageAsync(publicId);

            // Delete from database
            await _productRepository.DeleteProductImageAsync(imageId);

            _logger.LogInformation("Image deleted: {ImageId}", imageId);

            return Ok(ApiResponse<bool>.SuccessResponse(true, "Image deleted successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete image {ImageId}", imageId);
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Failed to delete image"));
        }
    }

    /// <summary>
    /// Reorder product images
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpPut("reorder")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ProductImageDto>>>> ReorderImages(
        [FromBody] ReorderImagesRequest request)
    {
        if (request.ImageIds == null || !request.ImageIds.Any())
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("No image IDs provided for reorder."));
        }

        try
        {
            // Verify all images belong to the product
            var existingImages = await _productRepository.GetProductImagesAsync(request.ProductId);
            var existingIds = existingImages.Select(i => i.Id).ToList();
            
            var invalidIds = request.ImageIds.Where(id => !existingIds.Contains(id)).ToList();
            if (invalidIds.Any())
            {
                return BadRequest(ApiResponse<object>.ErrorResponse($"Invalid image IDs: {string.Join(", ", invalidIds)}"));
            }

            // Perform reorder
            await _productRepository.ReorderProductImagesAsync(request.ProductId, request.ImageIds);

            // Fetch updated images
            var updatedImages = await _productRepository.GetProductImagesAsync(request.ProductId);

            var imageDtos = updatedImages.Select(i => new ProductImageDto
            {
                Id = i.Id,
                ProductId = i.ProductId,
                Url = i.Url,
                AltText = i.AltText,
                IsPrimary = i.IsPrimary,
                DisplayOrder = i.DisplayOrder,
                CreatedAt = i.CreatedAt
            });

            _logger.LogInformation("Images reordered for product {ProductId}", request.ProductId);

            return Ok(ApiResponse<IEnumerable<ProductImageDto>>.SuccessResponse(imageDtos, "Images reordered successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to reorder images for product {ProductId}", request.ProductId);
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Failed to reorder images"));
        }
    }

    /// <summary>
    /// Generate signed upload URL for direct browser upload
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpGet("signed-url")]
    public ActionResult<ApiResponse<SignedUploadResponse>> GetSignedUploadUrl(
        [FromQuery] string fileName,
        [FromQuery] string contentType)
    {
        try
        {
            // Validate content type
            if (!contentType.StartsWith("image/"))
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Only image files are allowed."));
            }

            var result = _mediaService.GenerateSignedUploadUrlAsync(fileName, contentType).GetAwaiter().GetResult();

            return Ok(ApiResponse<SignedUploadResponse>.SuccessResponse(
                new SignedUploadResponse(result.UploadUrl, result.PublicId, result.ExpiresAt),
                "Signed URL generated"
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate signed URL for: {FileName}", fileName);
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Failed to generate signed URL"));
        }
    }

    /// <summary>
    /// Optimize an existing image
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpPost("{publicId}/optimize")]
    public async Task<ActionResult<ApiResponse<bool>>> OptimizeImage(string publicId)
    {
        try
        {
            var success = await _mediaService.OptimizeImageAsync(publicId);

            if (success)
            {
                _logger.LogInformation("Image optimized: {PublicId}", publicId);
                return Ok(ApiResponse<bool>.SuccessResponse(true, "Image optimized successfully"));
            }
            else
            {
                return BadRequest(ApiResponse<bool>.ErrorResponse("Image optimization failed"));
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to optimize image: {PublicId}", publicId);
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Failed to optimize image"));
        }
    }

    private static string ExtractCloudinaryPublicId(string url)
    {
        try
        {
            // Extract public ID from Cloudinary URL
            // Format: https://res.cloudinary.com/{cloud}/image/upload/v{version}/{public_id}
            var uri = new Uri(url);
            var path = uri.AbsolutePath;
            var segments = path.Split('/', StringSplitOptions.RemoveEmptyEntries);
            
            // Find "upload" and get everything after it
            var uploadIndex = Array.IndexOf(segments, "upload");
            if (uploadIndex >= 0 && uploadIndex + 2 < segments.Length)
            {
                // Skip version segment, return public ID
                return string.Join("/", segments.Skip(uploadIndex + 2));
            }
            
            return url;
        }
        catch
        {
            return url;
        }
    }
}

// ============================================================
// RESPONSE DTOs
// ============================================================

public record MediaUploadResponse(
    string PublicId,
    string Url,
    string ThumbnailUrl,
    int Width,
    int Height,
    long FileSize,
    bool IsPrimary
);

public record SignedUploadResponse(
    string UploadUrl,
    string PublicId,
    DateTime ExpiresAt
);