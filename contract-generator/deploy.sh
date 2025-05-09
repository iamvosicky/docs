#!/bin/bash

# Contract Generator Deployment Script
# This script automates the deployment of the Contract Generator to Cloudflare

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print section headers
print_section() {
  echo -e "\n${YELLOW}==== $1 ====${NC}\n"
}

# Function to print success messages
print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error messages
print_error() {
  echo -e "${RED}✗ $1${NC}"
}

print_section "Starting Deployment to Cloudflare"

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
  print_error "Wrangler CLI is not installed. Please install it with: npm install -g wrangler"
  exit 1
fi

# Check if user is logged in to Cloudflare
print_section "Checking Cloudflare Authentication"
if ! wrangler whoami &> /dev/null; then
  print_error "You are not logged in to Cloudflare. Please run: wrangler login"
  exit 1
fi
print_success "Authenticated with Cloudflare"

# Verify environment files
print_section "Checking Environment Files"
if [ ! -f ".env.production" ]; then
  print_error ".env.production file not found. Please create it based on .env.example"
  exit 1
fi
print_success "Environment files verified"

# Ask if worker should be deployed
print_section "Worker Deployment"
read -p "Do you want to deploy the Worker backend? (y/n): " deploy_worker
if [[ $deploy_worker == "y" || $deploy_worker == "Y" ]]; then
  echo "Navigating to worker directory..."
  cd worker || { print_error "Worker directory not found"; exit 1; }

  echo "Deploying worker..."
  wrangler deploy || { print_error "Worker deployment failed"; exit 1; }
  print_success "Worker deployed successfully"

  # Return to root directory
  cd ..
else
  print_success "Skipping Worker deployment"
fi

# Build the Next.js application
print_section "Building Next.js Application"
echo "📦 Installing dependencies..."
npm install || { print_error "Failed to install dependencies"; exit 1; }

echo "📦 Building application..."
npm run build || { print_error "Build failed"; exit 1; }
print_success "Application built successfully"

# Deploy to Cloudflare Pages
print_section "Deploying to Cloudflare Pages"
echo "🔄 This may take a few minutes..."
npx @cloudflare/next-on-pages || { print_error "Deployment to Cloudflare Pages failed"; exit 1; }
print_success "Deployed to Cloudflare Pages"

# Final instructions
print_section "Deployment Complete"
echo "✅ Your Contract Generator application has been deployed to Cloudflare."
echo "Next steps:"
echo "1. Verify the application is working at your Cloudflare Pages URL"
echo "2. Set up a custom domain in the Cloudflare Pages dashboard (optional)"
echo "3. Configure any additional environment variables in the Cloudflare Pages dashboard"
echo "4. Set up continuous deployment with GitHub (optional)"

print_section "Thank you for using the Contract Generator deployment script!"
