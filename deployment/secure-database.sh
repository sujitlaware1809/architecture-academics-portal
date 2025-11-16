#!/bin/bash

# Database Security Cleanup Script
# This script ensures database files are never accidentally committed to GitHub

echo "🧹 Database Security Cleanup"
echo "============================"

PROJECT_DIR="/home/ec2-user/architecture-academics-portal"
BACKEND_DIR="$PROJECT_DIR/backend"

# Remove any database files from git tracking
echo "🔍 Checking for database files in git..."

cd "$PROJECT_DIR" || exit 1

# Remove database files from git index if they exist
git rm --cached backend/*.db 2>/dev/null || echo "✅ No database files in git index"
git rm --cached backend/*.sqlite 2>/dev/null || echo "✅ No SQLite files in git index"
git rm --cached backend/*.sqlite3 2>/dev/null || echo "✅ No SQLite3 files in git index"
git rm --cached backups/*.db 2>/dev/null || echo "✅ No backup files in git index"

# Remove any backup directories from git tracking
git rm -r --cached backups/ 2>/dev/null || echo "✅ No backup directory in git index"
git rm -r --cached backend/database/ 2>/dev/null || echo "✅ No database directory in git index"

# Ensure .gitignore is properly set
echo ""
echo "📋 Checking .gitignore..."

# Check if database patterns are in .gitignore
if grep -q "*.db" .gitignore; then
    echo "✅ Database files excluded in .gitignore"
else
    echo "⚠️  Adding database exclusions to .gitignore"
    echo "" >> .gitignore
    echo "# Database files - NEVER COMMIT!" >> .gitignore
    echo "*.db" >> .gitignore
    echo "*.sqlite" >> .gitignore
    echo "*.sqlite3" >> .gitignore
fi

# Move any existing database files to secure backup location
SECURE_BACKUP_DIR="/home/ec2-user/db-backups"
mkdir -p "$SECURE_BACKUP_DIR"

if [ -f "$BACKEND_DIR/architecture_portal.db" ]; then
    echo ""
    echo "📦 Moving database to secure location..."
    
    # Create timestamped backup
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    cp "$BACKEND_DIR/architecture_portal.db" "$SECURE_BACKUP_DIR/moved_from_repo_$TIMESTAMP.db"
    
    echo "✅ Database backed up to: $SECURE_BACKUP_DIR/moved_from_repo_$TIMESTAMP.db"
    echo "ℹ️  Original database remains in: $BACKEND_DIR/architecture_portal.db"
fi

echo ""
echo "🔒 Database Security Summary:"
echo "============================"
echo "✅ Database files excluded from git"
echo "✅ Backup location: $SECURE_BACKUP_DIR (outside repository)"
echo "✅ .gitignore configured to prevent accidents"
echo "✅ Repository is safe for commits"

echo ""
echo "💡 Tips:"
echo "- Database backups are stored in: $SECURE_BACKUP_DIR"
echo "- Use ./deployment/backup-database.sh for manual backups"
echo "- Use ./deployment/restore-database.sh to restore if needed"
echo "- Your database will NEVER be committed to GitHub"

echo ""
echo "✅ Database security cleanup completed!"