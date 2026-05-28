# Local Nginx Setup for Subdomain Testing

## The Problem

When you access `http://admin.nexprompt.local:5174/`, you're hitting port 5174 directly, but Vite doesn't know to serve the admin app based on the subdomain. It just serves whatever app is configured for that port.

**The issue:** Vite dev servers don't route based on subdomains - they only serve one app per port.

**The solution:** Use Nginx as a reverse proxy to route subdomains to the correct ports.

## Setup Steps

### Step 1: Install Nginx for Windows

1. **Download Nginx:**
   - Go to: http://nginx.org/en/download.html
   - Download the Windows version (e.g., `nginx-1.24.0.zip`)

2. **Extract Nginx:**
   - Extract to `C:\nginx`
   - You should have `C:\nginx\nginx.exe`

### Step 2: Configure Nginx

1. **Backup the original config:**
   ```bash
   copy C:\nginx\conf\nginx.conf C:\nginx\conf\nginx.conf.backup
   ```

2. **Replace with our config:**
   - Copy the contents of `nginx-local.conf` from this project
   - Paste into `C:\nginx\conf\nginx.conf`

   Or use this command:
   ```bash
   copy nginx-local.conf C:\nginx\conf\nginx.conf
   ```

### Step 3: Update Hosts File (Already Done)

Your hosts file should have:
```
127.0.0.1 nexprompt.local
127.0.0.1 admin.nexprompt.local
```

### Step 4: Start All Services

**Terminal 1 - User App (Port 5173):**
```bash
cd client
npm run dev
```

**Terminal 2 - Admin App (Port 5174):**
```bash
cd client
npm run dev:admin
```

**Terminal 3 - Backend (Port 5000):**
```bash
cd server
npm run dev
```

**Terminal 4 - Nginx:**
```bash
cd C:\nginx
start nginx
```

Or double-click `nginx.exe` in `C:\nginx`

### Step 5: Access the Apps

Now you can access:

- **User app**: http://nexprompt.local (no port!)
- **Admin app**: http://admin.nexprompt.local (no port!)

## How It Works

```
Browser Request: http://admin.nexprompt.local
    ↓
Nginx (port 80) receives request
    ↓
Checks server_name: admin.nexprompt.local
    ↓
Proxies to: http://localhost:5174
    ↓
Vite dev server on 5174 serves admin app
    ↓
Admin login page displayed ✅
```

## Nginx Commands

### Start Nginx
```bash
cd C:\nginx
start nginx
```

### Stop Nginx
```bash
cd C:\nginx
nginx -s stop
```

### Reload Config (after changes)
```bash
cd C:\nginx
nginx -s reload
```

### Test Config
```bash
cd C:\nginx
nginx -t
```

### Check if Nginx is Running
```bash
tasklist /FI "IMAGENAME eq nginx.exe"
```

## Troubleshooting

### Issue: Port 80 already in use

**Cause:** Another service (IIS, Apache, Skype) is using port 80

**Solution 1:** Stop the conflicting service
```bash
# Stop IIS
net stop was /y

# Or use different ports in nginx.conf
# Change "listen 80;" to "listen 8080;"
# Then access: http://nexprompt.local:8080
```

**Solution 2:** Use different ports
Edit `C:\nginx\conf\nginx.conf`:
```nginx
server {
    listen 8080;  # Changed from 80
    server_name nexprompt.local;
    # ...
}

server {
    listen 8081;  # Changed from 80
    server_name admin.nexprompt.local;
    # ...
}
```

Then access:
- User: http://nexprompt.local:8080
- Admin: http://admin.nexprompt.local:8081

### Issue: "nginx is not recognized"

**Cause:** Not in the nginx directory

**Solution:** Always run nginx commands from `C:\nginx`
```bash
cd C:\nginx
nginx -s stop
```

### Issue: Still seeing wrong app

**Cause:** Browser cache

**Solution:**
1. Clear browser cache (`Ctrl + Shift + Delete`)
2. Hard refresh (`Ctrl + Shift + R`)
3. Or use incognito mode

### Issue: Nginx won't start

**Cause:** Config error

**Solution:**
```bash
cd C:\nginx
nginx -t
```

Check the error message and fix the config.

## Verify Setup

### Check 1: Nginx is Running
```bash
tasklist /FI "IMAGENAME eq nginx.exe"
```

Should show nginx processes.

### Check 2: Vite Servers are Running
```bash
# Should see output in terminals:
User app:  ➜  Local:   http://localhost:5173/
Admin app: ➜  Local:   http://localhost:5174/
```

### Check 3: Access Apps
```bash
# User app
curl http://nexprompt.local

# Admin app
curl http://admin.nexprompt.local
```

Both should return HTML.

### Check 4: Browser Test
1. Go to http://admin.nexprompt.local
2. Should see: **Admin Login** page with shield icon
3. Go to http://nexprompt.local
4. Should see: **User Landing** page

## Alternative: Use Port Numbers (Simpler)

If Nginx is too complex, just use port numbers:

**Update `.env`:**
```env
VITE_ADMIN_URL=http://localhost:5174
VITE_USER_APP_URL=http://localhost:5173
```

**Access:**
- User: http://localhost:5173
- Admin: http://localhost:5174

This works without Nginx but doesn't test subdomains.

## Summary

✅ **Nginx routes subdomains** to correct ports  
✅ **No port numbers needed** in URLs  
✅ **Matches production setup** (with subdomains)  
✅ **User app**: http://nexprompt.local  
✅ **Admin app**: http://admin.nexprompt.local  

With Nginx, you can test the exact same subdomain setup as production! 🚀
