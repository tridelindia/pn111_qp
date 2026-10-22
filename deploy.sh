#!/bin/bash
set -e

echo "=========================================================="
echo " 🚀 Lusail Marine Monitoring System - Deployment Starting "
echo "=========================================================="

# Check Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Error: Docker is not running. Please start Docker first."
  exit 1
fi

# Ensure .env exists
if [ ! -f .env ]; then
  echo "ℹ️  Creating default .env from .env.example..."
  cp .env.example .env
fi

# Ensure init-db.sql exists
if [ ! -f docker/database/init-db.sql ]; then
  echo "❌ Error: docker/database/init-db.sql not found."
  exit 1
fi

echo "📦 Step 1: Building and starting Database (db_lusail)..."
docker compose up -d database

echo "⏳ Waiting for Database to initialize and restore backup..."
until [ "`docker inspect -f {{.State.Health.Status}} lusail_database 2>/dev/null`" = "healthy" ]; do
  printf "."
  sleep 2
done
echo ""
echo "✅ Database (db_lusail) is healthy and ready!"

echo "📦 Step 2: Building and starting Backend Service..."
docker compose up -d --build backend

echo "⏳ Waiting for Backend to connect to DB and become healthy..."
until [ "`docker inspect -f {{.State.Health.Status}} lusail_backend 2>/dev/null`" = "healthy" ]; do
  printf "."
  sleep 2
done
echo ""
echo "✅ Backend API & WebSocket are active on port 3000!"

echo "📦 Step 3: Building and starting Frontend (Angular + Nginx)..."
docker compose up -d --build frontend

echo "⏳ Waiting for Frontend to start on port 80..."
until [ "`docker inspect -f {{.State.Health.Status}} lusail_frontend 2>/dev/null`" = "healthy" ]; do
  printf "."
  sleep 2
done
echo ""
echo "=========================================================="
echo " 🎉 ALL SERVICES DEPLOYED SUCCESSFULLY! "
echo "=========================================================="
echo " 🌐 Frontend Web App: http://localhost (or http://localhost:80)"
echo " 🔌 Backend API:      http://localhost:3000/api"
echo " ⚡ WebSocket:        ws://localhost:3000"
echo " 🗄️  Database:         localhost:5434 (db_lusail)"
echo "=========================================================="
docker compose ps
