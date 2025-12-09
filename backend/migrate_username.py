import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "architecture_academics.db"

def migrate_username():
    """Add username column to users table"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Check if column exists
        cursor.execute("PRAGMA table_info(users)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if "username" not in columns:
            print("Adding username column to users table...")
            # Add column without UNIQUE constraint first
            cursor.execute("ALTER TABLE users ADD COLUMN username TEXT")
            # Create unique index
            cursor.execute("CREATE UNIQUE INDEX idx_users_username ON users(username)")
            conn.commit()
            print("Migration successful!")
        else:
            print("Username column already exists.")
            
    except Exception as e:
        print(f"Migration failed: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_username()
