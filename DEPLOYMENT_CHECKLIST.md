# 📋 NexPrompt VPS Deployment Checklist

Follow this checklist step-by-step to deploy on your VPS.

---

## ✅ Pre-Deployment Checklist

- [ ] VPS is running Ubuntu 22.04 LTS
- [ ] You have root SSH access
- [ ] Domain DNS is configured:
  - [ ] `nexprompt.site` → VPS IP
  - [ ] `admin.nexprompt.site` → VPS IP
  - [ ] DNS propagation complete (check: `nslookup nexprompt.site`)
- [ ] You have API keys ready:
  - [ ] Groq API key
  - [ ] SambaNova API key (optional)
  - [ ] Other AI provider keys (optional)

---

## 🚀 Deployment Steps

### Step 1: Connect to VPS
```bash
ssh root@YOUR_VPS_IP
```
- [ ] Successfully connected

### Step 2: Download Setup Script
```bash
cd /tmp
git clone https://github.com/Kalua420/NexPrompt.git
cd NexPrompt/deploy
```
- [ ] Repository cloned

### Step 3: Configure Database Password
```bash
nano first-time-setup.sh
```
- [ ] Changed `DB_PASS="CHANGE_THIS_DB_PASSWORD"` to a strong password
- [ ] Saved the file (Ctrl+X, Y, Enter)
- [ ] **Write down this password** - you'll need it for DATABASE_URL

### Step 4: Run Setup Script
```bash
chmod +x first-time-setup.sh
bash first-time-setup.sh
```
- [ ] Script started running
- [ ] System packages installed
- [ ] Node.js 20 installed
- [ ] PM2 installed
- [ ] MySQL installed
- [ ] Repository cloned to `/var/www/nexprompt`
- [ ] Script paused asking for .env files

### Step 5: Create Server .env (In New Terminal)
```bash
# Open new terminal
ssh root@YOUR_VPS_IP
cd /var/www/nexprompt/server
nano .env
```

Paste and configure:
```env
DATABASE_URL="mysql://nexprompt:YOUR_DB_PASSWORD@localhost:3306/nexprompt"
JWT_SECRET="GENERATE_64_CHAR_STRING"
JWT_REFRESH_SECRET="GENERATE_ANOTHER_64_CHAR_STRING"
CLIENT_URL="https://nexprompt.site,https://admin.nexprompt.site"
PORT=5000
NODE_ENV=production
GROQ_API_KEY="your-groq-key"
SAMBANOVA_API_KEY="your-sambanova-key"
```

**Generate JWT secrets:**
```bash
openssl rand -base64 48
openssl rand -base64 48
```

- [ ] DATABASE_URL configured with correct password
- [ ] JWT_SECRET generated and set (64+ characters)
- [ ] JWT_REFRESH_SECRET generated and set (64+ characters)
- [ ] CLIENT_URL set correctly
- [ ] At least one AI provider API key added
- [ ] File saved

### Step 6: Create Client .env
```bash
cd /var/www/nexprompt/client
nano .env
```

Paste:
```env
VITE_API_URL=https://nexprompt.site
VITE_SOCKET_URL=https://nexprompt.site
VITE_ADMIN_URL=https://admin.nexprompt.site
VITE_USER_APP_URL=https://nexprompt.site
VITE_GOOGLE_CLIENT_ID=""
```

- [ ] All URLs configured correctly
- [ ] File saved

### Step 7: Continue Setup Script
Go back to first terminal and press Enter

- [ ] Dependencies installed
- [ ] Prisma schema pushed to database
- [ ] User app built
- [ ] Admin app built
- [ ] Nginx configured
- [ ] SSL certificates obtained
- [ ] PM2 started
- [ ] Setup completed successfully

### Step 8: Verify Services
```bash
pm2 status
systemctl status nginx
systemctl status mysql
```

- [ ] PM2 shows `nexprompt-api` as `online`
- [ ] Nginx is `active (running)`
- [ ] MySQL is `active (running)`

### Step 9: Create Admin Account
```bash
cd /var/www/nexprompt/server
node create_admin.js
```

Follow prompts:
- [ ] Admin email entered
- [ ] Admin password entered
- [ ] Admin account created successfully

### Step 10: Test Websites
- [ ] Open `https://nexprompt.site` - User app loads
- [ ] Open `https://admin.nexprompt.site` - Admin app loads
- [ ] SSL certificate is valid (green lock icon)
- [ ] Can register a test user account
- [ ] Can log in to admin panel
- [ ] Can create a prompt and get AI response

---

## 🔍 Verification Commands

```bash
# Check PM2 logs
pm2 logs nexprompt-api --lines 50

# Check Nginx logs
tail -f /var/log/nginx/error.log

# Check if ports are listening
netstat -tlnp | grep -E ':(80|443|5000)'

# Test API endpoint
curl http://localhost:5000/api/auth/providers

# Check SSL certificates
sudo certbot certificates
```

---

## 🎯 Post-Deployment Tasks

- [ ] Change default SSH port (optional but recommended)
- [ ] Set up automated backups for MySQL database
- [ ] Configure monitoring (optional)
- [ ] Set up log rotation
- [ ] Document your admin credentials securely
- [ ] Test all features:
  - [ ] User registration
  - [ ] Email verification (if configured)
  - [ ] Prompt generation
  - [ ] Credit system
  - [ ] Admin panel
  - [ ] Payment gateway (if configured)

---

## 📝 Important Information to Save

Write down and save securely:

1. **VPS IP Address**: `_________________`
2. **MySQL Root Password**: `_________________`
3. **MySQL nexprompt Password**: `_________________`
4. **Admin Email**: `_________________`
5. **Admin Password**: `_________________`
6. **JWT_SECRET**: `_________________`
7. **JWT_REFRESH_SECRET**: `_________________`

---

## 🔄 Future Updates

When you push new code to GitHub:

```bash
ssh deploy@YOUR_VPS_IP
cd /var/www/nexprompt
bash deploy/deploy.sh
```

- [ ] Bookmark this command for future use

---

## 🆘 Emergency Contacts & Resources

- **GitHub Repo**: https://github.com/Kalua420/NexPrompt.git
- **Full Guide**: See `VPS_SETUP_GUIDE.md`
- **Quick Reference**: See `QUICK_DEPLOY.md`
- **PM2 Docs**: https://pm2.keymetrics.io/docs/usage/quick-start/
- **Nginx Docs**: https://nginx.org/en/docs/

---

## ✅ Deployment Complete!

If all checkboxes are checked, your NexPrompt application is successfully deployed! 🎉

**Access your apps:**
- User App: https://nexprompt.site
- Admin App: https://admin.nexprompt.site

**Monitor your app:**
```bash
pm2 monit
```
