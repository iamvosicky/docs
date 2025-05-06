#!/bin/bash

# Exit on error
set -e

echo "🚀 Initializing D1 database..."

# Get the database ID from wrangler.toml
DB_ID=$(grep -o 'database_id = "[^"]*"' wrangler.toml | cut -d'"' -f2)

if [ "$DB_ID" = "placeholder-id" ]; then
  echo "❌ Error: Please update the database_id in wrangler.toml first!"
  exit 1
fi

# Apply migrations
echo "📦 Applying database migrations..."
wrangler d1 execute contract_generator --file=./src/db/migrations.sql

echo "✅ Database initialization complete!"
