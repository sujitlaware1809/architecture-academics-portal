"""
Migration script to add user_type column to existing users table
"""
import sqlite3
from database import DATABASE_URL

def migrate():
    # Extract database path from DATABASE_URL
    db_path = DATABASE_URL.replace("sqlite:///./", "")
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if user_type column already exists
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'user_type' not in columns:
            print("Adding user_type column to users table...")
            cursor.execute("""
                ALTER TABLE users 
                ADD COLUMN user_type TEXT DEFAULT 'STUDENT'
            """)
            conn.commit()
            print("✓ user_type column added successfully")
        else:
            print("user_type column already exists")
        
        # Check and add cao_number column
        if 'cao_number' not in columns:
            print("Adding cao_number column to users table...")
            cursor.execute("""
                ALTER TABLE users 
                ADD COLUMN cao_number TEXT
            """)
            conn.commit()
            print("✓ cao_number column added successfully")
        else:
            print("cao_number column already exists")
        
        # Check and add teaching_experience column
        if 'teaching_experience' not in columns:
            print("Adding teaching_experience column to users table...")
            cursor.execute("""
                ALTER TABLE users 
                ADD COLUMN teaching_experience TEXT
            """)
            conn.commit()
            print("✓ teaching_experience column added successfully")
        else:
            print("teaching_experience column already exists")
        
        conn.close()
        print("\n✓ Migration completed successfully!")
        
    except Exception as e:
        print(f"✗ Migration failed: {str(e)}")
        raise

if __name__ == "__main__":
    migrate()
