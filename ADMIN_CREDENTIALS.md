# Admin Credentials - NexPrompt

**Created:** 2026-05-27 12:09:17

---

## 👤 Admin Account 1

- **Email:** `admin@nexprompt.site`
- **Password:** `Admin@123`
- **Role:** Admin
- **Credits:** 1000
- **Email Verified:** ✅ Yes
- **User ID:** `admin_001`

---

## 👤 Admin Account 2 (Super Admin)

- **Email:** `superadmin@nexprompt.site`
- **Password:** `SuperAdmin@123`
- **Role:** Admin
- **Credits:** 1000
- **Email Verified:** ✅ Yes
- **User ID:** `admin_002`

---

## 🔐 Security Notes

1. **Change passwords immediately** after first login in production
2. These are development/testing credentials only
3. Both accounts have full admin privileges
4. Both accounts start with 1000 credits

---

## 🚀 Login URLs

- **Frontend:** http://localhost:5173/admin/login
- **API Base:** http://localhost:5000/api

---

## 📝 Admin Features Access

With these credentials, you can:

- ✅ Access admin dashboard
- ✅ Manage users
- ✅ Manage templates
- ✅ View analytics and statistics
- ✅ Manage API keys
- ✅ View system health
- ✅ Manage credit packs
- ✅ View all payments and transactions

---

## 🔄 Re-create Admin Users

If you need to recreate or reset admin users:

```bash
cd server
node create_admin.js
```

This script will:
- Create or update admin users
- Reset passwords to defaults
- Ensure 1000 credits for each admin
- Set email as verified

---

## ⚠️ IMPORTANT

**DO NOT commit this file to version control!**

Add to `.gitignore`:
```
ADMIN_CREDENTIALS.md
```

---

**Status:** ✅ Active  
**Last Updated:** 2026-05-27
