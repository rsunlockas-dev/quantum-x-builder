@echo off
setlocal enabledelayedexpansion

echo.
echo ================================
echo VIZUAL X VS Code Extension
echo Quick Setup & Run
echo ================================
echo.

REM Check if Node.js is available
where node >nul 2>nul
if errorlevel 1 (
    echo [!] Node.js is NOT installed
    echo.
    echo Install Node.js 20 LTS from:
    echo   https://nodejs.org/
    echo.
    echo Or use Windows Package Manager:
    echo   winget install OpenJS.NodeJS.LTS
    echo.
    pause
    exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
    echo [!] npm is NOT installed
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i

echo [OK] Node.js found: %NODE_VERSION%
echo [OK] npm found: %NPM_VERSION%
echo.

cd /d c:\AI\quantum-x-builder\vizual-x
echo [=>] Working directory: %cd%
echo.

echo [=>] Installing dependencies...
call npm install
if errorlevel 1 (
    echo [!] npm install failed
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.

echo [=>] Building extension...
call npm run build
if errorlevel 1 (
    echo [!] Build failed
    pause
    exit /b 1
)
echo [OK] Build complete
echo.

echo ================================
echo VIZUAL X Extension Ready!
echo ================================
echo.
echo Next steps:
echo   1. Open this folder in VS Code:
echo      code .
echo.
echo   2. Press F5 to launch the extension
echo      in a new VS Code window
echo.
echo   3. Or run commands:
echo      Ctrl+Shift+X  - Open VIZUAL X Studio
echo.
pause
