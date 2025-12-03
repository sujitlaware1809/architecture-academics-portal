#!/bin/bash

# ==========================================
# PM2 Restart Script
# ==========================================
# Quick restart of all PM2 services

echo "🔄 Restarting PM2 services..."
pm2 restart all

echo "⏳ Waiting for services to start..."
sleep 2

echo ""
echo "✅ Services restarted!"
echo ""
echo "📊 Status:"
pm2 status

echo ""
echo "🔍 Logs:"
echo "   View all: pm2 logs"
echo "   Backend only: pm2 logs aa-backend"
echo "   Frontend only: pm2 logs aa-frontend"
