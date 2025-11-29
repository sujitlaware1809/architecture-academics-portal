"""
Migration script to auto-verify existing users who registered before email verification was implemented.
This ensures old users can continue logging in without needing to verify their email.
"""

import sqlite3
from datetime import datetime

DATABASE_URL = "sqlite:///./architecture_academics.db"
db_path = DATABASE_URL.replace("sqlite:///./", "")

def migrate_verify_old_users():
    print("🔄 Starting migration: Auto-verify existing users...")
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get count of unverified users
        cursor.execute("SELECT COUNT(*) FROM users WHERE is_verified = 0 OR is_verified IS NULL")
        unverified_count = cursor.fetchone()[0]
        
        if unverified_count == 0:
            print("✅ No unverified users found. All users are already verified.")
            return
        
        print(f"📊 Found {unverified_count} unverified user(s)")
        
        # Auto-verify all existing users (assuming they're legitimate old users)
        cursor.execute("""
            UPDATE users 
            SET is_verified = 1,
                email_otp = NULL,
                email_otp_expires_at = NULL
            WHERE is_verified = 0 OR is_verified IS NULL
        """)
        
        conn.commit()
        
        print(f"✅ Successfully verified {cursor.rowcount} user(s)")
        print("✅ Migration completed successfully!")
        print("\n💡 All existing users can now login without email verification.")
        print("💡 New registrations will still require email verification via link.")
        
        cursor.close()
        conn.close()
        
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
    except Exception as e:
        print(f"❌ Migration failed: {e}")

if __name__ == "__main__":
    migrate_verify_old_users()
