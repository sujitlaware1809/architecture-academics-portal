from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
import os

import crud
import schemas
from database import get_db, User
from routes.auth_routes import get_current_user

# Moodle integration - optional dependency
try:
    from moodle_integration import create_moodle_user_account, enroll_user_in_course, get_sso_login_url
    MOODLE_AVAILABLE = True
except ImportError:
    MOODLE_AVAILABLE = False
    
    # Fallback functions when moodle integration is not available
    def create_moodle_user_account(*args, **kwargs):
        return {"success": False, "message": "Moodle integration not available"}
    
    def enroll_user_in_course(*args, **kwargs):
        return {"success": False, "message": "Moodle integration not available"}
    
    def get_sso_login_url(*args, **kwargs):
        return None

router = APIRouter(prefix="/nata-courses", tags=["NATA Courses"])

# Import seed data
from seed_nata_lessons import get_nata_lessons

@router.get("")
async def get_nata_courses(
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all NATA preparation lessons"""
    try:
        # Use seed data for NATA lessons
        nata_lessons = get_nata_lessons()
        
        # Add IDs to lessons
        for idx, lesson in enumerate(nata_lessons):
            lesson['id'] = idx + 1
        
        # Filter by category if provided
        if category and category != "All":
            nata_lessons = [lesson for lesson in nata_lessons if lesson.get('category') == category]
        
        return {
            "success": True,
            "data": nata_lessons,
            "total": len(nata_lessons)
        }
    except Exception as e:
        print(f"Error fetching NATA lessons: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{course_id}")
async def get_nata_course_detail(
    course_id: int,
    db: Session = Depends(get_db)
):
    """Get detailed information about a specific NATA lesson"""
    try:
        nata_lessons = get_nata_lessons()
        
        # Find lesson by ID (ID is 1-indexed)
        if 1 <= course_id <= len(nata_lessons):
            lesson = nata_lessons[course_id - 1].copy()
            lesson['id'] = course_id
            return {
                "success": True,
                "data": lesson
            }
        
        raise HTTPException(status_code=404, detail="NATA lesson not found")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching NATA lesson detail: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{course_id}/enroll")
async def enroll_in_nata_course(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Enroll user in a NATA course and create Moodle account with automatic login"""
    try:
        # Check if user already has a Moodle account
        moodle_user_id = getattr(current_user, 'moodle_user_id', None)
        
        if not moodle_user_id:
            # Create Moodle user account
            user_data = {
                "email": current_user.email,
                "first_name": getattr(current_user, 'first_name', current_user.full_name.split()[0] if current_user.full_name else 'Student'),
                "last_name": getattr(current_user, 'last_name', ' '.join(current_user.full_name.split()[1:]) if current_user.full_name and len(current_user.full_name.split()) > 1 else 'User'),
                "city": "Mumbai",  # Default city
                "country": "IN"
            }
            
            moodle_result = await create_moodle_user_account(user_data)
            
            if moodle_result["success"]:
                moodle_user_id = moodle_result["moodle_user_id"]
                # Store Moodle user ID in main database (would need to add this field)
                # current_user.moodle_user_id = moodle_user_id
                # db.commit()
                print(f"✅ Created Moodle user account: {moodle_user_id}")
            else:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Failed to create Moodle account: {moodle_result['error']}"
                )
        
        # Map course_id to actual Moodle course ID (this should be stored in your database)
        moodle_course_mapping = {
            1: 101,  # NATA Drawing Fundamentals
            2: 102,  # NATA Mathematics Foundation
            3: 103,  # NATA General Aptitude
            4: 104,  # NATA Complete Package
            5: 105,  # NATA Advanced Drawing & Visualization
            6: 106,  # NATA Mock Test Series Premium
            7: 107,  # NATA Visual Memory & Observation
        }
        
        moodle_course_id = moodle_course_mapping.get(course_id, course_id)
        
        # Enroll user in the specific NATA course
        enrollment_result = await enroll_user_in_course(moodle_user_id, moodle_course_id)
        
        if not enrollment_result["success"]:
            print(f"❌ Enrollment failed: {enrollment_result['error']}")
            raise HTTPException(
                status_code=400,
                detail=f"Failed to enroll in course: {enrollment_result['error']}"
            )
        
        print(f"✅ User enrolled in Moodle course: {moodle_course_id}")
        
        # Generate SSO URL for direct access to the course
        sso_url = get_sso_login_url(current_user.id, moodle_course_id, moodle_user_id)
        
        # Alternative direct course URL (if SSO is not configured)
        course_url = f"{os.getenv('MOODLE_URL', 'https://moodle.architectureacademics.com')}/course/view.php?id={moodle_course_id}"
        
        enrollment_data = {
            "user_id": current_user.id,
            "course_id": course_id,
            "moodle_course_id": moodle_course_id,
            "moodle_user_id": moodle_user_id,
            "enrollment_date": datetime.utcnow().isoformat(),
            "status": "active",
            "access_granted": True,
            "sso_url": sso_url,
            "course_url": course_url
        }
        
        # TODO: Store enrollment in local database
        # enrollment = crud.create_nata_enrollment(db, enrollment_data)
        
        return {
            "success": True, 
            "message": "Successfully enrolled in NATA course! Redirecting to Moodle LMS...",
            "data": enrollment_data,
            "moodle_direct_url": sso_url,
            "course_access_url": course_url,
            "instructions": {
                "step1": "You will be automatically logged into Moodle LMS",
                "step2": "Access your course materials and videos",
                "step3": "Track your progress through the course modules",
                "step4": "Participate in discussions and submit assignments"
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Enrollment error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Enrollment failed: {str(e)}")

@router.get("/user/enrollments")
async def get_user_nata_enrollments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's NATA course enrollments and progress"""
    # Sample user enrollment data
    enrollments = [
        {
            "course_id": 1,
            "course_title": "NATA Drawing Fundamentals",
            "enrollment_date": "2024-10-01",
            "progress": 65,
            "status": "active",
            "next_lesson": "Perspective Drawing Basics",
            "moodle_course_url": "https://moodle.architectureacademics.com/course/nata-drawing"
        }
    ]
    
    return {"success": True, "data": enrollments}

@router.get("/{course_id}/access")
async def get_course_access_url(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get direct access URL to Moodle course for enrolled users"""
    try:
        # Check if user is enrolled (this should check your database)
        # For now, we'll simulate enrollment check
        moodle_user_id = getattr(current_user, 'moodle_user_id', current_user.id + 1000)  # Temporary mapping
        
        # Map course_id to Moodle course ID
        moodle_course_mapping = {
            1: 101,  # NATA Drawing Fundamentals
            2: 102,  # NATA Mathematics Foundation
            3: 103,  # NATA General Aptitude
            4: 104,  # NATA Complete Package
        }
        
        moodle_course_id = moodle_course_mapping.get(course_id, course_id)
        
        # Generate SSO URL for direct access
        sso_url = get_sso_login_url(current_user.id, moodle_course_id, moodle_user_id)
        course_url = f"{os.getenv('MOODLE_URL', 'https://moodle.architectureacademics.com')}/course/view.php?id={moodle_course_id}"
        
        return {
            "success": True,
            "course_id": course_id,
            "moodle_course_id": moodle_course_id,
            "sso_url": sso_url,
            "course_url": course_url,
            "message": "Click the URL to access your course on Moodle LMS"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get course access: {str(e)}")