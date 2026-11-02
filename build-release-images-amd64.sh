#!/bin/bash
set -euo pipefail

echo "=========================================================="
echo " Building AMD64 Packages & Exporting Docker Images"
echo "=========================================================="

# Target architecture for Windows Intel/AMD systems
PLATFORM="linux/amd64"
RELEASE_DIR="${1:-lusail_windows_amd64_release}"

# Ensure release directories exist
mkdir -p "$RELEASE_DIR/images"
mkdir -p docker/frontend/html

# 1. Build Angular production frontend bundle
echo "Step 1/4: Building Angular production frontend package..."

npm run build

echo "Copying compiled bundle..."
rm -rf docker/frontend/html/*
cp -r dist/qatar_new/browser/* docker/frontend/html/

echo "Frontend assets ready."

# 2. Build Docker images explicitly for AMD64
echo "Step 2/4: Building AMD64 Docker images..."

echo "Building Database image..."
docker buildx build \
    --platform "$PLATFORM" \
    --load \
    -t lusail-database:latest \
    -f docker/database/Dockerfile \
    docker/database

echo "Building Backend image..."
docker buildx build \
    --platform "$PLATFORM" \
    --load \
    -t lusail-backend:latest \
    -f docker/backend/Dockerfile \
    api

echo "Building Frontend image..."
docker buildx build \
    --platform "$PLATFORM" \
    --load \
    -t lusail-frontend:latest \
    -f docker/frontend/Dockerfile \
    docker/frontend

echo "All images built successfully!"

# 3. Verify architecture before exporting
echo "Step 3/4: Verifying image architectures..."

for IMAGE in lusail-database lusail-backend lusail-frontend
do
    ARCH=$(docker image inspect "$IMAGE:latest" \
        --format '{{.Os}}/{{.Architecture}}')

    echo "$IMAGE: $ARCH"

    if [ "$ARCH" != "$PLATFORM" ]; then
        echo "ERROR: Incorrect architecture for $IMAGE"
        exit 1
    fi
done

# 4. Export images
echo "Step 4/4: Exporting Docker images..."

docker save -o "$RELEASE_DIR/images/lusail-database.tar" lusail-database:latest

docker save -o "$RELEASE_DIR/images/lusail-backend.tar" lusail-backend:latest

docker save -o "$RELEASE_DIR/images/lusail-frontend.tar" lusail-frontend:latest

echo "=========================================================="
echo " Release Package Created Successfully!"
echo " Target Architecture: $PLATFORM"
echo " Destination:         $RELEASE_DIR"
echo "=========================================================="

ls -lh "$RELEASE_DIR/images/"

echo ""
echo "Ready to distribute $RELEASE_DIR/"

