from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List

import crud
import schemas
from database import get_db, User
from routes.auth_routes import get_current_user, get_current_recruiter

router = APIRouter(prefix="/applications", tags=["Job Applications"])

@router.get("/my", response_model=List[schemas.JobApplicationResponse])
async def get_my_applications(
    skip: int = Query(0),
    limit: int = Query(50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's job applications"""
    return crud.get_user_applications(db, current_user.id, skip, limit)

@router.get("/job", response_model=List[schemas.JobApplicationResponse])
async def get_recruiter_applications(
    skip: int = Query(0),
    limit: int = Query(100),
    current_recruiter: User = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    """Get applications for all jobs posted by the current recruiter"""
    applications = crud.get_recruiter_applications(db, current_recruiter.id, skip, limit)
    return applications

@router.put("/{application_id}/status")
async def update_application_status(
    application_id: int,
    status_update: dict,
    current_user: User = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    """Update application status (recruiters only)"""
    application = crud.update_application_status(
        db, application_id, status_update["status"], current_user.id
    )
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found or you don't have permission to update it"
        )
    return {"message": "Application status updated successfully"}

@router.post("/{application_id}/message")
async def add_application_message(
    application_id: int,
    message_data: schemas.ApplicationMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a message to a job application"""
    is_recruiter = current_user.role == schemas.UserRole.RECRUITER.value
    
    application = crud.add_application_message(
        db, application_id, message_data.message, current_user.id, is_recruiter
    )
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found or you don't have permission to add a message to it"
        )
    
    return {"message": "Message added successfully"}

@router.delete("/{application_id}")
async def delete_job_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a job application"""
    application = crud.delete_application(db, application_id, current_user.id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found or you don't have permission to delete it"
        )
    return {"message": "Application deleted successfully"}