<#
.SYNOPSIS
    Promote a user to Admin role safely (local SQL Server only).
.DESCRIPTION
    Pass the target phone via -Phone, or set the TARGET_PHONE env var.
    Connection strings used are local Trusted_Connection only; never paste
    a real SA password in this script.
.EXAMPLE
    ./UpgradeAdminUser.ps1 -Phone 9876543210
#>

param(
    [string]$Phone = $env:TARGET_PHONE
)

$ErrorActionPreference = "Stop"

if (-not $Phone) {
    Write-Host "[ERROR] Provide -Phone <10-digit-number> or set TARGET_PHONE env var." -ForegroundColor Red
    exit 1
}

$targetPhone = $Phone

# Try multiple connection strings (Windows Authentication only — no hardcoded passwords).
$connectionStrings = @(
    "Server=localhost;Database=FirstCryDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true",
    "Server=localhost,1433;Database=FirstCryDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true",
    "Server=localhost,1434;Database=FirstCryDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true",
    "Server=(local);Database=FirstCryDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true"
)

Write-Host "=================================================="
Write-Host "ADMIN USER UPGRADE SCRIPT"
Write-Host "Target Phone: $targetPhone"
Write-Host "=================================================="

$connectionString = $null
$conn = $null

foreach ($cs in $connectionStrings) {
    Write-Host "`nTrying connection: $cs"
    try {
        $testConn = New-Object System.Data.SqlClient.SqlConnection($cs)
        $testConn.Open()
        $testConn.Close()
        $connectionString = $cs
        Write-Host "    [OK] Connection successful!"
        break
    }
    catch {
        Write-Host "    [FAIL] $_"
        continue
    }
}

if (-not $connectionString) {
    Write-Host "`n[ERROR] Could not connect to any SQL Server instance."
    Write-Host "Please ensure SQL Server is running and accessible."
    exit 1
}

# Step 2: Find user
Write-Host "`n[2] Finding user with phone: $targetPhone..."

$query = @"
SELECT Id, PhoneNumber, Name, Email, Role, IsGuest, ProfileCompleted, CreatedAt
FROM Users
WHERE PhoneNumber = @Phone OR PhoneNumber = '+' + @Phone OR PhoneNumber = '91' + @Phone
"@

try {
    $conn = New-Object System.Data.SqlClient.SqlConnection($connectionString)
    $conn.Open()

    $cmd = $conn.CreateCommand()
    $cmd.CommandText = $query
    $cmd.Parameters.AddWithValue("@Phone", $targetPhone) | Out-Null

    $reader = $cmd.ExecuteReader()

    if ($reader.Read()) {
        $userId = $reader["Id"]
        $currentRole = $reader["Role"]
        Write-Host "    User FOUND:"
        Write-Host "      - Id: $userId"
        Write-Host "      - Phone: $($reader["PhoneNumber"])"
        Write-Host "      - Name: $($reader["Name"])"
        Write-Host "      - Email: $($reader["Email"])"
        Write-Host "      - Current Role: $currentRole"
        Write-Host "      - IsGuest: $($reader["IsGuest"])"
        Write-Host "      - ProfileCompleted: $($reader["ProfileCompleted"])"
        $reader.Close()

        # Step 3: Update to Admin
        Write-Host "`n[3] Upgrading user to Admin role..."

        if ($currentRole -eq "Admin") {
            Write-Host "    [SKIP] User already has Admin role!"
        }
        else {
            $updateCmd = $conn.CreateCommand()
            $updateCmd.CommandText = @"
UPDATE Users
SET Role = 'Admin',
    IsGuest = 0,
    ProfileCompleted = 1,
    Name = COALESCE(NULLIF(Name, ''), 'Admin User'),
    Email = COALESCE(NULLIF(Email, ''), 'admin@mummaxpress.local')
WHERE Id = @UserId
"@
            $updateCmd.Parameters.AddWithValue("@UserId", $userId) | Out-Null
            $affected = $updateCmd.ExecuteNonQuery()

            if ($affected -gt 0) {
                Write-Host "    [OK] User upgraded to Admin successfully"
            }
            else {
                Write-Host "    [WARN] Update affected 0 rows"
            }
        }

        # Step 4: Verify update
        Write-Host "`n[4] Verifying update..."
        $verifyCmd = $conn.CreateCommand()
        $verifyCmd.CommandText = "SELECT Id, PhoneNumber, Name, Role, IsGuest, ProfileCompleted FROM Users WHERE Id = @UserId"
        $verifyCmd.Parameters.AddWithValue("@UserId", $userId) | Out-Null
        $verifyReader = $verifyCmd.ExecuteReader()

        if ($verifyReader.Read()) {
            Write-Host "    Verified User:"
            Write-Host "      - Id: $($verifyReader["Id"])"
            Write-Host "      - Phone: $($verifyReader["PhoneNumber"])"
            Write-Host "      - Name: $($verifyReader["Name"])"
            Write-Host "      - Role: $($verifyReader["Role"])"
            Write-Host "      - IsGuest: $($verifyReader["IsGuest"])"
            Write-Host "      - ProfileCompleted: $($verifyReader["ProfileCompleted"])"

            if ($verifyReader["Role"] -eq "Admin") {
                Write-Host "`n    [SUCCESS] User is now an Admin!"
            }
        }
        $verifyReader.Close()
    }
    else {
        Write-Host "    User NOT found!"
        Write-Host "    Creating new admin user..."

        $newId = [Guid]::NewGuid()
        $insertCmd = $conn.CreateCommand()
        $insertCmd.CommandText = @"
INSERT INTO Users (Id, PhoneNumber, Name, Email, Role, IsGuest, ProfileCompleted, CreatedAt, UpdatedAt, IsDeleted)
VALUES (@Id, @Phone, 'Admin User', 'admin@mummaxpress.local', 'Admin', 0, 1, GETUTCDATE(), GETUTCDATE(), 0)
"@
        $insertCmd.Parameters.AddWithValue("@Id", $newId) | Out-Null
        $insertCmd.Parameters.AddWithValue("@Phone", $targetPhone) | Out-Null
        $insertCmd.ExecuteNonQuery() | Out-Null

        Write-Host "    [OK] Admin user created with Id: $newId"
    }

    $conn.Close()
}
catch {
    Write-Host "    [ERROR] $_"
    if ($conn) { $conn.Close() }
    exit 1
}

Write-Host "`n=================================================="
Write-Host "ADMIN USER UPGRADE COMPLETE"
Write-Host "=================================================="
Write-Host ""
Write-Host "| System                  | Status |"
Write-Host "|-------------------------|--------|"
Write-Host "| User Verification       | DONE   |"
Write-Host "| Admin Role Assignment   | DONE   |"
Write-Host "| Database Update         | DONE   |"
Write-Host ""
Write-Host "User can now login with OTP and access /admin"