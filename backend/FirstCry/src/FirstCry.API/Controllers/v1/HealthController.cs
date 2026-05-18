namespace FirstCry.API.Controllers.v1;

// ─────────────────────────────────────────────────────────────────────────────
// HealthController — Extended health check with Redis and DB status
//
// GET /api/v1/health         → full status (Redis, DB, version)
// GET /api/v1/health/ping    → ultra-lightweight liveness probe (no DB/Redis)
// ─────────────────────────────────────────────────────────────────────────────

using Asp.Versioning;
using System.Data.Common;
using FirstCry.Application.DTOs;
using FirstCry.Infrastructure;
using FirstCry.Infrastructure.Data.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using StackExchange.Redis;

/// <summary>
/// Health check endpoints.
/// Used by Docker healthcheck, Kubernetes liveness/readiness probes,
/// load balancers, and monitoring dashboards.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
public class HealthController : ControllerBase
{
    private readonly RedisHealthState?        _redisState;
    private readonly IConnectionMultiplexer?  _redis;
    private readonly ApplicationDbContext     _dbContext;
    private readonly IConfiguration           _configuration;
    private readonly ILogger<HealthController> _logger;

    public HealthController(
        ApplicationDbContext  dbContext,
        IConfiguration        configuration,
        ILogger<HealthController> logger,
        RedisHealthState?       redisState  = null,
        IConnectionMultiplexer? redis       = null)
    {
        _redisState = redisState;
        _redis      = redis;
        _dbContext  = dbContext;
        _configuration = configuration;
        _logger = logger;
    }

    // ── GET /api/v1/health ───────────────────────────────────────────────────

    /// <summary>
    /// Full health check — returns API status, Redis status (startup probe),
    /// and runtime Redis connectivity via live PING.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        // ── Redis runtime PING ─────────────────────────────────────────────
        string redisStatus  = "not_configured";
        string redisLatency = "n/a";
        string otpBackend   = "in_memory";

        var redisConfigured = _redisState is not null;

        if (redisConfigured)
        {
            otpBackend = _redisState!.IsAvailable ? "redis" : "in_memory";

            if (_redis is not null)
            {
                try
                {
                    var db      = _redis.GetDatabase();
                    var latency = db.Ping();
                    redisStatus  = "connected";
                    redisLatency = $"{latency.TotalMilliseconds:F1}ms";
                }
                catch (Exception ex)
                {
                    redisStatus = $"error: {ex.Message}";
                }
            }
            else
            {
                redisStatus = _redisState!.IsAvailable
                    ? "startup_ok_no_runtime_check"
                    : "unavailable_using_fallback";
            }
        }

        var dbStatus = await GetDatabaseStatusAsync();
        var overallStatus = dbStatus.IsAvailable ? "Healthy" : "Degraded";
        var response = ApiResponse<object>.SuccessResponse(new
        {
            Status      = overallStatus,
            Timestamp   = DateTime.UtcNow,
            Version     = "1.0.0",
            Environment = System.Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown",
            Database = new
            {
                Status = dbStatus.IsAvailable ? "connected" : "unavailable",
                Connection = MaskConnectionString(_configuration.GetConnectionString("DefaultConnection")),
                Error = dbStatus.IsAvailable
                    ? null
                    : "Database unavailable: check SQL Server service/container and connection string."
            },
            Redis = new
            {
                ConfiguredAtStartup = redisConfigured,
                StartupAvailable    = _redisState?.IsAvailable ?? false,
                RuntimeStatus       = redisStatus,
                RuntimeLatency      = redisLatency
            },
            OtpBackend = otpBackend
        }, dbStatus.IsAvailable ? "API is healthy." : "API is degraded.");

        return dbStatus.IsAvailable
            ? Ok(response)
            : StatusCode(StatusCodes.Status503ServiceUnavailable, response);
    }

    // ── GET /api/v1/health/ping ──────────────────────────────────────────────

    /// <summary>
    /// Lightweight liveness probe — always returns 200 immediately.
    /// Use this for Kubernetes liveness checks that must not hit external dependencies.
    /// </summary>
    [HttpGet("ping")]
    public IActionResult Ping() =>
        Ok(ApiResponse<object>.SuccessResponse(new { Status = "ok", Ts = DateTime.UtcNow }, "pong"));

    private async Task<(bool IsAvailable, string? Error)> GetDatabaseStatusAsync()
    {
        try
        {
            return await _dbContext.Database.CanConnectAsync()
                ? (true, null)
                : (false, "CanConnectAsync returned false.");
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex,
                "Database unavailable: check SQL Server service/container and connection string. Active connection: {DatabaseConnection}",
                MaskConnectionString(_configuration.GetConnectionString("DefaultConnection")));

            return (false, ex.GetBaseException().Message);
        }
    }

    private static string MaskConnectionString(string? connectionString)
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

    private static string? GetConnectionValue(DbConnectionStringBuilder builder, params string[] keys)
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

    private static bool HasConnectionValue(DbConnectionStringBuilder builder, params string[] keys)
    {
        return keys.Any(key => builder.TryGetValue(key, out var value)
            && !string.IsNullOrWhiteSpace(value?.ToString()));
    }
}
