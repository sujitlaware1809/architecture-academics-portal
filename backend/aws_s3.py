"""
AWS S3 integration for video and file uploads
"""

import boto3
from botocore.exceptions import ClientError
import os
from datetime import datetime, timedelta
import uuid
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class S3Manager:
    def __init__(self):
        # AWS S3 Configuration
        self.aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID")
        self.aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY") 
        self.aws_region = os.getenv("AWS_REGION", "us-east-1")
        self.bucket_name = os.getenv("S3_BUCKET_NAME", "architecture-academics-videos")
        
        # Initialize S3 client
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=self.aws_access_key_id,
            aws_secret_access_key=self.aws_secret_access_key,
            region_name=self.aws_region
        )
        
        # Folder structure
        self.video_folder = "course-videos/"
        self.material_folder = "course-materials/"
        self.image_folder = "course-images/"
    
    def generate_unique_filename(self, original_filename: str, folder: str = "") -> str:
        """Generate a unique filename with timestamp and UUID"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        name, ext = os.path.splitext(original_filename)
        return f"{folder}{timestamp}_{unique_id}_{name}{ext}"
    
    def upload_video(self, file_content: bytes, filename: str, course_id: int, lesson_id: int) -> Optional[str]:
        """Upload video to S3 and return public URL"""
        try:
            # Generate unique filename
            s3_key = self.generate_unique_filename(filename, f"{self.video_folder}course_{course_id}/lesson_{lesson_id}/")
            
            # Upload to S3
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=s3_key,
                Body=file_content,
                ContentType='video/mp4',
                Metadata={
                    'course_id': str(course_id),
                    'lesson_id': str(lesson_id),
                    'uploaded_at': datetime.now().isoformat()
                }
            )
            
            # Return public URL
            video_url = f"https://{self.bucket_name}.s3.{self.aws_region}.amazonaws.com/{s3_key}"
            logger.info(f"Video uploaded successfully: {video_url}")
            return video_url
            
        except ClientError as e:
            logger.error(f"Error uploading video to S3: {e}")
            return None
    
    def upload_material(self, file_content: bytes, filename: str, course_id: int) -> Optional[str]:
        """Upload course material to S3 and return public URL"""
        try:
            # Generate unique filename
            s3_key = self.generate_unique_filename(filename, f"{self.material_folder}course_{course_id}/")
            
            # Determine content type
            content_type = "application/octet-stream"
            if filename.lower().endswith('.pdf'):
                content_type = "application/pdf"
            elif filename.lower().endswith(('.doc', '.docx')):
                content_type = "application/msword"
            elif filename.lower().endswith('.txt'):
                content_type = "text/plain"
            
            # Upload to S3
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=s3_key,
                Body=file_content,
                ContentType=content_type,
                Metadata={
                    'course_id': str(course_id),
                    'uploaded_at': datetime.now().isoformat()
                }
            )
            
            # Return public URL
            material_url = f"https://{self.bucket_name}.s3.{self.aws_region}.amazonaws.com/{s3_key}"
            logger.info(f"Material uploaded successfully: {material_url}")
            return material_url
            
        except ClientError as e:
            logger.error(f"Error uploading material to S3: {e}")
            return None
    
    def upload_course_image(self, file_content: bytes, filename: str, course_id: int) -> Optional[str]:
        """Upload course thumbnail image to S3 and return public URL"""
        try:
            # Generate unique filename
            s3_key = self.generate_unique_filename(filename, f"{self.image_folder}course_{course_id}/")
            
            # Upload to S3
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=s3_key,
                Body=file_content,
                ContentType='image/jpeg',
                Metadata={
                    'course_id': str(course_id),
                    'uploaded_at': datetime.now().isoformat()
                }
            )
            
            # Return public URL
            image_url = f"https://{self.bucket_name}.s3.{self.aws_region}.amazonaws.com/{s3_key}"
            logger.info(f"Image uploaded successfully: {image_url}")
            return image_url
            
        except ClientError as e:
            logger.error(f"Error uploading image to S3: {e}")
            return None
    
    def delete_file(self, file_url: str) -> bool:
        """Delete file from S3 using the public URL"""
        try:
            # Extract S3 key from URL
            s3_key = file_url.split(f"{self.bucket_name}.s3.{self.aws_region}.amazonaws.com/")[1]
            
            # Delete from S3
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=s3_key)
            logger.info(f"File deleted successfully: {s3_key}")
            return True
            
        except (ClientError, IndexError) as e:
            logger.error(f"Error deleting file from S3: {e}")
            return False
    
    def generate_presigned_url(self, file_url: str, expiration: int = 3600) -> Optional[str]:
        """Generate a presigned URL for private video access (for premium content)"""
        try:
            # Extract S3 key from URL
            s3_key = file_url.split(f"{self.bucket_name}.s3.{self.aws_region}.amazonaws.com/")[1]
            
            # Generate presigned URL
            presigned_url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': s3_key},
                ExpiresIn=expiration
            )
            
            return presigned_url
            
        except (ClientError, IndexError) as e:
            logger.error(f"Error generating presigned URL: {e}")
            return None

# Global S3 manager instance
s3_manager = S3Manager()