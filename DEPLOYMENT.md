# Livaani Production Deployment Guide

**Status:** Production-Ready  
**Last Updated:** July 2026

---

## 📋 Pre-Deployment Checklist

### 1. Environment Configuration

- [ ] Create `.env` and `server/.env` with production values (DO NOT commit)
- [ ] Generate strong JWT secrets:
  ```bash
  node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
  node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
  ```
- [ ] Set secure admin password (strong, unique)
- [ ] Set `NODE_ENV=production`
- [ ] Set `FRONTEND_URL=https://yourdomain.com` (exact domain)
- [ ] Set `COOKIE_DOMAIN=yourdomain.com` (for production)

### 2. Database Security

- [ ] MongoDB credentials are unique and strong
- [ ] Database backups automated (daily minimum)
- [ ] IP whitelist configured (only your servers)
- [ ] SSL/TLS enabled for database connection
- [ ] Test failover/recovery procedure

### 3. SSL/TLS Certificate

- [ ] Valid SSL/TLS certificate installed (not self-signed)
- [ ] Certificate auto-renewal configured
- [ ] HSTS header enabled (see `SECURITY.md`)
- [ ] Test with `https://` domain

### 4. Frontend Build

- [ ] Run `npm run build` - verify no errors
- [ ] Verify `.env` only contains `VITE_GOOGLE_CLIENT_ID`
- [ ] Check `dist/` folder is complete
- [ ] Test production build locally: `npm run preview`

### 5. Backend Configuration

- [ ] All dependencies installed (`npm ci` not `npm install`)
- [ ] No debug logs enabled in production
- [ ] Error messages don't leak sensitive info
- [ ] Rate limiting configured on auth endpoints
- [ ] CORS whitelist has correct production domain

### 6. Security Headers

- [ ] Verify security headers with `curl -I https://yourdomain.com`
- [ ] CSP header doesn't have `unsafe-inline` for scripts
- [ ] X-Frame-Options set to DENY
- [ ] All headers present (see `SECURITY.md`)

### 7. Monitoring & Logging

- [ ] Error logging enabled (but no PII in logs)
- [ ] Failed login attempts logged
- [ ] Application monitoring set up
- [ ] Database connection pool monitored
- [ ] Disk space alerts configured

### 8. Backup & Disaster Recovery

- [ ] Database backups automated (daily minimum)
- [ ] Backup retention policy defined (30+ days)
- [ ] Tested recovery from backup (monthly)
- [ ] Disaster recovery plan documented

---

## 🚀 Deployment Steps

### Option A: Railway / Vercel / Similar Platform

1. **Connect Repository**
   ```
   1. Login to Railway/Vercel
   2. New Project → GitHub
   3. Select LIVN-main repository
   4. Auto-deploy enabled
   ```

2. **Set Environment Variables**
   ```
   Dashboard → Project Settings → Environment
   
   Add these variables:
   - NODE_ENV=production
   - MONGO_URI=your_mongodb_uri
   - JWT_SECRET=generated_secret
   - JWT_REFRESH_SECRET=generated_secret
   - ADMIN_EMAIL=admin@livaani.com
   - ADMIN_PASSWORD=strong_password
   - FRONTEND_URL=https://livaani.com
   - COOKIE_DOMAIN=livaani.com
   - PORT=5000 (or leave default)
   ```

3. **Configure Build Command**
   ```
   Build: npm run build:prod
   Start: npm run start:prod
   ```

4. **Deploy**
   - Platform auto-deploys on push to main
   - Monitor deployment logs
   - Verify production URL works

### Option B: Self-Hosted (VPS/AWS)

1. **Server Setup**
   ```bash
   # SSH into server
   ssh ubuntu@your_server_ip
   
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install PM2 (process manager)
   sudo npm install -g pm2
   
   # Clone repository
   git clone https://github.com/KMCR41207/LIVN.git
   cd LIVN
   ```

2. **Database Setup**
   ```bash
   # MongoDB Atlas:
   # 1. Create cluster at mongodb.com
   # 2. Create database user
   # 3. Get connection string
   # 4. Add server IP to whitelist
   ```

3. **SSL/TLS Certificate**
   ```bash
   # Install Certbot for Let's Encrypt
   sudo apt install -y certbot python3-certbot-nginx
   
   # Get certificate
   sudo certbot certonly --standalone -d livaani.com -d www.livaani.com
   
   # Auto-renewal
   sudo systemctl enable certbot.timer
   ```

4. **Nginx Reverse Proxy**
   ```bash
   # Install Nginx
   sudo apt install -y nginx
   
   # Create config file
   sudo nano /etc/nginx/sites-available/livaani
   ```

   Add this configuration:
   ```nginx
   upstream livaani_backend {
     server localhost:5000;
   }

   server {
     listen 80;
     server_name livaani.com www.livaani.com;
     return 301 https://$server_name$request_uri;
   }

   server {
     listen 443 ssl http2;
     server_name livaani.com www.livaani.com;

     # SSL Certificates
     ssl_certificate /etc/letsencrypt/live/livaani.com/fullchain.pem;
     ssl_certificate_key /etc/letsencrypt/live/livaani.com/privkey.pem;

     # Security Headers
     add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
     add_header X-Frame-Options "DENY" always;
     add_header X-Content-Type-Options "nosniff" always;
     add_header X-XSS-Protection "1; mode=block" always;

     # Gzip compression
     gzip on;
     gzip_types text/plain text/css text/javascript application/json;

     location / {
       proxy_pass http://livaani_backend;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
       proxy_cache_bypass $http_upgrade;
       
       # Cookies for HTTP-only tokens
       proxy_cookie_flags ~ secure httponly samesite=strict;
     }
   }
   ```

   Enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/livaani /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl start nginx
   ```

5. **Application Setup**
   ```bash
   cd /path/to/LIVN
   
   # Install dependencies
   npm ci
   
   # Build frontend
   npm run build
   
   # Create .env and server/.env with production values
   # (Use secure environment manager or manual creation)
   
   # Start with PM2
   pm2 start ecosystem.config.js --env production
   pm2 startup
   pm2 save
   ```

   Create `ecosystem.config.js`:
   ```javascript
   module.exports = {
     apps: [
       {
         name: 'livaani',
         script: './server/index.js',
         instances: 'max',
         exec_mode: 'cluster',
         env: {
           NODE_ENV: 'production',
           PORT: 5000,
         },
         error_file: 'logs/error.log',
         out_file: 'logs/out.log',
         log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
         merge_logs: true,
       },
     ],
   };
   ```

6. **Database Backup Script**
   ```bash
   # Create backup script
   cat > /home/ubuntu/backup-db.sh << 'EOF'
   #!/bin/bash
   
   BACKUP_DIR="/backups/mongodb"
   MONGO_URI=$1
   DATE=$(date +%Y%m%d_%H%M%S)
   
   mongodump --uri="$MONGO_URI" --out=$BACKUP_DIR/$DATE
   
   # Keep only last 30 days
   find $BACKUP_DIR -type d -mtime +30 -exec rm -rf {} \;
   EOF
   
   chmod +x /home/ubuntu/backup-db.sh
   
   # Add to crontab
   crontab -e
   # Add: 0 2 * * * /home/ubuntu/backup-db.sh "your_mongo_uri"
   ```

---

## 🔍 Post-Deployment Verification

### 1. Connectivity Tests

```bash
# Test frontend loads
curl https://livaani.com

# Test API responds
curl https://livaani.com/api/health

# Check security headers
curl -I https://livaani.com | grep -i "x-frame\|x-content\|csp\|hsts"
```

### 2. Functionality Tests

- [ ] Can create account
- [ ] Can login
- [ ] Can view products
- [ ] Can add to cart
- [ ] Can checkout (test payment with test credentials)
- [ ] Can view order history
- [ ] Can logout
- [ ] Admin features work

### 3. Security Validation

- [ ] localStorage is clean (no PII)
- [ ] Cookies have HttpOnly flag
- [ ] CORS works (test from another domain - should fail)
- [ ] All security headers present
- [ ] HTTPS enforced (http:// redirects to https://)

### 4. Performance Tests

```bash
# Test response time
ab -n 100 -c 10 https://livaani.com/api/health

# Check Core Web Vitals with Lighthouse
# https://pagespeed.web.dev/
```

---

## 📊 Monitoring

### Key Metrics

- Database connection pool utilization
- API response time (p50, p95, p99)
- Error rate (5xx responses)
- Failed login attempts
- Uptime (99.9%+ target)

### Alert Thresholds

- API response time > 5 seconds
- Error rate > 1%
- Failed logins > 10 in 15 minutes
- Disk space < 10%
- Database connection pool > 80%

### Tools

- **Application Monitoring**: Datadog, New Relic, or similar
- **Error Tracking**: Sentry
- **Uptime Monitoring**: Pingdom, Uptime Robot
- **Log Aggregation**: ELK Stack, Splunk

---

## 🔄 Rollback Procedure

If something goes wrong in production:

1. **Immediate Rollback**
   ```bash
   # If using Git
   git revert HEAD
   git push origin main
   
   # If using PM2
   pm2 restart livaani
   
   # Or if using Docker
   docker restart livaani-container
   ```

2. **Database Rollback (if needed)**
   ```bash
   # Restore from backup
   mongorestore --uri="prod_mongo_uri" /backups/mongodb/backup_date/
   ```

3. **Notification**
   - Alert team on Slack/email
   - Post incident report
   - Document root cause

---

## 🔐 Production Security Hardening

### Additional Recommendations

1. **DDoS Protection**
   - Use Cloudflare or similar CDN
   - Rate limiting on all endpoints
   - WAF (Web Application Firewall)

2. **Database Encryption**
   - Encryption at rest (enabled by default on MongoDB Atlas)
   - Encryption in transit (SSL/TLS)
   - Regular security audits

3. **Access Control**
   - Separate admin user for each admin
   - SSH key-based authentication (no passwords)
   - VPN for database access
   - IP whitelist for all services

4. **Audit Logging**
   - Log all admin actions
   - Log authentication failures
   - Monitor for suspicious patterns
   - Retain logs for 90 days minimum

5. **Regular Updates**
   - Monthly security patches
   - Quarterly penetration testing
   - Quarterly security audit
   - Annual comprehensive review

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue**: "CORS error" on frontend
```
Solution: 
1. Check FRONTEND_URL in server/.env
2. Verify domain in CORS whitelist
3. Restart server
```

**Issue**: "Token expired" after deployment
```
Solution:
1. Check JWT_SECRET is same across instances
2. Check server time is synchronized
3. Check token expiry settings
```

**Issue**: High memory usage
```
Solution:
1. Check database connection pool size
2. Look for memory leaks in logs
3. Increase server RAM
4. Use PM2 clustering (already configured)
```

---

**Need help?** Contact: ops@livaani.com
