namespace FirstCry.Infrastructure.Data.Context;

using FirstCry.Application.Common.Interfaces;
using FirstCry.Domain.Common;
using FirstCry.Domain.Entities;
using FirstCry.Domain.Entities.Orders;
using FirstCry.Domain.Entities.Payments;
using Microsoft.EntityFrameworkCore;

/// <summary>
/// Main EF Core DbContext for the application.
/// All entity DbSets are registered here.
/// Automatically handles CreatedAt/UpdatedAt timestamps.
/// </summary>
public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    // ── DbSets ──────────────────────────────────────────
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Brand> Brands => Set<Brand>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<ProductTag> ProductTags => Set<ProductTag>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<UserAddress> UserAddresses => Set<UserAddress>();
    public DbSet<WishlistItem> WishlistItems => Set<WishlistItem>();
    public DbSet<ProductReview> ProductReviews => Set<ProductReview>();
    public DbSet<Coupon> Coupons => Set<Coupon>();
    public DbSet<Banner> Banners => Set<Banner>();
    
    // ── Payment DbSets ──────────────────────────────────
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<PaymentTransaction> PaymentTransactions => Set<PaymentTransaction>();
    public DbSet<Refund> Refunds => Set<Refund>();
    
    // ── Warehouse DbSets ──────────────────────────────────
    public DbSet<Domain.Entities.Warehouse.Warehouse> Warehouses => Set<Domain.Entities.Warehouse.Warehouse>();
    public DbSet<Domain.Entities.Warehouse.WarehouseInventory> WarehouseInventories => Set<Domain.Entities.Warehouse.WarehouseInventory>();
    public DbSet<Domain.Entities.Warehouse.WarehouseTransfer> WarehouseTransfers => Set<Domain.Entities.Warehouse.WarehouseTransfer>();
    
    // ── Inventory DbSets ──────────────────────────────────
    public DbSet<Domain.Entities.Inventory.Inventory> Inventories => Set<Domain.Entities.Inventory.Inventory>();
    
    // ── Shipping DbSets ──────────────────────────────────
    public DbSet<Domain.Entities.Shipping.Shipment> Shipments => Set<Domain.Entities.Shipping.Shipment>();
    public DbSet<Domain.Entities.Shipping.ShippingZone> ShippingZones => Set<Domain.Entities.Shipping.ShippingZone>();
    
    // ── Notification DbSets ──────────────────────────────────
    public DbSet<Domain.Entities.Notifications.Notification> Notifications => Set<Domain.Entities.Notifications.Notification>();

    // ── Model Configuration ─────────────────────────────
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all IEntityTypeConfiguration<T> from this assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        // Global query filter for soft-deleted entities
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(AuditableEntity).IsAssignableFrom(entityType.ClrType))
            {
                modelBuilder.Entity(entityType.ClrType)
                    .HasQueryFilter(
                        GenerateSoftDeleteFilter(entityType.ClrType));
            }

            // Fix decimal precision for all decimal properties
            foreach (var property in entityType.GetProperties())
            {
                if (property.ClrType == typeof(decimal) || property.ClrType == typeof(decimal?))
                {
                    property.SetPrecision(18);
                    property.SetScale(2);
                }
            }
        }

        // User has a soft-delete global filter. Notification.User is optional (User?)
        // so we must explicitly mark the FK as optional to suppress EF warning EF1004.
        modelBuilder.Entity<Domain.Entities.Notifications.Notification>()
            .HasOne(n => n.User)
            .WithMany()
            .HasForeignKey(n => n.UserId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.SetNull);
    }

    // ── Auto-set timestamps on save ─────────────────────
    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = DateTime.UtcNow;
                    break;
                case EntityState.Modified:
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    break;
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }

    // ── Helper: generate soft delete filter expression ──
    private static System.Linq.Expressions.LambdaExpression GenerateSoftDeleteFilter(Type entityType)
    {
        var parameter = System.Linq.Expressions.Expression.Parameter(entityType, "e");
        var property = System.Linq.Expressions.Expression.Property(parameter, nameof(AuditableEntity.IsDeleted));
        var condition = System.Linq.Expressions.Expression.Equal(property, System.Linq.Expressions.Expression.Constant(false));
        return System.Linq.Expressions.Expression.Lambda(condition, parameter);
    }
}
