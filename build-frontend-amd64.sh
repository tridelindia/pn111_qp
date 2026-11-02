#!/bin/bash
set -euo pipefail

echo "=========================================================="
echo " Building AMD64 Frontend & Exporting Docker Image"
echo "=========================================================="

PLATFORM="linux/amd64"
RELEASE_DIR="${1:-lusail_windows_amd64_release}"

mkdir -p "$RELEASE_DIR/images"
mkdir -p docker/frontend/html

# 1. Build Angular production frontend bundle
echo "Step 1/3: Building Angular production frontend package..."
npm run build

echo "Copying compiled bundle..."
rm -rf docker/frontend/html/*
cp -r dist/qatar_new/browser/* docker/frontend/html/
echo "Frontend assets ready."

# 2. Build Frontend Docker image explicitly for AMD64
echo "Step 2/3: Building AMD64 Frontend Docker image..."
docker buildx build \
    --platform "$PLATFORM" \
    --load \
    -t lusail-frontend:latest \
    -f docker/frontend/Dockerfile \
    docker/frontend

# 3. Verify architecture before exporting
echo "Step 3/3: Verifying image architecture..."
ARCH=$(docker image inspect lusail-frontend:latest --format '{{.Os}}/{{.Architecture}}')
echo "lusail-frontend: $ARCH"

if [ "$ARCH" != "$PLATFORM" ]; then
    echo "ERROR: Incorrect architecture for lusail-frontend (expected $PLATFORM, got $ARCH)"
    exit 1
fi

echo "Exporting lusail-frontend.tar..."
docker save -o "$RELEASE_DIR/images/lusail-frontend.tar" lusail-frontend:latest

echo "=========================================================="
echo " Frontend AMD64 Image Built & Exported Successfully!"
echo " Location: $RELEASE_DIR/images/lusail-frontend.tar"
echo "=========================================================="
ls -lh "$RELEASE_DIR/images/lusail-frontend.tar"

