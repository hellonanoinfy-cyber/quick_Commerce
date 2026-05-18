# ===================================================
# FirstCry - Backend Start Script
# Kills old processes, clears port, starts fresh
# ===================================================

param(
    [switch]$Clean,
    [switch]$NoWatch,
    [int]$Port = 5181
)

$ErrorActionPreference = "Continue"
$BackendPath = "C:\Personal\webdev\firstcry\backend\FirstCry\src\FirstCry.API"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  FirstCry Backend - Starting..." -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 1. Kill any existing dotnet processes on this port
Write-Host "[1/5] Checking for existing processes on port $Port..." -ForegroundColor Yellow
$processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
if ($processes) {
    Write-Host "  Found process(es): $processes" -ForegroundColor Yellow
    foreach ($procId in $processes) {
        $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
        if ($proc) {
            Write-Host "  Killing: $($proc.ProcessName) (PID: $procId)" -ForegroundColor Red
            Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
        }
    }
    Start-Sleep -Seconds 2
}

# Also kill any lingering dotnet.exe processes
Write-Host "`n[2/5] Cleaning up dotnet processes..." -ForegroundColor Yellow
Get-Process -Name "dotnet" -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "  Stopping dotnet PID: $($_.Id)" -ForegroundColor Red
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 1

# 2. Clear logs directory if clean flag
if ($Clean) {
    Write-Host "`n[3/5] Clearing logs and build artifacts..." -ForegroundColor Yellow
    $logsPath = Join-Path $BackendPath "logs"
    if (Test-Path $logsPath) {
        Remove-Item "$logsPath\*" -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  Logs cleared" -ForegroundColor Green
    }
    # Clear obj and bin
    $objPath = Join-Path $BackendPath "obj"
    $binPath = Join-Path $BackendPath "bin"
    if (Test-Path $objPath) { Remove-Item "$objPath\*" -Recurse -Force -ErrorAction SilentlyContinue }
    if (Test-Path $binPath) { Remove-Item "$binPath\*" -Recurse -Force -ErrorAction SilentlyContinue }
    Write-Host "  Build artifacts cleared" -ForegroundColor Green
} else {
    Write-Host "`n[3/5] Skipping clean (use -Clean to rebuild)" -ForegroundColor Gray
}

# 3. Verify appsettings
Write-Host "`n[4/5] Verifying configuration..." -ForegroundColor Yellow
$configPath = Join-Path $BackendPath "appsettings.Development.json"
if (Test-Path $configPath) {
    $config = Get-Content $configPath -Raw | ConvertFrom-Json
    if ($config.Jwt.Secret -match "DevOnlySecretKey") {
        Write-Host "  Using DEVELOPMENT JWT secret" -ForegroundColor Green
    } else {
        Write-Host "  JWT secret configured" -ForegroundColor Green
    }
}

# Check connection string
$appsettingsPath = Join-Path $BackendPath "appsettings.json"
if (Test-Path $appsettingsPath) {
    $appConfig = Get-Content $appsettingsPath -Raw | ConvertFrom-Json
    $connStr = $appConfig.ConnectionStrings.DefaultConnection
    if ($connStr -match "127\.0\.0\.1") {
        Write-Host "  SQL Server connection: 127.0.0.1 (LocalDB)" -ForegroundColor Green
    } else {
        Write-Host "  SQL Server connection: $connStr" -ForegroundColor Cyan
    }
}

# 4. Build the project
Write-Host "`n[5/5] Building and starting backend..." -ForegroundColor Yellow
Set-Location $BackendPath

# First restore
Write-Host "  Restoring packages..." -ForegroundColor Gray
dotnet restore 2>&1 | Out-Null

# Then build
Write-Host "  Building project..." -ForegroundColor Gray
$buildResult = dotnet build --no-restore 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n  BUILD ERRORS DETECTED:" -ForegroundColor Red
    $buildResult | Select-Object -Last 20
    Write-Host "`n  Press any key to exit..." -ForegroundColor Yellow
    Read-Host
    exit 1
}
Write-Host "  Build successful!" -ForegroundColor Green

# 5. Start the API
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Starting API on http://localhost:$Port" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Start without watch if requested
$runArgs = @("run", "--no-build")
if ($NoWatch) {
    $runArgs += "--no-launch-profile"
}

# Set environment
$env:ASPNETCORE_ENVIRONMENT = "Development"
$env:ASPNETCORE_URLS = "http://localhost:$Port"

# Start dotnet watch
if (-not $NoWatch) {
    Start-Process -FilePath "dotnet" -ArgumentList "watch", "run", "--no-build" -WorkingDirectory $BackendPath -WindowStyle Normal -PassThru
} else {
    dotnet run --no-build
}