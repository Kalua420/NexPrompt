#!/usr/bin/env bash
# =============================================================================
# NexPrompt — First-time VPS setup
# Run once as root on a fresh Ubuntu VPS.
# Tested on Ubuntu 22.04 LTS.
# =============================================================================
set -euo pipefail

DOMAIN="nexprompt.site"
ADMIN_DOMAIN="admin.nexprompt.site"
APP_DIR="/var/www/nexprompt"
REPO_URL="https://github.com/Kalua420/NexPrompt.git"
DEPLOY_USER="deploy"   # non-root user that will own the app

# -----------------------------------------------------------------------------
# 1. System packages
# -----------------------------------------------------------------------------
echo "▶ Updating system packages..."
apt-get update -y
apt-get upgrade -y
apt-get install -y curl git nginx certbot python3-certbot-nginx ufw

# -----------------------------------------------------------------------------
# 2. Node.js 20 via NodeSource
# -----------------------------------------------------------------------------
echo "▶ Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# -----------------------------------------------------------------------------
# 3. PM2
# -----------------------------------------------------------------------------
echo "▶ Installing PM2..."
npm install -g pm2
mkdir -p /var/log/pm2

# -----------------------------------------------------------------------------
# 4. MySQL 8
# -----------------------------------------------------------------------------
echo "▶ Installing MySQL 8..."
apt-get install -y mysql-server
systemctl enable --now mysql

# Secure MySQL and create the app database + user
# Replace the password below before running
DB_PASS="CHANGE_THIS_DB_PASSWORD"
mysql -u root <<SQL
  ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${DB_PASS}';
  CREATE DATABASE IF NOT EXISTS nexprompt CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  CREATE USER IF NOT EXISTS 'nexprompt'@'localhost' IDENTIFIED BY '${DB_PASS}';
  GRANT ALL PRIVILEGES ON nexprompt.* TO 'nexprompt'@'localhost';
  FLUSH PRIVILEGES;
SQL

# -----------------------------------------------------------------------------
# 5. Deploy user
# -----------------------------------------------------------------------------
echo "▶ Creating deploy user..."
id -u "$DEPLOY_USER" &>/dev/null || useradd -m -s /bin/bash "$DEPLOY_USER"
# Allow deploy user to reload nginx without a password
echo "$DEPLOY_USER ALL=(ALL) NOPASSWD: /usr/sbin/nginx" >> /etc/sudoers.d/deploy-nginx
echo "$DEPLOY_USER ALL=(ALL) NOPASSWD: /bin/systemctl reload nginx" >> /etc/sudoers.d/deploy-nginx

# -----------------------------------------------------------------------------
# 6. Clone repo
# -----------------------------------------------------------------------------
echo "▶ Cloning repository..."
mkdir -p "$APP_DIR"
chown "$DEPLOY_USER":"$DEPLOY_USER" "$APP_DIR"
sudo -u "$DEPLOY_USER" git clone "$REPO_URL" "$APP_DIR"

# -----------------------------------------------------------------------------
# 7. Environment files
# -----------------------------------------------------------------------------
echo "▶ Setting up .env files..."
echo ""
echo "  ⚠  You must manually create:"
echo "     $APP_DIR/server/.env"
echo "     $APP_DIR/client/.env"
echo ""
echo "  Use the .env.example files as templates."
echo "  Key values to set:"
echo "    server/.env  →  DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET,"
echo "                    CLIENT_URL=https://${DOMAIN},https://${ADMIN_DOMAIN}"
echo "    client/.env  →  VITE_API_URL=https://${DOMAIN},"
echo "                    VITE_USER_APP_URL=https://${DOMAIN}"
echo ""
read -rp "  Press ENTER once you have created both .env files..."

# -----------------------------------------------------------------------------
# 8. Install dependencies + build
# -----------------------------------------------------------------------------
echo "▶ Installing server dependencies..."
cd "$APP_DIR/server"
sudo -u "$DEPLOY_USER" npm ci --omit=dev

echo "▶ Running Prisma schema push..."
sudo -u "$DEPLOY_USER" npx prisma db push

echo "▶ Installing client dependencies..."
cd "$APP_DIR/client"
sudo -u "$DEPLOY_USER" npm ci

echo "▶ Building user app..."
sudo -u "$DEPLOY_USER" npm run build

echo "▶ Building admin app..."
sudo -u "$DEPLOY_USER" npm run build:admin

# -----------------------------------------------------------------------------
# 9. Nginx
# -----------------------------------------------------------------------------
echo "▶ Configuring Nginx..."
cp "$APP_DIR/deploy/nginx/nexprompt.site.conf"       /etc/nginx/sites-available/nexprompt.site
cp "$APP_DIR/deploy/nginx/admin.nexprompt.site.conf" /etc/nginx/sites-available/admin.nexprompt.site

ln -sf /etc/nginx/sites-available/nexprompt.site       /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/admin.nexprompt.site /etc/nginx/sites-enabled/

# Remove default site
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl reload nginx

# -----------------------------------------------------------------------------
# 10. SSL via Let's Encrypt
# -----------------------------------------------------------------------------
echo "▶ Obtaining SSL certificates..."
certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m "admin@${DOMAIN}"
certbot --nginx -d "$ADMIN_DOMAIN"             --non-interactive --agree-tos -m "admin@${DOMAIN}"

# Auto-renew cron
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet && systemctl reload nginx") | crontab -

# -----------------------------------------------------------------------------
# 11. Firewall
# -----------------------------------------------------------------------------
echo "▶ Configuring UFW firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# -----------------------------------------------------------------------------
# 12. Start API with PM2
# -----------------------------------------------------------------------------
echo "▶ Starting API server with PM2..."
cd "$APP_DIR"
sudo -u "$DEPLOY_USER" pm2 start deploy/ecosystem.config.cjs --env production
sudo -u "$DEPLOY_USER" pm2 save
sudo env PATH="$PATH:/usr/bin" pm2 startup systemd -u "$DEPLOY_USER" --hp "/home/$DEPLOY_USER"

echo ""
echo "✅ First-time setup complete!"
echo ""
echo "   User app:  https://${DOMAIN}"
echo "   Admin app: https://${ADMIN_DOMAIN}"
echo "   API:       running on 127.0.0.1:5000 (internal only)"
echo ""
echo "   PM2 status:  pm2 status"
echo "   PM2 logs:    pm2 logs nexprompt-api"
echo "   Deploy:      bash $APP_DIR/deploy/deploy.sh"
