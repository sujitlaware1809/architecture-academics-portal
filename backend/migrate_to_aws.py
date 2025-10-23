"""
Database Migration Script - SQLite to PostgreSQL
"""
import os
import sqlite3
import psycopg2
from psycopg2.extras import execute_values
from database import Base, engine as sqlite_engine
import boto3
from botocore.exceptions import ClientError
import shutil
from pathlib import Path

def get_sqlite_connection():
    """Get SQLite database connection"""
    return sqlite3.connect('./architecture_academics.db')

def get_postgres_connection(database_url):
    """Get PostgreSQL database connection"""
    return psycopg2.connect(database_url)

def upload_file_to_s3(file_path, s3_key):
    """Upload file to S3 and return the new URL"""
    s3_client = boto3.client(
        's3',
        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
        region_name=os.getenv('AWS_REGION', 'us-east-1')
    )
    bucket_name = os.getenv('S3_BUCKET_NAME')
    
    try:
        s3_client.upload_file(file_path, bucket_name, s3_key)
        return f"https://{bucket_name}.s3.{os.getenv('AWS_REGION', 'us-east-1')}.amazonaws.com/{s3_key}"
    except ClientError as e:
        print(f"Error uploading file to S3: {e}")
        return None

def migrate_uploads_to_s3():
    """Migrate local uploads to S3"""
    upload_dir = Path("uploads")
    if not upload_dir.exists():
        return
    
    # Process each subdirectory
    for subdir in ['videos', 'materials', 'resumes']:
        subdir_path = upload_dir / subdir
        if not subdir_path.exists():
            continue
            
        print(f"\n📁 Processing {subdir} directory...")
        for file_path in subdir_path.rglob('*'):
            if file_path.is_file():
                # Create S3 key maintaining folder structure
                relative_path = file_path.relative_to(upload_dir)
                s3_key = str(relative_path).replace('\\', '/')
                
                print(f"⏳ Uploading {file_path.name}...")
                new_url = upload_file_to_s3(str(file_path), s3_key)
                
                if new_url:
                    print(f"✅ Uploaded {file_path.name} to S3")
                    # Return mapping of local path to S3 URL
                    yield (f"/uploads/{str(relative_path).replace('\\', '/')}", new_url)
                else:
                    print(f"❌ Failed to upload {file_path.name}")

def update_urls_in_postgres(postgres_conn, url_mappings):
    """Update URLs in PostgreSQL database"""
    cur = postgres_conn.cursor()
    
    # Update course lessons
    for old_url, new_url in url_mappings:
        cur.execute("""
            UPDATE course_lessons 
            SET video_url = %s 
            WHERE video_url = %s
        """, (new_url, old_url))
    
    # Update course materials
    for old_url, new_url in url_mappings:
        cur.execute("""
            UPDATE course_materials 
            SET file_url = %s 
            WHERE file_url = %s
        """, (new_url, old_url))
    
    # Update job applications
    for old_url, new_url in url_mappings:
        cur.execute("""
            UPDATE job_applications 
            SET resume_url = %s 
            WHERE resume_url = %s
        """, (new_url, old_url))
    
    postgres_conn.commit()

def migrate_database(database_url):
    """Migrate data from SQLite to PostgreSQL"""
    sqlite_conn = get_sqlite_connection()
    postgres_conn = get_postgres_connection(database_url)
    
    sqlite_cur = sqlite_conn.cursor()
    postgres_cur = postgres_conn.cursor()
    
    # Get all tables
    sqlite_cur.execute("""
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
    """)
    tables = sqlite_cur.fetchall()
    
    # Create tables in PostgreSQL
    Base.metadata.create_all(bind=engine)
    
    for table in tables:
        table_name = table[0]
        print(f"\n📋 Migrating table: {table_name}")
        
        # Get column names
        sqlite_cur.execute(f"PRAGMA table_info({table_name})")
        columns = [col[1] for col in sqlite_cur.fetchall()]
        columns_str = ", ".join(columns)
        
        # Get data from SQLite
        sqlite_cur.execute(f"SELECT {columns_str} FROM {table_name}")
        rows = sqlite_cur.fetchall()
        
        if rows:
            # Prepare INSERT statement for PostgreSQL
            placeholders = ", ".join(["%s"] * len(columns))
            insert_query = f"""
                INSERT INTO {table_name} ({columns_str})
                VALUES ({placeholders})
            """
            
            # Insert data in batches
            batch_size = 1000
            for i in range(0, len(rows), batch_size):
                batch = rows[i:i + batch_size]
                execute_values(postgres_cur, insert_query, batch)
                postgres_conn.commit()
                print(f"✅ Inserted {min(i + batch_size, len(rows))}/{len(rows)} rows")
        else:
            print(f"ℹ️ No data to migrate for table: {table_name}")
    
    # Reset sequences
    for table in tables:
        table_name = table[0]
        try:
            postgres_cur.execute(f"""
                SELECT setval(
                    pg_get_serial_sequence('{table_name}', 'id'),
                    COALESCE((SELECT MAX(id) FROM {table_name}), 0) + 1,
                    false
                )
            """)
            postgres_conn.commit()
        except Exception as e:
            print(f"⚠️ Could not reset sequence for {table_name}: {e}")
    
    print("\n🔄 Migrating uploaded files to S3...")
    url_mappings = list(migrate_uploads_to_s3())
    
    if url_mappings:
        print("\n📝 Updating URLs in database...")
        update_urls_in_postgres(postgres_conn, url_mappings)
    
    sqlite_conn.close()
    postgres_conn.close()
    print("\n✅ Migration complete!")

if __name__ == "__main__":
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("❌ DATABASE_URL environment variable not set")
        exit(1)
    
    migrate_database(database_url)