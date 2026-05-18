namespace FirstCry.Infrastructure.Data.Configurations;

using FirstCry.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

/// <summary>
/// EF Core Fluent API configuration for the ProductImage entity.
/// </summary>
public class ProductImageConfiguration : IEntityTypeConfiguration<ProductImage>
{
    public void Configure(EntityTypeBuilder<ProductImage> builder)
    {
        builder.ToTable("ProductImages");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Url)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(p => p.AltText)
            .HasMaxLength(500);

        builder.Property(p => p.IsPrimary)
            .HasDefaultValue(false);

        builder.Property(p => p.DisplayOrder)
            .HasDefaultValue(0);

        // Indexes
        builder.HasIndex(p => p.ProductId);
        builder.HasIndex(p => p.IsPrimary);
        builder.HasIndex(p => new { p.ProductId, p.DisplayOrder });

        // Relationships
        builder.HasOne(p => p.Product)
            .WithMany(p => p.Images)
            .HasForeignKey(p => p.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}