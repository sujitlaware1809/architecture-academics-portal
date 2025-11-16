#!/bin/bash

# Deployment Status Checker
# Run this script to check the health of your deployment

EC2_HOST="15.206.47.135"
FRONTEND_PORT="3000"
BACKEND_PORT="8000"

echo "🔍 Checking deployment status for Architecture Academics Portal..."
echo "🌐 EC2 Instance: $EC2_HOST"
echo ""

# Check if services are running
echo "📊 Service Status:"
echo "=================="

# Check backend service
echo -n "Backend Service: "
if systemctl is-active --quiet backend; then
    echo "✅ Running"
else
    echo "❌ Not Running"
fi

# Check frontend service  
echo -n "Frontend Service: "
if systemctl is-active --quiet frontend; then
    echo "✅ Running"
else
    echo "❌ Not Running"
fi

echo ""

# Check HTTP endpoints
echo "🌐 HTTP Health Checks:"
echo "====================="

# Check backend health
echo -n "Backend API: "
if curl -s -f "http://$EC2_HOST:$BACKEND_PORT/health" > /dev/null 2>&1; then
    echo "✅ Accessible (http://$EC2_HOST:$BACKEND_PORT)"
else
    echo "❌ Not Accessible"
fi

# Check frontend
echo -n "Frontend: "
if curl -s -f "http://$EC2_HOST:$FRONTEND_PORT" > /dev/null 2>&1; then
    echo "✅ Accessible (http://$EC2_HOST:$FRONTEND_PORT)"
else
    echo "❌ Not Accessible"
fi

echo ""

# Check ports
echo "🔌 Port Status:"
echo "==============="

# Check if ports are listening
echo -n "Port $BACKEND_PORT (Backend): "
if ss -tuln | grep -q ":$BACKEND_PORT "; then
    echo "✅ Listening"
else
    echo "❌ Not Listening"
fi

echo -n "Port $FRONTEND_PORT (Frontend): "
if ss -tuln | grep -q ":$FRONTEND_PORT "; then
    echo "✅ Listening"
else
    echo "❌ Not Listening"
fi

echo ""

# Show recent logs
echo "📝 Recent Logs (Last 5 lines):"
echo "==============================="

echo "Backend logs:"
journalctl -u backend --no-pager -n 5 2>/dev/null || echo "No backend logs available"

echo ""

echo "Frontend logs:"
journalctl -u frontend --no-pager -n 5 2>/dev/null || echo "No frontend logs available"

echo ""

# Show disk usage
echo "💾 Disk Usage:"
echo "=============="
df -h | grep -E "Filesystem|/dev/"

echo ""

# Show memory usage
echo "🧠 Memory Usage:"
echo "================"
free -h

echo ""
echo "✅ Health check completed!"
echo ""
echo "🔗 Application URLs:"
echo "   Frontend: http://$EC2_HOST:$FRONTEND_PORT"
echo "   Backend API: http://$EC2_HOST:$BACKEND_PORT"
echo "   Health Check: http://$EC2_HOST:$BACKEND_PORT/health"