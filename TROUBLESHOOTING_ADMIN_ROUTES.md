# Troubleshooting: "No routes matched location /admin/dashboard"

## Problem

You're seeing this error in the console:
```
No routes matched location "/admin/dashboard"
```

## Root Cause

This happens when:
1. You're logged in as an admin user
2. You're accessing the **user app** (localhost:5173 or nexprompt.site)
3. The app is trying to navigate to `/admin/dashboard` which no longer exists in the user app

## Solution

### Quick Fix (Development)

**Option 1: Clear Browser Storage**
1. Open browser DevTools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Find **Local Storage** → `http://localhost:5173`
4. Delete the `auth-storage` key
5. Refresh the page

**Option 2: Logout and Login Again**
1. Click logout in the user app
2. Login again with regular user credentials
3. Or login with admin credentials (will redirect to admin app)

**Option 3: Use the Correct App**
- If you're an admin, use: http://localhost:5174 (admin app)
- If you're a regular user, use: http://localhost:5173 (user app)

### Quick Fix (Production)

**Option 1: Clear Browser Storage**
1. Open browser DevTools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Find **Local Storage** → `https://nexprompt.site`
4. Delete the `auth-storage` key
5. Refresh the page

**Option 2: Use the Correct Domain**
- If you're an admin, go to: https://admin.nexprompt.site
- If you're a regular user, go to: https://nexprompt.site

## Why This Happens

Before the subdomain separation:
- Admin routes were at `/admin/dashboard` in the user app
- Admin users could access them directly

After the subdomain separation:
- Admin routes are now on a separate domain (admin.nexprompt.site)
- The user app no longer has `/admin/*` routes
- Old auth tokens in local storage might still reference the old routes

## Prevention

### For Development

Add this to your user app's `App.jsx` to catch and redirect admin users:

```jsx
// In App.jsx, add this at the top level
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore.js';

function AdminRedirect() {
  const user = useAuthStore((s) => s.user);
  
  useEffect(() => {
    if (user?.role === 'admin') {
      const adminUrl = import.meta.env.VITE_ADMIN_URL || 'https://admin.nexprompt.site';
      window.location.replace(adminUrl);
    }
  }, [user]);
  
  return null;
}

// Then in your App component:
export default function App() {
  return (
    <>
      <AdminRedirect />
      {/* rest of your app */}
    </>
  );
}
```

### For Production

The same fix applies. This will automatically redirect admin users who accidentally land on the user app.

## Testing

After clearing storage:

1. **Test as regular user:**
   ```
   Email: user@example.com
   Password: password123
   ```
   - Should stay on user app
   - Should access /dashboard successfully

2. **Test as admin user:**
   ```
   Email: admin@example.com
   Password: admin123
   ```
   - Should redirect to admin app automatically
   - Should land on admin.nexprompt.site/dashboard

## Additional Checks

### Check Local Storage
```javascript
// In browser console
localStorage.getItem('auth-storage')
```

Should show something like:
```json
{
  "state": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "role": "user"
    },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

If `role` is `"admin"` and you're on the user app, that's the problem.

### Check Current Route
```javascript
// In browser console
window.location.pathname
```

If it shows `/admin/dashboard` while on the user app, clear storage and reload.

## Summary

✅ **Clear browser local storage** to remove old auth tokens  
✅ **Use the correct app** for your user role  
✅ **Admin users** → admin.nexprompt.site  
✅ **Regular users** → nexprompt.site  
✅ **Add AdminRedirect component** to automatically redirect admin users  

This is a one-time issue that occurs during the transition from the old architecture to the new subdomain architecture.
