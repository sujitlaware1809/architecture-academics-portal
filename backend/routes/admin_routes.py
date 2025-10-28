from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional, List
from pathlib import Path
from datetime import datetime
import shutil

import crud
import schemas
from database import get_db, User, Job, Event, Workshop, Course, SystemSettings, EventRegistration, WorkshopRegistration, CourseLesson
from routes.auth_routes import get_current_admin
from aws_s3 import s3_manager

router = APIRouter(prefix="/api/admin", tags=["Admin"])

# File upload utilities
UPLOAD_DIR = Path("uploads")
VIDEO_DIR = UPLOAD_DIR / "videos"
MATERIAL_DIR = UPLOAD_DIR / "materials"
VIDEO_DIR.mkdir(exist_ok=True)
MATERIAL_DIR.mkdir(exist_ok=True)

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

# Dashboard Stats
@router.get("/stats")
async def get_admin_dashboard_stats(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get admin dashboard statistics"""
    return crud.get_admin_stats(db)

# ==================== JOB MANAGEMENT ====================

@router.get("/jobs", response_model=List[schemas.JobResponse])
async def get_admin_jobs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Get all jobs for admin management"""
    jobs = crud.get_all_jobs(db, skip=skip, limit=limit)
    return jobs

@router.post("/jobs", response_model=schemas.JobResponse)
async def admin_create_job(
    job: dict,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Create a new job posting (admin). Accepts UI payload and maps to schema; force currency INR."""
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
        jt = jt_map.get(str(payload.get('job_type', '')).lower(), schemas.JobType.FULL_TIME)
        el = el_map.get(str(payload.get('experience_level', '')).lower(), schemas.ExperienceLevel.MID_LEVEL)
        
        # Salary parsing: try to extract min/max numbers from string
        import re
        salary_range = str(payload.get('salary_range') or '')
        nums = [float(x.replace(',', '')) for x in re.findall(r"[0-9][0-9,]*", salary_range)]
        salary_min = nums[0] if len(nums) >= 1 else None
        salary_max = nums[1] if len(nums) >= 2 else None
        
        # Status mapping
        st_map = {
            'active': schemas.JobStatus.PUBLISHED,
            'closed': schemas.JobStatus.CLOSED,
            'draft': schemas.JobStatus.DRAFT,
        }
        status = st_map.get(str(payload.get('status', '')).lower(), schemas.JobStatus.PUBLISHED)
        
        # Deadline mapping
        application_deadline = None
        cd = payload.get('closing_date')
        if cd:
            try:
                application_deadline = datetime.fromisoformat(cd)
            except Exception:
                try:
                    application_deadline = datetime.strptime(cd, '%Y-%m-%d')
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

@router.put("/jobs/{job_id}", response_model=schemas.JobResponse)
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
            try:
                update_kwargs['application_deadline'] = datetime.fromisoformat(payload['closing_date'])
            except Exception:
                try:
                    update_kwargs['application_deadline'] = datetime.strptime(payload['closing_date'], '%Y-%m-%d')
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

@router.delete("/jobs/{job_id}")
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

@router.get("/jobs/{job_id}/applications", response_model=List[schemas.JobApplicationResponse])
async def admin_get_job_applications(
    job_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Admin: List applications for a specific job"""
    return crud.get_job_applications_admin(db, job_id, skip, limit)

@router.get("/jobs/applications", response_model=List[schemas.JobApplicationResponse])
async def admin_get_all_applications(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Admin: List all job applications across all jobs"""
    return crud.get_all_applications_admin(db, skip, limit)

# ==================== COURSE MANAGEMENT ====================

@router.get("/courses", response_model=List[schemas.CourseResponse])
async def get_admin_courses(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Get all courses for admin management"""
    courses = crud.get_courses(db, skip=skip, limit=limit)
    return courses

@router.post("/courses", response_model=schemas.CourseResponse)
async def create_admin_course(
    course: schemas.CourseCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Create a new course"""
    return crud.create_course(db, course)

@router.get("/courses/{course_id}", response_model=schemas.CourseDetailResponse)
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

@router.put("/courses/{course_id}", response_model=schemas.CourseResponse)
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

@router.delete("/courses/{course_id}")
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

# Course Lessons Management
@router.get("/courses/{course_id}/lessons", response_model=List[schemas.CourseLessonResponse])
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

@router.post("/courses/{course_id}/lessons", response_model=schemas.CourseLessonResponse)
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

@router.put("/lessons/{lesson_id}", response_model=schemas.CourseLessonResponse)
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

@router.delete("/lessons/{lesson_id}")
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

# ==================== USER MANAGEMENT ====================

@router.get("/users", response_model=List[schemas.UserResponse])
async def get_admin_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Get all users for admin management"""
    users = crud.get_all_users(db, skip=skip, limit=limit)
    return users

@router.post("/users", response_model=schemas.UserResponse)
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

@router.get("/users/{user_id}", response_model=schemas.UserResponse)
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

@router.put("/users/{user_id}", response_model=schemas.UserResponse)
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

@router.delete("/users/{user_id}")
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

# ==================== EVENTS MANAGEMENT ====================

@router.get("/events", response_model=List[schemas.EventResponse])
async def admin_get_all_events(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all events for admin"""
    return crud.get_events(db, skip=skip, limit=limit, status=status)

@router.post("/events", response_model=schemas.EventResponse)
async def admin_create_event(
    event: schemas.EventCreate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create new event"""
    return crud.create_event(db, event, organizer_id=current_user.id)

@router.get("/events/{event_id}", response_model=schemas.EventResponse)
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

@router.put("/events/{event_id}", response_model=schemas.EventResponse)
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

@router.delete("/events/{event_id}")
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

@router.get("/events/{event_id}/registrations")
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

# ==================== WORKSHOPS MANAGEMENT ====================

@router.get("/workshops", response_model=List[schemas.WorkshopResponse])
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

@router.post("/workshops", response_model=schemas.WorkshopResponse)
async def admin_create_workshop(
    workshop: schemas.WorkshopCreate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create new workshop"""
    return crud.create_workshop(db, workshop, instructor_id=current_user.id)

@router.get("/workshops/{workshop_id}", response_model=schemas.WorkshopResponse)
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

@router.put("/workshops/{workshop_id}", response_model=schemas.WorkshopResponse)
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

@router.delete("/workshops/{workshop_id}")
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

@router.get("/workshops/{workshop_id}/registrations")
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

# ==================== SYSTEM SETTINGS ====================

@router.get("/settings")
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

@router.put("/settings")
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

@router.post("/backup")
async def create_admin_backup(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Create database backup"""
    # This is a placeholder - implement actual backup logic
    import shutil
    import os
    
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

# Admin polling endpoint for new job application events  
@router.get("/jobs/applications/events")
async def get_application_events(
    since: Optional[str] = Query(None, description="ISO timestamp to fetch events after"),
    limit: int = Query(50, ge=1, le=200),
    current_admin: User = Depends(get_current_admin)
):
    """Return recent job application events since the provided ISO timestamp (for polling)."""
    from routes.job_routes import APPLICATION_EVENTS
    
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