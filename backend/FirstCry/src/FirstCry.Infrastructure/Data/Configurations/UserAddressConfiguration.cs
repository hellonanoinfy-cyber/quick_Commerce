using FirstCry.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FirstCry.Infrastructure.Data.Configurations;

public class UserAddressConfiguration : IEntityTypeConfiguration<UserAddress>
{
    public void Configure(EntityTypeBuilder<UserAddress> builder)
    {
        builder.HasKey(a => a.Id);
        builder.Property(a => a.FullName).HasMaxLength(100).IsRequired();
        builder.Property(a => a.Phone).HasMaxLength(20).IsRequired();
        builder.Property(a => a.Address).HasMaxLength(250).IsRequired();
        builder.Property(a => a.Landmark).HasMaxLength(120);
        builder.Property(a => a.City).HasMaxLength(60).IsRequired();
        builder.Property(a => a.State).HasMaxLength(60).IsRequired();
        builder.Property(a => a.Pincode).HasMaxLength(10).IsRequired();
        builder.Property(a => a.Type).HasMaxLength(20).IsRequired();
        builder.HasIndex(a => a.UserId);
        builder.HasOne(a => a.User).WithMany(u => u.Addresses).HasForeignKey(a => a.UserId);
    }
}
