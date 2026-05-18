namespace FirstCry.Infrastructure.Services.Cart;

using FirstCry.Application.Common.Interfaces;
using FirstCry.Application.Common.Exceptions;
using FirstCry.Domain.Entities;
using FirstCry.Infrastructure.Data.Context;
using Microsoft.EntityFrameworkCore;

public class CartService : ICartService
{
    private readonly ICartRepository _cartRepository;
    private readonly IRepository<Product> _productRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ApplicationDbContext _context;

    public CartService(
        ICartRepository cartRepository,
        IRepository<Product> productRepository,
        IUnitOfWork unitOfWork,
        ApplicationDbContext context)
    {
        _cartRepository = cartRepository;
        _productRepository = productRepository;
        _unitOfWork = unitOfWork;
        _context = context;
    }

    public async Task<Cart> GetCartByUserIdAsync(Guid userId)
    {
        var cart = await _cartRepository.GetByUserIdAsync(userId);
        if (cart == null)
        {
            cart = new Cart { UserId = userId };
            await _cartRepository.AddAsync(cart);
            await _unitOfWork.SaveChangesAsync();
        }
        return cart;
    }

    public async Task<Cart> AddItemAsync(Guid userId, Guid productId, int quantity)
    {
        if (quantity <= 0)
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["quantity"] = new[] { "Quantity must be greater than 0." }
            });

        var cart = await _cartRepository.GetByUserIdAsync(userId);
        if (cart == null)
        {
            cart = new Cart { UserId = userId };
            await _cartRepository.AddAsync(cart);
            await _unitOfWork.SaveChangesAsync();
        }

        // Load product separately to ensure it's tracked
        var product = await _productRepository.GetByIdAsync(productId);
        if (product == null)
            throw new NotFoundException("Product", productId);

        if (!product.IsActive)
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["product"] = new[] { "This product is no longer available." }
            });

        if (product.StockQuantity < quantity)
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["stock"] = new[] { $"Only {product.StockQuantity} units available." }
            });

        // Use the price with discount if available
        var price = product.DiscountPrice ?? product.Price;

        var existingItem = cart.Items.FirstOrDefault(i => i.ProductId == productId);
        if (existingItem != null)
        {
            var newQuantity = existingItem.Quantity + quantity;
            if (product.StockQuantity < newQuantity)
                throw new ValidationException(new Dictionary<string, string[]>
                {
                    ["stock"] = new[] { $"Only {product.StockQuantity} units available. You already have {existingItem.Quantity} in your cart." }
                });
            existingItem.Quantity = newQuantity;
            existingItem.Price = price;
        }
        else
        {
            var newItem = new CartItem
            {
                CartId = cart.Id,
                ProductId = productId,
                Quantity = quantity,
                Price = price
            };
            await _context.CartItems.AddAsync(newItem);
        }

        await _unitOfWork.SaveChangesAsync();

        // Reload cart with product data to return complete cart
        return (await _cartRepository.GetByUserIdAsync(userId))!;
    }

    public async Task<Cart> UpdateItemQuantityAsync(Guid userId, Guid productId, int quantity)
    {
        if (quantity < 0)
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["quantity"] = new[] { "Quantity cannot be negative." }
            });

        var cart = await _cartRepository.GetByUserIdAsync(userId);
        if (cart == null)
        {
            cart = new Cart { UserId = userId };
            await _cartRepository.AddAsync(cart);
            await _unitOfWork.SaveChangesAsync();
            return cart;
        }

        var existingItem = cart.Items.FirstOrDefault(i => i.ProductId == productId);
        if (existingItem == null)
            throw new NotFoundException("CartItem", productId);

        if (quantity == 0)
        {
            cart.Items.Remove(existingItem);
        }
        else
        {
            // Check stock if product exists
            var product = await _productRepository.GetByIdAsync(productId);
            if (product != null && product.StockQuantity < quantity)
                throw new ValidationException(new Dictionary<string, string[]>
                {
                    ["stock"] = new[] { $"Only {product.StockQuantity} units available." }
                });
            existingItem.Quantity = quantity;
        }

        await _unitOfWork.SaveChangesAsync();
        return (await _cartRepository.GetByUserIdAsync(userId))!;
    }

    public async Task<Cart> RemoveItemAsync(Guid userId, Guid productId)
    {
        var cart = await _cartRepository.GetByUserIdAsync(userId);
        if (cart == null)
        {
            cart = new Cart { UserId = userId };
            await _cartRepository.AddAsync(cart);
            await _unitOfWork.SaveChangesAsync();
            return cart;
        }

        var existingItem = cart.Items.FirstOrDefault(i => i.ProductId == productId);
        if (existingItem != null)
        {
            cart.Items.Remove(existingItem);
            await _unitOfWork.SaveChangesAsync();
        }

        return (await _cartRepository.GetByUserIdAsync(userId))!;
    }

    public async Task ClearCartAsync(Guid userId)
    {
        var cart = await _cartRepository.GetByUserIdAsync(userId);
        if (cart == null)
        {
            cart = new Cart { UserId = userId };
            await _cartRepository.AddAsync(cart);
            await _unitOfWork.SaveChangesAsync();
            return;
        }

        cart.Items.Clear();
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task MergeGuestCartAsync(Guid userId, List<GuestCartItemDto> guestItems)
    {
        if (guestItems == null || guestItems.Count == 0)
            return;

        var cart = await _cartRepository.GetByUserIdAsync(userId);
        if (cart == null)
        {
            cart = new Cart { UserId = userId };
            await _cartRepository.AddAsync(cart);
            await _unitOfWork.SaveChangesAsync();
        }

        foreach (var guestItem in guestItems)
        {
            var product = await _productRepository.GetByIdAsync(guestItem.ProductId);
            if (product == null || !product.IsActive) continue;

            var maxQty = Math.Min(guestItem.Quantity, product.StockQuantity);
            if (maxQty <= 0) continue;

            var existingItem = cart.Items.FirstOrDefault(i => i.ProductId == guestItem.ProductId);
            var price = product.DiscountPrice ?? product.Price;

            if (existingItem != null)
            {
                var newQty = existingItem.Quantity + maxQty;
                if (product.StockQuantity >= newQty)
                {
                    existingItem.Quantity = newQty;
                    existingItem.Price = price;
                }
            }
            else
            {
                cart.Items.Add(new CartItem
                {
                    CartId = cart.Id,
                    ProductId = guestItem.ProductId,
                    Quantity = maxQty,
                    Price = price
                });
            }
        }

        await _unitOfWork.SaveChangesAsync();
    }
}
