#!/bin/bash

# Deployment script for Mega Gamers
set -e

echo "🚀 Starting deployment..."

# Variables
SERVER_IP="31.97.197.116"
SERVER_USER="root"  # or your actual username
REMOTE_PATH="/var/www/megagamers"


# Build frontend locally
echo "📦 Building frontend..."
cd mega-gamers-frontend
npm install
npm run build
cd ..


# Copy files to server
echo "📤 Copying files to server..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.env' \
  --exclude 'logs' \
  ./mega-gamers-backend/ $SERVER_USER@$SERVER_IP:$REMOTE_PATH/mega-gamers-backend/
  

rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.env' \
  ./mega-gamers-frontend/ $SERVER_USER@$SERVER_IP:$REMOTE_PATH/mega-gamers-frontend/


# Copy nginx config
scp mega-gamers-frontend/nginx.conf $SERVER_USER@$SERVER_IP:/etc/nginx/sites-available/megagamers


echo "✅ Files copied successfully!"
echo ""
echo "Next steps:"
echo "1. SSH into your server: ssh $SERVER_USER@$SERVER_IP"
echo "2. Run the server setup commands"
