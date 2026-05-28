# VPS Quick Commands Reference

Quick reference for managing NexPrompt on your VPS.

## 🚀 Deploy / Update

```bash
# Quick deploy (recommended)
cd /var/www/nexprompt && bash deploy/deploy.sh

# Manual deploy
cd /var/www/nexprompt
git pull origin main
cd client && npm ci && npm run build && npm run build:admin
cd ../server && npm ci && npx prisma db push
pm2 restart all && sudo systemctl reload nginx
```

## 📊 Monitoring

```bash
# PM2 status
pm2 status

# PM2 logs (real-time)
pm2 logs nexprompt-api

# PM2 logs (last 100 lines)
pm2 logs nexprompt-api --lines 100

# Nginx status
sudo systemctl status nginx

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# System resources
htop
# or
free -h && df -h
```

## 🔄 Restart Services

```bash
# Restart API only
pm2 restart nexprompt-api

# Restart all PM2 processes
pm2 restart all

# Reload PM2 (zero-downtime)
pm2 reload all

# Restart Nginx
sudo systemctl restart nginx

# Reload Nginx (zero-downtime)
sudo systemctl reload nginx

# Restart everything
pm2 restart all && sudo systemctl reload nginx
```

## 🗄️ Database

```bash
# Connect to MySQL
mysql -u nexprompt -p nexprompt

# Prisma push schema
cd /var/www/nexprompt/server && npx prisma db push

# Prisma studio (database GUI)
cd /var/www/nexprompt/server && npx prisma studio

# Backup database
mysqldump -u nexprompt -p nexprompt > backup_$(date +%Y%m%d).sql

# Restore database
mysql -u nexprompt -p nexprompt < backup_20240101.sql
```

## 🔐 SSL Certificates

```bash
# Check certificate status
sudo certbot certificates

# Renew certificates
sudo certbot renew

# Renew and reload Nginx
sudo certbot renew && sudo systemctl reload nginx

# Force renew (for testing)
sudo certbot renew --force-renewal
```

## 🧹 Cleanup

```bash
# Clear PM2 logs
pm2 flush

# Clear Nginx logs
sudo truncate -s 0 /var/log/nginx/access.log
sudo truncate -s 0 /var/log/nginx/error.log

# Clear build cache
cd /var/www/nexprompt/client
rm -rf node_modules/.vite node_modules/.vite-admin

# Clear old builds
cd /var/www/nexprompt/client
rm -rf dist dist-admin

# Clean npm cache
npm cache clean --force
```

## 🔍 Debugging

```bash
# Check if API is running
curl http://localhost:5000/api/auth/providers

# Check user app
curl -I https://nexprompt.site

# Check admin app
curl -I https://admin.nexprompt.site

# Check open ports
sudo netstat -tulpn | grep LISTEN

# Check Node processes
ps aux | grep node

# Check Nginx config syntax
sudo nginx -t

# Check disk space
df -h

# Check memory
free -h

# Check CPU usage
top
```

## 📝 Environment Variables

```bash
# Edit server .env
nano /var/www/nexprompt/server/.env

# Edit client .env
nano /var/www/nexprompt/client/.env

# After editing .env, rebuild and restart
cd /var/www/nexprompt/client
npm run build && npm run build:admin
pm2 restart all
```

## 🔙 Rollback

```bash
# View commit history
cd /var/www/nexprompt
git log --oneline -10

# Rollback to specific commit
git reset --hard COMMIT_HASH

# Rebuild after rollback
cd client && npm run build && npm run build:admin
pm2 restart all && sudo systemctl reload nginx
```

## 🔥 Emergency Commands

```bash
# Kill all Node processes (DANGER!)
pkill -9 node

# Restart PM2 from scratch
pm2 kill
cd /var/www/nexprompt
pm2 start deploy/ecosystem.config.cjs --env production
pm2 save

# Force stop Nginx
sudo systemctl stop nginx
sudo systemctl start nginx

# Reboot server (last resort)
sudo reboot
```

## 📦 Build Commands

```bash
# Build user app only
cd /var/www/nexprompt/client
npm run build

# Build admin app only
cd /var/www/nexprompt/client
npm run build:admin

# Build both apps
cd /var/www/nexprompt/client
npm run build && npm run build:admin

# Verify builds
ls -la /var/www/nexprompt/client/dist/
ls -la /var/www/nexprompt/client/dist-admin/
```

## 🔐 Firewall

```bash
# Check UFW status
sudo ufw status

# Allow port
sudo ufw allow 8080

# Deny port
sudo ufw deny 8080

# Reload UFW
sudo ufw reload
```

## 👤 User Management

```bash
# Switch to deploy user
su - deploy

# Run command as deploy user
sudo -u deploy pm2 status

# Check current user
whoami

# Check user permissions
id deploy
```

## 📊 Performance

```bash
# Check API response time
time curl https://nexprompt.site/api/auth/providers

# Monitor real-time logs
pm2 logs nexprompt-api --raw | grep "ERROR"

# Check PM2 metrics
pm2 monit

# Check system load
uptime
```

## 🎯 One-Liners

```bash
# Full update in one command
cd /var/www/nexprompt && git pull && cd client && npm ci && npm run build && npm run build:admin && cd ../server && npm ci && npx prisma db push && pm2 restart all && sudo systemctl reload nginx

# Quick health check
pm2 status && sudo systemctl status nginx && df -h && free -h

# View all logs
pm2 logs nexprompt-api --lines 50 && sudo tail -50 /var/log/nginx/error.log

# Emergency restart
pm2 restart all && sudo systemctl restart nginx && echo "✅ All services restarted"
```

---

## 📞 Support

If something goes wrong:

1. **Check logs first:** `pm2 logs nexprompt-api --lines 100`
2. **Check Nginx:** `sudo nginx -t && sudo tail -100 /var/log/nginx/error.log`
3. **Check browser console:** Open DevTools (F12) and check for errors
4. **Verify builds:** Ensure `dist/` and `dist-admin/` exist and are recent
5. **Check environment:** Verify `.env` files have correct values

---

## 🎓 Tips

- Always run `sudo nginx -t` before reloading Nginx
- Use `pm2 reload` instead of `restart` for zero-downtime deploys
- Keep backups of `.env` files and database
- Monitor disk space regularly: `df -h`
- Check PM2 logs after every deploy
- Use `pm2 monit` for real-time monitoring
