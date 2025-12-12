from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional, List
from pathlib import Path
from uuid import uuid4
from datetime import datetime
import shutil

import crud
import schemas
from database import get_db, User, Job
from routes.auth_routes import get_current_user, get_current_recruiter, get_current_admin

router = APIRouter(prefix="/jobs", tags=["Jobs"])

# File upload utilities
UPLOAD_DIR = Path("uploads")
RESUME_DIR = UPLOAD_DIR / "resumes"
UPLOAD_DIR.mkdir(exist_ok=True)
RESUME_DIR.mkdir(exist_ok=True)

# Lightweight in-memory events buffer for admin polling of new job applications
APPLICATION_EVENTS: list[dict] = []

def save_uploaded_file(file: UploadFile, directory: Path) -> str:
    """Save uploaded file and return the file path"""
    import uuid
    # Generate unique filename
    file_extension = file.filename.split(".")[-1] if "." in file.filename else ""
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = directory / unique_filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Return relative path for URL
    return f"/uploads/{directory.name}/{unique_filename}"

@router.get("", response_model=List[schemas.JobResponse])
async def get_jobs(
    search: Optional[str] = Query(None, description="Search in title, company, description, tags"),
    job_type: Optional[schemas.JobType] = Query(None, description="Filter by job type"),
    work_mode: Optional[schemas.WorkMode] = Query(None, description="Filter by work mode"),
    experience_level: Optional[schemas.ExperienceLevel] = Query(None, description="Filter by experience level"),
    location: Optional[str] = Query(None, description="Filter by location"),
    min_salary: Optional[float] = Query(None, description="Minimum salary filter"),
    max_salary: Optional[float] = Query(None, description="Maximum salary filter"),
    skip: int = Query(0, description="Number of records to skip"),
    limit: int = Query(50, description="Maximum number of records to return"),
    db: Session = Depends(get_db)
):
    """Get all published jobs with optional filters"""
    jobs = crud.get_jobs(
        db=db,
        search=search,
        job_type=job_type.value if job_type else None,
        work_mode=work_mode.value if work_mode else None,
        experience_level=experience_level.value if experience_level else None,
        location=location,
        min_salary=min_salary,
        max_salary=max_salary,
        skip=skip,
        limit=limit
    )
    return jobs

@router.get("/my/posted", response_model=List[schemas.JobResponse])
async def get_my_posted_jobs(
    skip: int = Query(0),
    limit: int = Query(50),
    current_user: User = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    """Get jobs posted by current recruiter"""
    return crud.get_recruiter_jobs(db, current_user.id, skip, limit)

@router.get("/my", response_model=List[schemas.JobResponse])
async def get_recruiter_jobs(
    skip: int = Query(0),
    limit: int = Query(50),
    current_user: User = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    """Get jobs posted by current recruiter (alternative endpoint)"""
    return crud.get_recruiter_jobs(db, current_user.id, skip, limit)

@router.get("/saved/my", response_model=List[schemas.SavedJobResponse])
async def get_saved_jobs(
    skip: int = Query(0),
    limit: int = Query(50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's saved jobs"""
    return crud.get_user_saved_jobs(db, current_user.id, skip, limit)

@router.get("/{job_id}", response_model=schemas.JobResponse)
async def get_job(job_id: int, db: Session = Depends(get_db)):
    """Get a specific job by ID"""
    job = crud.get_job(db, job_id=job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    return job

@router.post("", response_model=schemas.JobResponse)
async def create_job(
    job: schemas.JobCreate,
    current_user: User = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    """Create a new job posting (recruiters only)"""
    print(f"Creating job for user: {current_user.email} (ID: {current_user.id})")
    return crud.create_job(db=db, job=job, recruiter_id=current_user.id)

@router.put("/{job_id}", response_model=schemas.JobResponse)
async def update_job(
    job_id: int,
    job_update: schemas.JobUpdate,
    current_user: User = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    """Update a job posting (only by the recruiter who posted it)"""
    updated_job = crud.update_job(db, job_id, job_update, current_user.id)
    if not updated_job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found or you don't have permission to update it"
        )
    return updated_job

@router.delete("/{job_id}")
async def delete_job(
    job_id: int,
    current_user: User = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    """Delete a job posting (only by the recruiter who posted it)"""
    deleted_job = crud.delete_job(db, job_id, current_user.id)
    if not deleted_job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found or you don't have permission to delete it"
        )
    return {"message": "Job deleted successfully"}

# Job Application Routes
@router.post("/{job_id}/apply", response_model=schemas.JobApplicationResponse)
async def apply_for_job(
    job_id: int,
    application: schemas.JobApplicationBase,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Apply for a job with JSON body (cover_letter, optional resume_url)."""
    if current_user.role == schemas.UserRole.RECRUITER.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Recruiters cannot apply for jobs"
        )
    
    # Check if job exists
    job = crud.get_job(db, job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    application_data = schemas.JobApplicationCreate(
        job_id=job_id,
        **application.dict()
    )
    
    db_application = crud.create_job_application(db, application_data, current_user.id)
    if not db_application:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already applied for this job"
        )
    # Record event for admin polling
    try:
        APPLICATION_EVENTS.append({
            "id": str(uuid4()),
            "type": "job_application",
            "job_id": job_id,
            "applicant_id": current_user.id,
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception:
        pass
    
    return db_application

@router.post("/{job_id}/apply/upload", response_model=schemas.JobApplicationResponse)
async def apply_for_job_with_upload(
    job_id: int,
    cover_letter: Optional[str] = Form(None),
    resume_file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Apply for a job with a resume file upload (PDF/DOCX)."""
    if current_user.role == schemas.UserRole.RECRUITER.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Recruiters cannot apply for jobs"
        )

    # Check if job exists
    job = crud.get_job(db, job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )

    # Validate resume file
    allowed_ext = {".pdf", ".doc", ".docx"}
    ext = Path(resume_file.filename).suffix.lower()
    if ext not in allowed_ext:
        raise HTTPException(status_code=400, detail=f"Unsupported resume format. Allowed: {', '.join(sorted(allowed_ext))}")
    # Limit to ~10MB
    if getattr(resume_file, 'size', None) and resume_file.size > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Resume too large. Max size: 10MB")

    # Save file
    resume_url = save_uploaded_file(resume_file, RESUME_DIR)

    application_data = schemas.JobApplicationCreate(
        job_id=job_id,
        cover_letter=cover_letter,
        resume_url=resume_url
    )
    db_application = crud.create_job_application(db, application_data, current_user.id)
    if not db_application:
        raise HTTPException(status_code=400, detail="You have already applied for this job")

    # Record event for admin polling
    try:
        APPLICATION_EVENTS.append({
            "id": str(uuid4()),
            "type": "job_application",
            "job_id": job_id,
            "applicant_id": current_user.id,
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception:
        pass

    return db_application

@router.get("/{job_id}/applications", response_model=List[schemas.JobApplicationResponse])
async def get_job_applications(
    job_id: int,
    skip: int = Query(0),
    limit: int = Query(50),
    current_user: User = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    """Get applications for a specific job (recruiters only)"""
    return crud.get_job_applications(db, job_id, current_user.id, skip, limit)

# Saved Jobs Routes
@router.post("/{job_id}/save")
async def save_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save a job for later"""
    if current_user.role == schemas.UserRole.RECRUITER.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Recruiters cannot save jobs"
        )
    
    # Check if job exists
    job = crud.get_job(db, job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    crud.save_job(db, job_id, current_user.id)
    return {"message": "Job saved successfully"}

@router.delete("/{job_id}/save")
async def unsave_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a job from saved jobs"""
    result = crud.unsave_job(db, job_id, current_user.id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved job not found"
        )
    return {"message": "Job removed from saved jobs"}