#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment to Cloudflare Pages..."

# Navigate to the contract-generator directory
cd contract-generator

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the Next.js application
echo "📦 Building Next.js application..."
npm run build

# Deploy to Cloudflare Pages using next-on-pages
echo "🔄 Preparing for Cloudflare Pages..."
npx @cloudflare/next-on-pages

echo "✅ Build complete! Files are ready for deployment."
