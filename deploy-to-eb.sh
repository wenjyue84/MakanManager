#!/bin/bash

# AWS Elastic Beanstalk Deployment Script for MakanManager
# This script prepares and deploys the application to AWS EB

set -e

echo "🚀 Starting AWS Elastic Beanstalk deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if EB CLI is installed
if ! command -v eb &> /dev/null; then
    print_error "Elastic Beanstalk CLI (eb) is not installed."
    print_status "Install it with: pip install awsebcli --upgrade --user"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Clean up previous builds
print_status "Cleaning up previous builds..."
rm -rf build/
rm -rf dist/
rm -rf node_modules/.cache/

# Install dependencies
print_status "Installing dependencies..."
npm ci

# Build the React application
print_status "Building React application..."
npm run build

# Verify build was successful
if [ ! -d "build" ]; then
    print_error "Build failed - build directory not found"
    exit 1
fi

print_status "Build completed successfully!"
print_status "Build directory contains: $(ls -la build/ | wc -l) files"

# Check if EB is initialized
if [ ! -f ".elasticbeanstalk/config.yml" ]; then
    print_warning "EB not initialized. Run 'eb init' first to set up your application."
    print_status "You can run this script again after initialization."
    exit 1
fi

# Deploy to EB
print_status "Deploying to Elastic Beanstalk..."
eb deploy

# Check deployment status
if [ $? -eq 0 ]; then
    print_status "✅ Deployment successful!"
    print_status "Opening application in browser..."
    eb open
else
    print_error "❌ Deployment failed. Check the logs with 'eb logs'"
    exit 1
fi

print_status "🎉 Deployment process completed!"
print_status "Useful commands:"
print_status "  - View logs: eb logs"
print_status "  - Check status: eb status"
print_status "  - SSH to instance: eb ssh"
print_status "  - Check environment variables: eb printenv"