using System.Text;
using System.Data.Common;
using Asp.Versioning;
using System.IdentityModel.Tokens.Jwt;
using FirstCry.API.Extensions;
using FirstCry.API.Hubs;
using FirstCry.API.Middleware;
using Microsoft.AspNetCore.HttpOverrides;
using FirstCry.Application;
using FirstCry.Application.DTOs;
using FirstCry.Infrastructure;
using FirstCry.Infrastructure.Data.Context;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;

using Microsoft.AspNetCore.RateLimiting;
using Serilog;
using FirstCry.Application.Common.Interfaces;


// ═══════════════════════════════════════════════════════════
// SERILOG BOOTSTRAP — must be first for startup error logging
// ═══════════════════════════════════════════════════════════
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day)
    .CreateBootstrapLogger();

try
{
    Log.Information("Starting FirstCry API...");

    // ── Fix OutOfMemoryException: disable config reloadOnChange ─────────────
    // PhysicalFileProvider.Watch() allocates a huge SIMD bitmap for deep paths,
    // crashing before startup on machines with limited RAM. Safe to disable in dev.
    var builder = WebApplication.CreateBuilder(new WebApplicationOptions
    {
        Args = args,
        // Disabling reloadOnChange prevents the PhysicalFileProvider SIMD OOM crash
    });
    builder.Configuration.Sources.Clear();
    builder.Configuration
        .AddJsonFile("appsettings.json", optional: false, reloadOnChange: false)
        .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: false)
        .AddEnvironmentVariables()
        .AddCommandLine(args);

    var activeConnectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    Log.Information("Active environment: {Environment}", builder.Environment.EnvironmentName);
    Log.Information("Active database connection: {DatabaseConnection}", MaskConnectionString(activeConnectionString));

    // ── Replace default logging with Serilog ────────────
    builder.Host.UseSerilog((context, services, configuration) =>
        configuration
            .ReadFrom.Configuration(context.Configuration)
            .ReadFrom.Services(services)
            .Enrich.FromLogContext()
            .WriteTo.Console()
            .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day));

    // ═══════════════════════════════════════════════════════
    //  SERVICE REGISTRATION
    // ═══════════════════════════════════════════════════════

    // ── Clean Architecture Layers ───────────────────────
    builder.Services.AddApplicationServices();
    builder.Services.AddInfrastructureServices(builder.Configuration);

    // ── Controllers ─────────────────────────────────────
    builder.Services.AddControllers();

    // ── API Versioning ──────────────────────────────────
    builder.Services.AddApiVersioning(options =>
    {
        options.DefaultApiVersion = new ApiVersion(1, 0);
        options.AssumeDefaultVersionWhenUnspecified = true;
        options.ReportApiVersions = true;
        options.ApiVersionReader = new UrlSegmentApiVersionReader();
    })
    .AddApiExplorer(options =>
    {
        options.GroupNameFormat = "'v'VVV";
        options.SubstituteApiVersionInUrl = true;
    });

    // ── Swagger ─────────────────────────────────────────
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(options =>
    {
        options.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "FirstCry API",
            Version = "v1",
            Description = "Quick Commerce Platform API"
        });
        options.CustomSchemaIds(type => type.FullName?.Replace("+", ".") ?? type.Name);

        // JWT auth in Swagger
        options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "Enter JWT token"
        });

        options.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                Array.Empty<string>()
            }
        });
    });

    // ── CORS ────────────────────────────────────────────
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("DefaultPolicy", policy =>
        {
            var allowedOrigins = builder.Configuration.GetValue<string>("Cors:AllowedOrigins") 
                ?.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                ?? new[] { "http://localhost:3000" };

            policy.WithOrigins(allowedOrigins)
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        });
    });

    // ── JWT Authentication ──────────────────────────────
    JwtConfigurationExtensions.ValidateJwtConfiguration(builder.Configuration, builder.Environment);
    JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();
    var jwtSettings = builder.Configuration.GetSection("Jwt");
    var secretKey = jwtSettings.GetValue<string>("Secret")!;

    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.GetValue<string>("Issuer") ?? "FirstCry",
            ValidAudience = jwtSettings.GetValue<string>("Audience") ?? "FirstCryApp",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
            // Tightened from 5 min to 30 s to reduce the window where an
            // expired access token is still honoured. Refresh-token rotation
            // already covers the legitimate "just expired" UX.
            ClockSkew = TimeSpan.FromSeconds(30),
            NameClaimType = "sub",
            RoleClaimType = "role"
        };

        // SignalR JWT — tokens come via query string
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

    builder.Services.AddAuthorization(options =>
    {
        options.AddPolicy("AdminOnly", policy =>
            policy.RequireRole("admin", "Admin"));
    });

    // ── SignalR ──────────────────────────────────────────────────────────
    // We reuse the IConnectionMultiplexer already registered (or not) by
    // AddInfrastructureServices(), rather than creating a second connection.
    // This way SignalR respects the same Redis availability decision made at
    // startup — no duplicate probes, no duplicate socket handles.
    var signalRBuilder = builder.Services.AddSignalR();

    // We inspect RedisHealthState (registered as singleton by DI) to decide
    // whether to attach the Redis backplane. We do it after Build() via a
    // post-build service-provider lookup so the singleton is already populated.
    // For now, register a post-configure action using the connection string:
    var signalRRedisConn = builder.Configuration.GetConnectionString("Redis");
    if (!string.IsNullOrWhiteSpace(signalRRedisConn))
    {
        // Use the same abortConnect=false and short timeouts so SignalR
        // backplane also falls back silently when Redis is down.
        try
        {
            var signalROptions = ConfigurationOptions.Parse(signalRRedisConn);
            signalROptions.AbortOnConnectFail = false;
            signalROptions.ConnectTimeout     = 1_000;
            signalROptions.SyncTimeout        = 1_000;
            signalROptions.ConnectRetry       = 2;

            signalRBuilder.AddStackExchangeRedis(signalRRedisConn, options =>
            {
                options.Configuration = signalROptions;
            });
            Log.Information("[SignalR] Redis backplane registered. Actual availability confirmed at runtime.");
        }
        catch (Exception ex)
        {
            Log.Warning("[SignalR] Redis backplane registration failed — using in-memory (single-node) backplane. Error: {Message}", ex.Message);
        }
    }
    else
    {
        Log.Warning("[SignalR] Redis not configured — using in-memory backplane (single-node only).");
    }
    
    builder.Services.AddSingleton<Microsoft.AspNetCore.SignalR.IUserIdProvider, FirstCry.API.Providers.CustomUserIdProvider>();
    builder.Services.AddScoped<INotificationService, FirstCry.API.Services.ApiNotificationService>();

    // ── Rate Limiting (.NET built-in) ───────────────────
    builder.Services.AddRateLimiter(options =>
    {
        options.RejectionStatusCode = 429;
        options.AddFixedWindowLimiter("fixed", limiterOptions =>
        {
            limiterOptions.PermitLimit = 100;
            limiterOptions.Window = TimeSpan.FromMinutes(1);
            limiterOptions.QueueLimit = 0;
        });

        // Stricter limit for Auth endpoints
        options.AddFixedWindowLimiter("auth", limiterOptions =>
        {
            limiterOptions.PermitLimit = 5;
            limiterOptions.Window = TimeSpan.FromMinutes(1);
            limiterOptions.QueueLimit = 0;
        });
    });

    // ── Health Checks ───────────────────────────────────
    builder.Services.AddHealthChecks();

    // ═══════════════════════════════════════════════════════
    //  MIDDLEWARE PIPELINE
    // ═══════════════════════════════════════════════════════
    var app = builder.Build();

    LogIntegrationStatus(app.Services);

    // ── Exception handling — must be first ───────────────
    app.UseMiddleware<ExceptionHandlingMiddleware>();

    // ── Reverse proxy (Docker / load balancer) ─────────
    var forwardedHeaders = new ForwardedHeadersOptions
    {
        ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
    };
    forwardedHeaders.KnownNetworks.Clear();
    forwardedHeaders.KnownProxies.Clear();
    app.UseForwardedHeaders(forwardedHeaders);

    // ── CORS — must be early ─────────────────────────────
    app.UseCors("DefaultPolicy");

    // ── Database Migration & Seeding ────────────────────
    await app.ApplyDatabaseStartupAsync(activeConnectionString);

    // ── Https redirection ───────────────────────────────
    if (!app.Environment.IsDevelopment())
    {
        app.UseHttpsRedirection();
        app.UseHsts();
    }

    // ── Security headers ────────────────────────────────
    app.UseMiddleware<SecurityHeadersMiddleware>();

    // ── Request logging ─────────────────────────────────
    app.UseMiddleware<RequestLoggingMiddleware>();

    // ── Serilog request logging ─────────────────────────
    app.UseSerilogRequestLogging();

    // ── Swagger (development only) ──────────────────────
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "FirstCry API v1");
            c.RoutePrefix = "swagger";
        });
    }

    // ── Standard middleware pipeline ────────────────────
    app.UseRateLimiter();
    app.UseAuthentication();
    app.UseAuthorization();

    // ── Map endpoints ───────────────────────────────────
    app.MapControllers();
    app.MapHub<NotificationHub>("/hubs/notifications");
    app.MapGet("/health", async (ApplicationDbContext context) =>
    {
        var database = await GetDatabaseHealthAsync(context, activeConnectionString);
        var status = database.IsAvailable ? "Healthy" : "Degraded";
        var message = database.IsAvailable ? "API is healthy." : "API is degraded.";
        var response = ApiResponse<object>.SuccessResponse(new
        {
            Status = status,
            Timestamp = DateTime.UtcNow,
            Environment = app.Environment.EnvironmentName,
            Database = new
            {
                Status = database.IsAvailable ? "connected" : "unavailable",
                Connection = MaskConnectionString(activeConnectionString),
                Error = database.IsAvailable
                    ? null
                    : "Database unavailable: check SQL Server service/container and connection string."
            }
        }, message);

        return database.IsAvailable
            ? Results.Ok(response)
            : Results.Json(response, statusCode: StatusCodes.Status503ServiceUnavailable);
    });

    app.Run();
}
catch (System.IO.IOException ex) when (ex.Message.Contains("address already in use") || ex.Message.Contains("Failed to bind to address"))
{
    Log.Fatal("\n\n❌ ERROR: Port conflict detected! Address already in use.\n" +
              "👉 Please run the following PowerShell command to free the port:\n" +
              "   Get-Process -Id (Get-NetTCPConnection -LocalPort 5181).OwningProcess | Stop-Process -Force\n");
    Environment.Exit(1);
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}

static async Task<(bool IsAvailable, string? Error)> GetDatabaseHealthAsync(
    ApplicationDbContext context,
    string? connectionString)
{
    try
    {
        return await context.Database.CanConnectAsync()
            ? (true, null)
            : (false, "CanConnectAsync returned false.");
    }
    catch (Exception ex) when (IsDatabaseConnectivityException(ex))
    {
        Log.Warning(ex,
            "Database health check failed. Active connection: {DatabaseConnection}",
            MaskConnectionString(connectionString));

        return (false, ex.GetBaseException().Message);
    }
}

static bool IsDatabaseConnectivityException(Exception exception)
{
    return exception is Microsoft.Data.SqlClient.SqlException
        || exception.InnerException is Microsoft.Data.SqlClient.SqlException
        || exception.Source == "Microsoft.Data.SqlClient"
        || exception.Message.Contains("SQL Server", StringComparison.OrdinalIgnoreCase)
        || exception.Message.Contains("network-related", StringComparison.OrdinalIgnoreCase)
        || exception.Message.Contains("actively refused", StringComparison.OrdinalIgnoreCase);
}

static string MaskConnectionString(string? connectionString)
{
    if (string.IsNullOrWhiteSpace(connectionString))
    {
        return "<empty>";
    }

    try
    {
        var builder = new DbConnectionStringBuilder
        {
            ConnectionString = connectionString
        };

        var server = GetConnectionValue(builder, "Server", "Data Source", "Address", "Addr", "Network Address");
        var database = GetConnectionValue(builder, "Database", "Initial Catalog");
        var usesSqlAuth = HasConnectionValue(builder, "User Id", "User ID", "UID");
        var auth = usesSqlAuth ? "sql" : "trusted";

        return $"Server={server ?? "<unknown>"};Database={database ?? "<unknown>"};Authentication={auth}";
    }
    catch
    {
        return "<unparseable>";
    }
}

static string? GetConnectionValue(DbConnectionStringBuilder builder, params string[] keys)
{
    foreach (var key in keys)
    {
        if (builder.TryGetValue(key, out var value))
        {
            return value?.ToString();
        }
    }

    return null;
}

static bool HasConnectionValue(DbConnectionStringBuilder builder, params string[] keys)
{
    return keys.Any(key => builder.TryGetValue(key, out var value)
        && !string.IsNullOrWhiteSpace(value?.ToString()));
}

static void LogIntegrationStatus(IServiceProvider services)
{
    using var scope = services.CreateScope();
    var integrations = scope.ServiceProvider.GetRequiredService<IIntegrationStatusService>().GetStatus();

    Log.Information("── Integration status ──");
    foreach (var module in new[] { integrations.Msg91, integrations.EmailOtp, integrations.Razorpay, integrations.Cloudinary, integrations.Redis, integrations.Meilisearch })
    {
        Log.Information("  {Name}: {Mode} — {Summary}", module.Name, module.Mode, module.Summary);
        foreach (var key in module.MissingKeys)
        {
            Log.Information("    → configure {Key}", key);
        }
    }
}
