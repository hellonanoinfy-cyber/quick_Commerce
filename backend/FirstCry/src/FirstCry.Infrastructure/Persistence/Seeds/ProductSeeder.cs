namespace FirstCry.Infrastructure.Persistence.Seeds;

using FirstCry.Domain.Entities;
using FirstCry.Infrastructure.Data.Context;
using Microsoft.EntityFrameworkCore;

public class ProductSeeder
{
    private const int TargetProductCount = 500;
    private const string ProductImageFallback = "/images/product-placeholder.png";

    private static readonly Dictionary<string, ProductImageRule[]> ProductImageCatalog = new(StringComparer.OrdinalIgnoreCase)
    {
        ["fashion"] = new[]
        {
            new ProductImageRule(new[] { "shoe", "booties", "socks" }, new[] { "photo-1569974641446-22542de88536", "photo-1622290319146-7b63df48a635" }),
            new ProductImageRule(new[] { "dress", "kurta", "festive", "party" }, new[] { "photo-1560506840-ec148e82a604", "photo-1766918780914-5df4a5a98c44", "photo-1622290319146-7b63df48a635" }),
            new ProductImageRule(new[] { "romper", "dungaree", "night", "hoodie", "t-shirt", "cotton", "swaddle" }, new[] { "photo-1766918780914-5df4a5a98c44", "photo-1560506840-ec148e82a604", "photo-1622290319146-7b63df48a635" }),
            new ProductImageRule(Array.Empty<string>(), new[] { "photo-1766918780914-5df4a5a98c44", "photo-1560506840-ec148e82a604", "photo-1622290319146-7b63df48a635" })
        },
        ["toys"] = new[]
        {
            new ProductImageRule(new[] { "plush", "comfort", "bear" }, new[] { "photo-1559454403-b8fb88521f11", "photo-1501686637-b7aa9c48a882" }),
            new ProductImageRule(new[] { "blocks", "stem", "puzzle", "sorter", "cube" }, new[] { "photo-1501686637-b7aa9c48a882", "photo-1484820540004-14229fe36ca4", "photo-1504484656217-38f8ffc617f9" }),
            new ProductImageRule(new[] { "rattle", "musical", "kitchen", "play" }, new[] { "photo-1504484656217-38f8ffc617f9", "photo-1582845512747-e42001c95638", "photo-1559454403-b8fb88521f11" }),
            new ProductImageRule(Array.Empty<string>(), new[] { "photo-1559454403-b8fb88521f11", "photo-1484820540004-14229fe36ca4", "photo-1582845512747-e42001c95638" })
        },
        ["baby-care"] = new[]
        {
            new ProductImageRule(new[] { "diaper", "wipes", "nappy" }, new[] { "photo-1584839404042-8bc21d240e91", "photo-1573662012516-5cb4399006e7" }),
            new ProductImageRule(new[] { "lotion", "cream", "shampoo", "bath", "rash", "nail" }, new[] { "photo-1582452721681-c56a89a8280a", "photo-1584839404042-8bc21d240e91" }),
            new ProductImageRule(new[] { "swaddle", "cotton" }, new[] { "photo-1766918780914-5df4a5a98c44", "photo-1573662012516-5cb4399006e7" }),
            new ProductImageRule(Array.Empty<string>(), new[] { "photo-1582452721681-c56a89a8280a", "photo-1584839404042-8bc21d240e91", "photo-1573662012516-5cb4399006e7" })
        },
        ["school"] = new[]
        {
            new ProductImageRule(new[] { "bag", "backpack", "rain cover" }, new[] { "photo-1726726192148-af52008ff663", "photo-1535982330050-f1c2fb79ff78" }),
            new ProductImageRule(new[] { "lunch", "bottle" }, new[] { "photo-1632142334511-8f24c3d3ae79", "photo-1726726192148-af52008ff663" }),
            new ProductImageRule(new[] { "stationery", "pencil", "art", "craft", "case", "lamp" }, new[] { "photo-1456735190827-d1262f71b8a3", "photo-1535982330050-f1c2fb79ff78" }),
            new ProductImageRule(Array.Empty<string>(), new[] { "photo-1726726192148-af52008ff663", "photo-1456735190827-d1262f71b8a3", "photo-1632142334511-8f24c3d3ae79" })
        },
        ["mom-care"] = new[]
        {
            new ProductImageRule(new[] { "maternity", "support", "stretch", "prenatal", "pregnancy", "postnatal" }, new[] { "photo-1457342813143-a1ae27448a82", "photo-1544784179-ae1535e9f013", "photo-1678739201887-34001155c5e0" }),
            new ProductImageRule(new[] { "nursing", "feeding", "hospital", "wellness", "journal" }, new[] { "photo-1493101670003-a9c7db5858b2", "photo-1457342813143-a1ae27448a82", "photo-1544784179-ae1535e9f013" }),
            new ProductImageRule(Array.Empty<string>(), new[] { "photo-1457342813143-a1ae27448a82", "photo-1544784179-ae1535e9f013", "photo-1493101670003-a9c7db5858b2" })
        },
        ["food"] = new[]
        {
            new ProductImageRule(new[] { "cereal", "porridge", "puree", "millet", "food jar", "weaning" }, new[] { "photo-1550461716-dbf266b2a8a7", "photo-1600984177310-c86c8f8fa9c7", "photo-1652480247284-a7ca2c1ffecc" }),
            new ProductImageRule(new[] { "snack", "fruit", "dry fruit", "bowl" }, new[] { "photo-1600984177310-c86c8f8fa9c7", "photo-1550461716-dbf266b2a8a7", "photo-1597178380795-38c56a1a7053" }),
            new ProductImageRule(Array.Empty<string>(), new[] { "photo-1550461716-dbf266b2a8a7", "photo-1600984177310-c86c8f8fa9c7", "photo-1652480247284-a7ca2c1ffecc" })
        },
        ["furniture"] = new[]
        {
            new ProductImageRule(new[] { "crib", "cot", "safety rail", "nursery" }, new[] { "photo-1710593668545-ed8272289743", "photo-1766918780914-5df4a5a98c44" }),
            new ProductImageRule(new[] { "feeding", "chair", "rocking" }, new[] { "photo-1597178380795-38c56a1a7053", "photo-1710593668545-ed8272289743" }),
            new ProductImageRule(new[] { "study", "table", "organizer", "storage", "rack" }, new[] { "photo-1535982330050-f1c2fb79ff78", "photo-1456735190827-d1262f71b8a3" }),
            new ProductImageRule(Array.Empty<string>(), new[] { "photo-1710593668545-ed8272289743", "photo-1597178380795-38c56a1a7053", "photo-1535982330050-f1c2fb79ff78" })
        },
        ["pharmacy"] = new[]
        {
            new ProductImageRule(new[] { "thermometer", "first aid", "vitamin", "medicine", "nasal", "oral" }, new[] { "photo-1600091474842-83bb9c05a723" }),
            new ProductImageRule(new[] { "cotton", "vapour", "repellent", "health" }, new[] { "photo-1600091474842-83bb9c05a723", "photo-1582452721681-c56a89a8280a" }),
            new ProductImageRule(Array.Empty<string>(), new[] { "photo-1600091474842-83bb9c05a723", "photo-1582452721681-c56a89a8280a" })
        }
    };

    public static async Task SeedAsync(ApplicationDbContext context)
    {
        var categoriesMap = await SeedCategoriesAsync(context);
        var brandsMap = await SeedBrandsAsync(context);

        var currentProductCount = await context.Products.CountAsync();
        if (currentProductCount >= TargetProductCount)
        {
            // Products already seeded — only add images to products that have none
            await NormalizeProductsWithoutImages(context);
            return;
        }

        // First run: only normalize products that have no images yet (safe)
        await NormalizeProductsWithoutImages(context);

        var products = GenerateProducts(categoriesMap, brandsMap, TargetProductCount - currentProductCount, currentProductCount);
        await context.Products.AddRangeAsync(products);
        await context.SaveChangesAsync();

        Console.WriteLine($"Seeded {products.Count} products. Catalog now has at least {TargetProductCount} products.");
    }

    /// <summary>
    /// Only updates products that have zero images — never touches existing image rows.
    /// This prevents EF Core optimistic concurrency exceptions on startup.
    /// </summary>
    private static async Task NormalizeProductsWithoutImages(ApplicationDbContext context)
    {
        var productsWithoutImages = await context.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Where(p => !p.Images.Any())
            .ToListAsync();

        if (productsWithoutImages.Count == 0) return;

        foreach (var product in productsWithoutImages)
        {
            var imageUrls = ResolveProductImages(
                product.Category?.Slug,
                product.Name,
                product.IsFeatured,
                product.IsTrending);
            ApplyProductImages(product, imageUrls);
        }

        await context.SaveChangesAsync();
    }

    private static async Task<Dictionary<string, Category>> SeedCategoriesAsync(ApplicationDbContext context)
    {
        var categoryData = new[]
        {
            ("Fashion", "fashion", "/images/catalog/fashion.svg"),
            ("Toys", "toys", "/images/catalog/toys.svg"),
            ("Baby Care", "baby-care", "/images/catalog/baby-care.svg"),
            ("School", "school", "/images/catalog/school.svg"),
            ("Mom Care", "mom-care", "/images/catalog/mom-care.svg"),
            ("Food", "food", "/images/catalog/food.svg"),
            ("Furniture", "furniture", "/images/catalog/furniture.svg"),
            ("Pharmacy", "pharmacy", "/images/catalog/pharmacy.svg")
        };

        var existing = await context.Categories.ToDictionaryAsync(c => c.Slug);
        foreach (var (name, slug, imageUrl) in categoryData)
        {
            if (existing.TryGetValue(slug, out var category))
            {
                category.Name = name;
                category.ImageUrl = imageUrl;
                category.IsActive = true;
            }
        }

        var missing = categoryData
            .Where(c => !existing.ContainsKey(c.Item2))
            .Select(c => Category.Create(c.Item1, c.Item2, c.Item3))
            .ToList();

        if (missing.Count > 0)
        {
            await context.Categories.AddRangeAsync(missing);
            await context.SaveChangesAsync();
        }

        return await context.Categories
            .Where(c => categoryData.Select(item => item.Item2).Contains(c.Slug))
            .ToDictionaryAsync(c => c.Slug);
    }

    private static async Task NormalizeExistingProductImagesAsync(ApplicationDbContext context)
    {
        var products = await context.Products
            .Include(product => product.Category)
            .Include(product => product.Images)
            .ToListAsync();

        foreach (var product in products)
        {
            var imageUrls = ResolveProductImages(
                product.Category?.Slug,
                product.Name,
                product.IsFeatured,
                product.IsTrending);
            ApplyProductImages(product, imageUrls);
        }

        await context.SaveChangesAsync();
    }

    private static async Task<Dictionary<string, Brand>> SeedBrandsAsync(ApplicationDbContext context)
    {
        var brandNames = new[] { "Mothercare", "Carters", "HM Kids", "FirstCry", "Hopscotch", "Fisher Price", "LEGO", "Himalaya", "Mamaearth", "Babyhug" };
        var existing = await context.Brands.ToDictionaryAsync(b => b.Slug);
        var missing = brandNames
            .Select(name => (Name: name, Slug: ToSlug(name)))
            .Where(brand => !existing.ContainsKey(brand.Slug))
            .Select(brand => Brand.Create(brand.Name, brand.Slug))
            .ToList();

        if (missing.Count > 0)
        {
            await context.Brands.AddRangeAsync(missing);
            await context.SaveChangesAsync();
        }

        return await context.Brands
            .Where(b => brandNames.Select(ToSlug).Contains(b.Slug))
            .ToDictionaryAsync(b => b.Slug);
    }

    private static List<Product> GenerateProducts(Dictionary<string, Category> catMap, Dictionary<string, Brand> brandMap, int count, int offset)
    {
        var products = new List<Product>();
        var brands = brandMap.Values.OrderBy(b => b.Name).ToList();
        var catalog = new Dictionary<string, string[]>
        {
            ["fashion"] = new[] { "Organic Cotton Romper", "Printed Party Dress", "Soft Denim Dungaree", "Breathable Night Suit", "Winter Hoodie Set", "Anti Slip Booties", "Festive Kurta Set", "Everyday T-Shirt Pack" },
            ["toys"] = new[] { "Stacking Blocks", "Musical Activity Cube", "Shape Sorter", "Plush Comfort Toy", "STEM Building Set", "Wooden Puzzle Board", "Rattle Gift Set", "Pretend Play Kitchen" },
            ["baby-care"] = new[] { "Gentle Baby Lotion", "Ultra Soft Diaper Pack", "Tear Free Shampoo", "Baby Wipes Combo", "Bath Essentials Kit", "Rash Protection Cream", "Cotton Swaddle Set", "Nail Care Kit" },
            ["school"] = new[] { "Ergonomic School Bag", "Insulated Lunch Box", "Stationery Starter Kit", "Water Bottle Set", "Art and Craft Pack", "Pencil Case Combo", "Homework Desk Lamp", "Rain Cover Backpack" },
            ["mom-care"] = new[] { "Maternity Support Belt", "Nursing Pillow", "Stretch Mark Cream", "Prenatal Wellness Kit", "Comfort Feeding Cover", "Hospital Bag Organizer", "Postnatal Care Kit", "Pregnancy Journal" },
            ["food"] = new[] { "Multigrain Cereal", "Fruit Puree Pack", "Rice Porridge Mix", "Toddler Snack Box", "Organic Millet Blend", "Stage One Food Jar", "Dry Fruit Powder", "Weaning Bowl Combo" },
            ["furniture"] = new[] { "Convertible Baby Crib", "Feeding High Chair", "Kids Study Table", "Toy Organizer", "Bedside Safety Rail", "Foldable Baby Cot", "Nursery Storage Rack", "Toddler Rocking Chair" },
            ["pharmacy"] = new[] { "Digital Thermometer", "Baby Nasal Aspirator", "First Aid Kit", "Vitamin Drops", "Sterile Cotton Roll", "Vapour Patch Pack", "Baby Oral Care Kit", "Mosquito Repellent Roll On" }
        };

        var categorySlugs = catalog.Keys.ToList();

        for (var i = 0; i < count; i++)
        {
            var sequence = offset + i + 1;
            var categorySlug = categorySlugs[sequence % categorySlugs.Count];
            var category = catMap[categorySlug];
            var brand = brands[sequence % brands.Count];
            var title = catalog[categorySlug][sequence % catalog[categorySlug].Length];
            var name = $"{brand.Name} {title}";
            var sku = $"FC-{categorySlug.Replace("-", "").ToUpperInvariant()}-{sequence:0000}";
            var price = 199 + ((sequence * 137) % 7800);
            var discountPercent = 10 + (sequence % 6) * 5;
            var discountPrice = Math.Round(price - (price * discountPercent / 100m), 2);
            var rating = Math.Round(3.8m + ((sequence % 13) * 0.09m), 1);

            var product = Product.Create(
                name,
                $"{ToSlug(name)}-{sequence:0000}",
                $"{brand.Name} {title} for everyday family needs.",
                $"{brand.Name} {title} is curated for quick-commerce shoppers who need reliable quality, clear pricing, and fast doorstep delivery. Built for comfort, safety, and daily use across modern parenting routines.",
                price,
                25 + (sequence * 11) % 475,
                category.Id,
                brand.Id
            );

            product.Sku = sku;
            product.DiscountPrice = discountPrice;
            product.IsFeatured = sequence % 3 == 0 || sequence % 10 == 0;
            product.IsTrending = sequence % 4 == 0 || sequence % 9 == 0;
            product.Rating = rating;
            product.ReviewCount = 18 + (sequence * 17) % 950;
            var imageUrls = ResolveProductImages(categorySlug, name, product.IsFeatured, product.IsTrending);
            ApplyProductImages(product, imageUrls);
            product.AddTag(category.Name);
            product.AddTag(brand.Name);

            products.Add(product);
        }

        return products;
    }

    private static string ToSlug(string value)
    {
        return value
            .ToLowerInvariant()
            .Replace("&", "and")
            .Replace("'", "")
            .Replace(" ", "-");
    }

    private static void ApplyProductImages(Product product, IReadOnlyList<string> imageUrls)
    {
        var safeUrls = imageUrls.Count > 0 ? imageUrls : new[] { ProductImageFallback };
        var existingImages = product.Images.OrderBy(image => image.DisplayOrder).ToList();

        if (existingImages.Count == 0)
        {
            for (var i = 0; i < safeUrls.Count; i++)
            {
                product.AddImage(safeUrls[i], product.Name, i == 0);
            }

            return;
        }

        for (var i = 0; i < existingImages.Count; i++)
        {
            existingImages[i].Url = safeUrls[i % safeUrls.Count];
            existingImages[i].AltText = product.Name;
            existingImages[i].IsPrimary = i == 0;
            existingImages[i].DisplayOrder = i + 1;
        }

        for (var i = existingImages.Count; i < safeUrls.Count; i++)
        {
            product.AddImage(safeUrls[i], product.Name, false);
        }
    }

    private static IReadOnlyList<string> ResolveProductImages(string? categorySlug, string productName, bool isFeatured, bool isTrending)
    {
        var desiredCount = isFeatured || isTrending ? 3 : 2;
        var slug = string.IsNullOrWhiteSpace(categorySlug) ? "baby-care" : categorySlug;

        if (!ProductImageCatalog.TryGetValue(slug, out var rules))
        {
            rules = ProductImageCatalog["baby-care"];
        }

        var productText = productName.ToLowerInvariant();
        var matchedRule = rules.FirstOrDefault(rule =>
            rule.Keywords.Length == 0 ||
            rule.Keywords.Any(keyword => productText.Contains(keyword, StringComparison.OrdinalIgnoreCase)));

        var photoIds = new List<string>(matchedRule?.PhotoIds ?? Array.Empty<string>());
        photoIds.AddRange(rules.SelectMany(rule => rule.PhotoIds));

        var distinctUrls = photoIds
            .Where(id => !string.IsNullOrWhiteSpace(id))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Select(ToUnsplashImageUrl)
            .ToList();

        if (distinctUrls.Count == 0)
        {
            return new[] { ProductImageFallback };
        }

        var start = StableIndex($"{slug}:{productName}", distinctUrls.Count);
        return Enumerable.Range(0, Math.Min(desiredCount, distinctUrls.Count))
            .Select(index => distinctUrls[(start + index) % distinctUrls.Count])
            .ToList();
    }

    private static string ToUnsplashImageUrl(string photoId)
    {
        return $"https://images.unsplash.com/{photoId}?auto=format&fit=crop&w=400&q=70";
    }

    private static int StableIndex(string value, int modulo)
    {
        if (modulo <= 1) return 0;

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

    private sealed record ProductImageRule(string[] Keywords, string[] PhotoIds);
}
