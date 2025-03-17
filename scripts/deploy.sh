#!/usr/bin/env bash
set -euo pipefail

# Idempotent deployment script for ShopSmart
# Safe to run multiple times — produces the same result

APP_DIR="/home/ubuntu/shopsmart"
SERVICE_NAME="shopsmart"

echo "==> Starting deployment..."

# Install Node.js if not present (idempotent)
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

# Install dependencies
cd "$APP_DIR/frontend" && npm ci --prefer-offline
cd "$APP_DIR/backend"  && npm ci --prefer-offline

# Build frontend
cd "$APP_DIR/frontend" && npm run build

# Run DB migrations (idempotent — Prisma skips already-applied)
cd "$APP_DIR/backend" && npx prisma migrate deploy

# Restart backend with PM2 (idempotent — creates or restarts)
if pm2 list | grep -q "$SERVICE_NAME"; then
  pm2 restart "$SERVICE_NAME"
else
  pm2 start dist/index.js --name "$SERVICE_NAME"
fi

pm2 save

echo "==> Deployment complete."
