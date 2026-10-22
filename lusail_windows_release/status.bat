@echo off
echo ==========================================================
echo  Lusail Marine Monitoring - Container Status
echo ==========================================================
echo.
docker compose ps
echo.
echo Recent Backend Logs:
docker compose logs --tail=20 backend
echo.
pause
