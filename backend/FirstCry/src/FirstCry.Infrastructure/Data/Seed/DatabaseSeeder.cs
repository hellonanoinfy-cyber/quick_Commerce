namespace FirstCry.Infrastructure.Data.Seed;

using FirstCry.Domain.Entities;
using FirstCry.Domain.Entities.Inventory;
using FirstCry.Infrastructure.Data.Context;
using Microsoft.EntityFrameworkCore;

public static class DatabaseSeeder
{
    private static readonly CatalogCategory[] Categories =
    {
        new("Diapers & Wipes", "diapers-and-wipes", "Everyday diapering and wipe essentials.", "/images/catalog/diapers-wipes.svg", 1, true),
        new("Baby Food", "baby-food", "Nutritious first foods, cereals, and toddler snacks.", "/images/catalog/baby-food.svg", 2, true),
        new("Baby Skin Care", "baby-skin-care", "Gentle bath, lotion, cream, and hygiene care.", "/images/catalog/baby-skin-care.svg", 3, true),
        new("Toys", "toys", "Rattles, learning toys, and playtime favorites.", "/images/catalog/toys.svg", 4, true),
        new("Baby Clothing", "baby-clothing", "Soft rompers, blankets, and everyday clothing.", "/images/catalog/baby-clothing.svg", 5, true),
        new("Feeding Essentials", "feeding-essentials", "Bottles, bowls, teethers, and feeding accessories.", "/images/catalog/feeding-essentials.svg", 6, true),
        new("Bath & Hygiene", "bath-and-hygiene", "Bath tubs, nail care, and hygiene tools.", "/images/catalog/bath-hygiene.svg", 7, false),
        new("Kids Footwear", "kids-footwear", "Comfortable shoes and sneakers for children.", "/images/catalog/kids-footwear.svg", 8, false),
        new("School Supplies", "school-supplies", "Bottles, stationery, and school-day basics.", "/images/catalog/school-supplies.svg", 9, false),
        new("Maternity Care", "maternity-care", "Pregnancy and postnatal support essentials.", "/images/catalog/maternity-care.svg", 10, false)
    };

    private static readonly CatalogBrand[] Brands =
    {
        new("Pampers", "pampers", "Trusted diapering essentials.", true),
        new("Huggies", "huggies", "Comfortable diapering and baby care.", true),
        new("Johnson's Baby", "johnsons-baby", "Gentle baby skincare products.", true),
        new("Himalaya Baby", "himalaya-baby", "Herbal baby care essentials.", true),
        new("Mamaearth", "mamaearth", "Safe and gentle baby care.", true),
        new("Chicco", "chicco", "Feeding and nursery essentials.", true),
        new("Mee Mee", "mee-mee", "Everyday baby care accessories.", true),
        new("Fisher-Price", "fisher-price", "Developmental toys for little ones.", true),
        new("Sebamed", "sebamed", "Sensitive skincare for babies.", false),
        new("FirstCry", "firstcry", "FirstCry private label essentials.", true)
    };

    private static readonly CatalogProduct[] Products =
    {
        new("Pampers Premium Care Diapers", "pampers-premium-care-diapers", "pampers", "diapers-and-wipes", 999m, 849m, 180, true, true, 4.8m, 1260),
        new("Huggies Wonder Pants", "huggies-wonder-pants", "huggies", "diapers-and-wipes", 899m, 749m, 160, true, true, 4.7m, 980),
        new("Johnson's Baby Lotion", "johnsons-baby-lotion", "johnsons-baby", "baby-skin-care", 299m, 249m, 120, true, false, 4.6m, 720),
        new("Himalaya Baby Shampoo", "himalaya-baby-shampoo", "himalaya-baby", "baby-skin-care", 240m, 210m, 115, true, false, 4.5m, 610),
        new("Mamaearth Baby Body Wash", "mamaearth-baby-body-wash", "mamaearth", "baby-skin-care", 349m, 299m, 100, true, true, 4.6m, 840),
        new("Chicco Feeding Bottle", "chicco-feeding-bottle", "chicco", "feeding-essentials", 449m, 389m, 90, true, false, 4.4m, 420),
        new("Mee Mee Baby Wipes", "mee-mee-baby-wipes", "mee-mee", "diapers-and-wipes", 199m, 169m, 220, true, true, 4.5m, 560),
        new("Fisher-Price Rattle Toy", "fisher-price-rattle-toy", "fisher-price", "toys", 399m, 329m, 75, true, true, 4.7m, 680),
        new("Sebamed Baby Cream", "sebamed-baby-cream", "sebamed", "baby-skin-care", 649m, 579m, 60, true, false, 4.6m, 340),
        new("FirstCry Cotton Romper", "firstcry-cotton-romper", "firstcry", "baby-clothing", 599m, 449m, 140, true, true, 4.4m, 510),
        new("Baby Food Cereal", "baby-food-cereal", "firstcry", "baby-food", 299m, 259m, 130, true, true, 4.3m, 460),
        new("Kids Learning Blocks", "kids-learning-blocks", "fisher-price", "toys", 799m, 699m, 55, true, true, 4.8m, 910),
        new("Baby Bath Tub", "baby-bath-tub", "mee-mee", "bath-and-hygiene", 1299m, 1099m, 35, false, true, 4.5m, 390),
        new("Baby Nail Cutter", "baby-nail-cutter", "chicco", "bath-and-hygiene", 249m, 199m, 85, false, false, 4.2m, 250),
        new("Baby Blanket", "baby-blanket", "firstcry", "baby-clothing", 699m, 549m, 70, true, false, 4.5m, 430),
        new("Kids Sneakers", "kids-sneakers", "firstcry", "kids-footwear", 999m, 799m, 45, false, true, 4.4m, 310),
        new("School Water Bottle", "school-water-bottle", "firstcry", "school-supplies", 349m, 279m, 95, false, false, 4.3m, 280),
        new("Maternity Pillow", "maternity-pillow", "firstcry", "maternity-care", 1499m, 1299m, 25, true, true, 4.7m, 370),
        new("Baby Teether", "baby-teether", "mee-mee", "feeding-essentials", 199m, 149m, 110, false, true, 4.4m, 520),
        new("Baby Stroller Toy", "baby-stroller-toy", "fisher-price", "toys", 549m, 479m, 65, false, true, 4.6m, 440)
    };

    public static async Task SeedAsync(ApplicationDbContext context, CancellationToken cancellationToken = default)
    {
        var categoryMap = await SeedCategoriesAsync(context, cancellationToken);
        var brandMap = await SeedBrandsAsync(context, cancellationToken);
        var seededProducts = await SeedProductsAsync(context, categoryMap, brandMap, cancellationToken);
        await SeedInventoryAsync(context, seededProducts, cancellationToken);
        await ExtendedCatalogSeeder.EnsureAsync(context, cancellationToken);
    }

    private static async Task<Dictionary<string, Category>> SeedCategoriesAsync(
        ApplicationDbContext context,
        CancellationToken cancellationToken)
    {
        var slugs = Categories.Select(category => category.Slug).ToArray();
        var existing = await context.Categories
            .IgnoreQueryFilters()
            .Where(category => slugs.Contains(category.Slug))
            .ToDictionaryAsync(category => category.Slug, cancellationToken);

        foreach (var categorySeed in Categories)
        {
            if (existing.TryGetValue(categorySeed.Slug, out var category))
            {
                category.Name = categorySeed.Name;
                category.Description = categorySeed.Description;
                category.ImageUrl = categorySeed.ImageUrl;
                category.DisplayOrder = categorySeed.DisplayOrder;
                category.IsFeatured = categorySeed.IsFeatured;
                category.IsActive = true;
                category.IsDeleted = false;
                category.DeletedAt = null;
                continue;
            }

            category = Category.Create(
                categorySeed.Name,
                categorySeed.Slug,
                categorySeed.Description,
                categorySeed.ImageUrl,
                categorySeed.DisplayOrder);
            category.IsFeatured = categorySeed.IsFeatured;
            existing[categorySeed.Slug] = category;
            await context.Categories.AddAsync(category, cancellationToken);
        }

        await context.SaveChangesAsync(cancellationToken);
        return await context.Categories
            .Where(category => slugs.Contains(category.Slug))
            .ToDictionaryAsync(category => category.Slug, cancellationToken);
    }

    private static async Task<Dictionary<string, Brand>> SeedBrandsAsync(
        ApplicationDbContext context,
        CancellationToken cancellationToken)
    {
        var slugs = Brands.Select(brand => brand.Slug).ToArray();
        var existing = await context.Brands
            .IgnoreQueryFilters()
            .Where(brand => slugs.Contains(brand.Slug))
            .ToDictionaryAsync(brand => brand.Slug, cancellationToken);

        foreach (var brandSeed in Brands)
        {
            if (existing.TryGetValue(brandSeed.Slug, out var brand))
            {
                brand.Name = brandSeed.Name;
                brand.Description = brandSeed.Description;
                brand.IsFeatured = brandSeed.IsFeatured;
                brand.IsActive = true;
                brand.IsDeleted = false;
                brand.DeletedAt = null;
                continue;
            }

            brand = Brand.Create(brandSeed.Name, brandSeed.Slug);
            brand.Description = brandSeed.Description;
            brand.IsFeatured = brandSeed.IsFeatured;
            existing[brandSeed.Slug] = brand;
            await context.Brands.AddAsync(brand, cancellationToken);
        }

        await context.SaveChangesAsync(cancellationToken);
        return await context.Brands
            .Where(brand => slugs.Contains(brand.Slug))
            .ToDictionaryAsync(brand => brand.Slug, cancellationToken);
    }

    private static async Task<List<Product>> SeedProductsAsync(
        ApplicationDbContext context,
        IReadOnlyDictionary<string, Category> categoryMap,
        IReadOnlyDictionary<string, Brand> brandMap,
        CancellationToken cancellationToken)
    {
        var slugs = Products.Select(product => product.Slug).ToArray();
        var existing = await context.Products
            .IgnoreQueryFilters()
            .Include(product => product.Images)
            .Where(product => slugs.Contains(product.Slug))
            .ToDictionaryAsync(product => product.Slug, cancellationToken);

        foreach (var productSeed in Products)
        {
            var category = categoryMap[productSeed.CategorySlug];
            var brand = brandMap[productSeed.BrandSlug];

            if (existing.TryGetValue(productSeed.Slug, out var product))
            {
                product.Name = productSeed.Name;
                product.Sku = BuildSku(productSeed.Slug);
                product.ShortDescription = $"{productSeed.Name} for quick everyday parenting needs.";
                product.Description = $"{productSeed.Name} is a FirstCry-ready catalog item seeded for local development and storefront verification.";
                product.Price = productSeed.Price;
                product.DiscountPrice = productSeed.DiscountPrice;
                product.StockQuantity = productSeed.StockQuantity;
                product.CategoryId = category.Id;
                product.BrandId = brand.Id;
                product.IsActive = true;
                product.IsFeatured = productSeed.IsFeatured;
                product.IsTrending = productSeed.IsTrending;
                product.Rating = productSeed.Rating;
                product.ReviewCount = productSeed.ReviewCount;
                product.IsDeleted = false;
                product.DeletedAt = null;
                EnsureProductImage(product, productSeed, category, brand);
                continue;
            }

            product = Product.Create(
                productSeed.Name,
                productSeed.Slug,
                $"{productSeed.Name} for quick everyday parenting needs.",
                $"{productSeed.Name} is a FirstCry-ready catalog item seeded for local development and storefront verification.",
                productSeed.Price,
                productSeed.StockQuantity,
                category.Id,
                brand.Id);

            product.Sku = BuildSku(productSeed.Slug);
            product.DiscountPrice = productSeed.DiscountPrice;
            product.IsFeatured = productSeed.IsFeatured;
            product.IsTrending = productSeed.IsTrending;
            product.Rating = productSeed.Rating;
            product.ReviewCount = productSeed.ReviewCount;
            EnsureProductImage(product, productSeed, category, brand);

            existing[productSeed.Slug] = product;
            await context.Products.AddAsync(product, cancellationToken);
        }

        await context.SaveChangesAsync(cancellationToken);
        return await context.Products
            .Where(product => slugs.Contains(product.Slug))
            .ToListAsync(cancellationToken);
    }

    private static async Task SeedInventoryAsync(
        ApplicationDbContext context,
        IEnumerable<Product> products,
        CancellationToken cancellationToken)
    {
        var productIds = products.Select(product => product.Id).ToArray();
        var inventoryProductIds = await context.Inventories
            .IgnoreQueryFilters()
            .Where(inventory => productIds.Contains(inventory.ProductId))
            .Select(inventory => inventory.ProductId)
            .ToListAsync(cancellationToken);
        var inventorySet = inventoryProductIds.ToHashSet();

        foreach (var product in products.Where(product => !inventorySet.Contains(product.Id)))
        {
            var initialQuantity = Math.Max(product.StockQuantity, 1);
            await context.Inventories.AddAsync(
                Inventory.Create(product.Id, initialQuantity: initialQuantity, reorderLevel: 10),
                cancellationToken);
        }

        await context.SaveChangesAsync(cancellationToken);
    }

    private static void EnsureProductImage(
        Product product,
        CatalogProduct productSeed,
        Category category,
        Brand brand)
    {
        var imageUrl = ProductImageSeeder.ResolvePrimaryImageUrl(
            productSeed.Name,
            productSeed.Slug,
            category.Name,
            category.Slug,
            brand.Name,
            brand.Slug);

        if (product.Images.Any())
        {
            var first = product.Images.OrderBy(image => image.DisplayOrder).First();
            if (string.IsNullOrWhiteSpace(first.Url) ||
                first.Url.Contains("placehold.co", StringComparison.OrdinalIgnoreCase) ||
                first.Url.StartsWith('/'))
            {
                first.Url = imageUrl;
            }

            first.AltText = product.Name;
            first.IsPrimary = true;
            first.DisplayOrder = 1;
            return;
        }

        product.AddImage(imageUrl, product.Name, true);
    }

    private static string BuildSku(string slug)
    {
        var compact = new string(slug.Where(char.IsLetterOrDigit).ToArray()).ToUpperInvariant();
        return $"FC-{compact[..Math.Min(compact.Length, 24)]}";
    }

    private sealed record CatalogCategory(
        string Name,
        string Slug,
        string Description,
        string ImageUrl,
        int DisplayOrder,
        bool IsFeatured);

    private sealed record CatalogBrand(
        string Name,
        string Slug,
        string Description,
        bool IsFeatured);

    private sealed record CatalogProduct(
        string Name,
        string Slug,
        string BrandSlug,
        string CategorySlug,
        decimal Price,
        decimal DiscountPrice,
        int StockQuantity,
        bool IsFeatured,
        bool IsTrending,
        decimal Rating,
        int ReviewCount);
}
