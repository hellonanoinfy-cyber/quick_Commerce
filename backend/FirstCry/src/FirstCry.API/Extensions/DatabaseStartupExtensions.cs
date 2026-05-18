namespace FirstCry.API.Extensions;

using FirstCry.Infrastructure.Data.Context;
using FirstCry.Infrastructure.Data.Seed;
using FirstCry.Infrastructure.Persistence.Seeds;
using Microsoft.EntityFrameworkCore;
using Serilog;

public static class DatabaseStartupExtensions
{
    public static async Task ApplyDatabaseStartupAsync(
        this WebApplication app,
        string? connectionString)
    {
        var migrate = app.Configuration.GetValue("Database:MigrateOnStartup", app.Environment.IsDevelopment());
        if (!migrate)
        {
            Log.Information("Database:MigrateOnStartup is disabled — skipping migrations.");
            return;
        }

        using var scope = app.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        try
        {
            Log.Information(
                "Checking database connectivity: {DatabaseConnection}",
                MaskConnectionString(connectionString));

            await context.Database.OpenConnectionAsync();
            await context.Database.CloseConnectionAsync();

            if (context.Database.IsRelational())
            {
                await context.Database.MigrateAsync();
                Log.Information("Database migrations applied successfully.");
            }
            else
            {
                await context.Database.EnsureCreatedAsync();
            }

            await ShippingZoneSeeder.SeedAsync(context);

            var seed = app.Configuration.GetValue("Database:SeedOnStartup", app.Environment.IsDevelopment());
            if (seed)
            {
                await DatabaseSeeder.SeedAsync(context);
                await ProductImageSeeder.EnsureAllProductsHaveImagesAsync(context);
                await AdminUserSeeder.SeedAsync(context);
                Log.Information("Database seeding completed successfully.");
            }
        }
        catch (Exception ex) when (IsDatabaseConnectivityException(ex))
        {
            Log.Error(
                ex,
                "Database unavailable: check SQL Server and connection string. Active connection: {DatabaseConnection}",
                MaskConnectionString(connectionString));
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Database migration or seeding failed.");
            if (app.Environment.IsProduction())
            {
                throw;
            }
        }
    }

    private static bool IsDatabaseConnectivityException(Exception exception) =>
        exception is Microsoft.Data.SqlClient.SqlException
        || exception.InnerException is Microsoft.Data.SqlClient.SqlException
        || exception.Source == "Microsoft.Data.SqlClient"
        || exception.Message.Contains("SQL Server", StringComparison.OrdinalIgnoreCase)
        || exception.Message.Contains("network-related", StringComparison.OrdinalIgnoreCase);

    private static string MaskConnectionString(string? connectionString)
    {
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            return "<empty>";
        }

        return "<configured>";
    }
}
