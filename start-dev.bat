@echo off
REM ============================================================
REM Claude for Word - Start Dev Server
REM Starts the HTTPS dev server on https://localhost:3000
REM ============================================================
setlocal enabledelayedexpansion

echo.
echo [Claude for Word] Starting development server...
echo.

cd /d "C:\Users\marco.rossi\Desktop\Claude\Claude_Word"
if errorlevel 1 (
    echo ERROR: Cannot navigate to project folder
    pause
    exit /b 1
)

echo Current directory: %cd%
echo.

REM Check if npm exists
where npm >nul 2>nul
if errorlevel 1 (
    echo ERROR: npm not found. Make sure Node.js is installed.
    pause
    exit /b 1
)

echo Checking Node.js and npm versions...
call npm --version
echo.

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: npm install failed
        pause
        exit /b 1
    )
    echo.
)

REM Generate dev certs if needed
echo Checking HTTPS certificates...
call npm run dev-certs 2>nul
if errorlevel 1 (
    echo WARNING: Certificate generation failed, but continuing...
)
echo.

echo ============================================================
echo Starting dev server on https://localhost:3000
echo The manifest will be served from the catalog folder
echo Press Ctrl+C to stop the server
echo ============================================================
echo.

REM Start the dev server
call npm start
if errorlevel 1 (
    echo.
    echo ERROR: Server failed to start
    pause
    exit /b 1
)
