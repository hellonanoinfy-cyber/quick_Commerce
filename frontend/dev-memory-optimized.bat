@echo off
REM ===================================================
REM FirstCry Frontend - Memory-Optimized Dev Script
REM Run this instead of npm run dev if you get heap errors
REM ===================================================

echo Starting FirstCry with memory optimization...
echo.

REM Set Node.js heap size to 4GB before starting Next.js
set NODE_OPTIONS=--max-old-space-size=4096

REM Start the development server with webpack (not turbopack for stability)
node node_modules\next\dist\bin\next dev --webpack

pause