using FirstCry.Domain.Entities;
using FirstCry.Domain.Entities.Orders;
using FirstCry.Infrastructure.Data.Context;
using Microsoft.EntityFrameworkCore;

const string DefaultConnectionString =
    "Server=127.0.0.1,1433;Database=FirstCryDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true;Encrypt=false";

var command = args.ElementAtOrDefault(0)?.Trim().ToLowerInvariant() ?? "audit";
var targetPhone = args.ElementAtOrDefault(1)?.Trim()
    ?? Environment.GetEnvironmentVariable("TARGET_PHONE")?.Trim();

if (string.IsNullOrWhiteSpace(targetPhone))
{
    Console.Error.WriteLine(
        "Provide the target phone number as the 2nd argument or set TARGET_PHONE env var.\n" +
        "Usage: dotnet run --project tools/UserReset -- [audit|cleanup|promote] <phone>");
    Environment.ExitCode = 2;
    return;
}
var connectionString = Environment.GetEnvironmentVariable("FIRSTCRY_DB")
    ?? Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
    ?? DefaultConnectionString;

await using var db = new ApplicationDbContext(
    new DbContextOptionsBuilder<ApplicationDbContext>()
        .UseSqlServer(connectionString)
        .Options);

switch (command)
{
    case "audit":
        await PrintAuditAsync(db, targetPhone);
        break;
    case "cleanup":
        await CleanupAsync(db, targetPhone);
        break;
    case "promote":
        await PromoteAsync(db, targetPhone);
        break;
    default:
        Console.Error.WriteLine("Usage: dotnet run --project tools/UserReset -- [audit|cleanup|promote] [phone]");
        Environment.ExitCode = 2;
        break;
}

static IQueryable<User> MatchingUsers(ApplicationDbContext db, string targetPhone)
{
    var normalized = targetPhone.Trim();
    var withoutCountry = normalized.StartsWith("+91", StringComparison.Ordinal)
        ? normalized[3..]
        : normalized.StartsWith("91", StringComparison.Ordinal) && normalized.Length == 12
            ? normalized[2..]
            : normalized;

    var withPlusCountry = $"+91{withoutCountry}";
    var withCountry = $"91{withoutCountry}";

    return db.Users.IgnoreQueryFilters()
        .Where(u =>
            u.PhoneNumber == normalized ||
            u.PhoneNumber == withoutCountry ||
            u.PhoneNumber == withPlusCountry ||
            u.PhoneNumber == withCountry ||
            u.PhoneNumber.EndsWith(withoutCountry));
}

static async Task PrintAuditAsync(ApplicationDbContext db, string targetPhone)
{
    var users = await MatchingUsers(db, targetPhone)
        .Include(u => u.RefreshTokens)
        .Include(u => u.Addresses)
        .Include(u => u.WishlistItems)
        .Include(u => u.Reviews)
        .OrderBy(u => u.CreatedAt)
        .ToListAsync();

    var userIds = users.Select(u => u.Id).ToList();
    var carts = await db.Carts.Include(c => c.Items)
        .Where(c => c.UserId.HasValue && userIds.Contains(c.UserId.Value))
        .ToListAsync();
    var orders = await db.Orders.IgnoreQueryFilters()
        .Where(o => userIds.Contains(o.UserId))
        .ToListAsync();
    var notifications = await db.Notifications
        .Where(n => n.UserId.HasValue && userIds.Contains(n.UserId.Value))
        .ToListAsync();

    Console.WriteLine($"Audit target phone: {targetPhone}");
    Console.WriteLine($"Matched users: {users.Count}");

    foreach (var user in users)
    {
        Console.WriteLine(
            $"USER {user.Id} phone={user.PhoneNumber} role={user.Role} isGuest={user.IsGuest} profileCompleted={user.ProfileCompleted} isDeleted={user.IsDeleted}");
        Console.WriteLine($"  refreshTokens={user.RefreshTokens.Count}");
        Console.WriteLine($"  addresses={user.Addresses.Count}");
        Console.WriteLine($"  carts={carts.Count(c => c.UserId == user.Id)} cartItems={carts.Where(c => c.UserId == user.Id).Sum(c => c.Items.Count)}");
        Console.WriteLine($"  wishlist={user.WishlistItems.Count}");
        Console.WriteLine($"  reviews={user.Reviews.Count}");
        Console.WriteLine($"  orders={orders.Count(o => o.UserId == user.Id)}");
        Console.WriteLine($"  notifications={notifications.Count(n => n.UserId == user.Id)}");
    }
}

static async Task CleanupAsync(ApplicationDbContext db, string targetPhone)
{
    await using var tx = await db.Database.BeginTransactionAsync();

    var users = await MatchingUsers(db, targetPhone)
        .Include(u => u.RefreshTokens)
        .Include(u => u.Addresses)
        .Include(u => u.WishlistItems)
        .Include(u => u.Reviews)
        .ToListAsync();

    if (users.Count == 0)
    {
        Console.WriteLine("No matching users to cleanup.");
        return;
    }

    var userIds = users.Select(u => u.Id).ToList();
    var carts = await db.Carts.Include(c => c.Items)
        .Where(c => c.UserId.HasValue && userIds.Contains(c.UserId.Value))
        .ToListAsync();
    var orders = await db.Orders.IgnoreQueryFilters()
        .Where(o => userIds.Contains(o.UserId))
        .ToListAsync();
    var notifications = await db.Notifications
        .Where(n => n.UserId.HasValue && userIds.Contains(n.UserId.Value))
        .ToListAsync();

    if (orders.Count > 0)
    {
        var archiveUser = new User
        {
            PhoneNumber = $"deleted-{targetPhone}-{DateTime.UtcNow:yyyyMMddHHmmss}",
            Name = "Deleted User",
            Role = "User",
            IsGuest = true,
            ProfileCompleted = false
        };

        db.Users.Add(archiveUser);
        await db.SaveChangesAsync();

        foreach (var order in orders)
        {
            db.Entry(order).Property(nameof(Order.UserId)).CurrentValue = archiveUser.Id;
        }
    }

    foreach (var notification in notifications)
    {
        db.Entry(notification).Property("UserId").CurrentValue = null;
    }

    foreach (var user in users)
    {
        user.RefreshTokens.Clear();
    }

    db.CartItems.RemoveRange(carts.SelectMany(c => c.Items));
    db.Carts.RemoveRange(carts);
    db.UserAddresses.RemoveRange(users.SelectMany(u => u.Addresses));
    db.WishlistItems.RemoveRange(users.SelectMany(u => u.WishlistItems));
    db.ProductReviews.RemoveRange(users.SelectMany(u => u.Reviews));
    db.Users.RemoveRange(users);

    await db.SaveChangesAsync();
    await tx.CommitAsync();

    Console.WriteLine($"Removed users={users.Count}, carts={carts.Count}, ordersReassigned={orders.Count}, notificationsDetached={notifications.Count}");
}

static async Task PromoteAsync(ApplicationDbContext db, string targetPhone)
{
    await using var tx = await db.Database.BeginTransactionAsync();

    var users = await MatchingUsers(db, targetPhone)
        .OrderByDescending(u => u.CreatedAt)
        .ToListAsync();

    if (users.Count != 1)
    {
        throw new InvalidOperationException($"Expected exactly one matching user after OTP recreation, found {users.Count}.");
    }

    var user = users[0];
    user.Role = "Admin";
    user.IsGuest = false;
    user.ProfileCompleted = true;
    user.Name = string.IsNullOrWhiteSpace(user.Name) ? "Admin User" : user.Name;

    await db.SaveChangesAsync();
    await tx.CommitAsync();

    Console.WriteLine($"Promoted user {user.Id} phone={user.PhoneNumber} role={user.Role} isGuest={user.IsGuest} profileCompleted={user.ProfileCompleted}");
}
