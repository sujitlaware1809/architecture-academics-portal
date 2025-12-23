#!/bin/bash

# ==========================================
# Database Backup Script
# ==========================================

BACKUP_DIR="/home/ec2-user/backups"
DB_PATH="/home/ec2-user/architecture-academics-portal/backend/architecture_academics.db"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.db"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "📦 Backing up database..."
if [ -f "$DB_PATH" ]; then
    cp "$DB_PATH" "$BACKUP_FILE"
    echo "✅ Database backed up to: $BACKUP_FILE"
    
    # Keep only last 5 backups
    ls -t "$BACKUP_DIR"/db_backup_*.db | tail -n +6 | xargs -I {} rm -- {}
    echo "🧹 Old backups cleaned up (kept last 5)"
else
    echo "❌ Database file not found at $DB_PATH"
fi
