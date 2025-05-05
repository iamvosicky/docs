#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment to Cloudflare Pages..."

# Build the Next.js application
echo "📦 Building Next.js application..."
npm run build

# Deploy to Cloudflare Pages using next-on-pages
echo "🔄 Deploying to Cloudflare Pages..."
npx @cloudflare/next-on-pages

echo "✅ Deployment complete!"
