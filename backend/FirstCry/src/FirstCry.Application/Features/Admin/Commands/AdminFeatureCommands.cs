using FirstCry.Application.Common.Interfaces;
using FirstCry.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FirstCry.Application.Features.Admin.Commands;

#region Categories

public record CreateCategoryCommand(
    string Name,
    string Slug,
    string? Description,
    Guid? ParentCategoryId,
    string? ImageUrl,
    int DisplayOrder,
    bool IsActive
) : IRequest<Guid>;

public class CreateCategoryCommandHandler : IRequestHandler<CreateCategoryCommand, Guid>
{
    private readonly IUnitOfWork _unitOfWork;

    public CreateCategoryCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = Category.Create(
            request.Name,
            request.Slug,
            request.Description,
            request.ImageUrl,
            request.DisplayOrder
        );

        category.ParentCategoryId = request.ParentCategoryId;

        category.IsActive = request.IsActive;

        await _unitOfWork.Categories.AddAsync(category, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return category.Id;
    }
}

public record UpdateCategoryCommand(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    Guid? ParentCategoryId,
    string? ImageUrl,
    int DisplayOrder,
    bool IsActive
) : IRequest<bool>;

public class UpdateCategoryCommandHandler : IRequestHandler<UpdateCategoryCommand, bool>
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdateCategoryCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(UpdateCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await _unitOfWork.Categories.GetByIdAsync(request.Id, cancellationToken);
        if (category == null) return false;

        category.Name = request.Name;
        category.Slug = request.Slug;
        category.Description = request.Description;
        category.ParentCategoryId = request.ParentCategoryId;
        category.ImageUrl = request.ImageUrl;
        category.DisplayOrder = request.DisplayOrder;
        category.IsActive = request.IsActive;

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}

public record DeleteCategoryCommand(Guid Id) : IRequest<bool>;

public class DeleteCategoryCommandHandler : IRequestHandler<DeleteCategoryCommand, bool>
{
    private readonly IUnitOfWork _unitOfWork;

    public DeleteCategoryCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeleteCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await _unitOfWork.Categories.GetByIdAsync(request.Id, cancellationToken);
        if (category == null) return false;

        // Check if category has products
        var hasProducts = await _unitOfWork.Products.GetQueryable()
            .AnyAsync(p => p.CategoryId == request.Id && !p.IsDeleted, cancellationToken);

        if (hasProducts)
        {
            // Soft delete - just deactivate
            category.IsActive = false;
        }
        else
        {
            // Hard delete if no products
            await _unitOfWork.Categories.DeleteAsync(category, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}

#endregion

#region Coupons

public record CreateCouponCommand(
    string Code,
    string Type,
    decimal Value,
    decimal? MinOrderAmount,
    decimal? MaxDiscountAmount,
    int? UsageLimit,
    int? MaxUsesPerUser,
    DateTime? StartDate,
    DateTime ExpiresAt,
    bool IsActive
) : IRequest<Guid>;

public class CreateCouponCommandHandler : IRequestHandler<CreateCouponCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateCouponCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateCouponCommand request, CancellationToken cancellationToken)
    {
        // Check if coupon code already exists
        var exists = await _context.Coupons.AnyAsync(c => c.Code == request.Code, cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("Coupon code already exists.");
        }

        var coupon = new Coupon
        {
            Id = Guid.NewGuid(),
            Code = request.Code.ToUpperInvariant(),
            Type = Enum.Parse<CouponType>(request.Type, true),
            Value = request.Value,
            MinOrderAmount = request.MinOrderAmount,
            MaxDiscountAmount = request.MaxDiscountAmount,
            UsageLimit = request.UsageLimit ?? 0,
            MaxUsesPerUser = request.MaxUsesPerUser,
            StartDate = request.StartDate ?? DateTime.UtcNow,
            ExpiresAt = request.ExpiresAt,
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        _context.Coupons.Add(coupon);
        await _context.SaveChangesAsync(cancellationToken);

        return coupon.Id;
    }
}

public record UpdateCouponCommand(
    Guid Id,
    string Code,
    string Type,
    decimal Value,
    decimal? MinOrderAmount,
    decimal? MaxDiscountAmount,
    int? UsageLimit,
    int? MaxUsesPerUser,
    DateTime? StartDate,
    DateTime ExpiresAt,
    bool IsActive
) : IRequest<bool>;

public class UpdateCouponCommandHandler : IRequestHandler<UpdateCouponCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public UpdateCouponCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateCouponCommand request, CancellationToken cancellationToken)
    {
        var coupon = await _context.Coupons.FindAsync(new object[] { request.Id }, cancellationToken);
        if (coupon == null) return false;

        coupon.Code = request.Code.ToUpperInvariant();
        coupon.Type = Enum.Parse<CouponType>(request.Type, true);
        coupon.Value = request.Value;
        coupon.MinOrderAmount = request.MinOrderAmount;
        coupon.MaxDiscountAmount = request.MaxDiscountAmount;
        coupon.UsageLimit = request.UsageLimit ?? 0;
        coupon.MaxUsesPerUser = request.MaxUsesPerUser;
        coupon.StartDate = request.StartDate ?? DateTime.UtcNow;
        coupon.ExpiresAt = request.ExpiresAt;
        coupon.IsActive = request.IsActive;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}

public record DeleteCouponCommand(Guid Id) : IRequest<bool>;

public class DeleteCouponCommandHandler : IRequestHandler<DeleteCouponCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public DeleteCouponCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteCouponCommand request, CancellationToken cancellationToken)
    {
        var coupon = await _context.Coupons.FindAsync(new object[] { request.Id }, cancellationToken);
        if (coupon == null) return false;

        _context.Coupons.Remove(coupon);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}

#endregion

#region Banners

public record CreateBannerCommand(
    string Title,
    string? Subtitle,
    string ImageUrl,
    string? TargetUrl,
    string? TargetType,
    int DisplayOrder,
    bool IsActive,
    DateTime? StartDate,
    DateTime? EndDate
) : IRequest<Guid>;

public class CreateBannerCommandHandler : IRequestHandler<CreateBannerCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateBannerCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateBannerCommand request, CancellationToken cancellationToken)
    {
        var banner = new Banner
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Subtitle = request.Subtitle,
            ImageUrl = request.ImageUrl,
            TargetUrl = request.TargetUrl,
            TargetType = request.TargetType,
            DisplayOrder = request.DisplayOrder,
            IsActive = request.IsActive,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            ClickCount = 0,
            CreatedAt = DateTime.UtcNow
        };

        _context.Banners.Add(banner);
        await _context.SaveChangesAsync(cancellationToken);

        return banner.Id;
    }
}

public record UpdateBannerCommand(
    Guid Id,
    string Title,
    string? Subtitle,
    string ImageUrl,
    string? TargetUrl,
    string? TargetType,
    int DisplayOrder,
    bool IsActive,
    DateTime? StartDate,
    DateTime? EndDate
) : IRequest<bool>;

public class UpdateBannerCommandHandler : IRequestHandler<UpdateBannerCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public UpdateBannerCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateBannerCommand request, CancellationToken cancellationToken)
    {
        var banner = await _context.Banners.FindAsync(new object[] { request.Id }, cancellationToken);
        if (banner == null) return false;

        banner.Title = request.Title;
        banner.Subtitle = request.Subtitle;
        banner.ImageUrl = request.ImageUrl;
        banner.TargetUrl = request.TargetUrl;
        banner.TargetType = request.TargetType;
        banner.DisplayOrder = request.DisplayOrder;
        banner.IsActive = request.IsActive;
        banner.StartDate = request.StartDate;
        banner.EndDate = request.EndDate;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}

public record DeleteBannerCommand(Guid Id) : IRequest<bool>;

public class DeleteBannerCommandHandler : IRequestHandler<DeleteBannerCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public DeleteBannerCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteBannerCommand request, CancellationToken cancellationToken)
    {
        var banner = await _context.Banners.FindAsync(new object[] { request.Id }, cancellationToken);
        if (banner == null) return false;

        _context.Banners.Remove(banner);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}

#endregion
