# Quick Deploy Reference

## 🚀 Development

```bash
# User app (port 5173)
cd client && npm run dev

# Admin app (port 5174)
cd client && npm run dev:admin

# Backend (port 5000)
cd server && npm run dev
```

**Access:**
- User: http://localhost:5173
- Admin: http://localhost:5174
- API: http://localhost:5000

---

## 🌐 Production URLs

- **User app**: https://nexprompt.site
- **Admin app**: https://admin.nexprompt.site
- **API**: Backend (not exposed, proxied through Nginx)

---

## 📦 Deploy to VPS

```bash
# First time only (as root)
sudo bash deploy/first-time-setup.sh

# Every subsequent deploy (as deploy user)
bash deploy/deploy.sh
```

---

## 🔑 Create Admin User

```bash
cd server
node create_admin.js
```

---

## 🔧 Environment Variables

### Development (`client/.env`)
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_ADMIN_URL=http://localhost:5174
VITE_USER_APP_URL=http://localhost:5173
VITE_GOOGLE_CLIENT_ID=your-client-id
```

### Production (`/var/www/nexprompt/client/.env`)
```env
VITE_API_URL=https://nexprompt.site
VITE_SOCKET_URL=https://nexprompt.site
VITE_ADMIN_URL=https://admin.nexprompt.site
VITE_USER_APP_URL=https://nexprompt.site
VITE_GOOGLE_CLIENT_ID=your-production-client-id
```

---

## 🗂️ Build Outputs

| App | Build Command | Output Dir | Served At |
|-----|---------------|------------|-----------|
| User | `npm run build` | `dist/` | nexprompt.site |
| Admin | `npm run build:admin` | `dist-admin/` | admin.nexprompt.site |

---

## 🔍 Troubleshooting

```bash
# Check PM2 status
pm2 status

# View API logs
pm2 logs nexprompt-api

# Test Nginx config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Check SSL certificates
sudo certbot certificates

# Renew SSL certificates
sudo certbot renew

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Restart everything
pm2 restart all
sudo systemctl restart nginx
```

---

## 📋 Deployment Checklist

- [ ] DNS records point to VPS IP (both domains)
- [ ] SSL certificates obtained for both domains
- [ ] Environment variables configured on VPS
- [ ] Database connection working
- [ ] Admin user created
- [ ] Both apps build successfully
- [ ] Nginx configs in place
- [ ] PM2 process running
- [ ] Test user app: https://nexprompt.site
- [ ] Test admin app: https://admin.nexprompt.site
- [ ] Test API endpoints
- [ ] Test admin login
- [ ] Test cross-domain navigation

---

## 🎯 Key Routes

### User App (nexprompt.site)
- `/` — Landing page
- `/login` — User login
- `/register` — User registration
- `/dashboard` — User dashboard
- `/workspace` — Prompt workspace
- `/templates` — Template marketplace
- `/favorites` — Saved prompts
- `/subscription` — Subscription management

### Admin App (admin.nexprompt.site)
- `/` — Redirects to `/login`
- `/login` — Admin login
- `/dashboard` — Admin dashboard
- `*` — Redirects to `/login`

---

## 🔐 Security Notes

1. Admin app has stricter CSP headers
2. Admin routes blocked on user domain
3. Backend validates `user.role === 'admin'`
4. HTTPS enforced in production
5. Separate builds isolate admin code

---

## 📞 Support

For detailed setup instructions, see `ADMIN_SUBDOMAIN_SETUP.md`
