#!/bin/bash

# Database Restore Script for Architecture Academics Portal
# This script helps restore your database from a backup

PROJECT_DIR="/home/ec2-user/architecture-academics-portal"
BACKEND_DIR="$PROJECT_DIR/backend"
# Store backups outside the git repository to avoid accidentally committing them
BACKUP_DIR="/home/ec2-user/db-backups"
DATABASE_FILE="$BACKEND_DIR/architecture_portal.db"

echo "🔄 Database Restore Script"
echo "=========================="

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ Backup directory not found: $BACKUP_DIR"
    exit 1
fi

# List available backups
echo "📁 Available backups:"
echo "===================="
backups=($(ls -t "$BACKUP_DIR"/database_backup_*.db 2>/dev/null))

if [ ${#backups[@]} -eq 0 ]; then
    echo "⚠️  No backups found in $BACKUP_DIR"
    exit 1
fi

# Display backups with numbers
for i in "${!backups[@]}"; do
    backup_file="${backups[$i]}"
    backup_name=$(basename "$backup_file")
    backup_size=$(du -h "$backup_file" | cut -f1)
    backup_date=$(stat -c %y "$backup_file" | cut -d'.' -f1)
    echo "$((i+1)). $backup_name (Size: $backup_size, Date: $backup_date)"
done

echo ""
echo "Enter the number of the backup to restore (or 'q' to quit):"
read -r choice

# Handle quit
if [ "$choice" = "q" ] || [ "$choice" = "Q" ]; then
    echo "👋 Restore cancelled"
    exit 0
fi

# Validate choice
if ! [[ "$choice" =~ ^[0-9]+$ ]] || [ "$choice" -lt 1 ] || [ "$choice" -gt ${#backups[@]} ]; then
    echo "❌ Invalid choice. Please enter a number between 1 and ${#backups[@]}"
    exit 1
fi

# Get selected backup
selected_backup="${backups[$((choice-1))]}"
backup_name=$(basename "$selected_backup")

echo ""
echo "⚠️  WARNING: This will replace your current database!"
echo "📋 Current database: $DATABASE_FILE"
echo "🔄 Restore from: $backup_name"
echo ""
echo "Are you sure you want to continue? (yes/no):"
read -r confirm

if [ "$confirm" != "yes" ]; then
    echo "👋 Restore cancelled"
    exit 0
fi

# Stop backend service before restore
echo "🛑 Stopping backend service..."
sudo systemctl stop backend

# Create a backup of current database before restore
if [ -f "$DATABASE_FILE" ]; then
    current_backup="$BACKUP_DIR/pre_restore_backup_$(date +"%Y%m%d_%H%M%S").db"
    echo "💾 Creating backup of current database..."
    cp "$DATABASE_FILE" "$current_backup"
    echo "✅ Current database backed up to: $(basename "$current_backup")"
fi

# Restore the database
echo "🔄 Restoring database..."
cp "$selected_backup" "$DATABASE_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Database restored successfully!"
    
    # Start backend service
    echo "🚀 Starting backend service..."
    sudo systemctl start backend
    
    # Check if service started successfully
    sleep 3
    if sudo systemctl is-active --quiet backend; then
        echo "✅ Backend service started successfully"
        echo "🌐 Your application should be accessible at: http://15.206.47.135:3000"
    else
        echo "❌ Backend service failed to start. Check logs with: sudo journalctl -u backend -f"
    fi
    
else
    echo "❌ Database restore failed!"
    
    # Try to restore the pre-restore backup if it exists
    if [ -f "$current_backup" ]; then
        echo "🔄 Attempting to restore previous database..."
        cp "$current_backup" "$DATABASE_FILE"
        sudo systemctl start backend
    fi
    exit 1
fi

echo ""
echo "✅ Database restore completed!"
echo "📍 Restored from: $backup_name"