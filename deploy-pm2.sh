#!/bin/bash
# PM2 Deployment Script for Blog WebArtisan
# Run this locally to deploy to VPS

set -e

# VPS Configuration
VPS_HOST="103.189.234.117"
VPS_USER="tamatopik"
VPS_PATH="~/blog-webartisan"
PM2_NAME="blog-webartisan"

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
ssh $VPS_USER@$VPS_HOST << ENDSSH
set -e

VPS_PATH="$VPS_PATH"
PM2_NAME="$PM2_NAME"

echo "Stopping old PM2 process..."
pm2 stop \$PM2_NAME || true
pm2 delete \$PM2_NAME || true

echo "Extracting files..."
tar -xzf /tmp/blog-webartisan-deploy.tar.gz -C \$VPS_PATH

echo "Installing dependencies..."
cd \$VPS_PATH
pnpm install

echo "Generating Prisma client..."
pnpm prisma generate

echo "Restarting PM2..."
pm2 start npm --name "\$PM2_NAME" -- start

echo "Saving PM2 config..."
pm2 save

echo "Cleanup..."
rm -f /tmp/blog-webartisan-deploy.tar.gz

echo "=== Deployment complete! ==="
pm2 status \$PM2_NAME
ENDSSH

# Cleanup local
rm -f /tmp/blog-webartisan-deploy.tar.gz

echo ""
echo "=========================================="
echo "Deployment completed successfully!"
echo "=========================================="
