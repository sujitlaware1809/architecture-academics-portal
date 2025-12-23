#!/bin/bash

# ==========================================
# Fix Frontend-Backend Connection
# Run this on EC2 to reconnect frontend to backend
# ==========================================

echo "🔧 Fixing frontend-backend connection..."

APP_DIR="/home/ec2-user/architecture-academics-portal"
cd "$APP_DIR/frontend"

# Update .env.local to point to backend via localhost
echo "📝 Updating frontend .env.local..."
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
NEXT_PUBLIC_SITE_URL=http://15.206.47.135
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000
NODE_ENV=production
EOF

echo "✅ Frontend .env.local updated"

# Update Nginx configuration
echo "🌐 Updating Nginx configuration..."
sudo tee /etc/nginx/conf.d/architecture-academics.conf > /dev/null <<'EOFNGINX'
upstream backend_api {
    server 127.0.0.1:8000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

upstream frontend_app {
    server 127.0.0.1:3000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

server {
    listen 80 default_server;
    server_name _;
    
    client_max_body_size 100M;
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # API Routes
    location /api/ {
        proxy_pass http://backend_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffering off;
        proxy_cache_bypass $http_pragma $http_authorization;
    }

    # Frontend
    location / {
        proxy_pass http://frontend_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffering off;
        proxy_cache_bypass $http_pragma $http_authorization;
    }
}
EOFNGINX

echo "✅ Nginx configuration updated"

# Test Nginx
echo "🧪 Testing Nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    # Restart services
    echo "🔄 Restarting services..."
    sudo systemctl restart nginx
    pm2 restart all
    
    echo ""
    echo "✅ Frontend-Backend connection fixed!"
    echo ""
    echo "📊 Service Status:"
    pm2 status
    echo ""
    echo "🌐 Access your application:"
    echo "   http://15.206.47.135"
    echo ""
    echo "🔍 Check logs:"
    echo "   pm2 logs aa-backend"
    echo "   pm2 logs aa-frontend"
else
    echo "❌ Nginx configuration error!"
    exit 1
fi
