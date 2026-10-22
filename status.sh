#!/bin/bash
echo "=========================================================="
echo " Lusail Marine Monitoring - Container Status"
echo "=========================================================="
docker compose ps
echo ""
echo "Recent Backend Logs:"
docker compose logs --tail=15 backend
