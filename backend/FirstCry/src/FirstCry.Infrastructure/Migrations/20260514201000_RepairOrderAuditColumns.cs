using FirstCry.Infrastructure.Data.Context;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FirstCry.Infrastructure.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20260514201000_RepairOrderAuditColumns")]
    public partial class RepairOrderAuditColumns : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF COL_LENGTH('dbo.Orders', 'CreatedBy') IS NULL
    ALTER TABLE [Orders] ADD [CreatedBy] nvarchar(max) NULL;
IF COL_LENGTH('dbo.Orders', 'UpdatedBy') IS NULL
    ALTER TABLE [Orders] ADD [UpdatedBy] nvarchar(max) NULL;
IF COL_LENGTH('dbo.Orders', 'DeletedAt') IS NULL
    ALTER TABLE [Orders] ADD [DeletedAt] datetime2 NULL;
IF COL_LENGTH('dbo.Orders', 'IsDeleted') IS NULL
    ALTER TABLE [Orders] ADD [IsDeleted] bit NOT NULL CONSTRAINT [DF_Orders_IsDeleted_20260514201000] DEFAULT CAST(0 AS bit) WITH VALUES;

IF COL_LENGTH('dbo.OrderItems', 'CreatedBy') IS NULL
    ALTER TABLE [OrderItems] ADD [CreatedBy] nvarchar(max) NULL;
IF COL_LENGTH('dbo.OrderItems', 'UpdatedBy') IS NULL
    ALTER TABLE [OrderItems] ADD [UpdatedBy] nvarchar(max) NULL;
IF COL_LENGTH('dbo.OrderItems', 'DeletedAt') IS NULL
    ALTER TABLE [OrderItems] ADD [DeletedAt] datetime2 NULL;
IF COL_LENGTH('dbo.OrderItems', 'IsDeleted') IS NULL
    ALTER TABLE [OrderItems] ADD [IsDeleted] bit NOT NULL CONSTRAINT [DF_OrderItems_IsDeleted_20260514201000] DEFAULT CAST(0 AS bit) WITH VALUES;
");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
