namespace FirstCry.Infrastructure.Data.Seed;

using FirstCry.Domain.Entities;
using FirstCry.Domain.Entities.Inventory;
using FirstCry.Infrastructure.Data.Context;
using Microsoft.EntityFrameworkCore;

/// <summary>
/// Ensures the catalog has at least <paramref name="targetCount"/> active products for storefront demos.
/// </summary>
public static class ExtendedCatalogSeeder
{
    private const int TargetCount = 500;

    private static readonly string[] ProductTypes =
    {
        "Premium Care Pants", "Ultra Soft Diapers", "Gentle Wipes", "Baby Lotion", "Body Wash",
        "Shampoo", "Feeding Bottle", "Teether Set", "Learning Blocks", "Rattle Toy",
        "Cotton Romper", "Baby Blanket", "Food Cereal", "Snack Pack", "Bath Tub",
        "Nail Cutter", "Water Bottle", "School Bag", "Maternity Pillow", "Moisturizing Cream",
        "Diaper Rash Cream", "Wet Wipes Pack", "Formula Stage 1", "Onesie Pack", "Socks Set",
        "Bibs Set", "Sterilizer", "Pacifier", "Sippy Cup", "Potty Trainer", "Sunscreen Lotion"
    };

    private static readonly string[] SizeLabels = { "Newborn", "Small", "Medium", "Large", "XL" };

    public static async Task EnsureAsync(ApplicationDbContext context, CancellationToken cancellationToken = default)
    {
        var currentCount = await context.Products
            .IgnoreQueryFilters()
            .CountAsync(product => !product.IsDeleted, cancellationToken);

        if (currentCount >= TargetCount)
        {
            return;
        }

        var categories = await context.Categories
            .IgnoreQueryFilters()
            .Where(category => category.IsActive && !category.IsDeleted)
            .ToListAsync(cancellationToken);

        var brands = await context.Brands
            .IgnoreQueryFilters()
            .Where(brand => brand.IsActive && !brand.IsDeleted)
            .ToListAsync(cancellationToken);

        if (categories.Count == 0 || brands.Count == 0)
        {
            return;
        }

        var existingSlugList = await context.Products
            .IgnoreQueryFilters()
            .Select(product => product.Slug)
            .ToListAsync(cancellationToken);
        var existingSlugs = existingSlugList.ToHashSet(StringComparer.OrdinalIgnoreCase);

        var random = new Random(42);
        var toCreate = TargetCount - currentCount;
        var created = new List<Product>();

        for (var i = 0; i < toCreate; i++)
        {
            var category = categories[i % categories.Count];
            var brand = brands[i % brands.Count];
            var type = ProductTypes[i % ProductTypes.Length];
            var size = SizeLabels[i % SizeLabels.Length];
            var name = $"{brand.Name} {type} {size}";
            var slug = Slugify($"{brand.Slug}-{type}-{size}-{i + currentCount + 1}");

            while (existingSlugs.Contains(slug))
            {
                slug = $"{slug}-{Guid.NewGuid():N}"[..Math.Min(80, slug.Length + 9)];
            }

            existingSlugs.Add(slug);

            var basePrice = 149m + (i % 40) * 37m + random.Next(0, 120);
            var discount = Math.Round(basePrice * (0.78m + (i % 5) * 0.04m), 0);
            var stock = 25 + (i % 18) * 12;

            var product = Product.Create(
                name,
                slug,
                $"{name} — curated for MummaXpress quick delivery.",
                $"{name} is a premium baby essential with fast doorstep delivery. Gentle, safe, and parent-trusted.",
                basePrice,
                stock,
                category.Id,
                brand.Id);

            product.Sku = $"MX-EXT-{(i + currentCount + 1):D5}";
            product.DiscountPrice = discount < basePrice ? discount : null;
            product.IsFeatured = i % 17 == 0;
            product.IsTrending = i % 11 == 0;
            product.Rating = Math.Round(4.1m + (i % 9) * 0.1m, 1);
            product.ReviewCount = 40 + (i % 200) * 3;

            var imageUrl = ProductImageSeeder.ResolvePrimaryImageUrl(
                name,
                slug,
                category.Name,
                category.Slug,
                brand.Name,
                brand.Slug);

            product.AddImage(imageUrl, name, true);

            created.Add(product);
            await context.Products.AddAsync(product, cancellationToken);

            if ((i + 1) % 100 == 0)
            {
                await context.SaveChangesAsync(cancellationToken);
            }
        }

        await context.SaveChangesAsync(cancellationToken);

        foreach (var product in created)
        {
            var hasInventory = await context.Inventories
                .AnyAsync(inv => inv.ProductId == product.Id, cancellationToken);

            if (!hasInventory)
            {
                await context.Inventories.AddAsync(
                    Inventory.Create(product.Id, initialQuantity: Math.Max(product.StockQuantity, 1), reorderLevel: 10),
                    cancellationToken);
            }
        }

        await context.SaveChangesAsync(cancellationToken);
        Console.WriteLine($"Extended catalog seeding added {created.Count} products (total target: {TargetCount}).");
    }

    private static string Slugify(string value)
    {
        var chars = value
            .ToLowerInvariant()
            .Select(ch => char.IsLetterOrDigit(ch) ? ch : '-')
            .ToArray();
        var slug = new string(chars);
        while (slug.Contains("--", StringComparison.Ordinal))
        {
            slug = slug.Replace("--", "-", StringComparison.Ordinal);
        }

        return slug.Trim('-');
    }
}
