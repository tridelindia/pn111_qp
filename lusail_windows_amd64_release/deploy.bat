@echo off
setlocal enabledelayedexpansion

echo ==========================================================
echo  Lusail Marine Monitoring System - Windows Deployment
echo ==========================================================
echo.

:: 1. Check if Docker is installed and running
docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker is not installed or not in your PATH.
    echo Please install Docker Desktop for Windows: https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)

docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker daemon is not running.
    echo Please start Docker Desktop and ensure it says "Docker Engine is running", then run deploy.bat again.
    echo.
    pause
    exit /b 1
)

:: 2. Load Docker Images from .tar packages
echo [1/4] Loading pre-built Docker images into Docker engine...

if not exist "images\lusail-database.tar" (
    echo [ERROR] images\lusail-database.tar not found!
    pause
    exit /b 1
)
echo   - Loading Database image from images\lusail-database.tar ...
docker load -i images\lusail-database.tar

if not exist "images\lusail-backend.tar" (
    echo [ERROR] images\lusail-backend.tar not found!
    pause
    exit /b 1
)
echo   - Loading Backend image from images\lusail-backend.tar ...
docker load -i images\lusail-backend.tar

if not exist "images\lusail-frontend.tar" (
    echo [ERROR] images\lusail-frontend.tar not found!
    pause
    exit /b 1
)
echo   - Loading Frontend image from images\lusail-frontend.tar ...
docker load -i images\lusail-frontend.tar

echo [OK] All container images loaded successfully!
echo.

:: 3. Start Database Service
echo [2/4] Starting Database container [db_lusail]...
docker compose up -d database

echo Waiting for database to initialize and restore data...
:WAIT_DB
timeout /t 3 /nobreak >nul
set "DB_HEALTH=starting"
for /f "tokens=*" %%i in ('docker inspect -f "{{.State.Health.Status}}" lusail_database 2^>nul') do set "DB_HEALTH=%%i"
if not "!DB_HEALTH!"=="healthy" (
    echo   ... still initializing database [!DB_HEALTH!]
    goto WAIT_DB
)
echo [OK] Database [db_lusail] is healthy and ready!
echo.

:: 4. Start Backend Service
echo [3/4] Starting Backend API and WebSocket service...
docker compose up -d backend

echo Waiting for backend to connect to database and start...
:WAIT_BACKEND
timeout /t 3 /nobreak >nul
set "BE_HEALTH=starting"
for /f "tokens=*" %%i in ('docker inspect -f "{{.State.Health.Status}}" lusail_backend 2^>nul') do set "BE_HEALTH=%%i"
if not "!BE_HEALTH!"=="healthy" (
    echo   ... waiting for backend [!BE_HEALTH!]
    goto WAIT_BACKEND
)
echo [OK] Backend API is active and connected!
echo.

:: 5. Start Frontend Service
echo [4/4] Starting Frontend Web Application...
docker compose up -d frontend

echo Waiting for frontend web server...
:WAIT_FRONTEND
timeout /t 2 /nobreak >nul
set "FE_HEALTH=starting"
for /f "tokens=*" %%i in ('docker inspect -f "{{.State.Health.Status}}" lusail_frontend 2^>nul') do set "FE_HEALTH=%%i"
if not "!FE_HEALTH!"=="healthy" (
    echo   ... waiting for frontend [!FE_HEALTH!]
    goto WAIT_FRONTEND
)
echo [OK] Frontend application is online!
echo.

echo ==========================================================
echo  DEPLOYMENT COMPLETED SUCCESSFULLY!
echo ==========================================================
echo.
echo   Web Application: http://localhost
echo   REST API:        http://localhost:3000/api
echo   WebSocket:       ws://localhost:3000
echo   Database:        localhost:5434 [db_lusail]
echo.
echo ==========================================================
docker compose ps
echo.
echo Launching application in default browser...
timeout /t 2 /nobreak >nul
start http://localhost
echo.
echo Press any key to close this installer window.
pause >nul
