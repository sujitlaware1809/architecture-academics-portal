"""
NATA Lessons Routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from typing import List

router = APIRouter()

# In-memory storage for NATA lessons (you can later move to database)
from seed_nata_lessons import get_nata_lessons

@router.get("/nata-courses")
async def get_nata_courses(db: Session = Depends(get_db)):
    """Get all NATA lessons"""
    lessons = get_nata_lessons()
    return {
        "success": True,
        "data": lessons,
        "total": len(lessons)
    }

@router.get("/nata-courses/{lesson_id}")
async def get_nata_course_by_id(lesson_id: int, db: Session = Depends(get_db)):
    """Get specific NATA lesson by ID"""
    lessons = get_nata_lessons()
    
    # Find lesson by index (using ID as index for now)
    if 0 <= lesson_id < len(lessons):
        lesson = lessons[lesson_id]
        lesson['id'] = lesson_id
        return {
            "success": True,
            "data": lesson
        }
    
    raise HTTPException(status_code=404, detail="NATA lesson not found")
