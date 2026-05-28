# Quick Fix: Admin Subdomain Access

## Problem
You're accessing `http://admin.localhost:5174/` and it's showing the user app landing page instead of the admin login page.

## Quick Solution

**Don't use `admin.localhost:5174` in development.**

Instead, use:
- **Admin app**: http://localhost:5174
- **User app**: http://localhost:5173

## Why?

In development, Vite dev servers run on different **ports**, not different **subdomains**.

- Port 5173 → User app
- Port 5174 → Admin app

When you use `admin.localhost:5174`, the browser doesn't know which app to load because both resolve to the same IP (127.0.0.1).

## Correct URLs

### Development
```
User app:  http://localhost:5173
Admin app: http://localhost:5174
API:       http://localhost:5000
```

### Production
```
User app:  https://nexprompt.site
Admin app: https://admin.nexprompt.site
API:       (proxied through Nginx)
```

## How to Access Admin App

1. **Open browser**
2. **Go to**: http://localhost:5174
3. **You should see**: Admin login page
4. **Login with admin credentials**

## If You Still See the Wrong Page

### Check 1: Verify Dev Servers are Running

```bash
# Terminal 1 - User app (port 5173)
cd client
npm run dev

# Terminal 2 - Admin app (port 5174)
cd client
npm run dev:admin
```

Look for output like:
```
User app:
  ➜  Local:   http://localhost:5173/

Admin app:
  ➜  Local:   http://localhost:5174/
```

### Check 2: Clear Browser Cache

1. Press `Ctrl + Shift + Delete`
2. Select "Cached images and files"
3. Click "Clear data"
4. Or use incognito mode

### Check 3: Verify You're on the Right Port

In the browser address bar, make sure it says:
```
http://localhost:5174
```

NOT:
```
http://admin.localhost:5174
http://localhost:5173
http://admin.localhost:5173
```

## Testing

### Test Admin App
```
1. Go to: http://localhost:5174
2. Should see: Admin login page with "Admin Login" heading
3. Should NOT see: Public landing page
```

### Test User App
```
1. Go to: http://localhost:5173
2. Should see: Public landing page or user login
3. Should NOT see: Admin login page
```

## Summary

✅ **Use `http://localhost:5174`** for admin app  
✅ **Use `http://localhost:5173`** for user app  
❌ **Don't use `http://admin.localhost:5174`** (doesn't work in dev)  

Subdomains are for production only. In development, use port numbers! 🚀
