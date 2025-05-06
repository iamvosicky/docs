#!/bin/bash

# Exit on error
set -e

# Configuration
IMAGE_NAME="contract-generator-pdf-service"
CONTAINER_NAME="contract-generator-pdf-service"
PORT=8080

# Build the Docker image
echo "🔨 Building Docker image..."
docker build -t $IMAGE_NAME .

# Stop and remove existing container if it exists
if [ "$(docker ps -a -q -f name=$CONTAINER_NAME)" ]; then
    echo "🛑 Stopping and removing existing container..."
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
fi

# Run the container
echo "🚀 Starting container..."
docker run -d \
    --name $CONTAINER_NAME \
    -p $PORT:$PORT \
    --restart unless-stopped \
    --env-file .env.production \
    $IMAGE_NAME

echo "✅ Deployment complete! Service is running on port $PORT"
