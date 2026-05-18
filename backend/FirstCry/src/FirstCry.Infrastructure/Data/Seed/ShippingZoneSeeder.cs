namespace FirstCry.Infrastructure.Data.Seed;

using FirstCry.Domain.Entities.Shipping;
using FirstCry.Infrastructure.Data.Context;
using Microsoft.EntityFrameworkCore;

public static class ShippingZoneSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context, CancellationToken cancellationToken = default)
    {
        if (await context.Set<ShippingZone>().AnyAsync(cancellationToken))
        {
            return;
        }

        var zones = new[]
        {
            ShippingZone.Create(
                "Express Metro",
                "560,561,562,110,400,411,600,500,700,682",
                0,
                1,
                0m,
                0m),
            ShippingZone.Create(
                "Tier 1 Cities",
                "201,302,380,411,452,500,600,700,800",
                1,
                2,
                29m,
                0m),
            ShippingZone.Create(
                "Rest of India",
                "1,2,3,4,5,6,7,8,9",
                3,
                5,
                49m,
                0m),
        };

        context.Set<ShippingZone>().AddRange(zones);
        await context.SaveChangesAsync(cancellationToken);
    }
}
