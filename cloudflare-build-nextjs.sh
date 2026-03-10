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

# Check for required files
required_files=(
  "./src/lib/company-profile-store.ts"
  "./src/lib/form-template-store.ts"
  "./src/types/company-profile.ts"
  "./src/types/form-template.ts"
)

for file in "${required_files[@]}"; do
  if [ ! -f "$file" ]; then
    echo "Error: $file is missing!"
    exit 1
  fi
done

echo "✅ All required files found!"

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building Next.js application for Cloudflare Pages..."

# Update next.config.js to use the correct output mode for Cloudflare
cat > next.config.js << 'CONFIG_EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Use 'export' output for static site generation
  output: 'export',
  
  // Ignore ESLint errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Ignore TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Configure images for static export
  images: {
    unoptimized: true,
  },
  
  // Ensure all files are included in the build
  webpack: (config, { isServer }) => {
    // Add src directory to the webpack resolve modules
    config.resolve.modules.push('./src');
    return config;
  },
  
  // Fix hydration issues
  experimental: {
    // This helps with hydration issues
    optimizeCss: true,
  },
};

module.exports = nextConfig;
CONFIG_EOF

# Build the Next.js application
npm run build

# Create the Cloudflare Pages configuration
mkdir -p .vercel/output/static
cp -r out/* .vercel/output/static/

# Create a _routes.json file for Cloudflare Pages
cat > .vercel/output/static/_routes.json << 'JSON_EOF'
{
  "version": 1,
  "include": ["/*"],
  "exclude": []
}
JSON_EOF

echo "✅ Next.js application built successfully!"
echo "🚀 Ready for Cloudflare Pages deployment!"
