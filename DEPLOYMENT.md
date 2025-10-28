# Simple EC2 Deployment Guide

## Server: http://52.66.127.84/

---

## 1️⃣ Initial EC2 Setup (One-time)

### SSH into EC2
```bash
# Save your key to a file first
# Create a file named deploy_1.pem and paste the key content
# Then set proper permissions:
chmod 400 deploy_1.pem

# SSH into server
ssh -i deploy_1.pem ubuntu@52.66.127.84
```

### Install Required Software
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python
sudo apt install python3 python3-pip python3-venv -y

# Install Node.js and pnpm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y
npm install -g pnpm

# Install Git
sudo apt install git -y
```

### Clone Repository
```bash
cd /home/ubuntu
git clone https://github.com/YOUR_USERNAME/architecture-academics-portal.git
cd architecture-academics-portal
```

### Setup Backend
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
nano .env  # Edit with your settings
```

### Setup Frontend
```bash
cd ../frontend

# Install dependencies
pnpm install

# Create .env.local
cp .env.example .env.local
nano .env.local  # Edit with your settings

# Build
pnpm build
```

### Setup Systemd Services
```bash
# Copy service files
sudo cp /home/ubuntu/architecture-academics-portal/backend.service /etc/systemd/system/
sudo cp /home/ubuntu/architecture-academics-portal/frontend.service /etc/systemd/system/

# Enable and start services
sudo systemctl enable backend
sudo systemctl enable frontend
sudo systemctl start backend
sudo systemctl start frontend

# Check status
sudo systemctl status backend
sudo systemctl status frontend
```

---

## 2️⃣ GitHub Secrets Setup

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

### `EC2_USERNAME`
```
ubuntu
```

### `EC2_SSH_KEY`
Paste the entire content of your deploy_1.pem file:
```
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAr/QiPAPLiDgWEOQuqvHOO1RBcnsSUJRx3M5/EGSO5l8M7gED
kqHXy+wlvRueG5j96cimVP7E1TCs12HnUKUcJ4cG/Vox0wXf2LeGqZXWqB7FYVkh
ykzAnWZMOgMQ+Jc473ytt9Cqeigr2iN9meik4oCrP5cixGuDv7ak/xb6Ef/KccfE
slXPN3SlOO1QmwjJg5bNN6k0jHwqdeqRK1Dr7GI+y/ew4ZrXBm2oO2dlmit48+WT
wSH4Mi3DAaDhzLN5gpHZ3t2Ljj81VBtKp3hJQaR6kNfi5BvQTc9/DEd6eTR+gInI
ORw4wKGaCSPYolHFS9ZOPppCzq/BNd7ELJT9HQIDAQABAoIBADgZT1zxHNBmiWqD
RfnMtKMn3uIAKTu1yIPM9qgkV4dNoNK1Ug1LOoFS3kln58YGxlXmWlnZDKqoJUNa
fKSyr8JOg8T9H8uXIOJ4yR+CnXjmrqm2AFb+l57XgdAxMBUCKe35Q23Kwr/F1Q1s
qVwL1547xd21cylK2iuisQJ/seVQsEOoqTi88R/br5c5U/Rd0siQ5nwBMuHrKWTy
TitwkVnM767M+fSelwQjL+gfNTPRnzBunerInmGYTiLIw+YnRBRz0jWO3lwQigEK
7LBnrBr4mrm5FchFl7WWgGtAKESVNb2hvwx8IE5lZ6Elj+LcTMq80I7otlr+wUBg
O3iy8aECgYEA1s8xDDyXCp3vbF87RgUkkoJjW9nVnXJ8zyii+njjQX8klhK9Cke+
JvcULaBxq4vwmKbClbuqF0yg4vvGJl4+7gQnlwb0ZWN7xNnNcoxPuvS+70swBkWg
AdY1rquc+iS+UpQS1ESsfBiEu7DSFZ3PmtJQv7KQEqn86oz+P4gEsGUCgYEA0bGM
jZYTVMSvgnKZHn+ST2fGvq0WPbYiD93akkCy4NtOkqMLno58W1exizolL5921gig
muM+HAuh7Uc01dW/Y0ygEAfjOGLdiONpn0QpGdb6Lf7hN92ZlzjO4EuvGgGx/ipX
msvOvUy0w+Yko2QFTO0Vu0szRvKJ4+PTkeZpYlkCgYBLHwQxGlNcBCWBycAJ2ayT
jAPBUGnS+QHK1JRCcdpPwm4CCaWQncxTBh9JYY2/B15plBACmzF9mm+9UX1XV6g8
RrmtqGH5vxO+oMinYYhUgljviGTQHLM7UTVO03c/R3BDosL+9tE3SL/Kf6jIpHrA
0wIoOAMIc+geApa7kw7IvQKBgQChxDTH7WTQWkODgOC69HNsqoRaCLFFvkIct2us
tBjK+qRs3zdRhF5PISGoZJzXVk+Y4mLz2ibJ//dVUz9hT1osQqqgc1VI5Iw+1CFh
anXCp2OtJBmevWeFj5+YzQoyJ+imSQf4NQ4yXwB8uAi/u6OTKrs/F85hBy51Dgbj
YTsfUQKBgGnMBSdzm8eKrzMcz4OzZDdPEJX3af2NniG/VIediqkKLDPo0TUYKYMu
dvGTx3VmSSLLpp/8UNbUocOO06qfcgx0oH7e/fLfi8qkMd3G+IzJag90qFRWqFcS
7ufZOvGK8Aofw6RePzd7bu+0GoixDBrCvMV0CmH1yl5XztFXaM+J
-----END RSA PRIVATE KEY-----
```

**Important:** Keep this key secure! Never share it publicly or commit it to your repository.

---

## 3️⃣ How CI/CD Works

### When you push to `main` branch:

**Backend changes (`backend/**`):**
1. GitHub Actions connects to EC2
2. Pulls latest code
3. Installs dependencies
4. Restarts backend service

**Frontend changes (`frontend/**`):**
1. GitHub Actions connects to EC2
2. Pulls latest code
3. Runs `pnpm install` and `pnpm build`
4. Restarts frontend service

---

## 4️⃣ Useful Commands

### Check Service Status
```bash
sudo systemctl status backend
sudo systemctl status frontend
```

### View Logs
```bash
sudo journalctl -u backend -f
sudo journalctl -u frontend -f
```

### Restart Services
```bash
sudo systemctl restart backend
sudo systemctl restart frontend
```

### Manual Deploy
```bash
cd /home/ubuntu/architecture-academics-portal
git pull origin main

# For backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart backend

# For frontend
cd ../frontend
pnpm install
pnpm build
sudo systemctl restart frontend
```

---

## 5️⃣ Access Your Application

- **Frontend**: http://52.66.127.84:3000
- **Backend API**: http://52.66.127.84:8000
- **API Docs**: http://52.66.127.84:8000/docs

---

## 🔧 Troubleshooting

### Backend not starting?
```bash
# Check logs
sudo journalctl -u backend -n 50

# Check if port 8000 is in use
sudo lsof -i :8000

# Manually test
cd /home/ubuntu/architecture-academics-portal/backend
source venv/bin/activate
python run_server.py
```

### Frontend not starting?
```bash
# Check logs
sudo journalctl -u frontend -n 50

# Check if port 3000 is in use
sudo lsof -i :3000

# Manually test
cd /home/ubuntu/architecture-academics-portal/frontend
pnpm start
```

### Port already in use?
```bash
# Kill process on port 8000
sudo kill -9 $(sudo lsof -t -i:8000)

# Kill process on port 3000
sudo kill -9 $(sudo lsof -t -i:3000)
```

---

## 📝 Important Notes

1. Make sure EC2 security group allows inbound traffic on ports 3000 and 8000
2. Keep your SSH key secure and never commit it to Git
3. Update `.env` and `.env.local` files with production values
4. The services will auto-restart on server reboot
5. Check logs if deployment fails

---

That's it! Your simple CI/CD is ready! 🚀
