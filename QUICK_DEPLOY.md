# Quick Deploy Reference

## 🚀 First Time Setup (One-time)

```bash
# 1. SSH to VPS
ssh root@your-vps-ip

# 2. Run setup script
cd /tmp
git clone https://github.com/Kalua420/NexPrompt.git
cd NexPrompt/deploy
nano first-time-setup.sh  # Edit DB_PASS
bash first-time-setup.sh

# 3. Create .env files when prompted
# Server: /var/www/nexprompt/server/.env
# Client: /var/www/nexprompt/client/.env

# 4. Create admin account
cd /var/www/nexprompt/server
node create_admin.js
```

---

## 🔄 Deploy Updates (Every time you push code)

```bash
# SSH as deploy user
ssh deploy@your-vps-ip

# Run deploy script
cd /var/www/nexprompt
bash deploy/deploy.sh
```

---

## 📋 Essential Commands

```bash
# Check status
pm2 status

# View logs
pm2 logs nexprompt-api

# Restart API
pm2 restart nexprompt-api

# Check Nginx
sudo nginx -t
sudo systemctl status nginx

# Check database
sudo systemctl status mysql
```

---

## 🔧 Environment Variables Required

### Server (.env)
```env
DATABASE_URL="mysql://nexprompt:PASSWORD@localhost:3306/nexprompt"
JWT_SECRET="64-char-random-string"
JWT_REFRESH_SECRET="64-char-random-string"
CLIENT_URL="https://nexprompt.site,https://admin.nexprompt.site"
GROQ_API_KEY="your-key"
SAMBANOVA_API_KEY="your-key"
```

### Client (.env)
```env
VITE_API_URL=https://nexprompt.site
VITE_SOCKET_URL=https://nexprompt.site
VITE_ADMIN_URL=https://admin.nexprompt.site
VITE_USER_APP_URL=https://nexprompt.site
```

---

## 🆘 Troubleshooting

```bash
# API not responding
pm2 logs nexprompt-api --lines 100

# Nginx errors
tail -f /var/log/nginx/error.log

# Database issues
sudo systemctl restart mysql
cd /var/www/nexprompt/server
npx prisma db push

# Full restart
pm2 restart nexprompt-api
sudo systemctl restart nginx
```

---

## 📍 Important Paths

- **App Directory**: `/var/www/nexprompt`
- **Server .env**: `/var/www/nexprompt/server/.env`
- **Client .env**: `/var/www/nexprompt/client/.env`
- **Nginx Config**: `/etc/nginx/sites-available/`
- **PM2 Logs**: `~/.pm2/logs/`
- **SSL Certs**: `/etc/letsencrypt/live/`

---

## 🌐 URLs

- **User App**: https://nexprompt.site
- **Admin App**: https://admin.nexprompt.site
- **API**: https://nexprompt.site/api (internal: http://localhost:5000)

---

## 🔐 Generate Secure Secrets

```bash
# Generate JWT secrets
openssl rand -base64 48
openssl rand -base64 48
```
