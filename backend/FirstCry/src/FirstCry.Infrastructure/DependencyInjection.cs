namespace FirstCry.Infrastructure;

// ─────────────────────────────────────────────────────────────────────────────
// Infrastructure DI Registration
//
// Design:
//   • Redis is OPTIONAL — startup never fails because Redis is unreachable
//   • Redis probe uses a 1-second timeout with AbortOnConnectFail = false
//   • If Redis is confirmed available   → RedisOtpService + RedisCacheService
//   • If Redis is unavailable/times out → InMemoryOtpService + InMemoryCacheService
//   • Strategy is logged at startup so developers know which branch is active
//   • All other infrastructure services are registered unconditionally
// ─────────────────────────────────────────────────────────────────────────────

using FirstCry.Application.Common.Interfaces;
using FirstCry.Infrastructure.Data.Context;
using FirstCry.Infrastructure.Data.Repositories;
using FirstCry.Infrastructure.Services.Auth;
using FirstCry.Infrastructure.Services.Cache;
using FirstCry.Infrastructure.Services.Email;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

/// <summary>
/// Registers all Infrastructure layer services into the DI container.
/// Called from Program.cs: builder.Services.AddInfrastructureServices(configuration);
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // ── 1. EF Core / SQL Server ────────────────────────────────────────
        RegisterDatabase(services, configuration);

        // ── 2. Repositories & Unit of Work ────────────────────────────────
        RegisterRepositories(services);

        // ── 3. Redis (optional) + OTP + Cache + Email OTP ────────────────
        RegisterRedisAndOtp(services, configuration);
        RegisterEmailOtp(services);

        // ── 4. Auth & Token Services ───────────────────────────────────────
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ITokenService, TokenService>();
        // ── 5. Cart Service ────────────────────────────────────────────────
        services.AddScoped<ICartService, FirstCry.Infrastructure.Services.Cart.CartService>();

        // ── 6. Payment Service ─────────────────────────────────────────────
        services.AddScoped<IPaymentService, FirstCry.Infrastructure.Services.Payments.RazorpayService>();

        // ── 7. Media Upload Service ────────────────────────────────────────
        services.AddScoped<IMediaUploadService, FirstCry.Infrastructure.Services.Media.CloudinaryMediaService>();

        // ── 8. SMS Service ─────────────────────────────────────────────────
        // Msg91SmsService auto-detects mode based on appsettings:
        //   • No AuthKey             → Demo mode (OTP printed to console / logs)
        //   • AuthKey but no Template → Demo mode
        //   • Both configured         → Production mode (real SMS via MSG91)
        services.AddHttpClient<ISmsService, Msg91SmsService>();

        services.AddScoped<IDeliveryService, FirstCry.Infrastructure.Services.Delivery.DeliveryService>();
        services.AddSingleton<IIntegrationStatusService, FirstCry.Infrastructure.Services.Integration.IntegrationStatusService>();

        return services;
    }

    // ── Database Registration ──────────────────────────────────────────────

    private static void RegisterDatabase(IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            // Development fallback: in-memory database
            Console.WriteLine("[WARN] DefaultConnection not set — using EF Core in-memory database.");
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseInMemoryDatabase("FirstCryDb_InMemory"));
        }
        else
        {
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(connectionString, sqlOptions =>
                {
                    sqlOptions.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
                    // Retry on transient SQL failures (network glitches, rolling restarts)
                    sqlOptions.EnableRetryOnFailure(
                        maxRetryCount: 3,
                        maxRetryDelay: TimeSpan.FromSeconds(10),
                        errorNumbersToAdd: null);
                }));
        }
    }

    // ── Repository Registration ────────────────────────────────────────────

    private static void RegisterRepositories(IServiceCollection services)
    {
        services.AddScoped(typeof(IRepository<>), typeof(BaseRepository<>));
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IApplicationDbContext>(provider =>
            provider.GetRequiredService<ApplicationDbContext>());

        services.AddScoped<ICartRepository,     CartRepository>();
        services.AddScoped<IProductRepository,  ProductRepository>();
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<IBrandRepository,    BrandRepository>();
        services.AddScoped<IOrderRepository,    OrderRepository>();
    }

    // ── Redis + OTP + Cache Registration ──────────────────────────────────

    private static void RegisterRedisAndOtp(IServiceCollection services, IConfiguration configuration)
    {
        // Always register IMemoryCache — used by InMemoryOtpService and InMemoryCacheService
        services.AddMemoryCache();

        var redisConnectionString = configuration.GetConnectionString("Redis");

        if (string.IsNullOrWhiteSpace(redisConnectionString))
        {
            Console.WriteLine("[WARN] Redis connection string not configured. Using in-memory OTP + cache.");
            RegisterInMemoryFallbacks(services);
            RegisterEmailOtpStore(services, redisAvailable: false);
            return;
        }

        // ── Attempt Redis connection ───────────────────────────────────────
        IConnectionMultiplexer? multiplexer = null;
        var redisAvailable = false;

        try
        {
            var options = ConfigurationOptions.Parse(redisConnectionString);

            // ── Resilience settings ────────────────────────────────────────
            // AbortOnConnectFail = false  → multiplexer is created even if Redis
            //                               is currently unreachable; it will retry
            //                               in the background.
            // ConnectTimeout = 1000ms     → fail-fast probe at startup.
            // ConnectRetry = 2            → try up to 2 times before giving up.
            // SyncTimeout = 1000ms        → synchronous operations timeout quickly.
            options.AbortOnConnectFail = false;
            options.ConnectTimeout     = 1_000;   // ms
            options.SyncTimeout        = 1_000;   // ms
            options.ConnectRetry       = 2;
            options.ReconnectRetryPolicy = new LinearRetry(1_000); // 1s between retries

            multiplexer = ConnectionMultiplexer.Connect(options);

            // ── Probe: verify the connection is actually usable ────────────
            // IsConnected alone is insufficient immediately after Connect(); we
            // issue a synchronous PING to get a definitive answer within the
            // SyncTimeout window set above.
            if (multiplexer.IsConnected)
            {
                var db = multiplexer.GetDatabase();
                var latency = db.Ping(); // synchronous — returns TimeSpan
                redisAvailable = true;

                Console.WriteLine(
                    $"[INFO] Redis connected successfully at '{redisConnectionString}'. " +
                    $"Latency={latency.TotalMilliseconds:F1}ms. " +
                    "Using Redis for OTP + cache.");
            }
            else
            {
                Console.WriteLine(
                    $"[WARN] Redis multiplexer created but IsConnected=false for '{redisConnectionString}'. " +
                    "Falling back to in-memory OTP + cache.");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine(
                $"[WARN] Redis connection probe failed: {ex.Message}. " +
                "Falling back to in-memory OTP + cache. " +
                "Start Redis to enable Redis-backed OTP and caching.");
            multiplexer?.Dispose();
            multiplexer = null;
        }

        // ── Register services based on probe result ────────────────────────
        if (redisAvailable && multiplexer is not null)
        {
            // Singleton: IConnectionMultiplexer is thread-safe and expensive to create
            services.AddSingleton<IConnectionMultiplexer>(multiplexer);

            // Register Redis-backed implementations
            services.AddScoped<ICacheService, RedisCacheService>();
            services.AddScoped<IOtpService,   RedisOtpService>();

            // Expose Redis availability flag for HealthController
            services.AddSingleton(new RedisHealthState { IsAvailable = true });
            RegisterEmailOtpStore(services, redisAvailable: true);
        }
        else
        {
            // Dispose unused multiplexer to free socket handles
            multiplexer?.Dispose();

            RegisterInMemoryFallbacks(services);
            services.AddSingleton(new RedisHealthState { IsAvailable = false });
            RegisterEmailOtpStore(services, redisAvailable: false);
        }
    }

    // ── In-Memory Fallback Registration ───────────────────────────────────

    private static void RegisterInMemoryFallbacks(IServiceCollection services)
    {
        services.AddScoped<ICacheService, InMemoryCacheService>();
        // OTP state must survive across the send-otp and verify-otp HTTP requests.
        services.AddSingleton<IOtpService, InMemoryOtpService>();
    }

    private static void RegisterEmailOtp(IServiceCollection services)
    {
        services.AddSingleton<EmailOtpHasher>();
        services.AddSingleton<InMemoryEmailOtpStore>();
        services.AddScoped<IEmailService, SmtpEmailService>();
        services.AddScoped<IEmailOtpAuthService, EmailOtpAuthService>();
    }

    private static void RegisterEmailOtpStore(IServiceCollection services, bool redisAvailable)
    {
        if (redisAvailable)
        {
            services.AddSingleton<IEmailOtpStore, RedisEmailOtpStore>();
            return;
        }

        services.AddSingleton<IEmailOtpStore>(sp => sp.GetRequiredService<InMemoryEmailOtpStore>());
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// RedisHealthState — injected as singleton so HealthController can expose it
// ─────────────────────────────────────────────────────────────────────────────

/// <summary>
/// Holds the Redis availability state determined at startup.
/// Injected as a singleton so the health endpoint can report it.
/// </summary>
public sealed class RedisHealthState
{
    public bool IsAvailable { get; init; }
}
