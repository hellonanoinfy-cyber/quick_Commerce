namespace FirstCry.API.Controllers.v1;

using Asp.Versioning;
using FirstCry.Application.Common.Interfaces;
using FirstCry.Application.DTOs;
using FirstCry.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/cart")]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetCart()
    {
        try
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid or missing user claims."));
            }

            var cart = await _cartService.GetCartByUserIdAsync(userId);
            return Ok(ApiResponse<CartResponse>.SuccessResponse(ToCartResponse(cart), "Cart retrieved."));
        }
        catch (Exception ex)
        {
            // For not found, we will fix CartService to return empty cart, but just in case:
            if (ex.Message.Contains("not found", StringComparison.OrdinalIgnoreCase))
            {
                // Return an empty cart structure
                return Ok(ApiResponse<CartResponse>.SuccessResponse(CreateEmptyCartResponse(), "Cart is empty."));
            }
            throw; // Let global exception handler catch real 500s
        }
    }

    [HttpPost("items")]
    [Authorize]
    public async Task<IActionResult> AddItem([FromBody] CartItemRequest request)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId)) return BadRequest(ApiResponse<object>.ErrorResponse("Invalid user claims."));

        var cart = await _cartService.AddItemAsync(userId, request.ProductId, request.Quantity);
        return Ok(ApiResponse<CartResponse>.SuccessResponse(ToCartResponse(cart), "Item added to cart."));
    }

    [HttpPut("items/{productId}")]
    [Authorize]
    public async Task<IActionResult> UpdateQuantity(Guid productId, [FromBody] UpdateQuantityRequest request)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId)) return BadRequest(ApiResponse<object>.ErrorResponse("Invalid user claims."));

        var cart = await _cartService.UpdateItemQuantityAsync(userId, productId, request.Quantity);
        return Ok(ApiResponse<CartResponse>.SuccessResponse(ToCartResponse(cart), "Cart item updated."));
    }

    [HttpDelete("items/{productId}")]
    [Authorize]
    public async Task<IActionResult> RemoveItem(Guid productId)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId)) return BadRequest(ApiResponse<object>.ErrorResponse("Invalid user claims."));

        var cart = await _cartService.RemoveItemAsync(userId, productId);
        return Ok(ApiResponse<CartResponse>.SuccessResponse(ToCartResponse(cart), "Item removed from cart."));
    }

    [HttpDelete]
    [Authorize]
    public async Task<IActionResult> ClearCart()
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId)) return BadRequest(ApiResponse<object>.ErrorResponse("Invalid user claims."));

        await _cartService.ClearCartAsync(userId);
        return Ok(ApiResponse<object>.SuccessResponse(new { }, "Cart cleared."));
    }

    [HttpPost("merge")]
    [AllowAnonymous]
    public async Task<IActionResult> MergeCart([FromBody] MergeCartRequest request)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
        
        if (string.IsNullOrEmpty(userIdString) && request.UserId == Guid.Empty)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("UserId is required for merging."));
        }

        var userId = !string.IsNullOrEmpty(userIdString) ? Guid.Parse(userIdString) : request.UserId;

        await _cartService.MergeGuestCartAsync(userId, request.Items);
        var cart = await _cartService.GetCartByUserIdAsync(userId);
        
        return Ok(ApiResponse<CartResponse>.SuccessResponse(ToCartResponse(cart), "Carts merged successfully."));
    }

    private static CartResponse ToCartResponse(Cart cart)
    {
        var items = cart.Items
            .OrderBy(item => item.CreatedAt)
            .Select(ToCartItemResponse)
            .ToList();

        var subtotal = items.Sum(item => item.LineTotal);

        return new CartResponse
        {
            Id = cart.Id,
            UserId = cart.UserId,
            Items = items,
            TotalItems = items.Sum(item => item.Quantity),
            Subtotal = subtotal,
            TotalAmount = subtotal
        };
    }

    private static CartResponse CreateEmptyCartResponse() => new()
    {
        Items = new List<CartItemResponse>(),
        TotalItems = 0,
        Subtotal = 0,
        TotalAmount = 0
    };

    private static CartItemResponse ToCartItemResponse(CartItem item)
    {
        var product = item.Product;

        return new CartItemResponse
        {
            Id = item.Id,
            ProductId = item.ProductId,
            Quantity = item.Quantity,
            Price = item.Price,
            LineTotal = item.Price * item.Quantity,
            Product = product == null ? null : new CartProductResponse
            {
                Id = product.Id,
                Name = product.Name,
                Slug = product.Slug,
                Sku = product.Sku,
                Price = product.Price,
                DiscountPrice = product.DiscountPrice,
                PrimaryImageUrl = product.Images.FirstOrDefault(image => image.IsPrimary)?.Url
                    ?? product.Images.OrderBy(image => image.DisplayOrder).Select(image => image.Url).FirstOrDefault(),
                StockQuantity = product.StockQuantity,
                IsActive = product.IsActive
            }
        };
    }
}

public class CartItemRequest
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
}

public class UpdateQuantityRequest
{
    public int Quantity { get; set; }
}

public class MergeCartRequest
{
    public Guid UserId { get; set; }
    public List<GuestCartItemDto> Items { get; set; } = new();
}

public class CartResponse
{
    public Guid Id { get; set; }
    public Guid? UserId { get; set; }
    public List<CartItemResponse> Items { get; set; } = new();
    public int TotalItems { get; set; }
    public decimal Subtotal { get; set; }
    public decimal TotalAmount { get; set; }
}

public class CartItemResponse
{
    public Guid Id { get; set; }
    public Guid? ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public decimal LineTotal { get; set; }
    public CartProductResponse? Product { get; set; }
}

public class CartProductResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public string? PrimaryImageUrl { get; set; }
    public int StockQuantity { get; set; }
    public bool IsActive { get; set; }
}
