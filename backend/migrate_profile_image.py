from sqlalchemy import create_engine, text
import os

DATABASE_URL = "sqlite:///./architecture_academics.db"

def migrate():
    print("Starting migration to add profile_image_url to users table...")
    
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as connection:
        try:
            # Check if column exists
            result = connection.execute(text("PRAGMA table_info(users)"))
            columns = [row[1] for row in result]
            
            if 'profile_image_url' not in columns:
                print("Adding profile_image_url column...")
                connection.execute(text("ALTER TABLE users ADD COLUMN profile_image_url TEXT"))
                print("Column added successfully.")
            else:
                print("Column profile_image_url already exists.")
                
        except Exception as e:
            print(f"An error occurred: {e}")

if __name__ == "__main__":
    migrate()
