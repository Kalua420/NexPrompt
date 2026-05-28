# Admin Subdomain Setup Guide

This guide explains how the admin subdomain (`admin.nexprompt.site`) is configured and how to deploy it.

## Architecture Overview

The NexPrompt application is split into two separate domains:

- **`nexprompt.site`** — User-facing application (main app)
- **`admin.nexprompt.site`** — Admin panel (separate subdomain)

Both domains:
- Share the same backend API at `127.0.0.1:5000`
- Use the same authentication system (JWT tokens)
- Are served by Nginx as static SPAs
- Proxy `/api/` and `/socket.io/` requests to the Express backend

## File Structure

```
client/
├── index.html              # User app entry point
├── admin.html              # Admin app entry point
├── vite.config.js          # User app build config (outputs to dist/)
├── vite.config.admin.js    # Admin app build config (outputs to dist-admin/)
├── src/
│   ├── main.jsx            # User app React entry
│   ├── admin-main.jsx      # Admin app React entry
│   ├── App.jsx             # User app routes (NO admin routes)
│   ├── AdminApp.jsx        # Admin app routes (login, dashboard)
│   └── pages/
│       └── Admin/
│           ├── Login.jsx   # Admin login page
│           └── Admin.jsx   # Admin dashboard
```

## Development Setup

### 1. Install Dependencies

```bash
cd client
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and configure:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_ADMIN_URL=http://localhost:5174
VITE_USER_APP_URL=http://localhost:5173
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### 3. Run Development Servers

**User App (port 5173):**
```bash
cd client
npm run dev
```

**Admin App (port 5174):**
```bash
cd client
npm run dev:admin
```

**Backend API (port 5000):**
```bash
cd server
npm run dev
```

### 4. Access the Apps

- User app: http://localhost:5173
- Admin app: http://localhost:5174
- API: http://localhost:5000

## Production Deployment

### 1. DNS Configuration

Ensure both domains point to your VPS IP:

```
A    nexprompt.site          → YOUR_VPS_IP
A    admin.nexprompt.site    → YOUR_VPS_IP
```

### 2. First-Time VPS Setup

Run the first-time setup script (only once):

```bash
sudo bash deploy/first-time-setup.sh
```

This script:
- Installs Node.js, Nginx, PM2, Certbot
- Creates the deploy user
- Sets up the project directory
- Configures Nginx vhosts
- Obtains SSL certificates for both domains

### 3. Configure Environment Variables

On the VPS, create `/var/www/nexprompt/client/.env`:

```env
VITE_API_URL=https://nexprompt.site
VITE_SOCKET_URL=https://nexprompt.site
VITE_ADMIN_URL=https://admin.nexprompt.site
VITE_USER_APP_URL=https://nexprompt.site
VITE_GOOGLE_CLIENT_ID=your-production-google-client-id
```

### 4. Deploy

Run the deploy script:

```bash
bash deploy/deploy.sh
```

This script:
- Pulls latest code from Git
- Installs dependencies
- Runs Prisma migrations
- Builds both user app (`dist/`) and admin app (`dist-admin/`)
- Restarts the API server via PM2
- Reloads Nginx

### 5. Verify Deployment

- User app: https://nexprompt.site
- Admin app: https://admin.nexprompt.site

## How It Works

### User App (nexprompt.site)

1. Nginx serves static files from `/var/www/nexprompt/client/dist/`
2. All routes fall back to `index.html` (SPA routing)
3. React Router handles client-side routing
4. No admin routes are included in the user app
5. If a user tries to access `/admin`, Nginx redirects to `admin.nexprompt.site`

### Admin App (admin.nexprompt.site)

1. Nginx serves static files from `/var/www/nexprompt/client/dist-admin/`
2. All routes fall back to `index.html` (SPA routing)
3. React Router handles client-side routing with these routes:
   - `/` → redirects to `/login`
   - `/login` → Admin login page
   - `/dashboard` → Admin dashboard (protected)
   - `*` → redirects to `/login`

### Authentication Flow

1. Admin visits `admin.nexprompt.site` → lands on `/login`
2. Admin enters credentials
3. Backend validates and checks `user.role === 'admin'`
4. If valid, returns JWT tokens
5. Admin is redirected to `/dashboard`
6. If non-admin tries to access, they're redirected to the user app

### Cross-Domain Navigation

The apps use environment variables for cross-domain links:

- **Admin → User**: Uses `VITE_USER_APP_URL`
- **User → Admin**: Uses `VITE_ADMIN_URL`

Example in Admin Login:
```jsx
<a href={import.meta.env.VITE_USER_APP_URL || 'https://nexprompt.site/login'}>
  Back to user login
</a>
```

## Nginx Configuration

### User App (`nexprompt.site`)

```nginx
root /var/www/nexprompt/client/dist;
index index.html;

# Block access to admin routes
location /admin {
    return 301 https://admin.nexprompt.site$request_uri;
}

# SPA fallback
location / {
    try_files $uri $uri/ /index.html;
}
```

### Admin App (`admin.nexprompt.site`)

```nginx
root /var/www/nexprompt/client/dist-admin;
index index.html;

# Stricter security headers
add_header X-Frame-Options "DENY" always;
add_header Content-Security-Policy "frame-ancestors 'none';" always;

# SPA fallback
location / {
    try_files $uri $uri/ /index.html;
}
```

## Build Process

### User App Build

```bash
npm run build
```

- Uses `vite.config.js`
- Input: `index.html`
- Output: `dist/`
- Entry: `src/main.jsx` → `src/App.jsx`

### Admin App Build

```bash
npm run build:admin
```

- Uses `vite.config.admin.js`
- Input: `admin.html`
- Output: `dist-admin/`
- Entry: `src/admin-main.jsx` → `src/AdminApp.jsx`

## Security Considerations

1. **Stricter CSP**: Admin app has `frame-ancestors 'none'` to prevent embedding
2. **X-Frame-Options**: Set to `DENY` for admin, `SAMEORIGIN` for user app
3. **Role-based access**: Backend validates `user.role === 'admin'` on all admin endpoints
4. **Separate domains**: Reduces attack surface by isolating admin functionality
5. **HTTPS only**: Both domains enforce HTTPS in production

## Troubleshooting

### Admin app shows 404

- Check that `dist-admin/` exists: `ls /var/www/nexprompt/client/dist-admin/`
- Verify Nginx config: `sudo nginx -t`
- Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`

### Admin login fails

- Verify backend is running: `pm2 status`
- Check API logs: `pm2 logs nexprompt-api`
- Ensure user has `role: 'admin'` in database

### Cross-domain redirects not working

- Verify environment variables are set correctly
- Check that `.env` was present during build (Vite reads at build time)
- Rebuild both apps: `npm run build && npm run build:admin`

### SSL certificate issues

- Renew certificates: `sudo certbot renew`
- Check certificate status: `sudo certbot certificates`
- Ensure both domains are in DNS before running Certbot

## Creating Admin Users

Use the `create_admin.js` script:

```bash
cd server
node create_admin.js
```

Follow the prompts to create an admin user.

## Summary

✅ **User app** at `nexprompt.site` — no admin routes  
✅ **Admin app** at `admin.nexprompt.site` — dedicated admin interface  
✅ **Shared backend** at `127.0.0.1:5000` — single API for both apps  
✅ **Separate builds** — `dist/` for users, `dist-admin/` for admins  
✅ **Cross-domain navigation** — environment variables handle links between apps  
✅ **Enhanced security** — stricter headers and role-based access control  

The setup is complete and ready for production deployment! 🚀
