#!/usr/bin/env bash
# =============================================================================
# NexPrompt — VPS deploy script
# Run on the VPS as the deploy user (not root) after first-time setup is done.
# Usage: bash deploy/deploy.sh
# =============================================================================
set -euo pipefail

APP_DIR="/var/www/nexprompt"
REPO_URL="https://github.com/Kalua420/NexPrompt.git"
BRANCH="main"

echo "▶ Pulling latest code..."
cd "$APP_DIR"
git fetch origin
git reset --hard "origin/$BRANCH"

echo "▶ Installing server dependencies..."
cd "$APP_DIR/server"
npm ci --omit=dev

echo "▶ Running Prisma migrations..."
npx prisma db push --accept-data-loss

echo "▶ Building user app..."
cd "$APP_DIR/client"
npm ci
npm run build

echo "▶ Building admin app..."
npm run build:admin

echo "▶ Restarting API server via PM2..."
cd "$APP_DIR"
pm2 reload deploy/ecosystem.config.cjs --env production

echo "▶ Reloading Nginx..."
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Deploy complete."
