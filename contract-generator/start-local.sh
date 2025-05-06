#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting Contract Generator platform locally..."

# Function to check if a port is in use
port_in_use() {
  lsof -i:$1 >/dev/null 2>&1
  return $?
}

# Check if required ports are available
if port_in_use 3000; then
  echo "❌ Error: Port 3000 is already in use. Please stop any service using this port."
  exit 1
fi

if port_in_use 8787; then
  echo "❌ Error: Port 8787 is already in use. Please stop any service using this port."
  exit 1
fi

if port_in_use 8080; then
  echo "❌ Error: Port 8080 is already in use. Please stop any service using this port."
  exit 1
fi

# Setup worker
echo "📦 Setting up Cloudflare Worker..."
cd worker
./setup-local.sh

# Setup PDF service
echo "📦 Setting up PDF Service..."
cd ../pdf-service
./setup-local.sh

# Create a migrations.sql file with the schema if it doesn't exist
if [ ! -f "worker/src/db/migrations.sql" ]; then
  echo "⚠️ Warning: migrations.sql file not found. Creating a sample schema..."
  mkdir -p worker/src/db
  cat > worker/src/db/migrations.sql << 'EOL'
-- Create Templates table
CREATE TABLE IF NOT EXISTS Templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  file_key TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- Create Files table
CREATE TABLE IF NOT EXISTS Files (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL,
  name TEXT NOT NULL,
  docx_key TEXT NOT NULL,
  pdf_key TEXT,
  data JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (template_id) REFERENCES Templates(id)
);

-- Create Users table
CREATE TABLE IF NOT EXISTS Users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Logs table
CREATE TABLE IF NOT EXISTS Logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id)
);
EOL
fi

# Start all services in separate terminals
echo "🚀 Starting all services..."

# Start worker
echo "🚀 Starting Cloudflare Worker on http://localhost:8787..."
cd ../worker
osascript -e 'tell app "Terminal" to do script "cd \"'$(pwd)'\" && npm run dev"'

# Start PDF service
echo "🚀 Starting PDF Service on http://localhost:8080..."
cd ../pdf-service
osascript -e 'tell app "Terminal" to do script "cd \"'$(pwd)'\" && npm run dev"'

# Start Next.js frontend
echo "🚀 Starting Next.js frontend on http://localhost:3000..."
cd ..
osascript -e 'tell app "Terminal" to do script "cd \"'$(pwd)'\" && npm run dev"'

echo "✅ All services started successfully!"
echo "📱 Frontend: http://localhost:3000"
echo "🔌 API: http://localhost:8787"
echo "📄 PDF Service: http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop this script (Note: This will not stop the services)"
