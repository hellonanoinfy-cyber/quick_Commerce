namespace FirstCry.Application.DTOs.Media;

/// <summary>
/// DTO for product image data transfer
/// </summary>
public class ProductImageDto
{
    public Guid Id { get; set; }
    public Guid? ProductId { get; set; }
    public string Url { get; set; } = string.Empty;
    public string? AltText { get; set; }
    public bool IsPrimary { get; set; }
    public int DisplayOrder { get; set; }
    public string? ThumbnailUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// Request to upload and attach image to a product
/// </summary>
public class UploadProductImageRequest
{
    public Guid ProductId { get; set; }
    public string? AltText { get; set; }
    public bool SetAsPrimary { get; set; }
}

/// <summary>
/// Request to update image metadata
/// </summary>
public class UpdateImageRequest
{
    public string? AltText { get; set; }
    public bool? IsPrimary { get; set; }
    public int? DisplayOrder { get; set; }
}

/// <summary>
/// Request to reorder product images
/// </summary>
public class ReorderImagesRequest
{
    public Guid ProductId { get; set; }
    public List<Guid> ImageIds { get; set; } = new();
}

/// <summary>
/// Response for image operations
/// </summary>
public class ImageOperationResponse
{
    public Guid ImageId { get; set; }
    public string Url { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
    public bool IsPrimary { get; set; }
    public int DisplayOrder { get; set; }
    public string? Message { get; set; }
}