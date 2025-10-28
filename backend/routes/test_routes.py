from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

import crud
from database import get_db

router = APIRouter(prefix="/api/test", tags=["Test Endpoints"])

@router.get("/workshops")
async def get_test_workshops(db: Session = Depends(get_db)):
    """Test endpoint for workshops without authentication"""
    workshops = crud.get_workshops(db, skip=0, limit=10)
    return workshops

@router.get("/courses")
async def get_test_courses(db: Session = Depends(get_db)):
    """Test endpoint for courses without authentication"""
    courses = crud.get_courses(db, skip=0, limit=10)
    return courses

@router.get("/jobs")
async def get_test_jobs(db: Session = Depends(get_db)):
    """Test endpoint for jobs without authentication"""
    jobs = crud.get_jobs(db, skip=0, limit=10)
    return jobs

@router.get("/users")
async def get_test_users(db: Session = Depends(get_db)):
    """Test endpoint for users without authentication"""
    users = crud.get_users(db, skip=0, limit=10)
    # Remove sensitive information
    safe_users = []
    for user in users:
        safe_users.append({
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role,
            "is_active": user.is_active,
            "created_at": user.created_at
        })
    return safe_users

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Jobs Portal API is running"}