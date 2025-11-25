from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db, User
import crud
from routes.auth_routes import get_current_user
from datetime import datetime

router = APIRouter(prefix="/users", tags=["users"])

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
        
        return {
            "user": {
                "id": current_user.id,
                "email": current_user.email,
                "full_name": f"{current_user.first_name} {current_user.last_name}",
                "role": current_user.role,
                "created_at": current_user.created_at.isoformat() if current_user.created_at else None
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
