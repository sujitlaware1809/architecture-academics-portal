from fastapi import FastAPI, Depends, HTTPException, status, Query, UploadFile, File, Form, Response, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse, FileResponse
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from typing import Optional, List
import crud
import schemas
from database import get_db, User, Job, Event, Workshop, Course, SystemSettings, EventRegistration, WorkshopRegistration, CourseLesson, CourseEnrollment
from auth import create_access_token, verify_token, ACCESS_TOKEN_EXPIRE_MINUTES
from aws_s3 import s3_manager
import os
import shutil
from pathlib import Path
from uuid import uuid4

app = FastAPI(
    title="Architecture Academics API",
    description="Backend API for Architecture Academics platform with Jobs Portal",
    version="1.0.0"
)

# Create upload directories
UPLOAD_DIR = Path("uploads")
VIDEO_DIR = UPLOAD_DIR / "videos"
MATERIAL_DIR = UPLOAD_DIR / "materials"
RESUME_DIR = UPLOAD_DIR / "resumes"
UPLOAD_DIR.mkdir(exist_ok=True)
RESUME_DIR.mkdir(exist_ok=True)

# Lightweight in-memory events buffer for admin polling of new job applications
APPLICATION_EVENTS: list[dict] = []
VIDEO_DIR.mkdir(exist_ok=True)
MATERIAL_DIR.mkdir(exist_ok=True)

# Serve static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Security
security = HTTPBearer()

# CORS middleware
# CORS configuration: allow localhost and common private network ranges in dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    # Additionally allow local network origins like http://192.168.x.x:3000, 10.x.x.x, 172.16-31.x.x
    allow_origin_regex=r"^https?://((localhost|127\.0\.0\.1)|(192\.168\.[0-9]{1,3}\.[0-9]{1,3})|(10\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})|(172\.(1[6-9]|2[0-9]|3[0-1])\.[0-9]{1,3}\.[0-9]{1,3}))(\:[0-9]{2,5})?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    token = credentials.credentials
    email = verify_token(token)
    
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = crud.get_user_by_email(db, email=email)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

async def get_current_recruiter(current_user: User = Depends(get_current_user)) -> User:
    """Get current authenticated recruiter"""
    print(f"Checking recruiter access for user: {current_user.email}, role: {current_user.role}")
    print(f"Role type: {type(current_user.role)}")
    
    # Handle both enum and string comparisons
    expected_role = schemas.UserRole.RECRUITER
    user_role = current_user.role
    
    # If the role is already a string, we need to compare with the enum's value
    # If the role is an enum, we can compare directly
    is_recruiter = False
    if isinstance(user_role, str):
        is_recruiter = user_role == expected_role.value
        print(f"Comparing string role: {user_role} == {expected_role.value} -> {is_recruiter}")
    else:
        is_recruiter = user_role == expected_role
        print(f"Comparing enum role: {user_role} == {expected_role} -> {is_recruiter}")
    
    if not is_recruiter:
        print(f"Access denied: User {current_user.email} does not have RECRUITER role")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions. Recruiter access required."
        )
    print(f"Access granted: User {current_user.email} has RECRUITER role")
    return current_user

async def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    """Get current authenticated admin"""
    expected_role = schemas.UserRole.ADMIN
    user_role = current_user.role
    
    is_admin = False
    if isinstance(user_role, str):
        is_admin = user_role == expected_role.value
    else:
        is_admin = user_role == expected_role
    
    if not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions. Admin access required."
        )
    return current_user

async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Get current user if authenticated, or None if not"""
    if not credentials:
        return None
    
    try:
        token = credentials.credentials
        email = verify_token(token)
        
        if email is None:
            return None
        
        user = crud.get_user_by_email(db, email=email)
        return user
    except:
        return None

# File upload utilities
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

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Architecture Academics API with Jobs Portal", "status": "running"}

# Authentication Routes
@app.post("/auth/register", response_model=schemas.Token)
async def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    
    # Validate password confirmation
    if user.password != user.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )
    
    # Check if user already exists
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    new_user = crud.create_user(db=db, user=user)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": new_user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": new_user
    }

@app.post("/auth/login", response_model=schemas.Token)
async def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    """Login user"""
    
    # Authenticate user
    user = crud.authenticate_user(db, user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@app.get("/auth/me", response_model=schemas.UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return current_user

@app.put("/auth/profile", response_model=schemas.UserResponse)
async def update_profile(
    profile_data: schemas.UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile"""
    
    updated_user = crud.update_user_profile(db, current_user.id, profile_data)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return updated_user

# Job Routes
@app.get("/jobs", response_model=List[schemas.JobResponse])
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

@app.get("/jobs/{job_id}", response_model=schemas.JobResponse)
async def get_job(job_id: int, db: Session = Depends(get_db)):
    """Get a specific job by ID"""
    job = crud.get_job(db, job_id=job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    return job

@app.post("/jobs", response_model=schemas.JobResponse)
async def create_job(
    job: schemas.JobCreate,
    current_user: User = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    """Create a new job posting (recruiters only)"""
    print(f"Creating job for user: {current_user.email} (ID: {current_user.id})")
    return crud.create_job(db=db, job=job, recruiter_id=current_user.id)

# Admin - Jobs Management (create)
@app.post("/api/admin/jobs", response_model=schemas.JobResponse)
async def admin_create_job(
    job: dict,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Create a new job posting (admin). Accepts UI payload and maps to schema; force currency INR."""
    # Frontend currently sends: title, company, description, location, salary_range (string),
    # job_type ('full-time'|'part-time'|'contract'|'internship'), experience_level ('entry'|'mid'|'senior'|'executive'),
    # requirements, benefits, status ('active'|'closed'|'draft'), closing_date (YYYY-MM-DD)
    try:
        payload = dict(job)
        # Map enums
        jt_map = {
            'full-time': schemas.JobType.FULL_TIME,
            'part-time': schemas.JobType.PART_TIME,
            'contract': schemas.JobType.CONTRACT,
            'internship': schemas.JobType.INTERNSHIP,
            'freelance': schemas.JobType.FREELANCE,
        }
        el_map = {
            'entry': schemas.ExperienceLevel.ENTRY_LEVEL,
            'mid': schemas.ExperienceLevel.MID_LEVEL,
            'senior': schemas.ExperienceLevel.SENIOR_LEVEL,
            'executive': schemas.ExperienceLevel.EXECUTIVE,
        }
        wm = schemas.WorkMode.ON_SITE  # default
        # Admin UI currently lacks work_mode; default to On-site
        jt = jt_map.get(str(payload.get('job_type', '')).lower(), schemas.JobType.FULL_TIME)
        el = el_map.get(str(payload.get('experience_level', '')).lower(), schemas.ExperienceLevel.MID_LEVEL)
        # Salary parsing: try to extract min/max numbers from string
        import re
        salary_range = str(payload.get('salary_range') or '')
        nums = [float(x.replace(',', '')) for x in re.findall(r"[0-9][0-9,]*", salary_range)]
        salary_min = nums[0] if len(nums) >= 1 else None
        salary_max = nums[1] if len(nums) >= 2 else None
        # Status mapping: admin UI uses active/closed/draft => map to JobStatus
        st_map = {
            'active': schemas.JobStatus.PUBLISHED,
            'closed': schemas.JobStatus.CLOSED,
            'draft': schemas.JobStatus.DRAFT,
        }
        status = st_map.get(str(payload.get('status', '')).lower(), schemas.JobStatus.PUBLISHED)
        # Deadline mapping
        from datetime import datetime as dt
        application_deadline = None
        cd = payload.get('closing_date')
        if cd:
            try:
                application_deadline = dt.fromisoformat(cd)
            except Exception:
                try:
                    application_deadline = dt.strptime(cd, '%Y-%m-%d')
                except Exception:
                    application_deadline = None
        job_schema = schemas.JobCreate(
            title=payload.get('title', ''),
            company=payload.get('company', ''),
            location=payload.get('location', ''),
            work_mode=wm,
            job_type=jt,
            experience_level=el,
            salary_min=salary_min,
            salary_max=salary_max,
            currency='INR',
            description=payload.get('description', ''),
            requirements=payload.get('requirements', ''),
            benefits=payload.get('benefits'),
            tags=payload.get('tags'),
            application_deadline=application_deadline,
            contact_email=payload.get('contact_email') or 'hr@example.com',
            company_website=payload.get('company_website'),
            company_description=payload.get('company_description')
        )
        created = crud.create_job(db=db, job=job_schema, recruiter_id=current_admin.id)
        # Apply status if not default published
        if status != schemas.JobStatus.PUBLISHED:
            created.status = status
            db.commit()
            db.refresh(created)
        return created
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Invalid job payload: {e}")

@app.get("/jobs/my/posted", response_model=List[schemas.JobResponse])
async def get_my_posted_jobs(
    skip: int = Query(0),
    limit: int = Query(50),
    current_user: User = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    """Get jobs posted by current recruiter"""
    return crud.get_recruiter_jobs(db, current_user.id, skip, limit)

@app.get("/jobs/my", response_model=List[schemas.JobResponse])
async def get_recruiter_jobs(
    skip: int = Query(0),
    limit: int = Query(50),
    current_user: User = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    """Get jobs posted by current recruiter (alternative endpoint)"""
    return crud.get_recruiter_jobs(db, current_user.id, skip, limit)

@app.put("/jobs/{job_id}", response_model=schemas.JobResponse)
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

@app.delete("/jobs/{job_id}")
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
@app.post("/jobs/{job_id}/apply", response_model=schemas.JobApplicationResponse)
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

@app.post("/jobs/{job_id}/apply/upload", response_model=schemas.JobApplicationResponse)
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

@app.get("/applications/my", response_model=List[schemas.JobApplicationResponse])
async def get_my_applications(
    skip: int = Query(0),
    limit: int = Query(50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's job applications"""
    return crud.get_user_applications(db, current_user.id, skip, limit)

@app.get("/applications/job", response_model=List[schemas.JobApplicationResponse])
async def get_recruiter_applications(
    skip: int = Query(0),
    limit: int = Query(100),
    current_recruiter: User = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    """Get applications for all jobs posted by the current recruiter"""
    applications = crud.get_recruiter_applications(db, current_recruiter.id, skip, limit)
    return applications

@app.get("/jobs/{job_id}/applications", response_model=List[schemas.JobApplicationResponse])
async def get_job_applications(
    job_id: int,
    skip: int = Query(0),
    limit: int = Query(50),
    current_user: User = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    """Get applications for a specific job (recruiters only)"""
    return crud.get_job_applications(db, job_id, current_user.id, skip, limit)

@app.put("/applications/{application_id}/status")
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

@app.post("/applications/{application_id}/message")
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

@app.delete("/applications/{application_id}")
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

# Saved Jobs Routes
@app.post("/jobs/{job_id}/save")
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

@app.delete("/jobs/{job_id}/save")
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

@app.get("/jobs/saved/my", response_model=List[schemas.SavedJobResponse])
async def get_saved_jobs(
    skip: int = Query(0),
    limit: int = Query(50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's saved jobs"""
    return crud.get_user_saved_jobs(db, current_user.id, skip, limit)

# Admin polling endpoint for new job application events
@app.get("/api/admin/jobs/applications/events")
async def get_application_events(
    since: Optional[str] = Query(None, description="ISO timestamp to fetch events after"),
    limit: int = Query(50, ge=1, le=200),
    current_admin: User = Depends(get_current_admin)
):
    """Return recent job application events since the provided ISO timestamp (for polling)."""
    try:
        since_dt = datetime.fromisoformat(since) if since else None
    except Exception:
        since_dt = None
    events = APPLICATION_EVENTS[-1000:]
    if since_dt:
        filtered = [e for e in events if datetime.fromisoformat(e["timestamp"]) > since_dt]
    else:
        filtered = events
    return filtered[-limit:]

# Admin Routes

# Admin - Courses Management
@app.get("/api/admin/courses", response_model=List[schemas.CourseResponse])
async def get_admin_courses(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Get all courses for admin management"""
    courses = crud.get_courses(db, skip=skip, limit=limit)
    return courses

@app.post("/api/admin/courses", response_model=schemas.CourseResponse)
async def create_admin_course(
    course: schemas.CourseCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Create a new course"""
    return crud.create_course(db, course)

@app.get("/api/admin/courses/{course_id}", response_model=schemas.CourseDetailResponse)
async def get_admin_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Get course by ID with lessons and materials"""
    course = crud.get_course_by_id(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@app.put("/api/admin/courses/{course_id}", response_model=schemas.CourseResponse)
async def update_admin_course(
    course_id: int,
    course_update: schemas.CourseUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Update course"""
    course = crud.update_course(db, course_id, course_update)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@app.delete("/api/admin/courses/{course_id}")
async def delete_admin_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Delete course"""
    success = crud.delete_course(db, course_id)
    if not success:
        raise HTTPException(status_code=404, detail="Course not found")
    return {"message": "Course deleted successfully"}

# Admin - Course Lessons Management
@app.get("/api/admin/courses/{course_id}/lessons", response_model=List[schemas.CourseLessonResponse])
async def get_course_lessons(
    course_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Get all lessons for a course"""
    # Verify course exists
    course = crud.get_course_by_id(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    return crud.get_course_lessons(db, course_id)

@app.post("/api/admin/courses/{course_id}/lessons", response_model=schemas.CourseLessonResponse)
async def create_course_lesson(
    course_id: int,
    title: str = Form(...),
    description: str = Form(None),
    video_duration: int = Form(None),
    order_index: int = Form(0),
    is_free: bool = Form(False),
    transcript: str = Form(None),
    video_file: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Create a new course lesson with optional video upload"""
    # Verify course exists
    course = crud.get_course_by_id(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Handle video upload
    video_url = None
    if video_file and video_file.filename:
        # Validate video file
        allowed_extensions = {".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm"}
        file_extension = Path(video_file.filename).suffix.lower()
        
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid video format. Allowed: {', '.join(allowed_extensions)}"
            )
        
        # Check file size (limit to 500MB)
        if video_file.size and video_file.size > 500 * 1024 * 1024:
            raise HTTPException(
                status_code=400, 
                detail="Video file too large. Maximum size: 500MB"
            )
        
        video_url = save_uploaded_file(video_file, VIDEO_DIR)
    
    # Create lesson
    lesson_data = schemas.CourseLessonCreate(
        title=title,
        description=description,
        video_duration=video_duration,
        order_index=order_index,
        is_free=is_free,
        transcript=transcript,
        course_id=course_id
    )
    
    return crud.create_course_lesson(db, lesson_data, video_url)

@app.put("/api/admin/lessons/{lesson_id}", response_model=schemas.CourseLessonResponse)
async def update_course_lesson(
    lesson_id: int,
    title: str = Form(None),
    description: str = Form(None),
    video_duration: int = Form(None),
    order_index: int = Form(None),
    is_free: bool = Form(None),
    transcript: str = Form(None),
    video_file: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Update course lesson with optional video upload"""
    lesson = crud.get_lesson_by_id(db, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    # Handle video upload
    video_url = None
    if video_file and video_file.filename:
        # Validate video file
        allowed_extensions = {".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm"}
        file_extension = Path(video_file.filename).suffix.lower()
        
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid video format. Allowed: {', '.join(allowed_extensions)}"
            )
        
        # Delete old video file
        if lesson.video_url:
            delete_uploaded_file(lesson.video_url)
        
        video_url = save_uploaded_file(video_file, VIDEO_DIR)
    
    # Create update object with only non-None values
    update_data = {}
    if title is not None:
        update_data["title"] = title
    if description is not None:
        update_data["description"] = description
    if video_duration is not None:
        update_data["video_duration"] = video_duration
    if order_index is not None:
        update_data["order_index"] = order_index
    if is_free is not None:
        update_data["is_free"] = is_free
    if transcript is not None:
        update_data["transcript"] = transcript
    
    lesson_update = schemas.CourseLessonUpdate(**update_data)
    return crud.update_course_lesson(db, lesson_id, lesson_update, video_url)

@app.delete("/api/admin/lessons/{lesson_id}")
async def delete_course_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Delete course lesson"""
    lesson = crud.get_lesson_by_id(db, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    # Delete video file
    if lesson.video_url:
        delete_uploaded_file(lesson.video_url)
    
    success = crud.delete_course_lesson(db, lesson_id)
    if not success:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    return {"message": "Lesson deleted successfully"}

@app.put("/api/admin/courses/{course_id}/lessons/reorder")
async def reorder_course_lessons(
    course_id: int,
    lesson_orders: List[dict],
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Reorder course lessons"""
    success = crud.reorder_course_lessons(db, course_id, lesson_orders)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to reorder lessons")
    
    return {"message": "Lessons reordered successfully"}

# Admin - Course Materials Management
@app.get("/api/admin/courses/{course_id}/materials", response_model=List[schemas.CourseMaterialResponse])
async def get_course_materials(
    course_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Get all materials for a course"""
    # Verify course exists
    course = crud.get_course_by_id(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    return crud.get_course_materials(db, course_id)

@app.post("/api/admin/courses/{course_id}/materials", response_model=schemas.CourseMaterialResponse)
async def create_course_material(
    course_id: int,
    title: str = Form(...),
    description: str = Form(None),
    file_type: str = Form(...),
    order_index: int = Form(0),
    is_downloadable: bool = Form(True),
    material_file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Create a new course material with file upload"""
    # Verify course exists
    course = crud.get_course_by_id(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Validate file
    allowed_extensions = {".pdf", ".doc", ".docx", ".ppt", ".pptx", ".txt", ".zip", ".rar"}
    file_extension = Path(material_file.filename).suffix.lower()
    
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid file format. Allowed: {', '.join(allowed_extensions)}"
        )
    
    # Check file size (limit to 100MB)
    if material_file.size and material_file.size > 100 * 1024 * 1024:
        raise HTTPException(
            status_code=400, 
            detail="File too large. Maximum size: 100MB"
        )
    
    # Save file
    file_url = save_uploaded_file(material_file, MATERIAL_DIR)
    
    # Create material
    material_data = schemas.CourseMaterialCreate(
        title=title,
        description=description,
        file_type=file_type,
        file_size=material_file.size,
        order_index=order_index,
        is_downloadable=is_downloadable,
        course_id=course_id
    )
    
    return crud.create_course_material(db, material_data, file_url)

@app.put("/api/admin/materials/{material_id}", response_model=schemas.CourseMaterialResponse)
async def update_course_material(
    material_id: int,
    material_update: schemas.CourseMaterialUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Update course material"""
    material = crud.update_course_material(db, material_id, material_update)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    return material

@app.delete("/api/admin/materials/{material_id}")
async def delete_course_material(
    material_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Delete course material"""
    material = crud.get_material_by_id(db, material_id)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    # Delete file
    delete_uploaded_file(material.file_url)
    
    success = crud.delete_course_material(db, material_id)
    if not success:
        raise HTTPException(status_code=404, detail="Material not found")
    
    return {"message": "Material deleted successfully"}

# Admin - Workshops Management
@app.get("/api/admin/workshops", response_model=List[schemas.WorkshopResponse])
async def get_admin_workshops(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Get all workshops for admin management"""
    workshops = crud.get_workshops(db, skip=skip, limit=limit)
    return workshops

@app.post("/api/admin/workshops", response_model=schemas.WorkshopResponse)
async def create_admin_workshop(
    workshop: schemas.WorkshopCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Create a new workshop"""
    return crud.create_workshop(db, workshop)

@app.get("/api/admin/workshops/{workshop_id}", response_model=schemas.WorkshopResponse)
async def get_admin_workshop(
    workshop_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Get workshop by ID"""
    workshop = crud.get_workshop_by_id(db, workshop_id)
    if not workshop:
        raise HTTPException(status_code=404, detail="Workshop not found")
    return workshop

@app.put("/api/admin/workshops/{workshop_id}", response_model=schemas.WorkshopResponse)
async def update_admin_workshop(
    workshop_id: int,
    workshop_update: schemas.WorkshopUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Update workshop"""
    workshop = crud.update_workshop(db, workshop_id, workshop_update)
    if not workshop:
        raise HTTPException(status_code=404, detail="Workshop not found")
    return workshop

@app.delete("/api/admin/workshops/{workshop_id}")
async def delete_admin_workshop(
    workshop_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Delete workshop"""
    success = crud.delete_workshop(db, workshop_id)
    if not success:
        raise HTTPException(status_code=404, detail="Workshop not found")
    return {"message": "Workshop deleted successfully"}

# Admin - Jobs Management
@app.get("/api/admin/jobs", response_model=List[schemas.JobResponse])
async def get_admin_jobs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Get all jobs for admin management"""
    jobs = crud.get_all_jobs(db, skip=skip, limit=limit)
    return jobs

@app.put("/api/admin/jobs/{job_id}", response_model=schemas.JobResponse)
async def update_admin_job(
    job_id: int,
    job_update: dict,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Update job by admin"""
    # Map UI payload to JobUpdate
    try:
        payload = dict(job_update)
        jt_map = {
            'full-time': schemas.JobType.FULL_TIME,
            'part-time': schemas.JobType.PART_TIME,
            'contract': schemas.JobType.CONTRACT,
            'internship': schemas.JobType.INTERNSHIP,
            'freelance': schemas.JobType.FREELANCE,
        }
        el_map = {
            'entry': schemas.ExperienceLevel.ENTRY_LEVEL,
            'mid': schemas.ExperienceLevel.MID_LEVEL,
            'senior': schemas.ExperienceLevel.SENIOR_LEVEL,
            'executive': schemas.ExperienceLevel.EXECUTIVE,
        }
        st_map = {
            'active': schemas.JobStatus.PUBLISHED,
            'closed': schemas.JobStatus.CLOSED,
            'draft': schemas.JobStatus.DRAFT,
        }
        update_kwargs = {}
        if 'title' in payload: update_kwargs['title'] = payload['title']
        if 'company' in payload: update_kwargs['company'] = payload['company']
        if 'location' in payload: update_kwargs['location'] = payload['location']
        if 'job_type' in payload: update_kwargs['job_type'] = jt_map.get(str(payload['job_type']).lower())
        if 'experience_level' in payload: update_kwargs['experience_level'] = el_map.get(str(payload['experience_level']).lower())
        if 'description' in payload: update_kwargs['description'] = payload['description']
        if 'requirements' in payload: update_kwargs['requirements'] = payload['requirements']
        if 'benefits' in payload: update_kwargs['benefits'] = payload['benefits']
        if 'tags' in payload: update_kwargs['tags'] = payload['tags']
        if 'status' in payload: update_kwargs['status'] = st_map.get(str(payload['status']).lower())
        if 'closing_date' in payload and payload['closing_date']:
            from datetime import datetime as dt
            try:
                update_kwargs['application_deadline'] = dt.fromisoformat(payload['closing_date'])
            except Exception:
                try:
                    update_kwargs['application_deadline'] = dt.strptime(payload['closing_date'], '%Y-%m-%d')
                except Exception:
                    pass
        # salary_range parsing if provided
        if 'salary_range' in payload:
            import re
            nums = [float(x.replace(',', '')) for x in re.findall(r"[0-9][0-9,]*", str(payload['salary_range']))]
            if len(nums) >= 1: update_kwargs['salary_min'] = nums[0]
            if len(nums) >= 2: update_kwargs['salary_max'] = nums[1]
        job = crud.update_job_admin(db, job_id, schemas.JobUpdate(**{k:v for k,v in update_kwargs.items() if v is not None}))
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Invalid job update payload: {e}")
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@app.delete("/api/admin/jobs/{job_id}")
async def delete_admin_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Delete job by admin"""
    success = crud.delete_job_admin(db, job_id)
    if not success:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"message": "Job deleted successfully"}

@app.get("/api/admin/jobs/{job_id}/applications", response_model=List[schemas.JobApplicationResponse])
async def admin_get_job_applications(
    job_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Admin: List applications for a specific job"""
    return crud.get_job_applications_admin(db, job_id, skip, limit)

@app.get("/api/admin/jobs/applications", response_model=List[schemas.JobApplicationResponse])
async def admin_get_all_applications(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Admin: List all job applications across all jobs"""
    return crud.get_all_applications_admin(db, skip, limit)

# Admin - Users Management
@app.get("/api/admin/users", response_model=List[schemas.UserResponse])
async def get_admin_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Get all users for admin management"""
    users = crud.get_all_users(db, skip=skip, limit=limit)
    return users

@app.post("/api/admin/users", response_model=schemas.UserResponse)
async def create_admin_user(
    user: schemas.AdminUserCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Create a new user by admin"""
    # Check if user already exists
    existing_user = crud.get_user_by_email(db, email=user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    return crud.create_admin_user(db, user)

@app.get("/api/admin/users/{user_id}", response_model=schemas.UserResponse)
async def get_admin_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Get user by ID"""
    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.put("/api/admin/users/{user_id}", response_model=schemas.UserResponse)
async def update_admin_user(
    user_id: int,
    user_update: schemas.AdminUserUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Update user by admin"""
    user = crud.update_admin_user(db, user_id, user_update)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.delete("/api/admin/users/{user_id}")
async def delete_admin_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Delete user by admin"""
    # Prevent admin from deleting themselves
    if user_id == current_admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    success = crud.delete_admin_user(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}

# Admin - System Settings
@app.get("/api/admin/settings")
async def get_admin_settings(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Get system settings"""
    settings = crud.get_all_system_settings(db)
    
    # Convert to dictionary format
    settings_dict = {setting.key: setting.value for setting in settings}
    
    # Get system info
    from sqlalchemy import func
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    total_jobs = db.query(Job).count()
    
    try:
        from database import Course, Workshop
        total_courses = db.query(Course).count()
        total_workshops = db.query(Workshop).count()
    except:
        total_courses = 0
        total_workshops = 0
    
    return {
        "settings": settings_dict,
        "system_info": {
            "version": "1.0.0",
            "uptime": "Running",
            "database_size": "Calculating...",
            "storage_used": "Calculating...",
            "total_users": total_users,
            "active_sessions": active_users,
            "last_backup": "2025-09-19T02:00:00Z",
            "total_jobs": total_jobs,
            "total_courses": total_courses,
            "total_workshops": total_workshops
        }
    }

@app.put("/api/admin/settings")
async def update_admin_settings(
    settings: dict,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Update system settings"""
    updated_settings = []
    
    for key, value in settings.items():
        if isinstance(value, (str, int, float, bool)):
            setting = crud.create_or_update_system_setting(
                db, key, str(value), updated_by=current_admin.id
            )
            updated_settings.append(setting)
    
    return {"message": "Settings updated successfully", "updated_count": len(updated_settings)}

@app.post("/api/admin/backup")
async def create_admin_backup(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Create database backup"""
    # This is a placeholder - implement actual backup logic
    import shutil
    import os
    from datetime import datetime
    
    try:
        backup_name = f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.db"
        backup_path = f"./backups/{backup_name}"
        
        # Create backups directory if it doesn't exist
        os.makedirs("./backups", exist_ok=True)
        
        # Copy the database file
        shutil.copy2("./architecture_academics.db", backup_path)
        
        # Update last backup time in settings
        crud.create_or_update_system_setting(
            db, "last_backup", datetime.now().isoformat(), 
            "Last database backup timestamp", current_admin.id
        )
        
        return {"message": "Backup created successfully", "backup_file": backup_name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Backup failed: {str(e)}")

# Admin/Development Routes
@app.post("/dev/create-recruiter")
async def create_predefined_recruiter(db: Session = Depends(get_db)):
    """Create predefined recruiter account (development only)"""
    recruiter = crud.create_predefined_recruiter(db)
    return {
        "message": "Predefined recruiter created successfully",
        "email": "recruiter@architectureacademics.com",
        "password": "Recruiter@123",
        "user": recruiter
    }

@app.get("/users/", response_model=List[schemas.UserResponse])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all users (protected endpoint)"""
    users = crud.get_all_users(db, skip=skip, limit=limit)
    return users

# Public Test Endpoints (No Authentication Required)
@app.get("/api/test/workshops")
async def get_test_workshops(db: Session = Depends(get_db)):
    """Test endpoint for workshops without authentication"""
    workshops = crud.get_workshops(db, skip=0, limit=10)
    return workshops

@app.get("/api/test/courses")
async def get_test_courses(db: Session = Depends(get_db)):
    """Test endpoint for courses without authentication"""
    courses = crud.get_courses(db, skip=0, limit=10)
    return courses

@app.get("/api/test/jobs")
async def get_test_jobs(db: Session = Depends(get_db)):
    """Test endpoint for jobs without authentication"""
    jobs = crud.get_jobs(db, skip=0, limit=10)
    return jobs

@app.get("/api/test/users")
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

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Jobs Portal API is running"}

# Initialize predefined recruiter on startup
# ===============================
# PUBLIC COURSE VIEWING ENDPOINTS (No Authentication Required)
# ===============================

@app.get("/api/courses", response_model=List[schemas.CourseResponse])
async def get_public_courses(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=100),
    level: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get all published courses for public viewing (no authentication required)"""
    return crud.get_published_courses(db, skip=skip, limit=limit, level=level, search=search)

@app.get("/api/courses/{course_id}", response_model=schemas.CourseDetailResponse)
async def get_public_course_detail(
    course_id: int,
    db: Session = Depends(get_db)
):
    """Get detailed course information for public viewing"""
    course = crud.get_course_by_id(db, course_id)
    if not course or course.status != schemas.CourseStatus.PUBLISHED:
        raise HTTPException(status_code=404, detail="Course not found or not published")
    
    # Get lessons (only show basic info, video URLs handled separately)
    lessons = crud.get_course_lessons(db, course_id)
    materials = crud.get_course_materials(db, course_id)
    
    # Create response dict excluding relationships to avoid duplication
    course_dict = {k: v for k, v in course.__dict__.items() if k not in ['lessons', 'materials', '_sa_instance_state']}
    
    return schemas.CourseDetailResponse(
        **course_dict,
        lessons=[schemas.CourseLessonResponse(**lesson.__dict__) for lesson in lessons],
        materials=[schemas.CourseMaterialResponse(**material.__dict__) for material in materials]
    )

@app.get("/api/courses/{course_id}/lessons")
async def get_course_lessons_public(
    course_id: int,
    db: Session = Depends(get_db)
):
    """Get course lessons for public viewing (shows which are free vs premium)"""
    course = crud.get_course_by_id(db, course_id)
    if not course or course.status != schemas.CourseStatus.PUBLISHED:
        raise HTTPException(status_code=404, detail="Course not found or not published")
    
    lessons = crud.get_course_lessons(db, course_id)
    
    # Return lesson info without video URLs (URLs are fetched separately based on access)
    return [
        {
            "id": lesson.id,
            "title": lesson.title,
            "description": lesson.description,
            "video_duration": lesson.video_duration,
            "order_index": lesson.order_index,
            "is_free": lesson.is_free,
            "has_video": bool(lesson.video_url)
        }
        for lesson in lessons
    ]

# ===============================
# S3-ENABLED VIDEO UPLOAD ENDPOINTS
# ===============================

@app.post("/api/admin/courses/{course_id}/lessons/s3", response_model=schemas.CourseLessonResponse)
async def create_course_lesson_s3(
    course_id: int,
    title: str = Form(...),
    description: str = Form(None),
    video_duration: int = Form(None),
    order_index: int = Form(0),
    is_free: bool = Form(False),
    transcript: str = Form(None),
    video_file: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Create a new course lesson with S3 video upload"""
    # Verify course exists
    course = crud.get_course_by_id(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Handle video upload to S3
    video_url = None
    if video_file and video_file.filename:
        # Validate video file
        allowed_extensions = {".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm"}
        file_extension = Path(video_file.filename).suffix.lower()
        
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid video format. Allowed: {', '.join(allowed_extensions)}"
            )
        
        # Check file size (limit to 500MB)
        if video_file.size and video_file.size > 500 * 1024 * 1024:
            raise HTTPException(
                status_code=400, 
                detail="Video file too large. Maximum size: 500MB"
            )
        
        # Read file content
        file_content = await video_file.read()
        
        # Create lesson first to get lesson_id
        lesson_data = schemas.CourseLessonCreate(
            title=title,
            description=description,
            video_duration=video_duration,
            order_index=order_index,
            is_free=is_free,
            transcript=transcript,
            course_id=course_id
        )
        
        lesson = crud.create_course_lesson(db, lesson_data, None)
        
        # Upload to S3
        video_url = s3_manager.upload_video(file_content, video_file.filename, course_id, lesson.id)
        
        if not video_url:
            # Delete lesson if S3 upload failed
            crud.delete_course_lesson(db, lesson.id)
            raise HTTPException(status_code=500, detail="Failed to upload video to S3")
        
        # Update lesson with S3 URL
        lesson = crud.update_course_lesson_video_url(db, lesson.id, video_url)
        return lesson
    else:
        # Create lesson without video
        lesson_data = schemas.CourseLessonCreate(
            title=title,
            description=description,
            video_duration=video_duration,
            order_index=order_index,
            is_free=is_free,
            transcript=transcript,
            course_id=course_id
        )
        
        return crud.create_course_lesson(db, lesson_data, None)

@app.post("/api/admin/courses/{course_id}/materials/s3", response_model=schemas.CourseMaterialResponse)
async def create_course_material_s3(
    course_id: int,
    title: str = Form(...),
    description: str = Form(None),
    order_index: int = Form(0),
    is_downloadable: bool = Form(True),
    material_file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Create a new course material with S3 file upload"""
    # Verify course exists
    course = crud.get_course_by_id(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Validate file
    allowed_extensions = {".pdf", ".doc", ".docx", ".txt", ".ppt", ".pptx", ".xls", ".xlsx"}
    file_extension = Path(material_file.filename).suffix.lower()
    
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid file format. Allowed: {', '.join(allowed_extensions)}"
        )
    
    # Check file size (limit to 100MB)
    if material_file.size and material_file.size > 100 * 1024 * 1024:
        raise HTTPException(
            status_code=400, 
            detail="File too large. Maximum size: 100MB"
        )
    
    # Read file content
    file_content = await material_file.read()
    
    # Upload to S3
    file_url = s3_manager.upload_material(file_content, material_file.filename, course_id)
    
    if not file_url:
        raise HTTPException(status_code=500, detail="Failed to upload file to S3")
    
    # Create material
    material_data = schemas.CourseMaterialCreate(
        title=title,
        description=description,
        file_url=file_url,
        file_type=file_extension,
        file_size=material_file.size,
        order_index=order_index,
        is_downloadable=is_downloadable,
        course_id=course_id
    )
    
    return crud.create_course_material(db, material_data)

@app.get("/api/courses/{course_id}/lessons/{lesson_id}/video-url")
async def get_lesson_video_url(
    course_id: int,
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_optional)
):
    """Get video URL for a lesson (free or subscription-based)"""
    lesson = crud.get_course_lesson_by_id(db, lesson_id)
    if not lesson or lesson.course_id != course_id:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    # If lesson is free, return public URL
    if lesson.is_free:
        return {"video_url": lesson.video_url, "is_free": True}
    
    # If lesson is premium, check user subscription
    if not current_user:
        return {"video_url": None, "is_free": False, "message": "Login required for premium content"}
    
    # Check if user has subscription (you can implement subscription logic here)
    has_subscription = current_user.role in [schemas.UserRole.ADMIN, schemas.UserRole.RECRUITER]
    
    if has_subscription:
        # Generate presigned URL for premium content
        presigned_url = s3_manager.generate_presigned_url(lesson.video_url, expiration=3600)
        return {"video_url": presigned_url, "is_free": False, "has_access": True}
    else:
        return {"video_url": None, "is_free": False, "has_access": False, "message": "Subscription required"}

# ==================== Blog & Discussion Endpoints ====================

@app.get("/blogs", response_model=List[schemas.BlogResponse])
async def get_blogs(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    category: Optional[schemas.BlogCategory] = None,
    author_id: Optional[int] = None,
    is_featured: Optional[bool] = None,
    status: Optional[schemas.BlogStatus] = None,
    db: Session = Depends(get_db)
):
    """Get all blogs with optional filters"""
    blogs = crud.get_blogs(
        db=db,
        skip=skip,
        limit=limit,
        search=search,
        category=category,
        author_id=author_id,
        is_featured=is_featured,
        status=status
    )
    return blogs

@app.get("/blogs/{blog_id}", response_model=schemas.BlogResponse)
async def get_blog(
    blog_id: int,
    db: Session = Depends(get_db)
):
    """Get blog by ID and increment view count"""
    blog = crud.increment_blog_views(db, blog_id)
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    return blog

@app.get("/blogs/slug/{slug}", response_model=schemas.BlogResponse)
async def get_blog_by_slug(
    slug: str,
    db: Session = Depends(get_db)
):
    """Get blog by slug"""
    blog = crud.get_blog_by_slug(db, slug)
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    # Increment view count
    crud.increment_blog_views(db, blog.id)
    return blog

@app.post("/blogs", response_model=schemas.BlogResponse)
async def create_blog(
    blog: schemas.BlogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new blog post (authenticated users only)"""
    new_blog = crud.create_blog(db=db, blog=blog, author_id=current_user.id)
    return new_blog

@app.put("/blogs/{blog_id}", response_model=schemas.BlogResponse)
async def update_blog(
    blog_id: int,
    blog_update: schemas.BlogUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a blog post (author or admin only)"""
    blog = crud.get_blog_by_id(db, blog_id)
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    # Check if user is author or admin
    if blog.author_id != current_user.id and current_user.role != schemas.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to update this blog")
    
    updated_blog = crud.update_blog(db, blog_id, blog_update)
    return updated_blog

@app.delete("/blogs/{blog_id}")
async def delete_blog(
    blog_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a blog post (author or admin only)"""
    blog = crud.get_blog_by_id(db, blog_id)
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    # Check if user is author or admin
    if blog.author_id != current_user.id and current_user.role != schemas.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to delete this blog")
    
    crud.delete_blog(db, blog_id)
    return {"message": "Blog deleted successfully"}

# Blog Comments Endpoints

@app.get("/blogs/{blog_id}/comments", response_model=List[schemas.BlogCommentResponse])
async def get_blog_comments(
    blog_id: int,
    db: Session = Depends(get_db)
):
    """Get all comments for a blog"""
    comments = crud.get_blog_comments(db, blog_id)
    return comments

@app.post("/blogs/{blog_id}/comments", response_model=schemas.BlogCommentResponse)
async def create_comment(
    blog_id: int,
    comment: schemas.BlogCommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a comment on a blog"""
    # Verify blog exists
    blog = crud.get_blog_by_id(db, blog_id)
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    # Create comment
    new_comment = crud.create_blog_comment(
        db=db,
        comment=comment,
        author_id=current_user.id
    )
    return new_comment

@app.put("/comments/{comment_id}", response_model=schemas.BlogCommentResponse)
async def update_comment(
    comment_id: int,
    comment_update: schemas.BlogCommentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a comment (author only)"""
    comment = crud.get_comment_by_id(db, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Check if user is author
    if comment.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this comment")
    
    updated_comment = crud.update_blog_comment(db, comment_id, comment_update)
    return updated_comment

@app.delete("/comments/{comment_id}")
async def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a comment (author or admin only)"""
    comment = crud.get_comment_by_id(db, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Check if user is author or admin
    if comment.author_id != current_user.id and current_user.role != schemas.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
    
    crud.delete_blog_comment(db, comment_id)
    return {"message": "Comment deleted successfully"}

# Blog Likes Endpoints

@app.post("/blogs/{blog_id}/like")
async def toggle_blog_like(
    blog_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Toggle like on a blog post"""
    blog = crud.get_blog_by_id(db, blog_id)
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    result = crud.toggle_blog_like(db, blog_id, current_user.id)
    return result

@app.get("/blogs/{blog_id}/like/status")
async def check_blog_like_status(
    blog_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if current user has liked a blog"""
    liked = crud.check_user_liked_blog(db, blog_id, current_user.id)
    return {"liked": liked}

@app.post("/comments/{comment_id}/like")
async def toggle_comment_like(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Toggle like on a comment"""
    comment = crud.get_comment_by_id(db, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    result = crud.toggle_comment_like(db, comment_id, current_user.id)
    return result

@app.get("/comments/{comment_id}/like/status")
async def check_comment_like_status(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if current user has liked a comment"""
    liked = crud.check_user_liked_comment(db, comment_id, current_user.id)
    return {"liked": liked}

# Get user's own blogs
@app.get("/blogs/my/posts", response_model=List[schemas.BlogResponse])
async def get_my_blogs(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's blogs"""
    blogs = crud.get_blogs(
        db=db,
        skip=skip,
        limit=limit,
        author_id=current_user.id,
        status=None  # Show all statuses for own blogs
    )
    return blogs


# ==================== DISCUSSION COMMUNITY ENDPOINTS ====================

# Get all discussions
@app.get("/discussions", response_model=List[schemas.DiscussionResponse])
async def get_discussions(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    author_id: Optional[int] = Query(None),
    is_solved: Optional[bool] = Query(None),
    is_pinned: Optional[bool] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get all discussions with optional filters"""
    discussions = crud.get_discussions(
        db=db,
        search=search,
        category=category,
        author_id=author_id,
        is_solved=is_solved,
        is_pinned=is_pinned,
        skip=skip,
        limit=limit
    )
    return discussions

# Get a single discussion
@app.get("/discussions/{discussion_id}", response_model=schemas.DiscussionResponse)
async def get_discussion(
    discussion_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific discussion by ID and increment views"""
    discussion = crud.get_discussion(db, discussion_id)
    if not discussion:
        raise HTTPException(status_code=404, detail="Discussion not found")
    
    # Increment view count
    crud.increment_discussion_views(db, discussion_id)
    
    return discussion

# Create a new discussion
@app.post("/discussions", response_model=schemas.DiscussionResponse, status_code=status.HTTP_201_CREATED)
async def create_discussion(
    discussion: schemas.DiscussionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new discussion (requires authentication)"""
    return crud.create_discussion(db, discussion, current_user.id)

# Update a discussion
@app.put("/discussions/{discussion_id}", response_model=schemas.DiscussionResponse)
async def update_discussion(
    discussion_id: int,
    discussion: schemas.DiscussionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a discussion (author or admin only)"""
    existing_discussion = crud.get_discussion(db, discussion_id)
    if not existing_discussion:
        raise HTTPException(status_code=404, detail="Discussion not found")
    
    # Check if user is the author or admin
    if existing_discussion.author_id != current_user.id and current_user.role != schemas.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to update this discussion")
    
    updated_discussion = crud.update_discussion(db, discussion_id, discussion)
    return updated_discussion

# Delete a discussion
@app.delete("/discussions/{discussion_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_discussion(
    discussion_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a discussion (author or admin only)"""
    discussion = crud.get_discussion(db, discussion_id)
    if not discussion:
        raise HTTPException(status_code=404, detail="Discussion not found")
    
    # Check if user is the author or admin
    if discussion.author_id != current_user.id and current_user.role != schemas.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to delete this discussion")
    
    crud.delete_discussion(db, discussion_id)
    return None

# Get discussion replies
@app.get("/discussions/{discussion_id}/replies", response_model=List[schemas.DiscussionReplyResponse])
async def get_discussion_replies(
    discussion_id: int,
    db: Session = Depends(get_db)
):
    """Get all replies for a discussion"""
    discussion = crud.get_discussion(db, discussion_id)
    if not discussion:
        raise HTTPException(status_code=404, detail="Discussion not found")
    
    replies = crud.get_discussion_replies(db, discussion_id)
    return replies

# Create a reply to a discussion
@app.post("/discussions/{discussion_id}/replies", response_model=schemas.DiscussionReplyResponse, status_code=status.HTTP_201_CREATED)
async def create_discussion_reply(
    discussion_id: int,
    reply: schemas.DiscussionReplyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a reply to a discussion"""
    discussion = crud.get_discussion(db, discussion_id)
    if not discussion:
        raise HTTPException(status_code=404, detail="Discussion not found")
    
    # Ensure the reply is for this discussion
    reply.discussion_id = discussion_id
    
    return crud.create_discussion_reply(db, reply, current_user.id)

# Update a reply
@app.put("/replies/{reply_id}", response_model=schemas.DiscussionReplyResponse)
async def update_reply(
    reply_id: int,
    reply: schemas.DiscussionReplyUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a reply (author or admin only)"""
    from database import DiscussionReply
    existing_reply = db.query(DiscussionReply).filter(DiscussionReply.id == reply_id).first()
    
    if not existing_reply:
        raise HTTPException(status_code=404, detail="Reply not found")
    
    # Check if user is the author or admin
    if existing_reply.author_id != current_user.id and current_user.role != schemas.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to update this reply")
    
    updated_reply = crud.update_discussion_reply(db, reply_id, reply)
    return updated_reply

# Delete a reply
@app.delete("/replies/{reply_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_reply(
    reply_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a reply (author or admin only)"""
    from database import DiscussionReply
    reply = db.query(DiscussionReply).filter(DiscussionReply.id == reply_id).first()
    
    if not reply:
        raise HTTPException(status_code=404, detail="Reply not found")
    
    # Check if user is the author or admin
    if reply.author_id != current_user.id and current_user.role != schemas.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to delete this reply")
    
    crud.delete_discussion_reply(db, reply_id)
    return None

# Mark reply as solution
@app.post("/replies/{reply_id}/mark-solution")
async def mark_as_solution(
    reply_id: int,
    discussion_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a reply as the accepted solution (discussion author only)"""
    discussion = crud.get_discussion(db, discussion_id)
    if not discussion:
        raise HTTPException(status_code=404, detail="Discussion not found")
    
    # Only the discussion author can mark solutions
    if discussion.author_id != current_user.id and current_user.role != schemas.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only the discussion author can mark solutions")
    
    reply = crud.mark_reply_as_solution(db, reply_id, discussion_id)
    if not reply:
        raise HTTPException(status_code=404, detail="Reply not found")
    
    return {"message": "Reply marked as solution", "reply_id": reply_id}

# Toggle like on discussion
@app.post("/discussions/{discussion_id}/like")
async def toggle_discussion_like(
    discussion_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Toggle like on a discussion"""
    discussion = crud.get_discussion(db, discussion_id)
    if not discussion:
        raise HTTPException(status_code=404, detail="Discussion not found")
    
    result = crud.toggle_discussion_like(db, discussion_id, current_user.id)
    return result

# Check discussion like status
@app.get("/discussions/{discussion_id}/like/status")
async def check_discussion_like_status(
    discussion_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if current user has liked a discussion"""
    liked = crud.check_user_liked_discussion(db, discussion_id, current_user.id)
    return {"liked": liked}

# Toggle like on reply
@app.post("/replies/{reply_id}/like")
async def toggle_reply_like(
    reply_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Toggle like on a reply"""
    from database import DiscussionReply
    reply = db.query(DiscussionReply).filter(DiscussionReply.id == reply_id).first()
    if not reply:
        raise HTTPException(status_code=404, detail="Reply not found")
    
    result = crud.toggle_discussion_reply_like(db, reply_id, current_user.id)
    return result

# Get user's own discussions
@app.get("/discussions/my/posts", response_model=List[schemas.DiscussionResponse])
async def get_my_discussions(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's discussions"""
    discussions = crud.get_discussions(
        db=db,
        skip=skip,
        limit=limit,
        author_id=current_user.id
    )
    return discussions


@app.on_event("startup")
async def startup_event():
    """Create predefined admin, recruiter and sample data on startup"""
    from database import SessionLocal
    db = SessionLocal()
    try:
        # Create predefined admin
        admin = crud.create_predefined_admin(db)
        print("✅ Predefined admin account created/verified")
        print("📧 Email: admin@architectureacademics.com")
        print("🔑 Password: Admin@123")
        
        # Create predefined recruiter
        recruiter = crud.create_predefined_recruiter(db)
        print("✅ Predefined recruiter account created/verified")
        print("📧 Email: recruiter@architectureacademics.com")
        print("🔑 Password: Recruiter@123")
        
        # Create sample jobs if none exist
        existing_jobs = crud.get_jobs(db, limit=1)
        if not existing_jobs:
            print("🔧 Creating sample jobs...")
            
            sample_jobs = [
                schemas.JobCreate(
                    title="Senior Architect",
                    company="Architecture Academics",
                    description="We are looking for a skilled Senior Architect to join our team and lead innovative design projects. The ideal candidate will have 5+ years of experience in architectural design and project management.",
                    requirements="Bachelor's degree in Architecture, 5+ years experience, Proficiency in AutoCAD and Revit, Strong design skills",
                    location="Mumbai, India",
                    job_type=schemas.JobType.FULL_TIME,
                    work_mode=schemas.WorkMode.HYBRID,
                    experience_level=schemas.ExperienceLevel.SENIOR_LEVEL,
                    salary_min=800000,
                    salary_max=1200000,
                    currency="INR",
                    tags="Architecture, Design, AutoCAD, Revit, Project Management",
                    benefits="Health insurance, Flexible working hours, Professional development opportunities",
                    contact_email="hr@architectureacademics.com"
                ),
                schemas.JobCreate(
                    title="Interior Designer",
                    company="Creative Spaces Pvt Ltd",
                    description="Join our creative team as an Interior Designer! We're seeking a passionate designer who can transform spaces into beautiful, functional environments.",
                    requirements="Bachelor's degree in Interior Design, 2+ years experience, Proficiency in 3D modeling software, Creative portfolio",
                    location="Delhi, India",
                    job_type=schemas.JobType.FULL_TIME,
                    work_mode=schemas.WorkMode.ON_SITE,
                    experience_level=schemas.ExperienceLevel.MID_LEVEL,
                    salary_min=400000,
                    salary_max=600000,
                    currency="INR",
                    tags="Interior Design, 3D Modeling, Space Planning, Creativity",
                    benefits="Creative environment, Health benefits, Annual bonus",
                    contact_email="careers@creativespaces.com"
                ),
                schemas.JobCreate(
                    title="Architectural Intern",
                    company="Future Designs Studio",
                    description="Exciting internship opportunity for architecture students! Gain hands-on experience working on real projects with our experienced team.",
                    requirements="Currently pursuing Architecture degree, Basic knowledge of CAD software, Eagerness to learn",
                    location="Bangalore, India",
                    job_type=schemas.JobType.INTERNSHIP,
                    work_mode=schemas.WorkMode.ON_SITE,
                    experience_level=schemas.ExperienceLevel.ENTRY_LEVEL,
                    salary_min=15000,
                    salary_max=25000,
                    currency="INR",
                    tags="Internship, CAD, Learning, Architecture",
                    benefits="Mentorship program, Certificate, Learning opportunities",
                    contact_email="internships@futuredesigns.com"
                ),
                schemas.JobCreate(
                    title="Project Manager - Construction",
                    company="BuildRight Engineers",
                    description="Lead construction projects from conception to completion. We need an experienced project manager with strong leadership skills.",
                    requirements="Engineering degree, 7+ years in construction project management, PMP certification preferred, Strong leadership skills",
                    location="Pune, India",
                    job_type=schemas.JobType.FULL_TIME,
                    work_mode=schemas.WorkMode.ON_SITE,
                    experience_level=schemas.ExperienceLevel.SENIOR_LEVEL,
                    salary_min=1000000,
                    salary_max=1500000,
                    currency="INR",
                    tags="Project Management, Construction, Leadership, Engineering",
                    benefits="Performance bonus, Health insurance, Company vehicle",
                    contact_email="careers@buildright.com"
                )
            ]
            
            # Create each sample job
            created_count = 0
            for job_data in sample_jobs:
                try:
                    job = crud.create_job(db, job_data, recruiter.id)
                    if job:
                        created_count += 1
                        print(f"✅ Created job: {job.title} at {job.company}")
                except Exception as e:
                    print(f"❌ Failed to create job: {e}")
            
            print(f"🎉 Created {created_count} sample jobs!")
        else:
            print(f"✅ Found {len(existing_jobs)} existing jobs in database")
        
        # Create sample blogs if none exist
        from database import Blog
        existing_blogs_count = db.query(Blog).count()
        
        if existing_blogs_count == 0:
            print("📝 Creating sample blog posts...")
            
            sample_blogs = [
                schemas.BlogCreate(
                    title="The Future of Sustainable Architecture in 2025",
                    content="""Sustainable architecture is no longer just a trend—it's a necessity. As we progress through 2025, the architecture industry is witnessing groundbreaking innovations in eco-friendly design and construction methods.

## Key Trends in Sustainable Design

### 1. Net-Zero Energy Buildings
Modern architects are focusing on designing buildings that produce as much energy as they consume. Through the integration of solar panels, wind turbines, and advanced insulation techniques, net-zero buildings are becoming more accessible and affordable.

### 2. Biophilic Design
Incorporating nature into built environments improves mental health and productivity. Living walls, natural lighting, and indoor gardens are essential elements in contemporary sustainable architecture.

### 3. Circular Economy in Construction
The construction industry is adopting circular economy principles, focusing on reusing materials, reducing waste, and designing for deconstruction and future adaptability.

### 4. Smart Building Technology
IoT sensors and AI-powered systems optimize energy consumption, monitor air quality, and enhance occupant comfort while minimizing environmental impact.

## Challenges and Opportunities

While sustainable architecture offers immense benefits, architects face challenges including higher initial costs, limited availability of eco-friendly materials, and the need for specialized knowledge. However, government incentives and growing environmental awareness are creating new opportunities.

## Conclusion

The future of architecture lies in sustainability. As professionals in this field, we have the responsibility and opportunity to shape a better, greener future for generations to come.""",
                    excerpt="Exploring the latest trends and innovations in sustainable architecture, from net-zero buildings to biophilic design and smart technology.",
                    category=schemas.BlogCategory.SUSTAINABLE_DESIGN,
                    tags="sustainability, green architecture, net-zero, biophilic design, smart buildings",
                    is_featured=True,
                    status=schemas.BlogStatus.PUBLISHED
                ),
                schemas.BlogCreate(
                    title="Top 10 Architecture Software Tools Every Professional Should Master",
                    content="""In today's digital age, proficiency in architecture software is essential for success. Here's a comprehensive guide to the most important tools in 2025.

## 1. AutoCAD
Still the industry standard for 2D drafting and documentation. Essential for creating precise technical drawings.

## 2. Revit
The leading BIM (Building Information Modeling) software. Perfect for collaborative projects and managing complex building data.

## 3. SketchUp
User-friendly 3D modeling software ideal for conceptual designs and quick visualizations.

## 4. Rhino + Grasshopper
Advanced parametric design tool for creating complex geometries and algorithmic designs.

## 5. Lumion
Real-time rendering software that brings your designs to life with stunning visualizations.

## 6. V-Ray
Professional rendering engine for photorealistic images and animations.

## 7. Enscape
Real-time rendering and virtual reality plugin for seamless design review.

## 8. BlueBeam
PDF-based collaboration tool for markups, measurements, and project coordination.

## 9. Navisworks
Project review software for clash detection and construction simulation.

## 10. Unity/Unreal Engine
Game engines now used for immersive architectural visualization and VR experiences.

## Learning Path

Start with AutoCAD and Revit as your foundation, then expand based on your specialization. Online courses, tutorials, and hands-on practice are key to mastering these tools.""",
                    excerpt="A comprehensive guide to the essential software tools that every modern architect needs to master in 2025.",
                    category=schemas.BlogCategory.TECHNOLOGY,
                    tags="software, AutoCAD, Revit, BIM, 3D modeling, rendering",
                    is_featured=True,
                    status=schemas.BlogStatus.PUBLISHED
                ),
                schemas.BlogCreate(
                    title="Career Advice: From Architecture Student to Licensed Architect",
                    content="""Embarking on a career in architecture is both exciting and challenging. Here's a roadmap to help you navigate your journey from student to licensed professional.

## Education Foundation

### Bachelor's Degree (5 years)
Focus on fundamental design principles, technical skills, and building systems. Participate in design competitions and workshops to build your portfolio.

### Master's Degree (Optional, 2 years)
Specialize in areas like sustainable design, urban planning, or digital architecture. Conduct research and develop advanced design skills.

## Practical Experience

### Internships
Start interning early! Summer internships provide valuable real-world experience and networking opportunities. Aim for diverse experiences in different firms.

### Architectural Assistantship
After graduation, work under licensed architects to gain practical experience. This is crucial for your licensure process.

## Licensure Process

1. **Complete Required Education**: NAAB-accredited degree
2. **Gain Experience**: 3-5 years of documented experience
3. **Pass Exams**: Complete all ARE (Architect Registration Examination) divisions
4. **State Registration**: Apply for licensure in your state

## Building Your Career

### Portfolio Development
Maintain an updated portfolio showcasing your best work. Include sketches, renderings, and completed projects.

### Networking
Join professional organizations like AIA or IIA. Attend conferences, workshops, and networking events.

### Continuous Learning
Stay updated with latest technologies, building codes, and design trends. Pursue certifications in specialized areas.

### Specialization
Consider specializing in areas like:
- Sustainable Design
- Healthcare Architecture
- Residential Design
- Commercial Architecture
- Urban Planning

## Tips for Success

1. Be patient—becoming a licensed architect takes time
2. Build strong relationships with mentors
3. Develop both technical and soft skills
4. Stay passionate about design
5. Embrace technology and innovation

Remember, every successful architect started where you are now. Stay dedicated, keep learning, and pursue your passion!""",
                    excerpt="A complete roadmap for architecture students and young professionals on the path to becoming licensed architects.",
                    category=schemas.BlogCategory.CAREER_ADVICE,
                    tags="career, education, licensure, internship, professional development",
                    is_featured=True,
                    status=schemas.BlogStatus.PUBLISHED
                ),
                schemas.BlogCreate(
                    title="Showcase: Award-Winning Residential Architecture Projects of 2025",
                    content="""Let's explore some of the most innovative and beautiful residential architecture projects that have won international acclaim this year.

## 1. The Floating House - Singapore

This stunning residence appears to float above a reflection pool, creating a seamless connection between architecture and water. The design emphasizes open spaces, natural ventilation, and sustainable materials.

**Key Features:**
- Cantilever design
- Solar panels integrated into the roof
- Rainwater harvesting system
- Natural ventilation throughout

## 2. Mountain Retreat - Swiss Alps

A modern interpretation of traditional alpine architecture, this retreat blends seamlessly with its mountainous surroundings while providing luxury and comfort.

**Highlights:**
- Local stone and timber construction
- Floor-to-ceiling windows with panoramic views
- Geothermal heating system
- Green roof design

## 3. Urban Oasis - Tokyo

In the heart of Tokyo, this compact home maximizes limited space through clever design and vertical living concepts.

**Innovation:**
- Multi-functional spaces
- Indoor garden with automated watering
- Smart home integration
- Minimalist Japanese aesthetic

## 4. Desert Villa - Dubai

This villa demonstrates how architecture can work with extreme climates, using passive cooling strategies and innovative shading systems.

**Sustainable Features:**
- Thermal mass walls
- Strategic window placement
- Solar chimney ventilation
- Desert-adapted landscaping

## 5. Coastal Contemporary - Australia

A beachfront property that celebrates its location while respecting environmental sensitivities of coastal living.

**Design Elements:**
- Hurricane-resistant structure
- Elevated foundation
- Outdoor living spaces
- Use of weather-resistant materials

These projects showcase the diverse possibilities in residential architecture, from sustainable innovations to cultural sensitivity and climate-responsive design.""",
                    excerpt="Featuring the most innovative and award-winning residential architecture projects from around the world in 2025.",
                    category=schemas.BlogCategory.PROJECT_SHOWCASE,
                    tags="residential, showcase, awards, innovation, design",
                    status=schemas.BlogStatus.PUBLISHED
                ),
                schemas.BlogCreate(
                    title="Understanding Building Information Modeling (BIM) in Modern Practice",
                    content="""Building Information Modeling (BIM) has revolutionized the architecture, engineering, and construction (AEC) industry. Let's dive deep into understanding BIM and its impact.

## What is BIM?

BIM is a digital representation of physical and functional characteristics of a facility. It's a shared knowledge resource forming a reliable basis for decisions during its life-cycle from inception onward.

## Key Benefits of BIM

### 1. Enhanced Collaboration
All stakeholders can access the same information, reducing miscommunication and errors.

### 2. Improved Visualization
3D models help clients understand designs better than traditional 2D drawings.

### 3. Cost Efficiency
Detect clashes and issues before construction, saving time and money.

### 4. Sustainable Design
Analyze energy performance and environmental impact early in design.

### 5. Facility Management
BIM models serve as valuable assets for building operation and maintenance.

## BIM Dimensions

- **3D**: Spatial representation
- **4D**: Time/scheduling
- **5D**: Cost estimation
- **6D**: Sustainability analysis
- **7D**: Facility management

## Implementation Challenges

1. Initial investment in software and training
2. Change management in traditional firms
3. Interoperability between different software
4. Data security and intellectual property concerns

## Best Practices

- Start with pilot projects
- Invest in training and education
- Establish clear BIM standards
- Use cloud-based collaboration platforms
- Regular software updates and maintenance

## The Future

As technology advances, BIM is integrating with AI, IoT, and VR/AR, creating even more possibilities for the industry.""",
                    excerpt="A comprehensive guide to Building Information Modeling (BIM) and its transformative impact on modern architectural practice.",
                    category=schemas.BlogCategory.TECHNOLOGY,
                    tags="BIM, technology, collaboration, 3D modeling, construction",
                    status=schemas.BlogStatus.PUBLISHED
                ),
                schemas.BlogCreate(
                    title="Architecture Education Reform: What Needs to Change?",
                    content="""Architecture education has remained largely unchanged for decades. As the profession evolves, so must our educational approach.

## Current Challenges

### 1. Theory vs. Practice Gap
Schools often focus heavily on design theory while students lack practical construction knowledge.

### 2. Technology Integration
Many programs don't adequately teach modern software and digital tools.

### 3. Sustainability Education
Environmental design should be core curriculum, not an elective.

### 4. Business Skills
Architects need to understand project management, finance, and entrepreneurship.

## Proposed Changes

### Practical Experience
- Mandatory internships during education
- Collaboration with construction companies
- Real client projects in coursework

### Technology Focus
- Updated software training
- Digital fabrication and 3D printing
- Virtual and augmented reality
- Parametric design tools

### Interdisciplinary Approach
- Collaborate with engineering students
- Work with business and marketing programs
- Partner with environmental science departments

### Mental Health Support
- Reduce all-nighter culture
- Better work-life balance
- Support systems for students

## Global Perspectives

Different countries are experimenting with innovative approaches:
- **Europe**: Integrated 5-year programs
- **Asia**: Technology-focused curriculum
- **Scandinavia**: Sustainability-centered education

## Moving Forward

Education reform requires collaboration between schools, professional organizations, and the industry. We need to prepare students for the realities of modern practice while maintaining design excellence.

The question isn't whether change is needed—it's how quickly we can implement it.""",
                    excerpt="Examining the need for reform in architecture education and proposing changes for better preparing future professionals.",
                    category=schemas.BlogCategory.EDUCATION,
                    tags="education, reform, learning, students, curriculum",
                    status=schemas.BlogStatus.PUBLISHED
                ),
                schemas.BlogCreate(
                    title="The Rise of Modular Construction: Future of Building?",
                    content="""Modular construction is transforming the building industry, offering faster construction times, cost savings, and improved quality control.

## What is Modular Construction?

Modular construction involves producing standardized components in a factory and assembling them on-site. It's different from traditional stick-building methods.

## Advantages

### Speed
- 30-50% faster than traditional construction
- Weather-independent manufacturing
- Parallel site and factory work

### Quality Control
- Controlled factory environment
- Consistent standards
- Rigorous testing procedures

### Sustainability
- Less construction waste
- Better material utilization
- Reduced site disturbance
- Lower carbon footprint

### Cost-Effective
- Reduced labor costs
- Bulk material purchasing
- Shorter construction timeline

## Applications

- **Residential**: Single-family homes, apartments
- **Commercial**: Hotels, offices, retail
- **Healthcare**: Medical facilities, clinics
- **Education**: Schools, dormitories
- **Emergency**: Disaster relief housing

## Challenges

1. Transportation logistics and costs
2. Limited design flexibility
3. Zoning and building code issues
4. Perception and acceptance
5. Initial investment requirements

## Technology Integration

Modern modular construction uses:
- BIM for precise coordination
- Robotics for manufacturing
- 3D printing for components
- IoT for smart building systems

## Case Studies

### Singapore Public Housing
Mass modular housing providing affordable homes quickly.

### Marriott Hotels
Modular construction for rapid hotel expansion.

### UK Healthcare Facilities
Fast-track modular hospitals for urgent care.

## Future Outlook

As technology improves and acceptance grows, modular construction is poised to capture significant market share. Innovation in materials, design flexibility, and manufacturing processes continues to expand possibilities.

The question isn't if modular will be mainstream—it's when.""",
                    excerpt="Exploring the benefits, challenges, and future potential of modular construction in revolutionizing the building industry.",
                    category=schemas.BlogCategory.INDUSTRY_INSIGHTS,
                    tags="modular construction, prefab, innovation, construction technology",
                    status=schemas.BlogStatus.PUBLISHED
                ),
                schemas.BlogCreate(
                    title="Breaking News: New Green Building Codes Announced",
                    content="""Major cities worldwide are implementing stricter green building codes aimed at reducing carbon emissions and improving energy efficiency.

## What's Changing?

### Energy Performance Standards
New buildings must meet higher energy efficiency standards, with many cities requiring net-zero energy certification.

### Material Requirements
- Mandatory use of sustainable materials
- Embodied carbon calculations
- Recycled content minimums

### Water Conservation
- Rainwater harvesting systems
- Greywater recycling
- Low-flow fixtures

### Indoor Air Quality
- Enhanced ventilation requirements
- VOC limits for materials
- Natural lighting standards

## Impact on Architects

Architects must now:
1. Design with energy modeling from day one
2. Specify compliant materials
3. Document sustainability measures
4. Work with energy consultants

## Timeline for Implementation

- **2025**: New requirements take effect
- **2026**: Existing building retrofits begin
- **2027**: Full compliance required
- **2030**: Net-zero targets

## Opportunities

These changes create opportunities for:
- Specialized sustainable design services
- Energy consulting
- Green building certification
- Retrofit and renovation projects

## Preparation Tips

1. Take green building certification courses
2. Learn energy modeling software
3. Build relationships with sustainability consultants
4. Study successful case examples

Stay informed and adapt—this is the future of architecture!""",
                    excerpt="New green building codes are being implemented worldwide, requiring architects to adapt their practices for sustainable design.",
                    category=schemas.BlogCategory.ARCHITECTURE_NEWS,
                    tags="green building, codes, regulations, sustainability, news",
                    status=schemas.BlogStatus.PUBLISHED
                ),
            ]
            
            created_blogs = 0
            for blog_data in sample_blogs:
                try:
                    blog = crud.create_blog(db, blog_data, recruiter.id)  # Using recruiter as default author
                    if blog:
                        created_blogs += 1
                        print(f"📝 Created blog: {blog.title}")
                except Exception as e:
                    print(f"❌ Failed to create blog: {e}")
            
            print(f"🎉 Created {created_blogs} sample blog posts!")
        else:
            print(f"✅ Found {existing_blogs_count} existing blogs in database")
        
        # Create sample discussions if none exist
        from database import Discussion
        existing_discussions_count = db.query(Discussion).count()
        
        if existing_discussions_count == 0:
            print("📝 Creating sample discussion posts...")
            
            sample_discussions = [
                schemas.DiscussionCreate(
                    title="How to effectively integrate sustainable materials in modern architecture?",
                    content="""I'm working on a residential project and want to incorporate more sustainable materials without significantly increasing costs. 

My main challenges are:
1. Finding suppliers of eco-friendly materials
2. Balancing sustainability with client budget
3. Ensuring materials meet local building codes

Has anyone successfully navigated this? What materials would you recommend for a budget-conscious sustainable build?

Any advice on cost-effective sustainable alternatives to traditional materials would be greatly appreciated!""",
                    category="Design Help",
                    tags="sustainability, materials, green building, residential"
                ),
                schemas.DiscussionCreate(
                    title="Best BIM software for small architecture firms in 2025?",
                    content="""Our small firm (5 architects) is looking to transition from AutoCAD to BIM. We've been researching different options but are overwhelmed by choices.

Key requirements:
- Good for small teams (5-10 users)
- Reasonable pricing
- Strong collaboration features
- Good learning curve

We're considering:
- Revit
- ArchiCAD
- Vectorworks

What are your experiences with these platforms? Are there other options we should consider? How long did it take your team to become proficient?""",
                    category="Software & Tools",
                    tags="BIM, Revit, ArchiCAD, software, CAD"
                ),
                schemas.DiscussionCreate(
                    title="Career advice: Should I specialize or stay a generalist?",
                    content="""I'm 3 years into my architecture career and facing a dilemma. 

My situation:
- Currently working at a mid-size firm doing various project types
- Enjoy both residential and commercial work
- Interested in sustainable design and historic preservation
- Concerned about limiting future opportunities

I've noticed some colleagues specializing (healthcare, residential, etc.) and advancing faster. But I also value the variety of being a generalist.

For those further in their careers:
- Did specializing help or hinder your career?
- At what point did you decide to specialize (or not)?
- Can you switch specializations later if needed?

Would love to hear different perspectives!""",
                    category="Career Advice",
                    tags="career, specialization, advice, professional development"
                ),
                schemas.DiscussionCreate(
                    title="Parametric design workflow: Grasshopper vs Dynamo?",
                    content="""I want to learn parametric design but can't decide between Grasshopper (Rhino) and Dynamo (Revit).

Background:
- Proficient in Revit for documentation
- Some Rhino experience for concept design
- Interested in facade optimization and complex geometries

Questions:
1. Which has a better learning curve for beginners?
2. Which is more valuable in the industry?
3. Can you use both effectively, or should I focus on one?
4. Any good learning resources you'd recommend?

Looking for practical advice from those who use these tools professionally.""",
                    category="Technical Questions",
                    tags="parametric design, Grasshopper, Dynamo, Rhino, computational design"
                ),
                schemas.DiscussionCreate(
                    title="Project feedback: University library design concept",
                    content="""I'm working on my thesis project - a university library design emphasizing natural light and sustainable features.

Key features:
- Central atrium with skylights
- Reading pods integrated into facade
- Green roof with solar panels
- Flexible study spaces

Concerns:
- Is the atrium too dominant in the plan?
- Worried about glare control in reading areas
- Budget constraints for green roof system

I'd love feedback on:
1. Overall spatial organization
2. Sustainable features implementation
3. Natural lighting strategy
4. Any red flags you see

Happy to share more details or sketches if helpful!""",
                    category="Project Feedback",
                    tags="thesis, library, sustainable design, feedback, student project"
                ),
                schemas.DiscussionCreate(
                    title="Dealing with difficult clients: How do you manage expectations?",
                    content="""I'm struggling with a residential client who keeps changing requirements after we've finalized designs.

The situation:
- We're on revision 7 of the concept design
- Client adds new requirements each meeting
- Timeline is slipping badly
- Starting to affect my team's morale

I've tried:
- Clear contracts with revision limits (they want to renegotiate)
- Detailed meeting notes (they claim misunderstandings)
- Regular check-ins (leads to more changes)

How do experienced architects handle this? 

What strategies work for:
- Setting firm boundaries
- Managing scope creep
- Keeping projects on track
- Maintaining good client relationships

At what point do you consider parting ways with a client?""",
                    category="General Discussion",
                    tags="client management, professional practice, communication"
                ),
                schemas.DiscussionCreate(
                    title="ARE 5.0 Study Tips: What worked for you?",
                    content="""I'm preparing for my architecture licensing exams (ARE 5.0) and would love advice from those who've passed.

My situation:
- Working full-time at a firm
- Planning to take 2 exams in the next 6 months
- Budget for study materials: ~$1000

Questions:
1. Which exams did you find easiest/hardest?
2. Best study materials or courses?
3. How many hours per week did you study?
4. Any specific tips for the case studies?
5. Best order to take the exams?

Also curious:
- How long did it take you to complete all divisions?
- Did your firm provide study time/support?
- Worth taking review courses or self-study sufficient?

Thanks in advance for any guidance!""",
                    category="Education & Learning",
                    tags="ARE, licensing, exam prep, professional development"
                ),
                schemas.DiscussionCreate(
                    title="New mass timber building codes: What you need to know",
                    content="""Just attended a seminar on the updated mass timber building codes and wanted to share key takeaways.

Major changes:
1. Increased height limits for mass timber structures (now up to 18 stories in some jurisdictions)
2. New fire testing requirements for CLT and glulam
3. Updated connection detailing standards
4. Enhanced moisture protection requirements

This is exciting for sustainable design! Mass timber is becoming more viable for mid-rise construction.

Questions for the community:
- Has anyone designed with mass timber under the new codes?
- What were your experiences with approval authorities?
- Cost comparisons with concrete/steel?
- Reliable suppliers and contractors?

Could be a game-changer for sustainable urban development!""",
                    category="Industry News",
                    tags="mass timber, building codes, CLT, sustainable construction, regulations"
                ),
                schemas.DiscussionCreate(
                    title="Looking for architecture photographers for portfolio",
                    content="""I need to build my portfolio with professional photos of completed projects.

What I'm looking for:
- Architectural photographer in the Northeast US
- Experience with interior and exterior shots
- Reasonable rates for small firm
- Rights to use images for marketing

Questions:
1. What's a fair rate for professional architecture photography?
2. Should I hire locally or consider travel costs for top photographers?
3. Any photographers you'd recommend?
4. Tips for preparing buildings for photo shoots?

Also open to:
- Collaboration opportunities
- Student photographers building portfolios
- Photo styling advice

Budget is flexible for the right photographer who understands architectural photography.""",
                    category="Networking",
                    tags="photography, portfolio, networking, marketing, collaboration"
                ),
                schemas.DiscussionCreate(
                    title="Advice for transitioning from residential to commercial architecture?",
                    content="""I've been designing residential projects for 5 years and want to transition to commercial work, particularly office and retail.

My background:
- Strong residential design portfolio
- Proficient in Revit and ArchiCAD
- Some experience with mixed-use projects
- LEED AP certification

Challenges I foresee:
- Different building codes and regulations
- Larger project scales and teams
- Different client expectations
- More complex MEP coordination

Questions:
1. How difficult is this transition typically?
2. What skills should I develop?
3. How to position myself for commercial firms?
4. Will my residential experience translate?
5. Salary expectations - should I expect a reset?

Any success stories or cautionary tales?""",
                    category="Career Advice",
                    tags="career transition, commercial architecture, residential, job search"
                ),
            ]
            
            created_discussions = 0
            for discussion_data in sample_discussions:
                try:
                    discussion = crud.create_discussion(db, discussion_data, recruiter.id)
                    if discussion:
                        created_discussions += 1
                        print(f"💬 Created discussion: {discussion.title}")
                except Exception as e:
                    print(f"❌ Failed to create discussion: {e}")
            
            print(f"🎉 Created {created_discussions} sample discussion posts!")
            
            # Add some sample replies to discussions
            if created_discussions > 0:
                print("💬 Adding sample replies to discussions...")
                discussions = db.query(Discussion).limit(3).all()
                
                sample_replies = [
                    ("I've had great success with reclaimed wood and recycled steel. Local salvage yards are goldmines! The cost is usually 30-40% less than new materials.", 1),
                    ("Check out bamboo flooring and cork - both sustainable and cost-effective. Also, consider recycled glass countertops.", 1),
                    ("We switched to Revit last year. Learning curve is steep but worth it. Budget about 3-6 months for team proficiency.", 2),
                    ("ArchiCAD is more intuitive in my opinion. Better for smaller teams. Revit is industry standard though.", 2),
                    ("I specialized after 5 years - best decision ever! Became the go-to person for healthcare projects. Higher pay, better projects.", 3),
                ]
                
                for reply_text, discussion_idx in sample_replies:
                    if discussion_idx <= len(discussions):
                        try:
                            reply_data = schemas.DiscussionReplyCreate(
                                content=reply_text,
                                discussion_id=discussions[discussion_idx - 1].id,
                                parent_id=None
                            )
                            crud.create_discussion_reply(db, reply_data, recruiter.id)
                        except:
                            pass
                
                print("✅ Added sample replies!")
        else:
            print(f"✅ Found {existing_discussions_count} existing discussions in database")
            
    except Exception as e:
        print(f"❌ Error during startup: {e}")
    finally:
        db.close()

# ==================== PUBLIC ROUTES ====================

# Public Events Endpoint
@app.get("/events", response_model=List[schemas.EventResponse])
async def get_public_events(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all events for public view"""
    # Return all events without status filtering for now
    return crud.get_events(db, skip=skip, limit=limit)

# Public Workshops Endpoint
@app.get("/workshops", response_model=List[schemas.WorkshopResponse])
async def get_public_workshops(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all workshops for public view"""
    # Return all workshops without status filtering for now
    return crud.get_workshops(db, skip=skip, limit=limit)

# Public Courses Endpoint
@app.get("/courses", response_model=List[schemas.CourseResponse])
async def get_public_courses(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all published courses for public view"""
    return crud.get_courses(db, skip=skip, limit=limit, status="published")

# ==================== ADMIN ROUTES ====================

@app.get("/admin/stats")
async def get_admin_dashboard_stats(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get admin dashboard statistics"""
    return crud.get_admin_stats(db)

# Admin - Events Management
@app.get("/admin/events", response_model=List[schemas.EventResponse])
async def admin_get_all_events(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all events for admin"""
    return crud.get_events(db, skip=skip, limit=limit, status=status)

@app.post("/admin/events", response_model=schemas.EventResponse)
async def admin_create_event(
    event: schemas.EventCreate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create new event"""
    return crud.create_event(db, event, organizer_id=current_user.id)

@app.get("/admin/events/{event_id}", response_model=schemas.EventResponse)
async def admin_get_event(
    event_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get event by ID"""
    event = crud.get_event(db, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@app.put("/admin/events/{event_id}", response_model=schemas.EventResponse)
async def admin_update_event(
    event_id: int,
    event_update: schemas.EventUpdate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update event"""
    updated_event = crud.update_event(db, event_id, event_update)
    if not updated_event:
        raise HTTPException(status_code=404, detail="Event not found")
    return updated_event

@app.delete("/admin/events/{event_id}")
async def admin_delete_event(
    event_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete event"""
    success = crud.delete_event(db, event_id)
    if not success:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Event deleted successfully"}

@app.get("/admin/events/{event_id}/registrations")
async def admin_get_event_registrations(
    event_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all registrations for an event with user details"""
    # Check if event exists
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Get all registrations with user details
    registrations = db.query(EventRegistration).filter(
        EventRegistration.event_id == event_id
    ).all()
    
    result = []
    for reg in registrations:
        user = db.query(User).filter(User.id == reg.participant_id).first()
        if user:
            result.append({
                "registration_id": reg.id,
                "registered_at": reg.registered_at,
                "attended": reg.attended,
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "full_name": f"{user.first_name} {user.last_name}"
                }
            })
    
    return {
        "event_id": event_id,
        "event_title": event.title,
        "total_registrations": len(result),
        "registrations": result
    }

# Event Registration (Public)
@app.post("/events/{event_id}/register")
async def register_for_event(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Register current user for an event (free registration)"""
    from database import EventRegistration
    
    # Check if event exists
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Check if event is full (count registrations directly)
    if event.max_participants:
        current_count = db.query(EventRegistration).filter(EventRegistration.event_id == event_id).count()
        if current_count >= event.max_participants:
            raise HTTPException(status_code=400, detail="Event is full")
    
    # Register user
    registration = crud.register_for_event(db, event_id, current_user.id)
    if not registration:
        raise HTTPException(status_code=400, detail="You are already registered for this event")
    
    return {
        "message": "Successfully registered for event",
        "event_id": event_id,
        "registration_id": registration.id,
        "registered_at": registration.registered_at
    }

@app.get("/events/{event_id}/registration-status")
async def check_event_registration_status(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if current user is registered for an event"""
    from database import EventRegistration
    from sqlalchemy import and_
    
    registration = db.query(EventRegistration).filter(
        and_(
            EventRegistration.event_id == event_id,
            EventRegistration.participant_id == current_user.id
        )
    ).first()
    
    return {
        "is_registered": registration is not None,
        "registration": {
            "id": registration.id,
            "registered_at": registration.registered_at,
            "attended": registration.attended
        } if registration else None
    }

@app.get("/api/event-registrations/my-events")
async def get_my_events(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all registered events for current user"""
    from database import EventRegistration
    
    registrations = db.query(EventRegistration).filter(
        EventRegistration.participant_id == current_user.id
    ).all()
    
    result = []
    for registration in registrations:
        event = db.query(Event).filter(Event.id == registration.event_id).first()
        if event:
            registered_count = db.query(EventRegistration).filter(
                EventRegistration.event_id == event.id
            ).count()
            
            result.append({
                "id": registration.id,
                "event_id": registration.event_id,
                "registered_at": registration.registered_at.isoformat() if registration.registered_at else None,
                "status": "confirmed",  # You can add status field to EventRegistration model if needed
                "event": {
                    "id": event.id,
                    "title": event.title,
                    "description": event.description,
                    "image_url": event.image_url,
                    "event_date": event.event_date.isoformat() if event.event_date else None,
                    "event_time": event.event_time,
                    "location": event.location,
                    "capacity": event.capacity,
                    "registered_count": registered_count,
                    "event_type": event.event_type or "Conference"
                }
            })
    
    return result

# Admin - Workshops Management
@app.get("/admin/workshops", response_model=List[schemas.WorkshopResponse])
async def admin_get_all_workshops(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all workshops for admin"""
    query = db.query(Workshop)
    if status:
        query = query.filter(Workshop.status == status)
    return query.order_by(Workshop.date.desc()).offset(skip).limit(limit).all()

@app.post("/admin/workshops", response_model=schemas.WorkshopResponse)
async def admin_create_workshop(
    workshop: schemas.WorkshopCreate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create new workshop"""
    return crud.create_workshop(db, workshop, instructor_id=current_user.id)

@app.get("/admin/workshops/{workshop_id}", response_model=schemas.WorkshopResponse)
async def admin_get_workshop(
    workshop_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get workshop by ID"""
    workshop = crud.get_workshop(db, workshop_id)
    if not workshop:
        raise HTTPException(status_code=404, detail="Workshop not found")
    return workshop

@app.put("/admin/workshops/{workshop_id}", response_model=schemas.WorkshopResponse)
async def admin_update_workshop(
    workshop_id: int,
    workshop_update: schemas.WorkshopUpdate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update workshop"""
    updated_workshop = crud.update_workshop(db, workshop_id, workshop_update)
    if not updated_workshop:
        raise HTTPException(status_code=404, detail="Workshop not found")
    return updated_workshop

@app.delete("/admin/workshops/{workshop_id}")
async def admin_delete_workshop(
    workshop_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete workshop"""
    success = crud.delete_workshop(db, workshop_id)
    if not success:
        raise HTTPException(status_code=404, detail="Workshop not found")
    return {"message": "Workshop deleted successfully"}

@app.get("/admin/workshops/{workshop_id}/registrations")
async def admin_get_workshop_registrations(
    workshop_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all registrations for a workshop with user details"""
    # Check if workshop exists
    workshop = db.query(Workshop).filter(Workshop.id == workshop_id).first()
    if not workshop:
        raise HTTPException(status_code=404, detail="Workshop not found")
    
    # Get all registrations with user details
    registrations = db.query(WorkshopRegistration).filter(
        WorkshopRegistration.workshop_id == workshop_id
    ).all()
    
    result = []
    for reg in registrations:
        user = db.query(User).filter(User.id == reg.participant_id).first()
        if user:
            result.append({
                "registration_id": reg.id,
                "registered_at": reg.registered_at,
                "attended": reg.attended,
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "full_name": f"{user.first_name} {user.last_name}"
                }
            })
    
    return {
        "workshop_id": workshop_id,
        "workshop_title": workshop.title,
        "total_registrations": len(result),
        "registrations": result
    }

# Workshop Registration (Public)
@app.post("/workshops/{workshop_id}/register")
async def register_for_workshop(
    workshop_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Register current user for a workshop (free registration)"""
    # Check if workshop exists
    workshop = db.query(Workshop).filter(Workshop.id == workshop_id).first()
    if not workshop:
        raise HTTPException(status_code=404, detail="Workshop not found")
    
    # Check if workshop is full (count registrations directly)
    if workshop.max_participants:
        current_count = db.query(WorkshopRegistration).filter(WorkshopRegistration.workshop_id == workshop_id).count()
        if current_count >= workshop.max_participants:
            raise HTTPException(status_code=400, detail="Workshop is full")
    
    # Register user
    registration = crud.register_for_workshop(db, workshop_id, current_user.id)
    if not registration:
        raise HTTPException(status_code=400, detail="You are already registered for this workshop")
    
    return {
        "message": "Successfully registered for workshop",
        "workshop_id": workshop_id,
        "registration_id": registration.id,
        "registered_at": registration.registered_at
    }

@app.get("/workshops/{workshop_id}/registration-status")
async def check_workshop_registration_status(
    workshop_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if current user is registered for a workshop"""
    from database import WorkshopRegistration
    from sqlalchemy import and_
    
    registration = db.query(WorkshopRegistration).filter(
        and_(
            WorkshopRegistration.workshop_id == workshop_id,
            WorkshopRegistration.participant_id == current_user.id
        )
    ).first()
    
    return {
        "is_registered": registration is not None,
        "registration": {
            "id": registration.id,
            "registered_at": registration.registered_at,
            "attended": registration.attended
        } if registration else None
    }

@app.get("/api/workshop-registrations/my-workshops")
async def get_my_workshops(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all registered workshops for current user"""
    from database import WorkshopRegistration
    
    registrations = db.query(WorkshopRegistration).filter(
        WorkshopRegistration.participant_id == current_user.id
    ).all()
    
    result = []
    for registration in registrations:
        workshop = db.query(Workshop).filter(Workshop.id == registration.workshop_id).first()
        if workshop:
            registered_count = db.query(WorkshopRegistration).filter(
                WorkshopRegistration.workshop_id == workshop.id
            ).count()
            
            result.append({
                "id": registration.id,
                "workshop_id": registration.workshop_id,
                "registered_at": registration.registered_at.isoformat() if registration.registered_at else None,
                "status": "confirmed",  # You can add status field to WorkshopRegistration model if needed
                "workshop": {
                    "id": workshop.id,
                    "title": workshop.title,
                    "description": workshop.description,
                    "image_url": workshop.image_url,
                    "date": workshop.date.isoformat() if workshop.date else None,
                    "time": workshop.time,
                    "location": workshop.location,
                    "capacity": workshop.capacity,
                    "registered_count": registered_count,
                    "category": workshop.category,
                    "skill_level": workshop.skill_level
                }
            })
    
    return result

# Admin - Courses Management
@app.get("/admin/courses", response_model=List[schemas.CourseResponse])
async def admin_get_all_courses(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all courses for admin"""
    query = db.query(Course)
    if status:
        query = query.filter(Course.status == status)
    return query.order_by(Course.created_at.desc()).offset(skip).limit(limit).all()

@app.post("/admin/courses", response_model=schemas.CourseResponse)
async def admin_create_course(
    course: schemas.CourseCreate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create new course"""
    return crud.create_course(db, course, instructor_id=current_user.id)

@app.get("/admin/courses/{course_id}", response_model=schemas.CourseResponse)
async def admin_get_course(
    course_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get course by ID"""
    course = crud.get_course(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@app.put("/admin/courses/{course_id}", response_model=schemas.CourseResponse)
async def admin_update_course(
    course_id: int,
    course_update: schemas.CourseUpdate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update course"""
    updated_course = crud.update_course(db, course_id, course_update)
    if not updated_course:
        raise HTTPException(status_code=404, detail="Course not found")
    return updated_course

@app.delete("/admin/courses/{course_id}")
async def admin_delete_course(
    course_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete course"""
    success = crud.delete_course(db, course_id)
    if not success:
        raise HTTPException(status_code=404, detail="Course not found")
    return {"message": "Course deleted successfully"}

# Admin - Jobs Management
@app.get("/admin/jobs", response_model=List[schemas.JobResponse])
async def admin_get_all_jobs(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all jobs for admin"""
    query = db.query(Job)
    if status:
        query = query.filter(Job.status == status)
    return query.order_by(Job.created_at.desc()).offset(skip).limit(limit).all()

@app.put("/admin/jobs/{job_id}", response_model=schemas.JobResponse)
async def admin_update_job(
    job_id: int,
    job_update: schemas.JobUpdate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update job"""
    updated_job = crud.update_job(db, job_id, job_update)
    if not updated_job:
        raise HTTPException(status_code=404, detail="Job not found")
    return updated_job

@app.delete("/admin/jobs/{job_id}")
async def admin_delete_job(
    job_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete job"""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    db.delete(job)
    db.commit()
    return {"message": "Job deleted successfully"}

# Admin - Users Management
@app.get("/admin/users", response_model=List[schemas.UserResponse])
async def admin_get_all_users(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    role: Optional[str] = None,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all users for admin"""
    return crud.get_all_users_admin(db, skip=skip, limit=limit, search=search, role=role)

@app.put("/admin/users/{user_id}/role")
async def admin_update_user_role(
    user_id: int,
    role: schemas.UserRole,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update user role"""
    updated_user = crud.update_user_role(db, user_id, role)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user

@app.put("/admin/users/{user_id}/toggle-status")
async def admin_toggle_user_status(
    user_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Toggle user active status"""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own account")
    
    updated_user = crud.toggle_user_status(db, user_id)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user

@app.delete("/admin/users/{user_id}")
async def admin_delete_user(
    user_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete user"""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    success = crud.delete_user(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}

# Admin - Settings Management
@app.get("/admin/settings")
async def admin_get_all_settings(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all system settings"""
    settings = db.query(SystemSettings).all()
    return settings

@app.post("/admin/settings")
async def admin_create_setting(
    key: str = Form(...),
    value: str = Form(...),
    description: Optional[str] = Form(None),
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create new setting"""
    existing = db.query(SystemSettings).filter(SystemSettings.key == key).first()
    if existing:
        raise HTTPException(status_code=400, detail="Setting with this key already exists")
    
    setting = SystemSettings(
        key=key,
        value=value,
        description=description,
        updated_by=current_user.id
    )
    db.add(setting)
    db.commit()
    db.refresh(setting)
    return setting

@app.put("/admin/settings/{setting_id}")
async def admin_update_setting(
    setting_id: int,
    value: str = Form(...),
    description: Optional[str] = Form(None),
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update setting"""
    setting = db.query(SystemSettings).filter(SystemSettings.id == setting_id).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    
    setting.value = value
    if description is not None:
        setting.description = description
    setting.updated_by = current_user.id
    setting.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(setting)
    return setting

@app.delete("/admin/settings/{setting_id}")
async def admin_delete_setting(
    setting_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete setting"""
    setting = db.query(SystemSettings).filter(SystemSettings.id == setting_id).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    
    db.delete(setting)
    db.commit()
    return {"message": "Setting deleted successfully"}

# ===============================
# COURSE ENROLLMENT ENDPOINTS
# ===============================

@app.post("/api/enrollments", response_model=schemas.CourseEnrollmentResponse)
async def enroll_in_course(
    enrollment: schemas.CourseEnrollmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Enroll user in a course"""
    course = crud.get_course_by_id(db, enrollment.course_id)
    if not course or course.status != schemas.CourseStatus.PUBLISHED:
        raise HTTPException(status_code=404, detail="Course not found or not available")
    
    try:
        db_enrollment = crud.create_enrollment(db, enrollment.course_id, current_user.id)
        return db_enrollment
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/enrollments", response_model=List[schemas.CourseEnrollmentResponse])
async def get_user_enrollments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all enrollments for current user"""
    return crud.get_user_enrollments(db, current_user.id)

@app.get("/api/courses/{course_id}/check-enrollment")
async def check_enrollment(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Check if user is enrolled in course"""
    enrollment = crud.get_enrollment(db, course_id, current_user.id)
    return {
        "enrolled": enrollment is not None,
        "enrollment": enrollment if enrollment else None
    }

@app.get("/api/enrollments/course/{course_id}")
async def get_enrollment_by_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get enrollment for a specific course"""
    enrollment = crud.get_enrollment(db, course_id, current_user.id)
    if not enrollment:
        raise HTTPException(status_code=404, detail="Not enrolled in this course")
    return enrollment

@app.get("/api/enrollments/my-courses")
async def get_my_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all enrolled courses with details for current user"""
    enrollments = db.query(CourseEnrollment).filter(
        CourseEnrollment.student_id == current_user.id
    ).all()
    
    result = []
    for enrollment in enrollments:
        course = crud.get_course_by_id(db, enrollment.course_id)
        if course:
            # Safely derive instructor name (Course has instructor_id and relationship 'instructor')
            instructor_name = None
            try:
                if getattr(course, "instructor", None):
                    first = getattr(course.instructor, "first_name", "") or ""
                    last = getattr(course.instructor, "last_name", "") or ""
                    full = f"{first} {last}".strip()
                    instructor_name = full if full else None
            except Exception:
                instructor_name = None

            result.append({
                "id": enrollment.id,
                "course_id": enrollment.course_id,
                "enrolled_at": enrollment.enrolled_at.isoformat() if enrollment.enrolled_at else None,
                "progress": enrollment.progress_percentage or 0,
                "last_accessed": enrollment.last_accessed_at.isoformat() if enrollment.last_accessed_at else None,
                "completed": enrollment.completed or False,
                "course": {
                    "id": course.id,
                    "title": course.title,
                    "description": course.description,
                    "image_url": course.image_url,
                    "level": course.level,
                    "duration": course.duration,
                    "instructor_name": instructor_name,
                    "lessons": [{"id": l.id, "title": l.title, "is_free": l.is_free} for l in course.lessons] if course.lessons else []
                }
            })
    
    return result

# ===============================
# LESSON PROGRESS ENDPOINTS
# ===============================

@app.post("/api/progress", response_model=schemas.LessonProgressResponse)
async def update_lesson_progress(
    lesson_id: int = Form(...),
    enrollment_id: int = Form(...),
    current_time: int = Form(0),
    completed: bool = Form(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update or create lesson progress"""
    enrollment = db.query(CourseEnrollment).filter(
        CourseEnrollment.id == enrollment_id,
        CourseEnrollment.student_id == current_user.id
    ).first()
    
    if not enrollment:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    progress = crud.create_or_update_lesson_progress(
        db, lesson_id, enrollment_id, current_time, completed
    )
    
    all_progress = crud.get_enrollment_progress(db, enrollment_id)
    if all_progress:
        completed_lessons = sum(1 for p in all_progress if p.completed)
        total_lessons = len(enrollment.course.lessons)
        if total_lessons > 0:
            progress_percentage = (completed_lessons / total_lessons) * 100
            crud.update_enrollment_progress(db, enrollment_id, progress_percentage)
    
    return progress

@app.get("/api/lessons/{lesson_id}/progress")
async def get_lesson_progress_api(
    lesson_id: int,
    enrollment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get progress for a specific lesson"""
    enrollment = db.query(CourseEnrollment).filter(
        CourseEnrollment.id == enrollment_id,
        CourseEnrollment.student_id == current_user.id
    ).first()
    
    if not enrollment:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    progress = crud.get_lesson_progress(db, lesson_id, enrollment_id)
    return progress if progress else {"current_time": 0, "completed": False}

# ===============================
# COURSE QUESTION/DOUBT ENDPOINTS
# ===============================

@app.post("/api/questions", response_model=schemas.CourseQuestionResponse)
async def create_question(
    question: schemas.CourseQuestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new question for a lesson"""
    lesson = db.query(CourseLesson).filter(CourseLesson.id == question.lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    enrollment = crud.get_enrollment(db, lesson.course_id, current_user.id)
    if not enrollment:
        raise HTTPException(status_code=403, detail="You must be enrolled to ask questions")
    
    return crud.create_course_question(db, question, current_user.id)

@app.get("/api/lessons/{lesson_id}/questions", response_model=List[schemas.CourseQuestionResponse])
async def get_lesson_questions_api(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all questions for a lesson"""
    questions = crud.get_lesson_questions(db, lesson_id)
    result = []
    for question in questions:
        replies = crud.get_question_replies(db, question.id)
        result.append(schemas.CourseQuestionResponse(
            **question.__dict__,
            replies_count=len(replies),
            replies=[schemas.QuestionReplyResponse(**reply.__dict__) for reply in replies]
        ))
    return result

@app.post("/api/questions/{question_id}/replies", response_model=schemas.QuestionReplyResponse)
async def create_reply_api(
    question_id: int,
    content: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Reply to a question"""
    question = crud.get_question_by_id(db, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    lesson = db.query(CourseLesson).filter(CourseLesson.id == question.lesson_id).first()
    is_instructor = (lesson and lesson.course.instructor_id == current_user.id) or current_user.role == schemas.UserRole.ADMIN
    
    reply = schemas.QuestionReplyCreate(question_id=question_id, content=content)
    return crud.create_question_reply(db, reply, current_user.id, is_instructor)

@app.get("/api/lessons/{lesson_id}/video-stream")
async def stream_lesson_video(
    lesson_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Stream lesson video with range support"""
    lesson = db.query(CourseLesson).filter(CourseLesson.id == lesson_id).first()
    if not lesson or not lesson.video_url:
        raise HTTPException(status_code=404, detail="Video not found")
    
    if not lesson.is_free:
        enrollment = crud.get_enrollment(db, lesson.course_id, current_user.id)
        if not enrollment:
            raise HTTPException(status_code=403, detail="You must be enrolled to access this video")
    
    video_path = Path(lesson.video_url)
    if not video_path.exists():
        raise HTTPException(status_code=404, detail="Video file not found")
    
    file_size = video_path.stat().st_size
    range_header = request.headers.get("range")
    
    if range_header:
        range_match = range_header.replace("bytes=", "").split("-")
        start = int(range_match[0]) if range_match[0] else 0
        end = int(range_match[1]) if range_match[1] else file_size - 1
        
        with open(video_path, "rb") as video:
            video.seek(start)
            data = video.read(end - start + 1)
        
        headers = {
            "Content-Range": f"bytes {start}-{end}/{file_size}",
            "Accept-Ranges": "bytes",
            "Content-Length": str(len(data)),
            "Content-Type": "video/mp4",
        }
        return Response(content=data, status_code=206, headers=headers)
    
    return FileResponse(video_path, media_type="video/mp4")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
