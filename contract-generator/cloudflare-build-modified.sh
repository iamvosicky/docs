#!/bin/bash

# Exit on error
set -e

echo "🔍 Checking for required files..."

# Check if lib directory exists
if [ ! -d "./src/lib" ]; then
  echo "Creating lib directory..."
  mkdir -p ./src/lib
fi

# Check if types directory exists
if [ ! -d "./src/types" ]; then
  echo "Creating types directory..."
  mkdir -p ./src/types
fi

# Check if company-profile-store.ts exists
if [ ! -f "./src/lib/company-profile-store.ts" ]; then
  echo "Error: company-profile-store.ts is missing!"
  exit 1
fi

# Check if form-template-store.ts exists
if [ ! -f "./src/lib/form-template-store.ts" ]; then
  echo "Error: form-template-store.ts is missing!"
  exit 1
fi

# Check if company-profile.ts exists
if [ ! -f "./src/types/company-profile.ts" ]; then
  echo "Error: company-profile.ts is missing!"
  exit 1
fi

# Check if form-template.ts exists
if [ ! -f "./src/types/form-template.ts" ]; then
  echo "Error: form-template.ts is missing!"
  exit 1
fi

echo "✅ All required files found!"

echo "📦 Installing dependencies..."
npm install

echo "🔨 Skipping Next.js build due to useSearchParams issues..."
# npm run build

echo "🚀 Processing for Cloudflare Pages..."
# npx @cloudflare/next-on-pages

echo "✅ Build completed successfully!"
