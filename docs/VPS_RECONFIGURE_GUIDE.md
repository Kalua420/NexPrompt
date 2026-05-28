# VPS Reconfiguration Guide

This guide will help you update your existing VPS deployment with the latest changes, including the admin app routing fixes.

## Prerequisites

- SSH access to your VPS
- Sudo privileges
- Your VPS is already running NexPrompt (first-time setup was completed)

---

## Quick Update (Recommended)

If your VPS is already set up and running, use this quick method:

### Step 1: SSH into your VPS

```bash
ssh your-user@your-vps-ip
# or
ssh deploy@nexprompt.site
```

### Step 2: Navigate to app directory

```bash
cd /var/www/nexprompt
```

### Step 3: Run the deploy script

```bash
bash deploy/deploy.sh
```

This will:
- Pull latest code from GitHub
- Install dependencies
- Run Prisma migrations
- Build both user and admin apps
- Restart PM2 processes
- Reload Nginx

### Step 4: Verify deployment

```bash
# Check PM2 status
pm2 status

# Check PM2 logs
pm2 logs nexprompt-api --lines 50

# Check Nginx status
sudo systemctl status nginx

# Test the sites
curl -I https://nexprompt.site
curl -I https://admin.nexprompt.site
```

---

## Manual Update (If deploy script fails)

If the automated script fails, follow these manual steps:

### 1. Pull latest code

```bash
cd /var/www/nexprompt
git fetch origin
git pull origin main
```

### 2. Update server dependencies

```bash
cd /var/www/nexprompt/server
npm ci --omit=dev
```

### 3. Update database schema

```bash
cd /var/www/nexprompt/server
npx prisma db push
```

### 4. Update client dependencies

```bash
cd /var/www/nexprompt/client
npm ci
```

### 5. Build user app

```bash
cd /var/www/nexprompt/client
npm run build
```

This creates `dist/` folder with the user app.

### 6. Build admin app

```bash
cd /var/www/nexprompt/client
npm run build:admin
```

This creates `dist-admin/` folder with the admin app.

### 7. Update Nginx configurations

```bash
# Backup existing configs
sudo cp /etc/nginx/sites-available/nexprompt.site /etc/nginx/sites-available/nexprompt.site.backup
sudo cp /etc/nginx/sites-available/admin.nexprompt.site /etc/nginx/sites-available/admin.nexprompt.site.backup

# Copy new configs
sudo cp /var/www/nexprompt/deploy/nginx/nexprompt.site.conf /etc/nginx/sites-available/nexprompt.site
sudo cp /var/www/nexprompt/deploy/nginx/admin.nexprompt.site.conf /etc/nginx/sites-available/admin.nexprompt.site

# Test Nginx config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 8. Restart PM2 processes

```bash
cd /var/www/nexprompt
pm2 reload deploy/ecosystem.config.cjs --env production

# Or restart all
pm2 restart all
```

### 9. Verify everything is working

```bash
# Check PM2
pm2 status
pm2 logs nexprompt-api --lines 50

# Check Nginx
sudo systemctl status nginx

# Check disk space
df -h

# Check memory
free -h
```

---

## Environment Variables Check

Ensure your environment files are properly configured:

### Server `.env` (`/var/www/nexprompt/server/.env`)

```bash
# Database
DATABASE_URL="mysql://nexprompt:YOUR_PASSWORD@localhost:3306/nexprompt"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars"

# CORS - IMPORTANT: Include both domains
CLIENT_URL="https://nexprompt.site,https://admin.nexprompt.site"

# AI Provider Keys (optional)
GROQ_API_KEY="your-groq-key"
OPENAI_API_KEY="your-openai-key"
ANTHROPIC_API_KEY="your-anthropic-key"
GEMINI_API_KEY="your-gemini-key"

# Razorpay (optional)
RAZORPAY_KEY_ID="your-razorpay-key"
RAZORPAY_KEY_SECRET="your-razorpay-secret"
RAZORPAY_WEBHOOK_SECRET="your-webhook-secret"

# Email (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### Client `.env` (`/var/www/nexprompt/client/.env`)

```bash
# API URL - points to your main domain
VITE_API_URL=https://nexprompt.site

# User app URL - for redirects from admin
VITE_USER_APP_URL=https://nexprompt.site

# Admin app URL - for redirects from user app
VITE_ADMIN_URL=https://admin.nexprompt.site

# Google OAuth (optional)
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

**Important:** After changing `.env` files, you must rebuild and restart:

```bash
cd /var/www/nexprompt/client
npm run build
npm run build:admin

cd /var/www/nexprompt
pm2 restart all
```

---

## Troubleshooting

### Issue: Admin app shows user login page

**Cause:** Build cache or incorrect build output

**Solution:**
```bash
cd /var/www/nexprompt/client

# Clear build outputs
rm -rf dist dist-admin

# Clear node cache
rm -rf node_modules/.vite node_modules/.vite-admin

# Rebuild both apps
npm run build
npm run build:admin

# Verify the builds
ls -la dist/
ls -la dist-admin/

# Check that dist-admin/index.html loads admin-main.jsx
grep "admin-main" dist-admin/index.html
```

### Issue: 502 Bad Gateway

**Cause:** API server not running

**Solution:**
```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs nexprompt-api --lines 100

# Restart API
pm2 restart nexprompt-api

# If still failing, check server .env
cd /var/www/nexprompt/server
cat .env | grep DATABASE_URL
```

### Issue: CORS errors in browser console

**Cause:** CLIENT_URL in server `.env` doesn't include both domains

**Solution:**
```bash
cd /var/www/nexprompt/server
nano .env

# Ensure this line includes BOTH domains:
CLIENT_URL="https://nexprompt.site,https://admin.nexprompt.site"

# Save and restart
pm2 restart nexprompt-api
```

### Issue: SSL certificate errors

**Cause:** Certificates expired or not properly configured

**Solution:**
```bash
# Check certificate status
sudo certbot certificates

# Renew certificates
sudo certbot renew

# Reload Nginx
sudo systemctl reload nginx
```

### Issue: Database connection errors

**Cause:** MySQL not running or wrong credentials

**Solution:**
```bash
# Check MySQL status
sudo systemctl status mysql

# Start MySQL if stopped
sudo systemctl start mysql

# Test database connection
mysql -u nexprompt -p nexprompt

# Check Prisma connection
cd /var/www/nexprompt/server
npx prisma db push
```

---

## Verification Checklist

After reconfiguration, verify these:

- [ ] User app loads at `https://nexprompt.site`
- [ ] Admin app loads at `https://admin.nexprompt.site`
- [ ] Admin login page shows "Admin Login" with shield icon (not "Forge Your Future")
- [ ] User can register/login on user app
- [ ] Admin can login on admin app
- [ ] API requests work (check browser DevTools Network tab)
- [ ] WebSocket connections work (for streaming)
- [ ] PM2 shows all processes running: `pm2 status`
- [ ] Nginx shows no errors: `sudo nginx -t`
- [ ] SSL certificates are valid: `sudo certbot certificates`

---

## Useful Commands

```bash
# View PM2 logs in real-time
pm2 logs nexprompt-api

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log

# View Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Restart everything
pm2 restart all && sudo systemctl reload nginx

# Check disk space
df -h

# Check memory usage
free -h

# Check running processes
ps aux | grep node

# Check open ports
sudo netstat -tulpn | grep LISTEN
```

---

## Rollback (If something goes wrong)

If the update breaks something, you can rollback:

```bash
cd /var/www/nexprompt

# Find the previous commit
git log --oneline -10

# Rollback to previous commit (replace COMMIT_HASH)
git reset --hard COMMIT_HASH

# Rebuild
cd client
npm run build
npm run build:admin

# Restart
pm2 restart all
sudo systemctl reload nginx
```

---

## Need Help?

If you encounter issues:

1. Check PM2 logs: `pm2 logs nexprompt-api --lines 100`
2. Check Nginx logs: `sudo tail -100 /var/log/nginx/error.log`
3. Check browser console for errors (F12)
4. Verify environment variables are correct
5. Ensure both builds completed successfully (`dist/` and `dist-admin/` exist)

---

## Summary

**Quick update:** `bash deploy/deploy.sh`

**Manual update:**
1. Pull code: `git pull origin main`
2. Install deps: `npm ci` (in both server/ and client/)
3. Build apps: `npm run build && npm run build:admin` (in client/)
4. Restart: `pm2 restart all && sudo systemctl reload nginx`

**Verify:** Check both `nexprompt.site` and `admin.nexprompt.site` in browser
