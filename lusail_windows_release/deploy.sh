#!/bin/bash
set -e

echo "=========================================================="
echo " 🚀 Lusail Marine Monitoring - Deployment Starting"
echo "=========================================================="

if ! docker info > /dev/null 2>&1; then
  echo "❌ Error: Docker daemon is not running. Please start Docker first."
  exit 1
fi

echo "📦 Step 1: Loading Docker images..."
docker load -i images/lusail-database.tar
docker load -i images/lusail-backend.tar
docker load -i images/lusail-frontend.tar
echo "✅ All images loaded!"

echo "📦 Step 2: Starting Database (db_lusail)..."
docker compose up -d database

echo "⏳ Waiting for Database to initialize..."
until [ "`docker inspect -f {{.State.Health.Status}} lusail_database 2>/dev/null`" = "healthy" ]; do
  printf "."
  sleep 2
done
echo ""
echo "✅ Database (db_lusail) is ready!"

echo "📦 Step 3: Starting Backend Service..."
docker compose up -d backend

echo "⏳ Waiting for Backend to connect to DB..."
until [ "`docker inspect -f {{.State.Health.Status}} lusail_backend 2>/dev/null`" = "healthy" ]; do
  printf "."
  sleep 2
done
echo ""
echo "✅ Backend API is active!"

echo "📦 Step 4: Starting Frontend Service..."
docker compose up -d frontend

echo "⏳ Waiting for Frontend..."
until [ "`docker inspect -f {{.State.Health.Status}} lusail_frontend 2>/dev/null`" = "healthy" ]; do
  printf "."
  sleep 2
done
echo ""
echo "=========================================================="
echo " 🎉 DEPLOYED SUCCESSFULLY!"
echo " Web Application: http://localhost (or http://localhost:80)"
echo " REST API:        http://localhost:3000/api"
echo " WebSocket:       ws://localhost:3000"
echo " Database:        localhost:5434 (db_lusail)"
echo "=========================================================="
docker compose ps
