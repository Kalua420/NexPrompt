# 🚀 NexPrompt - VPS Deployment Guide

## 📦 What's Been Done

✅ Code pushed to GitHub: https://github.com/Kalua420/NexPrompt.git
✅ WebSocket connection issues fixed
✅ Comprehensive deployment guides created

---

## 📚 Documentation Files

1. **VPS_SETUP_GUIDE.md** - Complete step-by-step setup guide
2. **QUICK_DEPLOY.md** - Quick reference for common commands
3. **DEPLOYMENT_CHECKLIST.md** - Interactive checklist to follow

---

## 🎯 Quick Start for VPS Deployment

### Option 1: Follow the Checklist (Recommended)
Open `DEPLOYMENT_CHECKLIST.md` and follow each step, checking off as you go.

### Option 2: Quick Commands

```bash
# 1. SSH to your VPS
ssh root@your-vps-ip

# 2. Clone and run setup
cd /tmp
git clone https://github.com/Kalua420/NexPrompt.git
cd NexPrompt/deploy
nano first-time-setup.sh  # Edit DB_PASS
bash first-time-setup.sh

# 3. Create .env files when prompted
# See VPS_SETUP_GUIDE.md for .env templates

# 4. Create admin account
cd /var/www/nexprompt/server
node create_admin.js
```

---

## 🔑 Required Before Starting

### 1. Domain DNS Configuration
Point these domains to your VPS IP:
- `nexprompt.site` → Your VPS IP
- `admin.nexprompt.site` → Your VPS IP

Check DNS propagation:
```bash
nslookup nexprompt.site
nslookup admin.nexprompt.site
```

### 2. API Keys Needed
- **Groq API Key** (required) - Get from: https://console.groq.com
- **SambaNova API Key** (optional) - Get from: https://cloud.sambanova.ai
- Other AI providers (optional)

### 3. VPS Requirements
- Ubuntu 22.04 LTS
- Minimum 2GB RAM
- 20GB disk space
- Root SSH access

---

## 📋 Environment Variables Reference

### Server .env (Required)
```env
DATABASE_URL="mysql://nexprompt:PASSWORD@localhost:3306/nexprompt"
JWT_SECRET="64-character-random-string"
JWT_REFRESH_SECRET="64-character-random-string"
CLIENT_URL="https://nexprompt.site,https://admin.nexprompt.site"
PORT=5000
NODE_ENV=production
GROQ_API_KEY="your-groq-api-key"
SAMBANOVA_API_KEY="your-sambanova-api-key"
```

### Client .env (Required)
```env
VITE_API_URL=https://nexprompt.site
VITE_SOCKET_URL=https://nexprompt.site
VITE_ADMIN_URL=https://admin.nexprompt.site
VITE_USER_APP_URL=https://nexprompt.site
```

**Generate secure JWT secrets:**
```bash
openssl rand -base64 48
openssl rand -base64 48
```

---

## 🔄 Deployment Workflow

### First Time Setup
1. Run `first-time-setup.sh` (once)
2. Create `.env` files
3. Create admin account
4. Test the application

### Future Updates
```bash
ssh deploy@your-vps-ip
cd /var/www/nexprompt
bash deploy/deploy.sh
```

---

## 🛠️ Common Commands

```bash
# Check status
pm2 status

# View logs
pm2 logs nexprompt-api

# Restart API
pm2 restart nexprompt-api

# Check Nginx
sudo nginx -t
sudo systemctl status nginx

# Check database
sudo systemctl status mysql

# View real-time logs
pm2 logs nexprompt-api --lines 100
```

---

## 🌐 Access URLs After Deployment

- **User App**: https://nexprompt.site
- **Admin App**: https://admin.nexprompt.site
- **API**: https://nexprompt.site/api (proxied through Nginx)

---

## 🆘 Troubleshooting

### API Not Starting
```bash
pm2 logs nexprompt-api --lines 100
# Check for errors in .env or database connection
```

### Nginx Errors
```bash
tail -f /var/log/nginx/error.log
sudo nginx -t  # Test configuration
```

### Database Connection Issues
```bash
sudo systemctl status mysql
# Verify DATABASE_URL in server/.env
```

### SSL Certificate Issues
```bash
sudo certbot certificates
sudo certbot renew --dry-run
```

### WebSocket Connection Issues
- Ensure `VITE_SOCKET_URL` matches your domain
- Check if port 5000 is accessible internally
- Verify Nginx WebSocket proxy configuration

---

## 📊 Monitoring

### PM2 Monitoring
```bash
pm2 monit  # Real-time monitoring
pm2 status  # Quick status check
```

### System Resources
```bash
htop  # Install: sudo apt install htop
df -h  # Disk usage
free -h  # Memory usage
```

---

## 🔐 Security Checklist

- ✅ Strong MySQL password
- ✅ 64+ character JWT secrets
- ✅ UFW firewall enabled
- ✅ SSL certificates installed
- ✅ Running as non-root user
- ✅ API behind Nginx reverse proxy
- ✅ Rate limiting enabled
- ✅ CORS properly configured

---

## 📦 What Gets Deployed

### Backend (API Server)
- Node.js Express server
- Socket.IO for real-time communication
- Prisma ORM with MySQL
- JWT authentication
- AI provider integrations

### Frontend (Static Files)
- React user app (served by Nginx)
- React admin app (served by Nginx)
- Vite build system

### Infrastructure
- Nginx (reverse proxy + static file server)
- PM2 (process manager)
- MySQL (database)
- Let's Encrypt (SSL certificates)

---

## 🎓 Learning Resources

- **PM2 Documentation**: https://pm2.keymetrics.io/docs/
- **Nginx Documentation**: https://nginx.org/en/docs/
- **Prisma Documentation**: https://www.prisma.io/docs/
- **Let's Encrypt**: https://letsencrypt.org/docs/

---

## 📞 Support

If you encounter issues:

1. Check the logs: `pm2 logs nexprompt-api`
2. Review the guides: `VPS_SETUP_GUIDE.md`
3. Follow the checklist: `DEPLOYMENT_CHECKLIST.md`
4. Check Nginx logs: `/var/log/nginx/error.log`

---

## 🎉 Success Indicators

Your deployment is successful when:

- ✅ `pm2 status` shows `nexprompt-api` as `online`
- ✅ Both websites load with valid SSL
- ✅ You can register and log in
- ✅ You can create prompts and get AI responses
- ✅ Admin panel is accessible
- ✅ No errors in `pm2 logs`

---

## 📝 Next Steps After Deployment

1. Create admin account
2. Test user registration
3. Configure payment gateway (optional)
4. Set up email service (optional)
5. Add more AI provider keys
6. Customize branding
7. Set up monitoring
8. Configure backups

---

**Repository**: https://github.com/Kalua420/NexPrompt.git
**Latest Commit**: Includes WebSocket fixes and deployment guides
**Ready to Deploy**: Yes ✅
