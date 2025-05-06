#!/bin/bash

# Exit on error
set -e

echo "🚀 Setting up local development environment for Cloudflare Worker..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Error: wrangler is not installed. Please install it with 'npm install -g wrangler'."
    exit 1
fi

# Create a local database directory if it doesn't exist
echo "📦 Setting up local database..."
mkdir -p .wrangler/state/d1

# Initialize the database with schema
echo "📦 Initializing database with schema..."
# Create an empty database file if it doesn't exist
touch .wrangler/state/d1/db.sqlite

# Update wrangler.toml for local development
echo "📝 Updating wrangler.toml for local development..."
# This is handled in the wrangler.toml file already

echo "✅ Local development environment setup complete!"
echo "🚀 Run 'npm run dev' to start the local development server."
