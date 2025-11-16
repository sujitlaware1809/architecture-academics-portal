# CI/CD Deployment Guide

This guide explains how to set up automatic deployment to your EC2 instance (15.206.47.135) using GitHub Actions.

## 🗄️ Database Preservation

Your existing database is **automatically preserved** during deployments:

- ✅ **No automatic migrations** - Your data stays intact
- 🔄 **Automatic backups** - Created before every deployment
- 📁 **Backup location**: `/home/ec2-user/db-backups/` (outside git repository)
- 🚫 **Never committed** - Database files are excluded from GitHub

### Manual Database Operations

```bash
# Create a manual backup
./deployment/backup-database.sh

# Restore from backup (interactive)
./deployment/restore-database.sh

# List available backups
ls -la /home/ec2-user/db-backups/
```

## 🚀 Quick Setup

### 1. EC2 Instance Setup

Run this one-time setup on your EC2 instance:

```bash
# Download and run the setup script
curl -O https://raw.githubusercontent.com/sujitlaware1809/architecture-academics-portal/main/deployment/setup-ec2.sh
chmod +x setup-ec2.sh
sudo ./setup-ec2.sh
```

### 2. GitHub Secrets Configuration

Add these secrets to your GitHub repository:

1. Go to your repository → Settings → Secrets and variables → Actions
2. Add the following secrets:

- **`EC2_USERNAME`**: Your EC2 username (usually `ec2-user`)
- **`EC2_SSH_KEY`**: Your private SSH key content for EC2 access

### 3. SSH Key Setup

Generate an SSH key pair for deployment:

```bash
# On your local machine
ssh-keygen -t rsa -b 4096 -f ~/.ssh/ec2-deploy-key

# Copy the public key to your EC2 instance
ssh-copy-id -i ~/.ssh/ec2-deploy-key.pub ec2-user@15.206.47.135

# Copy the private key content to GitHub secrets
cat ~/.ssh/ec2-deploy-key
```

## 🔄 How CI/CD Works

### Automatic Deployment Triggers

The deployment will automatically trigger when:

- **Any code is pushed to the `main` branch**
- **Manual deployment is triggered via GitHub Actions tab**

### Deployment Workflows

We have 3 deployment workflows:

1. **`deploy-frontend.yml`** - Deploys only frontend changes
2. **`deploy-backend.yml`** - Deploys only backend changes  
3. **`deploy-full-stack.yml`** - Deploys both frontend and backend

### Manual Deployment

You can manually trigger deployments:

1. Go to GitHub → Actions tab
2. Select "Deploy Full Stack to EC2"
3. Click "Run workflow"
4. Choose what to deploy: `both`, `frontend`, or `backend`

## 🌐 Application URLs

After successful deployment:

- **Frontend**: http://15.206.47.135:3000
- **Backend API**: http://15.206.47.135:8000
- **Health Check**: http://15.206.47.135:8000/health

## 🔧 Environment Variables

The CI/CD automatically sets up these environment variables:

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://15.206.47.135:8000
NEXT_PUBLIC_SITE_URL=http://15.206.47.135:3000
```

### Backend
- Runs on port 8000
- Uses systemd service for process management

## 📊 Monitoring & Logs

### Check Service Status
```bash
# Backend status
sudo systemctl status backend

# Frontend status  
sudo systemctl status frontend
```

### View Logs
```bash
# Backend logs
sudo journalctl -u backend -f

# Frontend logs
sudo journalctl -u frontend -f
```

### Restart Services
```bash
# Restart backend
sudo systemctl restart backend

# Restart frontend
sudo systemctl restart frontend
```

## 🔍 Troubleshooting

### Common Issues

1. **Deployment fails**: Check GitHub Actions logs for details
2. **Services won't start**: Check systemd logs with `journalctl`
3. **Port conflicts**: Ensure ports 3000 and 8000 are available
4. **Permission issues**: Ensure proper file ownership for ec2-user

### Debug Commands

```bash
# Check if ports are in use
sudo netstat -tlnp | grep -E ':3000|:8000'

# Check disk space
df -h

# Check memory usage
free -h

# Test connectivity
curl http://localhost:8000/health
curl http://localhost:3000
```

## 🔐 Security Considerations

1. **SSH Keys**: Keep your private SSH key secure and never commit it to the repository
2. **Firewall**: Ensure only necessary ports are open
3. **Updates**: Regularly update your EC2 instance packages
4. **SSL**: Consider adding SSL certificates for production use

## 📝 Making Changes

When you make changes to your code:

1. **Commit and push to main branch**:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. **Watch the deployment**:
   - Go to GitHub Actions tab
   - Monitor the deployment progress
   - Check for any errors

3. **Verify deployment**:
   - Visit http://15.206.47.135:3000
   - Test your changes

## 🚨 Emergency Procedures

### Quick Rollback
```bash
# On EC2 instance
cd /home/ec2-user/architecture-academics-portal
git log --oneline -10  # See recent commits
git reset --hard <previous-commit-hash>
sudo systemctl restart backend frontend
```

### Manual Deployment
```bash
# On EC2 instance
cd /home/ec2-user/architecture-academics-portal
git pull origin main
cd frontend && npm install && npm run build
cd ../backend && source venv/bin/activate && pip install -r requirements.txt
sudo systemctl restart backend frontend
```

## 📞 Support

If you encounter issues:

1. Check the GitHub Actions logs first
2. SSH into your EC2 instance and check service logs
3. Ensure all prerequisites are installed
4. Verify your GitHub secrets are correctly configured

---

**Your application will be automatically deployed to http://15.206.47.135:3000 whenever you push changes to the main branch! 🎉**