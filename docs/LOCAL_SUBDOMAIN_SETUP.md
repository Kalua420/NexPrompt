# Local Subdomain Setup for Development

## The Issue

You're trying to access `http://admin.localhost:5174/` but it's showing the user app landing page instead of the admin login page.

## Why This Happens

In development:
- `localhost:5173` → User app (Vite dev server on port 5173)
- `localhost:5174` → Admin app (Vite dev server on port 5174)

When you use `admin.localhost:5174`, your browser treats it as a subdomain, but:
1. The browser resolves `admin.localhost` to `127.0.0.1` (same as `localhost`)
2. It connects to port 5174
3. But the Vite dev server on port 5174 doesn't know about subdomains
4. It might be serving the wrong app or not handling the subdomain correctly

## Solution 1: Use Port Numbers (Recommended for Development)

**Don't use subdomains in development.** Use port numbers instead:

- **User app**: http://localhost:5173
- **Admin app**: http://localhost:5174

This is the simplest and most reliable way for local development.

## Solution 2: Set Up Local DNS with Hosts File

If you really want to use subdomains locally, you need to:

### Step 1: Edit Hosts File

**Windows:**
1. Open Notepad as Administrator
2. Open file: `C:\Windows\System32\drivers\etc\hosts`
3. Add these lines:
   ```
   127.0.0.1 nexprompt.local
   127.0.0.1 admin.nexprompt.local
   ```
4. Save and close

**Mac/Linux:**
1. Open terminal
2. Run: `sudo nano /etc/hosts`
3. Add these lines:
   ```
   127.0.0.1 nexprompt.local
   127.0.0.1 admin.nexprompt.local
   ```
4. Save (`Ctrl+O`, `Enter`, `Ctrl+X`)

### Step 2: Update Environment Variables

Edit `client/.env`:
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_ADMIN_URL=http://admin.nexprompt.local:5174
VITE_USER_APP_URL=http://nexprompt.local:5173
```

### Step 3: Update Vite Configs

**User app** (`client/vite.config.js`):
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0', // Allow access from custom domains
  },
});
```

**Admin app** (`client/vite.config.admin.js`):
```javascript
export default defineConfig({
  plugins: [react()],
  root: '.',
  build: {
    outDir: 'dist-admin',
    rollupOptions: {
      input: resolve(__dirname, 'admin.html'),
    },
  },
  server: {
    port: 5174,
    host: '0.0.0.0', // Allow access from custom domains
  },
});
```

### Step 4: Restart Dev Servers

```bash
# Stop all dev servers (Ctrl+C)

# Start user app
cd client
npm run dev

# Start admin app (in another terminal)
cd client
npm run dev:admin
```

### Step 5: Access the Apps

- **User app**: http://nexprompt.local:5173
- **Admin app**: http://admin.nexprompt.local:5174

## Solution 3: Use a Reverse Proxy (Advanced)

Set up Nginx locally to proxy both apps:

### Install Nginx (Windows)

1. Download Nginx for Windows: https://nginx.org/en/download.html
2. Extract to `C:\nginx`

### Configure Nginx

Create `C:\nginx\conf\nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    # User app
    server {
        listen 80;
        server_name nexprompt.local;

        location / {
            proxy_pass http://localhost:5173;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }

    # Admin app
    server {
        listen 80;
        server_name admin.nexprompt.local;

        location / {
            proxy_pass http://localhost:5174;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

### Start Nginx

```bash
cd C:\nginx
start nginx
```

### Access the Apps

- **User app**: http://nexprompt.local (no port needed!)
- **Admin app**: http://admin.nexprompt.local (no port needed!)

### Stop Nginx

```bash
cd C:\nginx
nginx -s stop
```

## Recommended Approach

**For Development:**
✅ Use `localhost:5173` and `localhost:5174` (Solution 1)

**For Production:**
✅ Use `nexprompt.site` and `admin.nexprompt.site` with proper DNS and Nginx

**Why?**
- Simpler setup
- No need to modify hosts file
- No need for local Nginx
- Works out of the box
- Easier to debug

## Current Setup

Your current `.env` should be:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_ADMIN_URL=http://localhost:5174
VITE_USER_APP_URL=http://localhost:5173
```

**Access:**
- User app: http://localhost:5173
- Admin app: http://localhost:5174

## Why `admin.localhost:5174` Doesn't Work

1. `admin.localhost` resolves to `127.0.0.1` (same as `localhost`)
2. Browser connects to port 5174
3. Vite dev server on 5174 is configured to serve the admin app
4. But the server might not be handling the subdomain correctly
5. Or you might be accessing the wrong server

**The issue:** When you use `admin.localhost:5174`, you're essentially doing `localhost:5174` with an extra subdomain that Vite doesn't understand.

## Summary

✅ **Use `localhost:5174` for admin app** (simplest)  
✅ **Use `localhost:5173` for user app** (simplest)  
⚠️ **Don't use `admin.localhost:5174`** (doesn't work without setup)  
🔧 **If you need subdomains**, use Solution 2 or 3 above  

For development, stick with port numbers. For production, use real subdomains with DNS and Nginx.
