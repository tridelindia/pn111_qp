========================================================================
 LUSAIL MARINE MONITORING SYSTEM - DEPLOYMENT INSTRUCTIONS (WINDOWS)
========================================================================

PRE-REQUISITES:
------------------------------------------------------------------------
1. Docker Desktop for Windows must be installed.
   Download if needed: https://www.docker.com/products/docker-desktop/
2. Ensure Docker Desktop is running before deploying (a green whale icon in the taskbar).

QUICK START (ONE-CLICK DEPLOYMENT):
------------------------------------------------------------------------
1. Unzip / Copy this entire "lusail_windows_release" folder to the Windows target machine.
2. Double-click "deploy.bat" (or right-click and select "Run as Administrator").
3. The script will automatically:
   a) Load the pre-built container images into Docker.
   b) Start and initialize the Database (db_lusail) with all default tables.
   c) Verify the database connection and start the Backend API & WebSocket.
   d) Start the Frontend Web Application on port 80.
   e) Open http://localhost in your default web browser.

ACCESS URLS:
------------------------------------------------------------------------
- Web Application: http://localhost (or http://localhost:80)
- Backend REST API: http://localhost:3000/api
- Live WebSocket:   ws://localhost:3000
- PostgreSQL:       localhost:5434 (Database: db_lusail, User: postgres, Password: Tridel@qp@2025)

HOW TO STOP:
------------------------------------------------------------------------
- Double-click "stop.bat" to stop all containers.

HOW TO CHECK STATUS:
------------------------------------------------------------------------
- Double-click "status.bat" to see container status and recent logs.

AUTO-RECOVERY:
------------------------------------------------------------------------
All containers are configured with "restart: always". If the machine restarts
or an unexpected interruption occurs, Docker will automatically restart all
services in the background.

========================================================================
