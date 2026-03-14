@echo off
REM ============================================================
REM Claude for Word - Quick Rebuild Script
REM Rebuilds the plugin and prompts to reload in Word
REM ============================================================

echo.
echo [Claude for Word] Building...
echo.

cd /d "C:\Users\marco.rossi\Desktop\Claude\Claude_Word"

REM Check if npm exists
where npm >nul 2>nul
if errorlevel 1 (
    echo ERROR: npm not found. Make sure Node.js is installed.
    pause
    exit /b 1
)

REM Run build
call npm run build

if errorlevel 1 (
    echo.
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo ============================================================
echo [SUCCESS] Plugin rebuilt successfully!
echo.
echo Next step: Reload the plugin in Word
echo   1. Go to Sviluppo ^> Componenti aggiuntivi
echo   2. Click on "Claude" to reload
echo   OR press Ctrl+Shift+F5 in Word to force reload
echo ============================================================
echo.
pause
