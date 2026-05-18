namespace FirstCry.Infrastructure.Data.Seed;

using FirstCry.Domain.Entities;
using FirstCry.Infrastructure.Data.Context;
using Microsoft.EntityFrameworkCore;

public static class ProductImageSeeder
{
    private static readonly ImageRule[] ImageRules =
    {
        new(new[] { "diaper", "diapers", "nappy", "pants", "wipes" }, new[]
        {
            "photo-1584839404042-8bc21d240e91",
            "photo-1573662012516-5cb4399006e7",
            "photo-1582452721681-c56a89a8280a"
        }),
        new(new[] { "lotion", "shampoo", "body wash", "cream", "skin", "rash", "sebamed", "johnson", "himalaya", "mamaearth" }, new[]
        {
            "photo-1582452721681-c56a89a8280a",
            "photo-1584839404042-8bc21d240e91",
            "photo-1573662012516-5cb4399006e7"
        }),
        new(new[] { "feeding", "bottle", "bowl", "teether", "weaning" }, new[]
        {
            "photo-1597178380795-38c56a1a7053",
            "photo-1632142334511-8f24c3d3ae79",
            "photo-1600984177310-c86c8f8fa9c7"
        }),
        new(new[] { "toy", "rattle", "blocks", "learning", "puzzle", "stroller toy", "fisher", "lego" }, new[]
        {
            "photo-1504484656217-38f8ffc617f9",
            "photo-1501686637-b7aa9c48a882",
            "photo-1484820540004-14229fe36ca4"
        }),
        new(new[] { "romper", "clothing", "cotton", "blanket", "fashion", "dress", "hoodie", "t-shirt", "sneakers", "footwear", "shoe" }, new[]
        {
            "photo-1766918780914-5df4a5a98c44",
            "photo-1560506840-ec148e82a604",
            "photo-1622290319146-7b63df48a635"
        }),
        new(new[] { "food", "cereal", "porridge", "puree", "millet", "snack" }, new[]
        {
            "photo-1550461716-dbf266b2a8a7",
            "photo-1600984177310-c86c8f8fa9c7",
            "photo-1652480247284-a7ca2c1ffecc"
        }),
        new(new[] { "bath", "tub", "nail", "hygiene", "cutter" }, new[]
        {
            "photo-1582452721681-c56a89a8280a",
            "photo-1584839404042-8bc21d240e91",
            "photo-1573662012516-5cb4399006e7"
        }),
        new(new[] { "school", "water bottle", "bag", "stationery", "pencil", "lunch" }, new[]
        {
            "photo-1726726192148-af52008ff663",
            "photo-1632142334511-8f24c3d3ae79",
            "photo-1535982330050-f1c2fb79ff78"
        }),
        new(new[] { "maternity", "pillow", "pregnancy", "nursing", "mom" }, new[]
        {
            "photo-1457342813143-a1ae27448a82",
            "photo-1544784179-ae1535e9f013",
            "photo-1493101670003-a9c7db5858b2"
        }),
        new(new[] { "crib", "cot", "chair", "furniture", "organizer", "table" }, new[]
        {
            "photo-1710593668545-ed8272289743",
            "photo-1597178380795-38c56a1a7053",
            "photo-1535982330050-f1c2fb79ff78"
        }),
        new(Array.Empty<string>(), new[]
        {
            "photo-1584839404042-8bc21d240e91",
            "photo-1504484656217-38f8ffc617f9",
            "photo-1766918780914-5df4a5a98c44"
        })
    };

    public static string ResolvePrimaryImageUrl(
        string productName,
        string productSlug,
        string? categoryName = null,
        string? categorySlug = null,
        string? brandName = null,
        string? brandSlug = null)
    {
        return ResolveImageUrls(productName, productSlug, categoryName, categorySlug, brandName, brandSlug)[0];
    }

    /// <summary>
    /// Backfills products that have no images or only broken/placeholder URLs.
    /// </summary>
    public static Task EnsureAllProductsHaveImagesAsync(
        ApplicationDbContext context,
        CancellationToken cancellationToken = default) =>
        NormalizeAsync(context, onlyMissingOrBroken: true, cancellationToken);

    public static async Task NormalizeAsync(
        ApplicationDbContext context,
        bool onlyMissingOrBroken = false,
        CancellationToken cancellationToken = default)
    {
        var products = await context.Products
            .IgnoreQueryFilters()
            .Include(product => product.Category)
            .Include(product => product.Brand)
            .Where(product => !product.IsDeleted)
            .ToListAsync(cancellationToken);

        var productIds = products.Select(product => product.Id).ToList();
        var imagesByProductId = await context.ProductImages
            .Where(image => image.ProductId.HasValue && productIds.Contains(image.ProductId.Value))
            .OrderBy(image => image.DisplayOrder)
            .ThenBy(image => image.CreatedAt)
            .GroupBy(image => image.ProductId!.Value)
            .ToDictionaryAsync(group => group.Key, group => group.ToList(), cancellationToken);

        var changed = 0;

        foreach (var product in products)
        {
            imagesByProductId.TryGetValue(product.Id, out var productImages);
            productImages ??= new List<ProductImage>();

            if (HasProtectedImage(productImages))
            {
                continue;
            }

            if (onlyMissingOrBroken && !NeedsImageRepair(productImages))
            {
                continue;
            }

            var imageUrls = ResolveImageUrls(product);
            var existingImages = productImages.OrderBy(image => image.DisplayOrder).ToList();

            if (existingImages.Count == 0)
            {
                for (var i = 0; i < imageUrls.Count; i++)
                {
                    context.ProductImages.Add(ProductImage.Create(product.Id, imageUrls[i], product.Name, i == 0, i + 1));
                }

                changed++;
                continue;
            }

            for (var i = 0; i < existingImages.Count; i++)
            {
                var nextUrl = imageUrls[i % imageUrls.Count];
                var shouldBePrimary = i == 0;
                var image = existingImages[i];

                if (image.Url != nextUrl ||
                    image.AltText != product.Name ||
                    image.IsPrimary != shouldBePrimary ||
                    image.DisplayOrder != i + 1)
                {
                    image.Url = nextUrl;
                    image.AltText = product.Name;
                    image.IsPrimary = shouldBePrimary;
                    image.DisplayOrder = i + 1;
                    image.UpdatedAt = DateTime.UtcNow;
                    changed++;
                }
            }

            for (var i = existingImages.Count; i < Math.Min(imageUrls.Count, 3); i++)
            {
                context.ProductImages.Add(ProductImage.Create(product.Id, imageUrls[i], product.Name, false, i + 1));
                changed++;
            }
        }

        if (changed > 0)
        {
            await context.SaveChangesAsync(cancellationToken);
        }

        Console.WriteLine($"Product image normalization completed. Updated or added {changed} image rows.");
    }

    private static IReadOnlyList<string> ResolveImageUrls(Product product)
    {
        return ResolveImageUrls(
            product.Name,
            product.Slug,
            product.Category?.Name,
            product.Category?.Slug,
            product.Brand?.Name,
            product.Brand?.Slug);
    }

    private static IReadOnlyList<string> ResolveImageUrls(
        string productName,
        string productSlug,
        string? categoryName,
        string? categorySlug,
        string? brandName,
        string? brandSlug)
    {
        var searchableText = string.Join(' ', new[]
        {
            productName,
            productSlug,
            categoryName,
            categorySlug,
            brandName,
            brandSlug
        }.Where(value => !string.IsNullOrWhiteSpace(value))).ToLowerInvariant();

        var rule = ImageRules.FirstOrDefault(candidate =>
            candidate.Keywords.Length == 0 ||
            candidate.Keywords.Any(keyword => searchableText.Contains(keyword, StringComparison.OrdinalIgnoreCase)))
            ?? ImageRules[^1];

        var urls = rule.PhotoIds
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Select(ToUnsplashImageUrl)
            .ToList();

        var start = StableIndex($"{productSlug}:{productName}", urls.Count);
        return Enumerable.Range(0, urls.Count)
            .Select(index => urls[(start + index) % urls.Count])
            .ToList();
    }

    private static bool NeedsImageRepair(IReadOnlyList<ProductImage> images)
    {
        if (images.Count == 0)
        {
            return true;
        }

        var primary = images.FirstOrDefault(image => image.IsPrimary)
            ?? images.OrderBy(image => image.DisplayOrder).First();

        return IsBrokenCatalogImageUrl(primary.Url);
    }

    private static bool IsBrokenCatalogImageUrl(string? url)
    {
        if (string.IsNullOrWhiteSpace(url))
        {
            return true;
        }

        if (url.StartsWith('/'))
        {
            return true;
        }

        if (url.EndsWith(".svg", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        if (url.Contains("placehold.co", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        return !Uri.TryCreate(url, UriKind.Absolute, out _);
    }

    private static bool HasProtectedImage(IEnumerable<ProductImage> images)
    {
        return images.Any(image =>
        {
            if (string.IsNullOrWhiteSpace(image.Url) || image.Url.StartsWith('/'))
            {
                return false;
            }

            if (!Uri.TryCreate(image.Url, UriKind.Absolute, out var uri))
            {
                return false;
            }

            return uri.Host.Equals("res.cloudinary.com", StringComparison.OrdinalIgnoreCase)
                || uri.Host.EndsWith(".amazonaws.com", StringComparison.OrdinalIgnoreCase)
                || uri.Host.EndsWith(".cloudfront.net", StringComparison.OrdinalIgnoreCase);
        });
    }

    private static string ToUnsplashImageUrl(string photoId)
    {
        return $"https://images.unsplash.com/{photoId}?auto=format&fit=crop&w=900&q=85";
    }

    private static int StableIndex(string value, int modulo)
    {
        if (modulo <= 1)
        {
            return 0;
        }

        unchecked
        {
            var hash = 17;
            foreach (var character in value)
            {
                hash = hash * 31 + character;
            }

            return (hash & int.MaxValue) % modulo;
        }
    }

    private sealed record ImageRule(string[] Keywords, string[] PhotoIds);
}
