# 🚀 EC2 Deployment Guide - Architecture Academics Portal

This guide covers complete deployment to AWS EC2 with PM2 process manager, Nginx reverse proxy, and SSL.

## 📋 Prerequisites

- AWS EC2 instance (Ubuntu 22.04 or 24.04 LTS)
- Domain name pointed to your EC2 IP
- SSH access to EC2 instance
- Git repository access

## ⚡ Quick Deploy

```bash
# SSH into your EC2 instance
ssh ubuntu@your-ec2-ip

# Download and run deployment script
wget https://raw.githubusercontent.com/yourusername/architecture-academics-portal/main/deploy.sh
chmod +x deploy.sh
./deploy.sh yourdomain.com
```

## 🔑 Environment Variables Setup (CRITICAL!)

### Common Errors from Missing Environment Variables:

1. **"Email verification not working"** → Missing SMTP settings
2. **"CORS error"** → Wrong CORS_ORIGINS or NEXT_PUBLIC_API_URL
3. **"File upload failed"** → Missing AWS S3 credentials
4. **"JWT decode error"** → Wrong SECRET_KEY or not set
5. **"Database error"** → Wrong DATABASE_URL path

### Backend Environment Variables (`backend/.env`)

Create `backend/.env` file:

```bash
# Navigate to backend
cd /home/ubuntu/architecture-academics-portal/backend

# Copy production template
cp ../.env.production .env

# Edit with your values
nano .env
```

**Required variables:**

```bash
# AWS S3 (REQUIRED for file uploads)
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name

# Database (SQLite for simple setup, PostgreSQL for production)
DATABASE_URL=sqlite:///./architecture_academics.db

# JWT Security (MUST CHANGE - use strong random strings!)
SECRET_KEY=<GENERATE_STRONG_64_CHAR_STRING>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS (Your frontend URL)
CORS_ORIGINS=["https://yourdomain.com"]

# Email (REQUIRED for user verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
SMTP_FROM_EMAIL=noreply@yourdomain.com
SMTP_FROM_NAME=Architecture Academics
FRONTEND_URL=https://yourdomain.com
```

**Generate strong secrets:**
```bash
# Generate SECRET_KEY
python3 -c "import secrets; print(secrets.token_urlsafe(64))"

# Or use OpenSSL
openssl rand -base64 64
```

### Frontend Environment Variables (`frontend/.env.local`)

Create `frontend/.env.local` **BEFORE building:**

```bash
cd /home/ubuntu/architecture-academics-portal/frontend
nano .env.local
```

**Required variables:**

```bash
# API URL (must match Nginx proxy configuration)
NEXT_PUBLIC_API_URL=https://yourdomain.com/api

# Site URL
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

⚠️ **IMPORTANT:** These must be set BEFORE running `pnpm build` because Next.js bakes them into the build!

If you change these after building, you must rebuild:
```bash
pnpm build
pm2 restart aa-frontend
```

## 📦 Manual Step-by-Step Deployment

### 1. Update System & Install Dependencies

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs build-essential

# Install pnpm
corepack enable
corepack prepare pnpm@latest --activate

# Install Python & pip
sudo apt install -y python3 python3-venv python3-pip

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

### 2. Clone Repository

```bash
cd /home/ubuntu
git clone <your-repo-url> architecture-academics-portal
cd architecture-academics-portal
```

### 3. Setup Backend

```bash
cd backend

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file (IMPORTANT!)
cp ../.env.production .env
nano .env  # Fill in your values!

# Test backend manually
python run_server.py
# Should start on http://0.0.0.0:8000
# Press Ctrl+C to stop

deactivate
```

### 4. Setup Frontend

```bash
cd ../frontend

# Create .env.local (IMPORTANT!)
nano .env.local
# Add:
# NEXT_PUBLIC_API_URL=https://yourdomain.com/api
# NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Install dependencies
pnpm install

# Build Next.js app
pnpm build

# Test frontend manually
pnpm start
# Should start on http://localhost:3000
# Press Ctrl+C to stop
```

### 5. Start Services with PM2

```bash
cd /home/ubuntu/architecture-academics-portal

# Edit ecosystem.config.js to update environment variables
nano ecosystem.config.js

# Start all services
pm2 start ecosystem.config.js

# Check status
pm2 status

# View logs
pm2 logs aa-backend --lines 50
pm2 logs aa-frontend --lines 50

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
# Run the command it prints
pm2 save
```

### 6. Configure Nginx

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/architecture-academics
```

Add this configuration (replace `yourdomain.com`):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Backend API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend proxy
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site and restart Nginx:

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/architecture-academics /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 7. Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts and enter your email
# Certbot will automatically configure Nginx for HTTPS
```

### 8. Configure AWS Security Groups

In AWS Console, allow these ports:
- **Port 22** (SSH) - Your IP only
- **Port 80** (HTTP) - 0.0.0.0/0
- **Port 443** (HTTPS) - 0.0.0.0/0
- **Port 8000** (Backend API) - Optional if using Nginx proxy

## 🔍 Verification & Testing

### Check Services

```bash
# PM2 status
pm2 status

# View logs
pm2 logs aa-backend
pm2 logs aa-frontend

# Check backend directly
curl http://localhost:8000/

# Check frontend directly
curl http://localhost:3000/

# Check through Nginx
curl http://localhost/
curl http://localhost/api/
```

### Test from Browser

1. Open `https://yourdomain.com` - Should load frontend
2. Open browser console and check for errors
3. Try registering a new user - Check email verification works
4. Try logging in - Check JWT authentication works
5. Try uploading a file - Check S3 integration works

## 🐛 Troubleshooting Common Issues

### Issue: "CORS error in browser console"

**Solution:**
```bash
# Check backend/.env has correct CORS_ORIGINS
cd /home/ubuntu/architecture-academics-portal/backend
nano .env

# Make sure it matches your domain:
CORS_ORIGINS=["https://yourdomain.com"]

# Restart backend
pm2 restart aa-backend
```

### Issue: "Email verification not working"

**Solution:**
```bash
# Check SMTP settings in backend/.env
nano /home/ubuntu/architecture-academics-portal/backend/.env

# For Gmail, use App Password (not regular password):
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=<your-16-char-app-password>
FRONTEND_URL=https://yourdomain.com

# Restart backend
pm2 restart aa-backend

# Check logs for email errors
pm2 logs aa-backend --lines 100
```

### Issue: "File upload failed / S3 error"

**Solution:**
```bash
# Verify AWS credentials in backend/.env
nano /home/ubuntu/architecture-academics-portal/backend/.env

# Check:
AWS_ACCESS_KEY_ID=AKIAXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxx
S3_BUCKET_NAME=your-bucket-name
AWS_REGION=us-east-1

# Make sure IAM user has S3 permissions
# Restart backend
pm2 restart aa-backend
```

### Issue: "Next.js shows 404 for API calls"

**Solution:**
```bash
# Rebuild frontend with correct env vars
cd /home/ubuntu/architecture-academics-portal/frontend

# Check .env.local
cat .env.local
# Should have:
# NEXT_PUBLIC_API_URL=https://yourdomain.com/api

# Rebuild
pnpm build
pm2 restart aa-frontend
```

### Issue: "Backend crashes on startup"

**Solution:**
```bash
# Check Python virtual environment
cd /home/ubuntu/architecture-academics-portal/backend
source .venv/bin/activate
python run_server.py  # Test manually

# Check logs
pm2 logs aa-backend --err --lines 50

# Common issues:
# - Missing dependencies: pip install -r requirements.txt
# - Wrong Python path in ecosystem.config.js
# - Database file permissions
```

### Issue: "PM2 processes don't restart after reboot"

**Solution:**
```bash
# Setup PM2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu

# Save current processes
pm2 save

# Test by rebooting
sudo reboot

# After reboot, check:
pm2 status
```

## 📊 PM2 Commands Reference

```bash
# List all processes
pm2 list

# Show detailed info
pm2 show aa-backend

# View logs (live tail)
pm2 logs aa-backend
pm2 logs aa-frontend

# View last 100 lines
pm2 logs aa-backend --lines 100

# View only errors
pm2 logs aa-backend --err

# Restart services
pm2 restart aa-backend
pm2 restart aa-frontend
pm2 restart all

# Stop services
pm2 stop aa-backend
pm2 stop all

# Delete services
pm2 delete aa-backend
pm2 delete all

# Reload (zero-downtime restart)
pm2 reload aa-frontend

# Monitor CPU/Memory
pm2 monit

# Save current process list
pm2 save

# Resurrect saved processes
pm2 resurrect
```

## 🔄 Updating Deployment

```bash
# SSH into server
ssh ubuntu@your-ec2-ip

# Navigate to app directory
cd /home/ubuntu/architecture-academics-portal

# Pull latest changes
git pull origin main

# Update backend
cd backend
source .venv/bin/activate
pip install -r requirements.txt
deactivate
pm2 restart aa-backend

# Update frontend
cd ../frontend
pnpm install
pnpm build
pm2 restart aa-frontend

# Check status
pm2 status
pm2 logs --lines 50
```

## 🔐 Security Checklist

- [ ] Strong SECRET_KEY (64+ characters)
- [ ] SMTP credentials not exposed
- [ ] AWS credentials have minimal IAM permissions
- [ ] Security groups restrict SSH to your IP only
- [ ] SSL certificate installed (HTTPS)
- [ ] Environment files (.env) not in git repository
- [ ] Database backups configured
- [ ] PM2 startup configured for auto-restart
- [ ] Nginx configured with security headers
- [ ] Firewall (ufw) enabled with only necessary ports

## 📞 Support

If deployment fails, check:
1. PM2 logs: `pm2 logs --lines 200`
2. Nginx logs: `sudo tail -100 /var/log/nginx/error.log`
3. System logs: `sudo journalctl -xe`

For common issues, see Troubleshooting section above.
