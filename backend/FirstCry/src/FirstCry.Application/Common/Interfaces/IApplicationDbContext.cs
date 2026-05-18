namespace FirstCry.Application.Common.Interfaces;

using FirstCry.Domain.Entities;
using FirstCry.Domain.Entities.Orders;
using Microsoft.EntityFrameworkCore;


/// <summary>
/// Application-level database context interface.
/// Exposes DbSets without coupling Application layer to EF Core directly.
/// </summary>
public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<Product> Products { get; }
    DbSet<Category> Categories { get; }
    DbSet<Brand> Brands { get; }
    DbSet<Order> Orders { get; }
    DbSet<OrderItem> OrderItems { get; }
    DbSet<UserAddress> UserAddresses { get; }
    DbSet<WishlistItem> WishlistItems { get; }
    DbSet<ProductReview> ProductReviews { get; }
    DbSet<Coupon> Coupons { get; }
    DbSet<Banner> Banners { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
