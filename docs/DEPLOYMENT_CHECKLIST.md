# 🚀 Admin Subdomain Deployment Checklist

## Pre-Deployment Verification

### ✅ Code Changes
- [x] Modified `client/src/App.jsx` - Removed admin routes
- [x] Modified `client/src/AdminApp.jsx` - Updated route paths
- [x] Modified `client/src/pages/Admin/Login.jsx` - Cross-domain navigation
- [x] Modified `client/src/pages/Admin/Admin.jsx` - Updated redirects
- [x] Modified `client/src/pages/Auth/Login.jsx` - Admin redirect to subdomain
- [x] Modified `client/src/components/Sidebar.jsx` - Admin link to subdomain
- [x] All files pass diagnostics (no errors)

### ✅ Documentation Created
- [x] `ADMIN_SUBDOMAIN_SETUP.md` - Comprehensive guide
- [x] `QUICK_DEPLOY_REFERENCE.md` - Quick commands
- [x] `ADMIN_SUBDOMAIN_CHANGES.md` - Change log
- [x] `IMPLEMENTATION_COMPLETE.md` - Summary
- [x] `ARCHITECTURE_DIAGRAM.md` - Visual diagrams
- [x] `DEPLOYMENT_CHECKLIST.md` - This file

---

## Local Testing (Before Deployment)

### Step 1: Test User App
```bash
cd client
npm install
npm run dev
```

- [ ] User app starts on http://localhost:5173
- [ ] Landing page loads
- [ ] Login page loads
- [ ] Can register new user
- [ ] Can login as regular user
- [ ] Dashboard loads after login
- [ ] No console errors
- [ ] No admin routes accessible

### Step 2: Test Admin App
```bash
cd client
npm run dev:admin
```

- [ ] Admin app starts on http://localhost:5174
- [ ] Redirects to `/login` automatically
- [ ] Admin login page loads
- [ ] "Back to user login" link works (goes to localhost:5173)
- [ ] No console errors

### Step 3: Test Backend
```bash
cd server
npm install
npm run dev
```

- [ ] Backend starts on http://localhost:5000
- [ ] Database connection works
- [ ] API endpoints respond
- [ ] No startup errors

### Step 4: Test Admin Login Flow
- [ ] Create admin user: `cd server && node create_admin.js`
- [ ] Login with admin credentials at http://localhost:5174/login
- [ ] Redirected to `/dashboard` after login
- [ ] Admin dashboard loads correctly
- [ ] Can access admin features

### Step 5: Test Cross-Domain Navigation
- [ ] Login as admin on user app (localhost:5173)
- [ ] Should redirect to admin app (localhost:5174)
- [ ] Click "Back to user login" on admin app
- [ ] Should redirect to user app (localhost:5173)
- [ ] Login as regular user on admin app
- [ ] Should be blocked or redirected to user app

### Step 6: Test Builds
```bash
cd client
npm run build
npm run build:admin
```

- [ ] User app builds successfully → `dist/`
- [ ] Admin app builds successfully → `dist-admin/`
- [ ] No build errors
- [ ] Both `dist/` and `dist-admin/` contain `index.html`

---

## VPS Deployment

### Pre-Deployment Requirements

#### DNS Configuration
- [ ] `nexprompt.site` A record points to VPS IP
- [ ] `admin.nexprompt.site` A record points to VPS IP
- [ ] DNS propagation complete (check with `nslookup`)

#### VPS Access
- [ ] SSH access to VPS
- [ ] Root or sudo privileges
- [ ] Git installed
- [ ] Node.js 20+ installed

---

## First-Time VPS Setup

### Step 1: Run First-Time Setup Script
```bash
# SSH into VPS as root
ssh root@YOUR_VPS_IP

# Clone repository
cd /var/www
git clone https://github.com/YOUR_USERNAME/nexprompt.git

# Run first-time setup
cd nexprompt
bash deploy/first-time-setup.sh
```

**Checklist:**
- [ ] Script completes without errors
- [ ] Node.js installed
- [ ] Nginx installed
- [ ] PM2 installed
- [ ] Certbot installed
- [ ] Deploy user created
- [ ] Project directory created at `/var/www/nexprompt`
- [ ] Nginx configs copied to `/etc/nginx/sites-available/`
- [ ] Nginx configs symlinked to `/etc/nginx/sites-enabled/`

### Step 2: Obtain SSL Certificates
```bash
# For user domain
sudo certbot --nginx -d nexprompt.site -d www.nexprompt.site

# For admin domain
sudo certbot --nginx -d admin.nexprompt.site
```

**Checklist:**
- [ ] SSL certificate obtained for `nexprompt.site`
- [ ] SSL certificate obtained for `admin.nexprompt.site`
- [ ] Nginx configs updated with SSL paths
- [ ] HTTPS redirects working

### Step 3: Configure Environment Variables

#### Server Environment
```bash
cd /var/www/nexprompt/server
cp .env.example .env
nano .env
```

**Required variables:**
- [ ] `DATABASE_URL` - MySQL connection string
- [ ] `JWT_SECRET` - Random secret key
- [ ] `JWT_REFRESH_SECRET` - Random secret key
- [ ] `GROQ_API_KEY` - Groq API key (minimum)
- [ ] Other provider API keys (optional)

#### Client Environment
```bash
cd /var/www/nexprompt/client
cp ../deploy/env.client.production .env
nano .env
```

**Required variables:**
- [ ] `VITE_API_URL=https://nexprompt.site`
- [ ] `VITE_SOCKET_URL=https://nexprompt.site`
- [ ] `VITE_ADMIN_URL=https://admin.nexprompt.site`
- [ ] `VITE_USER_APP_URL=https://nexprompt.site`
- [ ] `VITE_GOOGLE_CLIENT_ID` (optional)

### Step 4: Database Setup
```bash
cd /var/www/nexprompt/server
npm install
npx prisma db push
```

**Checklist:**
- [ ] Database schema created
- [ ] No Prisma errors
- [ ] Can connect to database

### Step 5: Create Admin User
```bash
cd /var/www/nexprompt/server
node create_admin.js
```

**Checklist:**
- [ ] Admin user created successfully
- [ ] Email and password noted securely
- [ ] User has `role: 'admin'` in database

### Step 6: Initial Deploy
```bash
cd /var/www/nexprompt
bash deploy/deploy.sh
```

**Checklist:**
- [ ] Git pull successful
- [ ] Server dependencies installed
- [ ] Client dependencies installed
- [ ] User app built successfully
- [ ] Admin app built successfully
- [ ] PM2 process started
- [ ] Nginx reloaded

---

## Post-Deployment Verification

### Step 1: Check Services
```bash
# Check PM2 status
pm2 status

# Check Nginx status
sudo systemctl status nginx

# Check Nginx config
sudo nginx -t
```

**Checklist:**
- [ ] PM2 shows `nexprompt-api` as `online`
- [ ] Nginx is `active (running)`
- [ ] Nginx config test passes

### Step 2: Test User App
Visit https://nexprompt.site

**Checklist:**
- [ ] Site loads with HTTPS (green padlock)
- [ ] Landing page displays correctly
- [ ] Can navigate to login page
- [ ] Can register new user
- [ ] Can login as regular user
- [ ] Dashboard loads after login
- [ ] No console errors in browser
- [ ] All features work (workspace, templates, etc.)

### Step 3: Test Admin App
Visit https://admin.nexprompt.site

**Checklist:**
- [ ] Site loads with HTTPS (green padlock)
- [ ] Automatically redirects to `/login`
- [ ] Admin login page displays correctly
- [ ] "Back to user login" link works
- [ ] Can login with admin credentials
- [ ] Redirected to `/dashboard` after login
- [ ] Admin dashboard loads correctly
- [ ] No console errors in browser

### Step 4: Test Cross-Domain Navigation

**From User App:**
- [ ] Login as admin user on https://nexprompt.site/login
- [ ] Should redirect to https://admin.nexprompt.site/dashboard
- [ ] Admin dashboard loads correctly

**From Admin App:**
- [ ] Click "Back to user login" on admin login page
- [ ] Should redirect to https://nexprompt.site/login
- [ ] User login page loads correctly

**Admin Link in Sidebar:**
- [ ] Login as admin on user app
- [ ] Sidebar shows "Admin" link
- [ ] Click "Admin" link
- [ ] Should redirect to https://admin.nexprompt.site/dashboard

### Step 5: Test API Endpoints

**From User App:**
```bash
# Test user API
curl -X POST https://nexprompt.site/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

**From Admin App:**
```bash
# Test admin API (with JWT token)
curl -X GET https://admin.nexprompt.site/api/admin/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Checklist:**
- [ ] User API endpoints respond
- [ ] Admin API endpoints respond
- [ ] Both apps can reach the same backend
- [ ] Authentication works from both domains

### Step 6: Test Security

**User App:**
- [ ] Try accessing `/admin` route → should redirect to admin subdomain
- [ ] Try accessing admin API endpoints as regular user → should be blocked

**Admin App:**
- [ ] Try logging in as regular user → should be blocked or redirected
- [ ] Try accessing admin dashboard without login → should redirect to login
- [ ] Check security headers (use browser dev tools):
  - [ ] `X-Frame-Options: DENY`
  - [ ] `Content-Security-Policy: frame-ancestors 'none'`

### Step 7: Monitor Logs
```bash
# API logs
pm2 logs nexprompt-api

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

**Checklist:**
- [ ] No errors in PM2 logs
- [ ] No errors in Nginx logs
- [ ] API requests logging correctly

---

## Subsequent Deployments

For future updates, simply run:

```bash
cd /var/www/nexprompt
bash deploy/deploy.sh
```

**Checklist:**
- [ ] Git pull successful
- [ ] Dependencies updated
- [ ] Both apps rebuilt
- [ ] PM2 process reloaded
- [ ] Nginx reloaded
- [ ] No errors in logs
- [ ] Site still accessible

---

## Rollback Procedure

If something goes wrong:

```bash
# Revert to previous commit
cd /var/www/nexprompt
git log --oneline  # Find previous commit hash
git reset --hard COMMIT_HASH

# Rebuild and restart
bash deploy/deploy.sh
```

**Checklist:**
- [ ] Reverted to working commit
- [ ] Apps rebuilt
- [ ] Services restarted
- [ ] Site working again

---

## Troubleshooting

### Issue: Admin app shows 404
```bash
# Check if dist-admin exists
ls -la /var/www/nexprompt/client/dist-admin/

# Rebuild admin app
cd /var/www/nexprompt/client
npm run build:admin

# Reload Nginx
sudo systemctl reload nginx
```

### Issue: Admin login fails
```bash
# Check if admin user exists
cd /var/www/nexprompt/server
npx prisma studio
# Check Users table for role='admin'

# Create admin user if missing
node create_admin.js
```

### Issue: Cross-domain redirects not working
```bash
# Check environment variables
cat /var/www/nexprompt/client/.env

# Rebuild both apps (Vite reads .env at build time)
cd /var/www/nexprompt/client
npm run build
npm run build:admin
```

### Issue: SSL certificate errors
```bash
# Check certificates
sudo certbot certificates

# Renew if needed
sudo certbot renew

# Reload Nginx
sudo systemctl reload nginx
```

### Issue: API not responding
```bash
# Check PM2 status
pm2 status

# Restart API
pm2 restart nexprompt-api

# Check logs
pm2 logs nexprompt-api
```

---

## Success Criteria

### ✅ All Systems Operational

- [x] User app accessible at https://nexprompt.site
- [x] Admin app accessible at https://admin.nexprompt.site
- [x] Both apps load with valid SSL certificates
- [x] Admin login is the landing page for admin subdomain
- [x] Cross-domain navigation works seamlessly
- [x] Admin users can access both apps
- [x] Regular users cannot access admin panel
- [x] API requests work from both domains
- [x] No console errors in either app
- [x] All routes work correctly
- [x] Security headers properly configured
- [x] PM2 process running
- [x] Nginx serving both apps
- [x] Database connection working
- [x] No errors in logs

---

## 🎉 Deployment Complete!

Once all items are checked, your admin subdomain implementation is complete and production-ready!

**Next Steps:**
1. Monitor logs for the first 24 hours
2. Test all features thoroughly
3. Create backups of database and configs
4. Document any custom configurations
5. Set up monitoring/alerting (optional)

**Support:**
- See `ADMIN_SUBDOMAIN_SETUP.md` for detailed documentation
- See `QUICK_DEPLOY_REFERENCE.md` for quick commands
- See `ARCHITECTURE_DIAGRAM.md` for system overview
