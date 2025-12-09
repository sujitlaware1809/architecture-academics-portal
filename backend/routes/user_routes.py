from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from database import get_db, User
import crud
from routes.auth_routes import get_current_user
from datetime import datetime
import shutil
import os
from pathlib import Path

router = APIRouter(prefix="/users", tags=["users"])

UPLOAD_DIR = "uploads/profile_images"
Path(UPLOAD_DIR).mkdir(parents=True, exist_ok=True)

@router.post("/profile-image")
async def upload_profile_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Validate file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        filename = f"user_{current_user.id}_{int(datetime.utcnow().timestamp())}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Update user profile
        # Construct URL (assuming static files are served from /uploads)
        image_url = f"/uploads/profile_images/{filename}"
        
        current_user.profile_image_url = image_url
        db.commit()
        db.refresh(current_user)
        
        return {"profile_image_url": image_url}
        
    except Exception as e:
        print(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload image")

@router.get("/dashboard")
async def get_user_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user dashboard data including stats and activity
    """
    try:
        # Get user enrollments
        enrollments = crud.get_user_enrollments(db, current_user.id)
        
        # Get user event registrations
        event_registrations = crud.get_user_event_registrations(db, current_user.id)
        
        # Get user workshop registrations
        workshop_registrations = crud.get_user_workshop_registrations(db, current_user.id)
        
        # Get user job applications
        job_applications = crud.get_user_job_applications(db, current_user.id)
        
        # Calculate stats
        enrolled_courses = len(enrollments)
        completed_courses = sum(1 for e in enrollments if e.progress_percentage and float(e.progress_percentage) >= 100)
        
        # Format enrolled courses with progress
        enrolled_courses_data = []
        for enrollment in enrollments[:5]:  # Limit to 5 most recent
            enrolled_courses_data.append({
                "id": enrollment.course_id,
                "title": enrollment.course.title if enrollment.course else "Unknown Course",
                "progress": float(enrollment.progress_percentage) if enrollment.progress_percentage else 0,
                "last_accessed": enrollment.last_accessed_at.isoformat() if enrollment.last_accessed_at else enrollment.enrolled_at.isoformat()
            })
        
        # Build recent activity from all sources
        recent_activity = []
        
        # Add course enrollments
        for enrollment in enrollments[:3]:
            recent_activity.append({
                "id": enrollment.id,
                "type": "course",
                "title": f"Enrolled in {enrollment.course.title if enrollment.course else 'course'}",
                "date": enrollment.enrolled_at.isoformat(),
                "status": "completed" if (enrollment.progress_percentage and float(enrollment.progress_percentage) >= 100) else "in_progress"
            })
        
        # Add event registrations
        for registration in event_registrations[:3]:
            recent_activity.append({
                "id": registration.id,
                "type": "event",
                "title": f"Registered for {registration.event.title if registration.event else 'event'}",
                "date": registration.registered_at.isoformat(),
                "status": "registered"
            })
        
        # Add workshop registrations
        for registration in workshop_registrations[:3]:
            recent_activity.append({
                "id": registration.id,
                "type": "workshop",
                "title": f"Registered for {registration.workshop.title if registration.workshop else 'workshop'}",
                "date": registration.registered_at.isoformat(),
                "status": "registered"
            })
        
        # Add job applications
        for application in job_applications[:3]:
            recent_activity.append({
                "id": application.id,
                "type": "job",
                "title": f"Applied for {application.job.title if application.job else 'job'}",
                "date": application.applied_at.isoformat(),
                "status": application.status
            })
        
        # Sort recent activity by date
        recent_activity.sort(key=lambda x: x['date'], reverse=True)
        recent_activity = recent_activity[:10]  # Limit to 10 most recent
        
        # Calculate profile completion
        profile_fields = [
            current_user.first_name,
            current_user.last_name,
            current_user.username,
            current_user.phone,
            current_user.bio,
            current_user.university,
            current_user.graduation_year,
            current_user.specialization,
            current_user.location
        ]
        filled_fields = sum(1 for field in profile_fields if field)
        total_fields = len(profile_fields)
        profile_completion = int((filled_fields / total_fields) * 100)

        return {
            "user": {
                "id": current_user.id,
                "email": current_user.email,
                "full_name": f"{current_user.first_name} {current_user.last_name}",
                "first_name": current_user.first_name,
                "last_name": current_user.last_name,
                "username": current_user.username,
                "role": current_user.role,
                "profile_completion": profile_completion,
                "profile_image_url": current_user.profile_image_url,
                "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
                "phone": current_user.phone,
                "bio": current_user.bio,
                "university": current_user.university,
                "graduation_year": current_user.graduation_year,
                "specialization": current_user.specialization,
                "location": current_user.location,
                "website": current_user.website,
                "linkedin": current_user.linkedin,
                "portfolio": current_user.portfolio
            },
            "stats": {
                "enrolled_courses": enrolled_courses,
                "completed_courses": completed_courses,
                "registered_events": len(event_registrations),
                "registered_workshops": len(workshop_registrations),
                "job_applications": len(job_applications)
            },
            "recent_activity": recent_activity,
            "enrolled_courses": enrolled_courses_data
        }
        
    except Exception as e:
        print(f"Dashboard error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
