# 🚀 Reconfigure Your VPS Now - Simple Steps

Follow these exact steps to update your VPS with the latest changes.

---

## Step 1: SSH into your VPS

```bash
ssh your-username@your-vps-ip
```

Or if you set up a deploy user:

```bash
ssh deploy@nexprompt.site
```

---

## Step 2: Run the automated deploy script

```bash
cd /var/www/nexprompt
bash deploy/deploy.sh
```

**This will automatically:**
- ✅ Pull latest code from GitHub
- ✅ Install dependencies
- ✅ Run database migrations
- ✅ Build user app (dist/)
- ✅ Build admin app (dist-admin/)
- ✅ Restart API server
- ✅ Reload Nginx

**Expected output:**
```
▶ Pulling latest code...
▶ Installing server dependencies...
▶ Running Prisma migrations...
▶ Building user app...
▶ Building admin app...
▶ Restarting API server via PM2...
▶ Reloading Nginx...
✅ Deploy complete.
```

---

## Step 3: Verify the deployment

### Check PM2 status
```bash
pm2 status
```

Should show `nexprompt-api` as `online`.

### Check PM2 logs
```bash
pm2 logs nexprompt-api --lines 50
```

Should show no errors, and you should see:
```
✅ Server running on port 5000
✅ Database connected
```

### Check Nginx
```bash
sudo systemctl status nginx
```

Should show `active (running)`.

---

## Step 4: Test in browser

### Test user app
Open: `https://nexprompt.site`

Should show the landing page with "Forge Your Future".

### Test admin app
Open: `https://admin.nexprompt.site`

Should show the admin login page with:
- 🛡️ Shield icon
- "Admin Login" heading
- "Sign in with your admin account" subheading
- NO Google OAuth button
- NO "Create one free" link

---

## ✅ Success Checklist

- [ ] Deploy script completed without errors
- [ ] PM2 shows `nexprompt-api` as online
- [ ] PM2 logs show no errors
- [ ] Nginx is active and running
- [ ] User app loads at `https://nexprompt.site`
- [ ] Admin app loads at `https://admin.nexprompt.site`
- [ ] Admin login page shows correct UI (shield icon, no Google button)
- [ ] Can login to user app
- [ ] Can login to admin app

---

## 🔧 If Something Goes Wrong

### Issue: Deploy script fails

**Try manual deployment:**

```bash
cd /var/www/nexprompt

# Pull code
git pull origin main

# Update server
cd server
npm ci --omit=dev
npx prisma db push

# Update and build client
cd ../client
npm ci
npm run build
npm run build:admin

# Restart services
pm2 restart all
sudo systemctl reload nginx
```

### Issue: Admin app still shows user login

**Clear cache and rebuild:**

```bash
cd /var/www/nexprompt/client

# Remove old builds
rm -rf dist dist-admin

# Clear cache
rm -rf node_modules/.vite node_modules/.vite-admin

# Rebuild
npm run build
npm run build:admin

# Verify admin build
ls -la dist-admin/
grep "admin-main" dist-admin/index.html

# Restart
pm2 restart all
sudo systemctl reload nginx
```

### Issue: 502 Bad Gateway

**Check API server:**

```bash
# Check PM2
pm2 status

# Check logs
pm2 logs nexprompt-api --lines 100

# Restart API
pm2 restart nexprompt-api
```

### Issue: CORS errors

**Check environment variables:**

```bash
cd /var/www/nexprompt/server
cat .env | grep CLIENT_URL
```

Should show:
```
CLIENT_URL="https://nexprompt.site,https://admin.nexprompt.site"
```

If not, edit and restart:
```bash
nano /var/www/nexprompt/server/.env
# Add/fix: CLIENT_URL="https://nexprompt.site,https://admin.nexprompt.site"
pm2 restart nexprompt-api
```

---

## 📞 Need More Help?

Check these files in the repo:
- `VPS_RECONFIGURE_GUIDE.md` - Detailed troubleshooting guide
- `VPS_QUICK_COMMANDS.md` - Quick command reference
- `deploy/deploy.sh` - Automated deploy script
- `deploy/first-time-setup.sh` - First-time VPS setup

Or check logs:
```bash
# API logs
pm2 logs nexprompt-api --lines 100

# Nginx error logs
sudo tail -100 /var/log/nginx/error.log

# Nginx access logs
sudo tail -100 /var/log/nginx/access.log
```

---

## 🎯 Quick Commands Summary

```bash
# Deploy
cd /var/www/nexprompt && bash deploy/deploy.sh

# Check status
pm2 status && sudo systemctl status nginx

# View logs
pm2 logs nexprompt-api

# Restart everything
pm2 restart all && sudo systemctl reload nginx

# Emergency rebuild
cd /var/www/nexprompt/client
rm -rf dist dist-admin node_modules/.vite*
npm run build && npm run build:admin
pm2 restart all && sudo systemctl reload nginx
```

---

## 🎉 That's It!

Your VPS should now be running the latest version with:
- ✅ Fixed admin app routing
- ✅ Separate builds for user and admin apps
- ✅ Proper CORS configuration
- ✅ Enhanced security headers
- ✅ All latest features and fixes

Visit your sites:
- **User app:** https://nexprompt.site
- **Admin app:** https://admin.nexprompt.site
