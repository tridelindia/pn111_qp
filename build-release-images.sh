#!/bin/bash
set -e

echo "=========================================================="
echo " 🏗️  Building Packages & Exporting Docker Images for Release"
echo "=========================================================="

# Ensure release directories exist
mkdir -p lusail_windows_release/images
mkdir -p docker/frontend/html

# 1. Build Angular production frontend bundle
echo "📦 Step 1/4: Building Angular production frontend package..."
npm run build
echo "Copying compiled bundle into docker/frontend/html..."
rm -rf docker/frontend/html/*
cp -r dist/qatar_new/browser/* docker/frontend/html/
echo "✅ Frontend assets ready."

# 2. Build Docker images locally
echo "📦 Step 2/4: Building Docker container images..."

echo "  - Building Database image (lusail-database:latest)..."
docker build -t lusail-database:latest -f docker/database/Dockerfile docker/database

echo "  - Building Backend image (lusail-backend:latest)..."
docker build -t lusail-backend:latest -f docker/backend/Dockerfile api

echo "  - Building Frontend image (lusail-frontend:latest)..."
docker build -t lusail-frontend:latest -f docker/frontend/Dockerfile docker/frontend

echo "✅ All 3 images built successfully!"

# 3. Export images to tar archives
echo "📦 Step 3/4: Exporting images to tar archives for client distribution..."

echo "  - Exporting lusail-database.tar..."
docker save -o lusail_windows_release/images/lusail-database.tar lusail-database:latest

echo "  - Exporting lusail-backend.tar..."
docker save -o lusail_windows_release/images/lusail-backend.tar lusail-backend:latest

echo "  - Exporting lusail-frontend.tar..."
docker save -o lusail_windows_release/images/lusail-frontend.tar lusail-frontend:latest

echo "✅ All images exported to lusail_windows_release/images/!"

# 4. Summary
echo "=========================================================="
echo " 🎉 Release Package Created Successfully!"
echo " Folder: lusail_windows_release/"
echo "=========================================================="
ls -lh lusail_windows_release/images/
echo ""
echo "You can now zip and deliver the 'lusail_windows_release' folder directly to your client."
echo "No source code is exposed."
