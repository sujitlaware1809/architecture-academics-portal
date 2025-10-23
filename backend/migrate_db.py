"""
Database migration script to update schema
Adds missing columns to existing tables
"""
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "architecture_academics.db"

def migrate_database():
    """Add missing columns to the database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    migrations = [
        # Add completed column to course_enrollments if it doesn't exist
        {
            "table": "course_enrollments",
            "column": "completed",
            "sql": "ALTER TABLE course_enrollments ADD COLUMN completed BOOLEAN DEFAULT 0"
        },
        # Add progress_percentage column if it doesn't exist
        {
            "table": "course_enrollments",
            "column": "progress_percentage",
            "sql": "ALTER TABLE course_enrollments ADD COLUMN progress_percentage REAL DEFAULT 0.0"
        },
        # Add last_accessed_at column if it doesn't exist
        {
            "table": "course_enrollments",
            "column": "last_accessed_at",
            "sql": "ALTER TABLE course_enrollments ADD COLUMN last_accessed_at TEXT"
        },
        # Ensure courses table has price column
        {
            "table": "courses",
            "column": "price",
            "sql": "ALTER TABLE courses ADD COLUMN price REAL DEFAULT 0 NOT NULL"
        }
    ]
    
    for migration in migrations:
        try:
            # Check if column exists
            cursor.execute(f"PRAGMA table_info({migration['table']})")
            columns = [col[1] for col in cursor.fetchall()]
            
            if migration['column'] not in columns:
                print(f"Adding column {migration['column']} to {migration['table']}...")
                cursor.execute(migration['sql'])
                conn.commit()
                print(f"✅ Column {migration['column']} added successfully")
            else:
                print(f"✓ Column {migration['column']} already exists in {migration['table']}")
                
        except Exception as e:
            print(f"❌ Error with {migration['column']}: {e}")
            conn.rollback()
    
    conn.close()
    print("\n✅ Database migration completed!")

if __name__ == "__main__":
    print("Starting database migration...")
    migrate_database()
