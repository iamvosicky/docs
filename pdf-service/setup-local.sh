#!/bin/bash

# Exit on error
set -e

echo "🚀 Setting up local development environment for PDF Service..."

# Check if LibreOffice is installed
if ! command -v libreoffice &> /dev/null; then
    echo "⚠️ Warning: LibreOffice is not installed. PDF conversion will not work."
    echo "Please install LibreOffice using your package manager:"
    echo "  - macOS: brew install libreoffice"
    echo "  - Ubuntu/Debian: sudo apt-get install libreoffice"
    echo "  - Windows: Download from https://www.libreoffice.org/download/download/"
fi

# Create temp directory if it doesn't exist
if [ ! -d "temp" ]; then
    echo "📁 Creating temp directory..."
    mkdir -p temp
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "✅ Local development environment setup complete!"
echo "🚀 Run 'npm run dev' to start the local development server."
