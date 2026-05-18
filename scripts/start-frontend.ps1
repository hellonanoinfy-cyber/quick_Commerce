# ===================================================
# FirstCry - Frontend Start Script
# Ensures proxy is configured and starts Next.js
# ===================================================

param(
    [switch]$Clean,
    [switch]$NoBuild
)

$ErrorActionPreference = "Continue"
$FrontendPath = "C:\Personal\webdev\firstcry\frontend"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  FirstCry Frontend - Starting..." -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 1. Verify next.config.mjs has proxy configured
Write-Host "[1/4] Checking proxy configuration..." -ForegroundColor Yellow
$nextConfig = Join-Path $FrontendPath "next.config.mjs"
if (Test-Path $nextConfig) {
    $content = Get-Content $nextConfig -Raw
    if ($content -match "/api/.*prox.*5181") {
        Write-Host "  API proxy configured correctly" -ForegroundColor Green
    } else {
        Write-Host "  WARNING: API proxy may not be configured" -ForegroundColor Yellow
    }
}

# 2. Check .env.local
Write-Host "`n[2/4] Checking environment variables..." -ForegroundColor Yellow
$envFile = Join-Path $FrontendPath ".env.local"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    if ($envContent -match "NEXT_PUBLIC_API_URL") {
        Write-Host "  API URL configured" -ForegroundColor Green
    }
}

# 3. Clean if requested
if ($Clean) {
    Write-Host "`n[3/4] Cleaning build artifacts..." -ForegroundColor Yellow
    $nextDir = Join-Path $FrontendPath ".next"
    if (Test-Path $nextDir) {
        Remove-Item "$nextDir" -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  .next directory cleared" -ForegroundColor Green
    }
} else {
    Write-Host "`n[3/4] Skipping clean" -ForegroundColor Gray
}

# 4. Start Next.js
Write-Host "`n[4/4] Starting Next.js dev server..." -ForegroundColor Yellow
Set-Location $FrontendPath

if ($NoBuild) {
    npm run dev
} else {
    npm run dev
}