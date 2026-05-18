namespace FirstCry.Infrastructure.Data.Configurations.Payments;

using FirstCry.Domain.Entities.Payments;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.ToTable("Payments");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.RazorpayOrderId)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.RazorpayPaymentId)
            .HasMaxLength(100);

        builder.Property(p => p.RazorpayRefundId)
            .HasMaxLength(100);

        builder.Property(p => p.Amount)
            .IsRequired()
            .HasPrecision(18, 2);

        builder.Property(p => p.Currency)
            .IsRequired()
            .HasMaxLength(10)
            .HasDefaultValue("INR");

        builder.Property(p => p.PaymentMethod)
            .HasMaxLength(50);

        builder.Property(p => p.FailureReason)
            .HasMaxLength(500);

        builder.Property(p => p.ErrorCode)
            .HasMaxLength(50);

        builder.Property(p => p.ErrorDescription)
            .HasMaxLength(500);

        builder.Property(p => p.Signature)
            .HasMaxLength(256);

        builder.Property(p => p.CardId)
            .HasMaxLength(100);

        builder.Property(p => p.CardNetwork)
            .HasMaxLength(50);

        builder.Property(p => p.CardType)
            .HasMaxLength(50);

        builder.Property(p => p.CardIssuer)
            .HasMaxLength(100);

        builder.Property(p => p.IpAddress)
            .HasMaxLength(50);

        builder.Property(p => p.UserAgent)
            .HasMaxLength(500);

        builder.Property(p => p.RefundedAmount)
            .HasPrecision(18, 2);

        // Indexes for performance
        builder.HasIndex(p => p.RazorpayOrderId).IsUnique();
        builder.HasIndex(p => p.RazorpayPaymentId);
        builder.HasIndex(p => p.OrderId);
        builder.HasIndex(p => p.Status);
        builder.HasIndex(p => p.CreatedAt);

        // Global query filter to exclude soft-deleted records
        builder.HasQueryFilter(p => !p.IsDeleted);
    }
}

public class PaymentTransactionConfiguration : IEntityTypeConfiguration<PaymentTransaction>
{
    public void Configure(EntityTypeBuilder<PaymentTransaction> builder)
    {
        builder.ToTable("PaymentTransactions");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.TransactionType)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(t => t.Details)
            .HasMaxLength(500);

        builder.Property(t => t.Amount)
            .HasPrecision(18, 2);

        // Relationships
        builder.HasOne(t => t.Payment)
            .WithMany(p => p.Transactions)
            .HasForeignKey(t => t.PaymentId)
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired(false); // Optional FK to prevent query filter warning on soft-deletable parent

        builder.HasIndex(t => t.PaymentId);
        builder.HasIndex(t => t.CreatedAt);
    }
}

public class RefundConfiguration : IEntityTypeConfiguration<Refund>
{
    public void Configure(EntityTypeBuilder<Refund> builder)
    {
        builder.ToTable("Refunds");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.RazorpayRefundId)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(r => r.Amount)
            .IsRequired()
            .HasPrecision(18, 2);

        builder.Property(r => r.Status)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(r => r.Reason)
            .HasMaxLength(500);

        builder.Property(r => r.Receipt)
            .HasMaxLength(100);

        // Relationships
        builder.HasOne(r => r.Payment)
            .WithMany(p => p.Refunds)
            .HasForeignKey(r => r.PaymentId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(r => r.RazorpayRefundId).IsUnique();
        builder.HasIndex(r => r.PaymentId);
        builder.HasIndex(r => r.Status);
    }
}