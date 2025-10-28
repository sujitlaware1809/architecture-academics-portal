from fastapi import UploadFile
from pathlib import Path
import shutil
import uuid

def save_uploaded_file(file: UploadFile, directory: Path) -> str:
    """Save uploaded file and return the file path"""
    # Generate unique filename
    file_extension = file.filename.split(".")[-1] if "." in file.filename else ""
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = directory / unique_filename
    
    # Ensure directory exists
    directory.mkdir(parents=True, exist_ok=True)
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Return relative path for URL
    return f"/uploads/{directory.name}/{unique_filename}"

def delete_uploaded_file(file_path: str) -> bool:
    """Delete uploaded file"""
    try:
        if file_path.startswith("/uploads/"):
            full_path = Path("." + file_path)
            if full_path.exists():
                full_path.unlink()
                return True
    except Exception:
        pass
    return False

def validate_file_type(file: UploadFile, allowed_extensions: set) -> bool:
    """Validate file type based on extension"""
    if not file.filename:
        return False
    
    file_extension = Path(file.filename).suffix.lower()
    return file_extension in allowed_extensions

def validate_file_size(file: UploadFile, max_size_mb: int) -> bool:
    """Validate file size"""
    if not hasattr(file, 'size') or file.size is None:
        return True  # Cannot validate size, allow
    
    max_size_bytes = max_size_mb * 1024 * 1024
    return file.size <= max_size_bytes

def get_file_info(file: UploadFile) -> dict:
    """Get file information"""
    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "size": getattr(file, 'size', None),
        "extension": Path(file.filename).suffix.lower() if file.filename else None
    }