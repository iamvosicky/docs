#!/bin/bash

# Exit on error
set -e

echo "🔧 Setting up environment variables for Cloudflare Worker..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Error: wrangler is not installed. Please install it with 'npm install -g wrangler'."
    exit 1
fi

# Check if user is logged in
if ! wrangler whoami &> /dev/null; then
    echo "❌ Error: You are not logged in to Cloudflare. Please run 'wrangler login' first."
    exit 1
fi

# Set environment variables
echo "📝 Setting JWT_SECRET..."
wrangler secret put JWT_SECRET

echo "📝 Setting ALLOWED_ORIGINS..."
wrangler secret put ALLOWED_ORIGINS

echo "📝 Setting PDF_SERVICE_URL..."
wrangler secret put PDF_SERVICE_URL

echo "📝 Setting ADMIN_EMAIL..."
wrangler secret put ADMIN_EMAIL

echo "✅ Environment variables set successfully!"
