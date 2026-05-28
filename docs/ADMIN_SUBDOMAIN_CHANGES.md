# Admin Subdomain Implementation - Changes Summary

## Overview

Implemented a complete separation of admin and user interfaces using subdomains:
- **User app**: `nexprompt.site` (main application)
- **Admin app**: `admin.nexprompt.site` (admin panel)

## Files Modified

### 1. `client/src/App.jsx`
**Changes:**
- ✅ Removed admin routes (`/admin/login`, `/admin/dashboard`)
- ✅ Removed `AdminLogin` and `Admin` lazy imports
- ✅ Removed `ProtectedAdminRoute` component
- ✅ User app now has NO admin functionality

**Reason:** Admin routes are now exclusively on the admin subdomain.

---

### 2. `client/src/AdminApp.jsx`
**Changes:**
- ✅ Updated routes to use root paths (`/login`, `/dashboard` instead of `/admin/login`, `/admin/dashboard`)
- ✅ Root path (`/`) now redirects to `/login`
- ✅ Added comments for clarity

**Reason:** Admin app is on its own domain, so routes don't need `/admin` prefix.

---

### 3. `client/src/pages/Admin/Login.jsx`
**Changes:**
- ✅ Changed "Back to user login" link from React Router `<Link>` to native `<a>` tag
- ✅ Uses `VITE_USER_APP_URL` environment variable for cross-domain navigation
- ✅ Updated navigation paths from `/admin/dashboard` to `/dashboard`
- ✅ Non-admin users are redirected to the main user app using `window.location.replace()`

**Reason:** Cross-domain navigation requires full page redirects, not client-side routing.

---

### 4. `deploy/nginx/admin.nexprompt.site.conf`
**Changes:**
- ✅ Changed `index` directive from `admin.html` to `index.html`
- ✅ Updated SPA fallback to serve `index.html` instead of `admin.html`

**Reason:** Vite outputs the built admin app as `index.html` in the `dist-admin/` directory.

---

## Files Already Configured (No Changes Needed)

### ✅ `client/.env.example`
Already has:
```env
VITE_ADMIN_URL=http://localhost:5174
VITE_USER_APP_URL=http://localhost:5173
```

### ✅ `client/.env`
Already configured with correct URLs.

### ✅ `deploy/env.client.production`
Already has production URLs:
```env
VITE_ADMIN_URL=https://admin.nexprompt.site
VITE_USER_APP_URL=https://nexprompt.site
```

### ✅ `client/vite.config.admin.js`
Already configured to:
- Build to `dist-admin/`
- Use `admin.html` as input
- Run on port 5174

### ✅ `deploy/nginx/nexprompt.site.conf`
Already has:
```nginx
location /admin {
    return 301 https://admin.nexprompt.site$request_uri;
}
```

### ✅ `deploy/deploy.sh`
Already builds both apps:
```bash
npm run build        # User app → dist/
npm run build:admin  # Admin app → dist-admin/
```

---

## New Files Created

### 1. `ADMIN_SUBDOMAIN_SETUP.md`
Comprehensive guide covering:
- Architecture overview
- Development setup
- Production deployment
- How it works (detailed explanation)
- Nginx configuration
- Build process
- Security considerations
- Troubleshooting
- Creating admin users

### 2. `QUICK_DEPLOY_REFERENCE.md`
Quick reference card with:
- Development commands
- Production URLs
- Deploy commands
- Environment variables
- Build outputs
- Troubleshooting commands
- Deployment checklist
- Key routes
- Security notes

### 3. `ADMIN_SUBDOMAIN_CHANGES.md` (this file)
Summary of all changes made.

---

## How It Works Now

### User Flow (nexprompt.site)
1. User visits `nexprompt.site`
2. Lands on landing page or login
3. After login, accesses user dashboard
4. NO admin routes available
5. If user tries `/admin`, Nginx redirects to `admin.nexprompt.site`

### Admin Flow (admin.nexprompt.site)
1. Admin visits `admin.nexprompt.site`
2. Automatically redirected to `/login`
3. Enters admin credentials
4. Backend validates `user.role === 'admin'`
5. If valid, redirected to `/dashboard`
6. If non-admin, redirected to user app

### Cross-Domain Navigation
- Admin login page has link to user app using `VITE_USER_APP_URL`
- User app can link to admin using `VITE_ADMIN_URL`
- Both use full URLs for cross-domain navigation

---

## Testing Checklist

### Development Testing
- [ ] User app runs on http://localhost:5173
- [ ] Admin app runs on http://localhost:5174
- [ ] Admin login page loads at http://localhost:5174/login
- [ ] Admin dashboard loads at http://localhost:5174/dashboard
- [ ] "Back to user login" link goes to http://localhost:5173/login
- [ ] Non-admin users are redirected to user app
- [ ] Admin users can access dashboard

### Production Testing
- [ ] User app loads at https://nexprompt.site
- [ ] Admin app loads at https://admin.nexprompt.site
- [ ] Admin login page is the landing page for admin subdomain
- [ ] SSL certificates work for both domains
- [ ] API requests work from both domains
- [ ] Cross-domain navigation works
- [ ] Admin authentication works
- [ ] Non-admin users cannot access admin dashboard

---

## Deployment Steps

### First Time (VPS Setup)
```bash
# 1. Ensure DNS records point to VPS
# 2. Run first-time setup
sudo bash deploy/first-time-setup.sh

# 3. Configure environment variables
cd /var/www/nexprompt/client
cp ../deploy/env.client.production .env
# Edit .env with production values

# 4. Deploy
bash deploy/deploy.sh

# 5. Create admin user
cd /var/www/nexprompt/server
node create_admin.js
```

### Subsequent Deploys
```bash
bash deploy/deploy.sh
```

---

## Security Enhancements

1. **Separate domains** — Admin functionality isolated from user app
2. **Stricter CSP** — Admin app has `frame-ancestors 'none'`
3. **X-Frame-Options** — Set to `DENY` for admin app
4. **Role validation** — Backend checks `user.role === 'admin'`
5. **HTTPS only** — Both domains enforce HTTPS in production
6. **No admin code in user build** — Reduces attack surface

---

## Benefits

✅ **Clear separation** — Admin and user interfaces are completely separate  
✅ **Better security** — Admin functionality isolated and protected  
✅ **Easier maintenance** — Changes to admin don't affect user app  
✅ **Professional setup** — Industry-standard subdomain architecture  
✅ **Scalability** — Can deploy admin and user apps independently  
✅ **SEO friendly** — User app has no admin routes cluttering sitemap  

---

## Rollback Plan

If issues arise, revert these commits:
1. `client/src/App.jsx` — Re-add admin routes
2. `client/src/AdminApp.jsx` — Revert route paths
3. `client/src/pages/Admin/Login.jsx` — Revert navigation changes
4. `deploy/nginx/admin.nexprompt.site.conf` — Revert nginx config

Then rebuild and redeploy:
```bash
npm run build
npm run build:admin
pm2 restart all
sudo systemctl reload nginx
```

---

## Next Steps

1. ✅ Test in development environment
2. ✅ Commit changes to Git
3. ✅ Deploy to VPS
4. ✅ Test in production
5. ✅ Create admin user
6. ✅ Verify cross-domain navigation
7. ✅ Monitor logs for any issues

---

## Support

For questions or issues:
- See `ADMIN_SUBDOMAIN_SETUP.md` for detailed setup
- See `QUICK_DEPLOY_REFERENCE.md` for quick commands
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Check API logs: `pm2 logs nexprompt-api`
