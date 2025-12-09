# 🚀 EC2 Deployment Guide (Frontend :3000, Backend :8000)

This guide will help you deploy the Architecture Academics Portal on an AWS EC2 instance (Amazon Linux 2023).

## 📋 Prerequisites
1.  **EC2 Instance**: Amazon Linux 2023 (t2.medium or larger recommended).
2.  **Security Group**: Open ports **22** (SSH), **3000** (Frontend), and **8000** (Backend).
3.  **SSH Key**: Your `.pem` file to access the server.

---

## 🛠️ Step 1: Prepare Your Code (Local Machine)

1.  **Update the IP Address**:
    If you have a new EC2 IP, run this script locally to update all configuration files.
    ```powershell
    # In your VS Code terminal (Git Bash or WSL recommended for .sh scripts, or manually edit)
    # Replace 1.2.3.4 with your actual EC2 Public IP
    ./update-ip.sh 1.2.3.4
    ```
    *If you can't run the script, manually edit `setup-port-3000.sh` and replace the IP address.*

2.  **Push Changes to GitHub**:
    ```bash
    git add .
    git commit -m "Update deployment config"
    git push origin main
    ```

---

## ☁️ Step 2: Connect to EC2

Open your terminal and SSH into your instance:
```bash
ssh -i "your-key.pem" ec2-user@your-ec2-ip
```

---

## 🚀 Step 3: First Time Deployment (Fresh Server)

Run these commands on your **EC2 terminal**:

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/sujitlaware1809/architecture-academics-portal.git
    cd architecture-academics-portal
    ```

2.  **Run the Full Setup Script**:
    This script installs Node.js, Python, PM2, and sets up the application.
    ```bash
    chmod +x deploy-fresh-ec2.sh
    ./deploy-fresh-ec2.sh
    ```
    *Note: This might take 5-10 minutes.*

3.  **Configure Ports & Environment**:
    This script configures the frontend to talk to the backend on the correct IP.
    ```bash
    chmod +x setup-port-3000.sh
    ./setup-port-3000.sh
    ```

---

## 🔄 Step 4: Updating Existing Deployment

If you have already deployed and just pushed new code:

1.  **Pull Latest Code**:
    ```bash
    cd architecture-academics-portal
    git pull origin main
    ```

2.  **Rebuild & Restart**:
    ```bash
    # Re-run the setup script to rebuild frontend and restart services
    ./setup-port-3000.sh
    ```

---

## ✅ Verification

1.  **Frontend**: Open `http://YOUR_EC2_IP:3000` in your browser.
2.  **Backend API**: Open `http://YOUR_EC2_IP:8000/docs` to see the API documentation.
3.  **Check Logs**:
    ```bash
    pm2 logs
    ```

## 🐞 Troubleshooting

-   **Site not loading?** Check your EC2 Security Group. Ensure Custom TCP rules for port 3000 and 8000 are allowed from "Anywhere" (0.0.0.0/0).
-   **Backend error?** Check logs: `pm2 logs aa-backend`
-   **Frontend error?** Check logs: `pm2 logs aa-frontend`
