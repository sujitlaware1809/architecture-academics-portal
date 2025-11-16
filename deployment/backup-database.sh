#!/bin/bash

# Database Backup Script for Architecture Academics Portal
# This script creates backups of your SQLite database before any deployments

PROJECT_DIR="/home/ec2-user/architecture-academics-portal"
BACKEND_DIR="$PROJECT_DIR/backend"
# Store backups outside the git repository to avoid accidentally committing them
BACKUP_DIR="/home/ec2-user/db-backups"
DATABASE_FILE="$BACKEND_DIR/architecture_portal.db"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/database_backup_$TIMESTAMP.db"

echo "🗄️  Database Backup Script"
echo "=========================="

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if database exists
if [ -f "$DATABASE_FILE" ]; then
    echo "📋 Database found: $DATABASE_FILE"
    
    # Create backup
    echo "💾 Creating backup..."
    cp "$DATABASE_FILE" "$BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
        echo "✅ Backup created successfully: $BACKUP_FILE"
        
        # Get backup size
        BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        echo "📊 Backup size: $BACKUP_SIZE"
        
        # List recent backups
        echo ""
        echo "📁 Recent backups:"
        ls -lht "$BACKUP_DIR"/database_backup_*.db | head -5
        
        # Clean old backups (keep last 10)
        echo ""
        echo "🧹 Cleaning old backups (keeping last 10)..."
        ls -t "$BACKUP_DIR"/database_backup_*.db | tail -n +11 | xargs -r rm
        echo "✅ Cleanup completed"
        
    else
        echo "❌ Backup failed!"
        exit 1
    fi
else
    echo "⚠️  Database not found at: $DATABASE_FILE"
    echo "This might be a fresh installation"
    exit 0
fi

echo ""
echo "✅ Database backup completed successfully!"
echo "📍 Backup location: $BACKUP_FILE"