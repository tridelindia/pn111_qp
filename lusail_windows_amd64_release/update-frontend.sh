#!/bin/bash
set -e

echo "=========================================================="
echo " 🚀 Updating Lusail Frontend Container"
echo "=========================================================="

if ! docker info > /dev/null 2>&1; then
  echo "❌ Error: Docker daemon is not running. Please start Docker first."
  exit 1
fi

if [ ! -f images/lusail-frontend.tar ]; then
  echo "❌ Error: images/lusail-frontend.tar not found!"
  exit 1
fi

echo "📦 Step 1: Loading updated Frontend Docker image..."
docker load -i images/lusail-frontend.tar

echo "📦 Step 2: Restarting Frontend container..."
docker compose up -d --no-deps --force-recreate frontend

echo "⏳ Waiting for Frontend..."
until [ "`docker inspect -f {{.State.Health.Status}} lusail_frontend 2>/dev/null`" = "healthy" ]; do
  printf "."
  sleep 2
done
echo ""

echo "=========================================================="
echo " 🎉 FRONTEND UPDATED SUCCESSFULLY!"
echo " Web Application: http://localhost (or http://localhost:80)"
echo "=========================================================="
docker compose ps

