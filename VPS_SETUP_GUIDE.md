# NexPrompt VPS Setup Guide

Complete guide to deploy NexPrompt on your existing VPS.

## Prerequisites

- Ubuntu 22.04 LTS VPS with root access
- Domain names pointed to your VPS IP:
  - `nexprompt.site` → Your VPS IP
  - `admin.nexprompt.site` → Your VPS IP
- SSH access to your VPS

---

## Part 1: Connect to Your VPS

```bash
ssh root@your-vps-ip
```

---

## Part 2: First-Time Setup (Run Once)

### Step 1: Download and Run Setup Script

```bash
# Clone the repository temporarily
cd /tmp
git clone https://github.com/Kalua420/NexPrompt.git
cd NexPrompt/deploy

# Make the script executable
chmod +x first-time-setup.sh

# IMPORTANT: Edit the script to set your MySQL password
nano first-time-setup.sh
# Find this line: DB_PASS="CHANGE_THIS_DB_PASSWORD"
# Change it to a strong password, e.g.: DB_PASS="YourSecurePassword123!"
# Save: Ctrl+X, then Y, then Enter

# Run the setup script
bash first-time-setup.sh
```

### Step 2: Create Environment Files

The script will pause and ask you to create `.env` files. Open a new terminal and SSH again:

```bash
ssh root@your-vps-ip
cd /var/www/nexprompt
```

#### Create Server .env

```bash
nano server/.env
```

Paste this content (replace values with your actual credentials):

```env
# Database
DATABASE_URL="mysql://nexprompt:YourSecurePassword123!@localhost:3306/nexprompt"

# JWT Secrets (generate random 64-character strings)
JWT_SECRET="your-64-character-random-string-here-make-it-very-long-and-secure"
JWT_REFRESH_SECRET="another-64-character-random-string-different-from-above"

# URLs
CLIENT_URL="https://nexprompt.site,https://admin.nexprompt.site"
PORT=5000
NODE_ENV=production

# Email (SendGrid - optional, for email verification)
SENDGRID_API_KEY=""
FROM_EMAIL="noreply@nexprompt.site"

# Google OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Payment (Razorpay - optional)
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""

# AI Provider API Keys (at least one required)
GROQ_API_KEY="your-groq-api-key"
SAMBANOVA_API_KEY="your-sambanova-api-key"
ANTHROPIC_API_KEY=""
OPENCODE_API_KEY=""
GEMINI_API_KEY=""
```

**To generate secure JWT secrets:**
```bash
# Run these commands to generate random strings
openssl rand -base64 48
openssl rand -base64 48
```

Save: `Ctrl+X`, then `Y`, then `Enter`

#### Create Client .env

```bash
nano client/.env
```

Paste this content:

```env
VITE_API_URL=https://nexprompt.site
VITE_SOCKET_URL=https://nexprompt.site
VITE_ADMIN_URL=https://admin.nexprompt.site
VITE_USER_APP_URL=https://nexprompt.site
VITE_GOOGLE_CLIENT_ID=""
```

Save: `Ctrl+X`, then `Y`, then `Enter`

### Step 3: Continue Setup

Go back to your first terminal where the setup script is waiting and press `Enter` to continue.

The script will:
- Install all dependencies
- Build the frontend apps
- Configure Nginx
- Obtain SSL certificates
- Start the API server with PM2

---

## Part 3: Verify Installation

### Check if everything is running:

```bash
# Check PM2 status
pm2 status

# Check PM2 logs
pm2 logs nexprompt-api

# Check Nginx status
systemctl status nginx

# Check if ports are listening
netstat -tlnp | grep -E ':(80|443|5000)'
```

### Test the websites:

1. Open browser: `https://nexprompt.site` (User app)
2. Open browser: `https://admin.nexprompt.site` (Admin app)

---

## Part 4: Create Admin Account

```bash
cd /var/www/nexprompt/server
node create_admin.js
```

Follow the prompts to create your admin account.

---

## Part 5: Future Deployments (Updates)

When you push new code to GitHub, deploy updates with:

```bash
ssh deploy@your-vps-ip
cd /var/www/nexprompt
bash deploy/deploy.sh
```

---

## Troubleshooting

### Check API Logs
```bash
pm2 logs nexprompt-api
```

### Check Nginx Logs
```bash
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### Restart Services
```bash
# Restart API
pm2 restart nexprompt-api

# Restart Nginx
sudo systemctl restart nginx

# Restart MySQL
sudo systemctl restart mysql
```

### Check Database Connection
```bash
cd /var/www/nexprompt/server
npx prisma studio
# Opens on http://localhost:5555 (use SSH tunnel to access)
```

### SSH Tunnel for Prisma Studio
On your local machine:
```bash
ssh -L 5555:localhost:5555 deploy@your-vps-ip
```
Then open: `http://localhost:5555`

---

## Security Checklist

- ✅ Strong MySQL password set
- ✅ JWT secrets are 64+ characters
- ✅ Firewall (UFW) enabled
- ✅ SSL certificates installed
- ✅ Running as non-root user (deploy)
- ✅ API only accessible via Nginx reverse proxy

---

## Important Files & Directories

```
/var/www/nexprompt/
├── server/
│   ├── .env                    # Server environment variables
│   ├── src/index.js           # API entry point
│   └── prisma/schema.prisma   # Database schema
├── client/
│   ├── .env                    # Client environment variables
│   └── dist/                   # Built user app (served by Nginx)
├── deploy/
│   ├── deploy.sh              # Update deployment script
│   ├── ecosystem.config.cjs   # PM2 configuration
│   └── nginx/                 # Nginx configurations
└── docs/                       # Documentation
```

---

## Quick Commands Reference

```bash
# View running processes
pm2 status

# View API logs (live)
pm2 logs nexprompt-api

# Restart API
pm2 restart nexprompt-api

# Deploy updates
bash /var/www/nexprompt/deploy/deploy.sh

# Check Nginx config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Check SSL certificate expiry
sudo certbot certificates

# Renew SSL certificates manually
sudo certbot renew

# View database
cd /var/www/nexprompt/server && npx prisma studio
```

---

## Support

If you encounter issues:

1. Check logs: `pm2 logs nexprompt-api`
2. Check Nginx: `tail -f /var/log/nginx/error.log`
3. Verify .env files are correct
4. Ensure database is running: `sudo systemctl status mysql`
5. Check firewall: `sudo ufw status`

---

## Next Steps After Setup

1. **Create Admin Account**: Run `node create_admin.js` in server directory
2. **Configure AI Providers**: Add API keys in server/.env
3. **Test User Registration**: Create a test user account
4. **Configure Payment Gateway**: Add Razorpay credentials (optional)
5. **Setup Email**: Add SendGrid API key for email verification (optional)
6. **Monitor Logs**: Keep an eye on PM2 logs for any errors

---

**Repository**: https://github.com/Kalua420/NexPrompt.git
**Deployment User**: deploy
**App Directory**: /var/www/nexprompt
