#!/bin/bash
# PM2 Deployment Script for Blog WebArtisan
# Run this locally to deploy to VPS

set -e

# VPS Configuration
VPS_HOST="${VPS_HOST:-your-vps-host}"
VPS_USER="${VPS_USER:-root}"
VPS_PATH="${VPS_PATH:-/var/www/blog-webartisan}"

echo "=========================================="
echo "Deploying to VPS via SSH"
echo "Host: $VPS_HOST"
echo "Path: $VPS_PATH"
echo "=========================================="

# Build locally first
echo ""
echo "=== Building locally ==="
pnpm build

# Create deployment package
echo ""
echo "=== Creating deployment package ==="
tar -czf /tmp/blog-webartisan-deploy.tar.gz \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=.git \
  --exclude=*.log \
  .

# Upload to VPS
echo ""
echo "=== Uploading to VPS ==="
scp /tmp/blog-webartisan-deploy.tar.gz $VPS_USER@$VPS_HOST:/tmp/

# Deploy on VPS
echo ""
echo "=== Extracting and restarting on VPS ==="
ssh $VPS_USER@$VPS_HOST << 'ENDSSH'
set -e

VPS_PATH="/var/www/blog-webartisan"
PM2_NAME="blog-webartisan"

echo "Creating directory if not exists..."
sudo mkdir -p $VPS_PATH

echo "Extracting files..."
sudo tar -xzf /tmp/blog-webartisan-deploy.tar.gz -C $VPS_PATH

echo "Installing dependencies..."
cd $VPS_PATH
sudo pnpm install --prod=false

echo "Generating Prisma client..."
sudo pnpm prisma generate

echo "Building Next.js..."
sudo pnpm build

echo "Installing production dependencies..."
sudo pnpm install --prod

echo "Restarting PM2..."
sudo pm2 restart $PM2_NAME || sudo pm2 start npm --name "$PM2_NAME" -- start

echo "Cleanup..."
rm -f /tmp/blog-webartisan-deploy.tar.gz

echo "=== Deployment complete! ==="
pm2 status $PM2_NAME
ENDSSH

# Cleanup local
rm -f /tmp/blog-webartisan-deploy.tar.gz

echo ""
echo "=========================================="
echo "Deployment completed successfully!"
echo "=========================================="
