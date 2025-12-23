#!/bin/bash

# ==========================================
# Run Database Seeder Manually
# ==========================================

echo "🌱 Seeding Database..."
cd backend

# Activate venv and run seed
if [ -f ".venv/bin/activate" ]; then
    source .venv/bin/activate
    python seed_all.py
else
    echo "⚠️  Virtual environment not found. Creating..."
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
    python seed_all.py
fi

echo "✅ Seeding Complete."
echo "🔄 Restarting Backend..."
pm2 restart aa-backend
