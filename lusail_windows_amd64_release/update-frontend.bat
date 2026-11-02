@echo off
setlocal enabledelayedexpansion

echo ==========================================================
echo  Updating Lusail Frontend Container (Windows)
echo ==========================================================
echo.

:: 1. Check if Docker is running
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker daemon is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

:: 2. Check if images\lusail-frontend.tar exists
if not exist "images\lusail-frontend.tar" (
    echo [ERROR] images\lusail-frontend.tar not found!
    pause
    exit /b 1
)

:: 3. Load the updated frontend image
echo [1/2] Loading new frontend image from images\lusail-frontend.tar ...
docker load -i images\lusail-frontend.tar
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to load frontend image.
    pause
    exit /b 1
)

:: 4. Recreate only the frontend container (database and backend are untouched)
echo [2/2] Updating and restarting frontend container...
docker compose up -d --no-deps --force-recreate frontend

echo.
echo Waiting for frontend health check...
:WAIT_FRONTEND
timeout /t 2 /nobreak >nul
set "FE_HEALTH=starting"
for /f "tokens=*" %%i in ('docker inspect -f "{{.State.Health.Status}}" lusail_frontend 2^>nul') do set "FE_HEALTH=%%i"
if not "!FE_HEALTH!"=="healthy" (
    echo   ... waiting for frontend [!FE_HEALTH!]
    goto WAIT_FRONTEND
)

echo.
echo ==========================================================
echo  FRONTEND UPDATED SUCCESSFULLY!
echo ==========================================================
echo.
docker compose ps
echo.
echo Launching application in default browser...
timeout /t 2 /nobreak >nul
start http://localhost
echo.
pause

