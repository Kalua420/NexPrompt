# Fix: Confusing Login Page Cache Issue

## Problem

When accessing `http://localhost:5174/login`, sometimes it shows the user login page, sometimes the admin login page. This is very confusing!

## Root Cause

**Browser caching.** The browser is caching the HTML/JS from one app and serving it when you access the other app on a different port.

## Immediate Fix

### Step 1: Clear Browser Cache

**Option A: Hard Refresh**
- Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- This forces the browser to reload without cache

**Option B: Clear All Cache**
1. Press `Ctrl + Shift + Delete`
2. Select "Cached images and files"
3. Click "Clear data"

**Option C: Use Incognito Mode**
- Open a new incognito/private window
- Test in incognito to avoid cache issues

### Step 2: Restart Dev Servers

I've added cache-busting headers to both Vite configs. Now restart:

```bash
# Stop both dev servers (Ctrl+C in each terminal)

# Terminal 1 - User app
cd client
npm run dev

# Terminal 2 - Admin app
cd client
npm run dev:admin
```

## What I Fixed

Added cache-busting headers to both Vite configs:

```javascript
server: {
  headers: {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
}
```

This tells the browser to NEVER cache the dev server responses.

## Testing After Fix

### Test 1: User App
```
1. Go to: http://localhost:5173/login
2. Should ALWAYS show: User login page (no "Admin" in heading)
3. Hard refresh (Ctrl+Shift+R) multiple times
4. Should still show user login page
```

### Test 2: Admin App
```
1. Go to: http://localhost:5174/login
2. Should ALWAYS show: Admin login page (with "Admin Login" heading and shield icon)
3. Hard refresh (Ctrl+Shift+R) multiple times
4. Should still show admin login page
```

### Test 3: Switch Between Apps
```
1. Go to: http://localhost:5173/login (user)
2. Then go to: http://localhost:5174/login (admin)
3. Should show admin login page
4. Go back to: http://localhost:5173/login
5. Should show user login page
```

## How to Identify Which App You're On

### User Login Page
- **Title**: "Welcome back"
- **Subheading**: "Sign in to your NexPrompt account"
- **No "Admin" text**
- **Has "Don't have an account? Create one free" link**
- **Has Google login button**

### Admin Login Page
- **Title**: "Admin Login" (with "Admin" in accent color)
- **Subheading**: "Sign in with your admin account"
- **Shield icon** at the top
- **Button says**: "Sign in as Admin"
- **Has "Back to user login" link**
- **NO Google login button**

## Additional Tips

### Tip 1: Use Different Browsers
- User app in Chrome
- Admin app in Firefox
- Avoids confusion

### Tip 2: Bookmark the URLs
- Bookmark `http://localhost:5173/login` as "User Login"
- Bookmark `http://localhost:5174/login` as "Admin Login"

### Tip 3: Check the Browser Tab Title
- User app: "NexPrompt"
- Admin app: "NexPrompt Admin"

### Tip 4: Check the URL Bar
- User app: Port **5173**
- Admin app: Port **5174**

## If Still Seeing Wrong Page

### Nuclear Option: Clear Everything

```bash
# 1. Stop all dev servers
# 2. Clear browser cache completely
# 3. Close all browser windows
# 4. Delete node_modules and reinstall (optional)
cd client
rm -rf node_modules
npm install

# 5. Restart dev servers
npm run dev
npm run dev:admin
```

### Check Service Worker

Some browsers have service workers that cache aggressively:

1. Open DevTools (`F12`)
2. Go to **Application** tab
3. Click **Service Workers**
4. Click **Unregister** for any service workers
5. Refresh the page

## Summary

✅ **Cache-busting headers added** to both Vite configs  
✅ **Restart dev servers** to apply changes  
✅ **Clear browser cache** to remove old cached pages  
✅ **Use hard refresh** (`Ctrl+Shift+R`) when switching between apps  
✅ **Check port number** in URL to confirm which app you're on  

After these fixes, each port should consistently serve the correct app! 🚀
