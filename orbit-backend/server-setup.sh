#!/bin/bash

# Server setup script for Mega Gamers
set -e

echo "🔧 Setting up server..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Git (if needed)
sudo apt install -y git

# Create project directory (if not exists)
sudo mkdir -p /var/www/megagamers
sudo chown -R $USER:$USER /var/www/megagamers

# Setup backend
cd /var/www/megagamers/mega-gamers-backend
npm install --production

# Create .env file from template
cp .env.production .env
# EDIT .env WITH PRODUCTION VALUES!
nano .env

# Setup logs directory
mkdir -p logs

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# Setup Nginx
sudo ln -sf /etc/nginx/sites-available/megagamers /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
echo "y" | sudo ufw enable

echo "✅ Server setup complete!"
echo "Your app should be available at http://31.97.197.116"
