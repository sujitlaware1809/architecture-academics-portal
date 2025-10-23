from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from database import User, Job, JobApplication, SavedJob, Course, CourseEnrollment, Workshop, WorkshopRegistration, Event, EventRegistration, SystemSettings, CourseLesson, CourseMaterial, LessonProgress
import schemas
from auth import get_password_hash, verify_password
from typing import Optional, List
from datetime import datetime

# User CRUD operations
def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get user by email"""
    return db.query(User).filter(User.email == email).first()

def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """Get user by ID"""
    return db.query(User).filter(User.id == user_id).first()

def create_user(db: Session, user: schemas.UserCreate) -> User:
    """Create a new user"""
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        hashed_password=hashed_password,
        role=user.role if hasattr(user, 'role') else schemas.UserRole.USER
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Authenticate user with email and password"""
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

def update_user_profile(db: Session, user_id: int, profile_data: schemas.UserProfileUpdate) -> Optional[User]:
    """Update user profile"""
    user = get_user_by_id(db, user_id)
    if not user:
        return None
    
    # Update profile fields
    for field, value in profile_data.dict(exclude_unset=True).items():
        setattr(user, field, value)
    
    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return user

def get_all_users(db: Session, skip: int = 0, limit: int = 100):
    """Get all users (for admin purposes)"""
    return db.query(User).offset(skip).limit(limit).all()

# Job CRUD operations
def create_job(db: Session, job: schemas.JobCreate, recruiter_id: int):
    db_job = Job(
        **job.dict(),
        recruiter_id=recruiter_id
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

def get_job(db: Session, job_id: int):
    return db.query(Job).filter(Job.id == job_id).first()

def get_jobs(
    db: Session, 
    search: Optional[str] = None,
    job_type: Optional[str] = None,
    work_mode: Optional[str] = None,
    experience_level: Optional[str] = None,
    location: Optional[str] = None,
    min_salary: Optional[float] = None,
    max_salary: Optional[float] = None,
    skip: int = 0, 
    limit: int = 50
):
    query = db.query(Job).filter(Job.status == "published")
    
    if search:
        query = query.filter(
            or_(
                Job.title.contains(search),
                Job.company.contains(search),
                Job.description.contains(search),
                Job.tags.contains(search)
            )
        )
    
    if job_type:
        query = query.filter(Job.job_type == job_type)
    
    if work_mode:
        query = query.filter(Job.work_mode == work_mode)
    
    if experience_level:
        query = query.filter(Job.experience_level == experience_level)
    
    if location:
        query = query.filter(Job.location.contains(location))
    
    if min_salary:
        query = query.filter(Job.salary_min >= min_salary)
    
    if max_salary:
        query = query.filter(Job.salary_max <= max_salary)
    
    return query.offset(skip).limit(limit).all()

def get_recruiter_jobs(db: Session, recruiter_id: int, skip: int = 0, limit: int = 50):
    return db.query(Job).filter(Job.recruiter_id == recruiter_id).offset(skip).limit(limit).all()

def get_all_jobs(db: Session, skip: int = 0, limit: int = 100):
    """Get all jobs for admin management with pagination"""
    jobs = db.query(Job).order_by(Job.created_at.desc()).offset(skip).limit(limit).all()
    # Enrich with UI convenience fields
    for j in jobs:
        try:
            j.applications_count = len(j.applications)
            # salary_range formatted string if both present
            if j.salary_min is not None and j.salary_max is not None:
                j.salary_range = f"₹{int(float(j.salary_min)):,} - ₹{int(float(j.salary_max)):,}"
            elif j.salary_min is not None:
                j.salary_range = f"₹{int(float(j.salary_min)):,}+"
            elif j.salary_max is not None:
                j.salary_range = f"Up to ₹{int(float(j.salary_max)):,}"
            else:
                j.salary_range = "Not specified"
            j.closing_date = j.application_deadline
        except Exception:
            pass
    return jobs

def update_job(db: Session, job_id: int, job_update: schemas.JobUpdate, recruiter_id: int):
    db_job = db.query(Job).filter(
        and_(Job.id == job_id, Job.recruiter_id == recruiter_id)
    ).first()
    
    if not db_job:
        return None
    
    update_data = job_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_job, field, value)
    
    db_job.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_job)
    return db_job

def delete_job(db: Session, job_id: int, recruiter_id: int):
    db_job = db.query(Job).filter(
        and_(Job.id == job_id, Job.recruiter_id == recruiter_id)
    ).first()
    
    if not db_job:
        return None
    
    db.delete(db_job)
    db.commit()
    return db_job

def update_job_admin(db: Session, job_id: int, job_update: schemas.JobUpdate):
    """Update job without recruiter ownership constraints (admin only)"""
    db_job = db.query(Job).filter(Job.id == job_id).first()
    if not db_job:
        return None
    update_data = job_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_job, field, value)
    db_job.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_job)
    return db_job

def delete_job_admin(db: Session, job_id: int):
    """Delete job without recruiter ownership constraints (admin only)"""
    db_job = db.query(Job).filter(Job.id == job_id).first()
    if not db_job:
        return False
    db.delete(db_job)
    db.commit()
    return True

# Job Application CRUD operations
def create_job_application(db: Session, application: schemas.JobApplicationCreate, applicant_id: int):
    # Check if user already applied for this job
    existing_application = db.query(JobApplication).filter(
        and_(JobApplication.job_id == application.job_id, JobApplication.applicant_id == applicant_id)
    ).first()
    
    if existing_application:
        return None  # Already applied
    
    db_application = JobApplication(
        **application.dict(),
        applicant_id=applicant_id
    )
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    return db_application

def get_user_applications(db: Session, user_id: int, skip: int = 0, limit: int = 50):
    return db.query(JobApplication).filter(JobApplication.applicant_id == user_id).offset(skip).limit(limit).all()

def delete_application(db: Session, application_id: int, user_id: int):
    """Delete a job application"""
    db_application = db.query(JobApplication).filter(
        and_(JobApplication.id == application_id, JobApplication.applicant_id == user_id)
    ).first()
    
    if not db_application:
        return None
    
    db.delete(db_application)
    db.commit()
    return db_application

def get_job_applications(db: Session, job_id: int, recruiter_id: int, skip: int = 0, limit: int = 50):
    # Verify that the recruiter owns this job
    job = db.query(Job).filter(and_(Job.id == job_id, Job.recruiter_id == recruiter_id)).first()
    if not job:
        return []
    
    return db.query(JobApplication).filter(JobApplication.job_id == job_id).offset(skip).limit(limit).all()

def get_recruiter_applications(db: Session, recruiter_id: int, skip: int = 0, limit: int = 100):
    """Get all applications for jobs posted by a recruiter"""
    # Query applications for all jobs posted by the recruiter
    return db.query(JobApplication).join(Job, JobApplication.job_id == Job.id).filter(
        Job.recruiter_id == recruiter_id
    ).offset(skip).limit(limit).all()

def get_job_applications_admin(db: Session, job_id: int, skip: int = 0, limit: int = 50):
    """Admin: Get applications for a specific job (no ownership constraint)"""
    return db.query(JobApplication).filter(JobApplication.job_id == job_id).order_by(JobApplication.applied_at.desc()).offset(skip).limit(limit).all()

def get_all_applications_admin(db: Session, skip: int = 0, limit: int = 100):
    """Admin: Get all job applications across all jobs"""
    return db.query(JobApplication).order_by(JobApplication.applied_at.desc()).offset(skip).limit(limit).all()

def update_application_status(db: Session, application_id: int, status: str, recruiter_id: int):
    application = db.query(JobApplication).join(Job).filter(
        and_(JobApplication.id == application_id, Job.recruiter_id == recruiter_id)
    ).first()
    
    if not application:
        return None
    
    application.status = status
    application.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(application)
    return application

def add_application_message(db: Session, application_id: int, message: str, user_id: int, is_recruiter: bool):
    """Add a message to a job application"""
    # Find the application
    if is_recruiter:
        # Recruiter message - verify this is their job posting
        application = db.query(JobApplication).join(Job).filter(
            and_(JobApplication.id == application_id, Job.recruiter_id == user_id)
        ).first()
    else:
        # Applicant message - verify this is their application
        application = db.query(JobApplication).filter(
            and_(JobApplication.id == application_id, JobApplication.applicant_id == user_id)
        ).first()
    
    if not application:
        return None
    
    # Create message object
    new_message = {
        "user_id": user_id,
        "is_recruiter": is_recruiter,
        "message": message,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    # Get existing messages or initialize empty list
    messages = []
    if application.messages:
        import json
        try:
            messages = json.loads(application.messages)
        except:
            messages = []
    
    # Add new message
    messages.append(new_message)
    
    # Update application
    application.messages = json.dumps(messages)
    application.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(application)
    return application

# Saved Job CRUD operations
def save_job(db: Session, job_id: int, user_id: int):
    # Check if already saved
    existing_saved = db.query(SavedJob).filter(
        and_(SavedJob.job_id == job_id, SavedJob.user_id == user_id)
    ).first()
    
    if existing_saved:
        return existing_saved
    
    db_saved = SavedJob(job_id=job_id, user_id=user_id)
    db.add(db_saved)
    db.commit()
    db.refresh(db_saved)
    return db_saved

def unsave_job(db: Session, job_id: int, user_id: int):
    db_saved = db.query(SavedJob).filter(
        and_(SavedJob.job_id == job_id, SavedJob.user_id == user_id)
    ).first()
    
    if not db_saved:
        return None
    
    db.delete(db_saved)
    db.commit()
    return db_saved

def get_user_saved_jobs(db: Session, user_id: int, skip: int = 0, limit: int = 50):
    return db.query(SavedJob).filter(SavedJob.user_id == user_id).offset(skip).limit(limit).all()

# Create predefined recruiter account
def create_predefined_recruiter(db: Session):
    # Check if recruiter already exists
    existing_recruiter = get_user_by_email(db, "recruiter@architectureacademics.com")
    if existing_recruiter:
        return existing_recruiter
    
    recruiter_data = schemas.UserCreate(
        email="recruiter@architectureacademics.com",
        password="Recruiter@123",
        confirm_password="Recruiter@123",
        first_name="Architecture",
        last_name="Recruiter",
        role=schemas.UserRole.RECRUITER
    )
    
    recruiter = create_user(db, recruiter_data)
    
    # Update recruiter profile
    profile_data = schemas.UserProfileUpdate(
        company_name="Architecture Academics",
        company_website="https://architectureacademics.com",
        company_description="Leading architecture education and recruitment platform",
        location="Mumbai, India",
        phone="+91-9876543210"
    )
    
    update_user_profile(db, recruiter.id, profile_data)
    
    return recruiter

# Create predefined admin account
def create_predefined_admin(db: Session):
    # Check if admin already exists
    existing_admin = get_user_by_email(db, "admin@architectureacademics.com")
    if existing_admin:
        return existing_admin
    
    admin_data = schemas.UserCreate(
        email="admin@architectureacademics.com",
        password="Admin@123",
        confirm_password="Admin@123",
        first_name="System",
        last_name="Administrator",
        role=schemas.UserRole.ADMIN
    )
    
    admin = create_user(db, admin_data)
    
    # Update admin profile
    profile_data = schemas.UserProfileUpdate(
        company_name="Architecture Academics",
        location="Mumbai, India"
    )
    
    update_user_profile(db, admin.id, profile_data)
    
    return admin

# Course CRUD operations
def get_courses(db: Session, skip: int = 0, limit: int = 100, status: Optional[str] = None) -> List[Course]:
    """Get all courses with pagination and optional status filter"""
    query = db.query(Course)
    if status:
        query = query.filter(Course.status == status)
    courses = query.offset(skip).limit(limit).all()
    for course in courses:
        course.enrolled_count = db.query(CourseEnrollment).filter(CourseEnrollment.course_id == course.id).count()
    return courses

def get_published_courses(db: Session, skip: int = 0, limit: int = 100, level: str = None, search: str = None) -> List[Course]:
    """Get published courses for public viewing with optional filtering"""
    query = db.query(Course).filter(Course.status == schemas.CourseStatus.PUBLISHED)
    
    # Filter by level if provided
    if level:
        try:
            level_enum = schemas.CourseLevel(level)
            query = query.filter(Course.level == level_enum)
        except ValueError:
            pass  # Invalid level, ignore filter
    
    # Search filter
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Course.title.ilike(search_term),
                Course.description.ilike(search_term),
                Course.short_description.ilike(search_term)
            )
        )
    
    courses = query.offset(skip).limit(limit).all()
    
    # Add computed fields
    for course in courses:
        course.enrolled_count = db.query(CourseEnrollment).filter(CourseEnrollment.course_id == course.id).count()
        lessons = db.query(CourseLesson).filter(CourseLesson.course_id == course.id).all()
        course.total_lessons = len(lessons)
        course.total_duration = sum(lesson.video_duration or 0 for lesson in lessons)
        course.has_free_preview = any(lesson.is_free for lesson in lessons)
    
    return courses

def get_course_by_id(db: Session, course_id: int) -> Optional[Course]:
    """Get course by ID with lessons and materials"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if course:
        course.enrolled_count = db.query(CourseEnrollment).filter(CourseEnrollment.course_id == course.id).count()
        # Load lessons and materials
        course.lessons = db.query(CourseLesson).filter(CourseLesson.course_id == course.id).order_by(CourseLesson.order_index).all()
        course.materials = db.query(CourseMaterial).filter(CourseMaterial.course_id == course.id).order_by(CourseMaterial.order_index).all()
        course.total_lessons = len(course.lessons)
        course.total_duration = sum(lesson.video_duration or 0 for lesson in course.lessons)
    return course

def create_course(db: Session, course: schemas.CourseCreate) -> Course:
    """Create a new course"""
    course_data = course.dict()
    # Set status to PUBLISHED by default for new courses
    if 'status' not in course_data or course_data.get('status') is None:
        course_data['status'] = schemas.CourseStatus.PUBLISHED
    
    db_course = Course(**course_data)
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    db_course.enrolled_count = 0
    return db_course

def update_course(db: Session, course_id: int, course_update: schemas.CourseUpdate) -> Optional[Course]:
    """Update course"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        return None
    
    for field, value in course_update.dict(exclude_unset=True).items():
        setattr(course, field, value)
    
    db.commit()
    db.refresh(course)
    course.enrolled_count = db.query(CourseEnrollment).filter(CourseEnrollment.course_id == course.id).count()
    return course

def delete_course(db: Session, course_id: int) -> bool:
    """Delete course"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        return False
    
    # Delete enrollments first
    db.query(CourseEnrollment).filter(CourseEnrollment.course_id == course_id).delete()
    db.delete(course)
    db.commit()
    return True

# Workshop CRUD operations
def get_workshops(db: Session, skip: int = 0, limit: int = 100, status: Optional[str] = None) -> List[Workshop]:
    """Get all workshops with pagination and optional status filter"""
    query = db.query(Workshop)
    if status:
        query = query.filter(Workshop.status == status)
    workshops = query.offset(skip).limit(limit).all()
    for workshop in workshops:
        workshop.registered_count = db.query(WorkshopRegistration).filter(WorkshopRegistration.workshop_id == workshop.id).count()
    return workshops

def get_workshop_by_id(db: Session, workshop_id: int) -> Optional[Workshop]:
    """Get workshop by ID"""
    workshop = db.query(Workshop).filter(Workshop.id == workshop_id).first()
    if workshop:
        workshop.registered_count = db.query(WorkshopRegistration).filter(WorkshopRegistration.workshop_id == workshop.id).count()
    return workshop

def create_workshop(db: Session, workshop: schemas.WorkshopCreate) -> Workshop:
    """Create a new workshop"""
    db_workshop = Workshop(**workshop.dict())
    db.add(db_workshop)
    db.commit()
    db.refresh(db_workshop)
    db_workshop.registered_count = 0
    return db_workshop

def update_workshop(db: Session, workshop_id: int, workshop_update: schemas.WorkshopUpdate) -> Optional[Workshop]:
    """Update workshop"""
    workshop = db.query(Workshop).filter(Workshop.id == workshop_id).first()
    if not workshop:
        return None
    
    for field, value in workshop_update.dict(exclude_unset=True).items():
        setattr(workshop, field, value)
    
    db.commit()
    db.refresh(workshop)
    workshop.registered_count = db.query(WorkshopRegistration).filter(WorkshopRegistration.workshop_id == workshop.id).count()
    return workshop

def delete_workshop(db: Session, workshop_id: int) -> bool:
    """Delete workshop"""
    workshop = db.query(Workshop).filter(Workshop.id == workshop_id).first()
    if not workshop:
        return False
    
    # Delete registrations first
    db.query(WorkshopRegistration).filter(WorkshopRegistration.workshop_id == workshop_id).delete()
    db.delete(workshop)
    db.commit()
    return True

# System Settings CRUD operations
def get_system_setting(db: Session, key: str) -> Optional[SystemSettings]:
    """Get system setting by key"""
    return db.query(SystemSettings).filter(SystemSettings.key == key).first()

def get_all_system_settings(db: Session) -> List[SystemSettings]:
    """Get all system settings"""
    return db.query(SystemSettings).all()

def create_or_update_system_setting(db: Session, key: str, value: str, description: str = None, updated_by: int = None) -> SystemSettings:
    """Create or update system setting"""
    setting = db.query(SystemSettings).filter(SystemSettings.key == key).first()
    
    if setting:
        setting.value = value
        if description is not None:
            setting.description = description
        setting.updated_by = updated_by
        setting.updated_at = datetime.utcnow()
    else:
        setting = SystemSettings(
            key=key,
            value=value,
            description=description,
            updated_by=updated_by
        )
        db.add(setting)
    
    db.commit()
    db.refresh(setting)
    return setting

def delete_system_setting(db: Session, key: str) -> bool:
    """Delete system setting"""
    setting = db.query(SystemSettings).filter(SystemSettings.key == key).first()
    if not setting:
        return False
    
    db.delete(setting)
    db.commit()
    return True

# Admin User Management CRUD operations
def get_all_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
    """Get all users for admin management"""
    return db.query(User).offset(skip).limit(limit).all()

def create_admin_user(db: Session, user: schemas.AdminUserCreate) -> User:
    """Create user by admin"""
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        hashed_password=hashed_password,
        role=user.role,
        is_active=user.is_active,
        is_verified=user.is_verified
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_admin_user(db: Session, user_id: int, user_update: schemas.AdminUserUpdate) -> Optional[User]:
    """Update user by admin"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    
    for field, value in user_update.dict(exclude_unset=True).items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    return user

def delete_admin_user(db: Session, user_id: int) -> bool:
    """Delete user by admin"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return False
    
    # Delete related records first
    db.query(JobApplication).filter(JobApplication.applicant_id == user_id).delete()
    db.query(SavedJob).filter(SavedJob.user_id == user_id).delete()
    db.query(CourseEnrollment).filter(CourseEnrollment.student_id == user_id).delete()
    db.query(WorkshopRegistration).filter(WorkshopRegistration.participant_id == user_id).delete()
    
    # Update foreign key references to null where possible
    db.query(Job).filter(Job.recruiter_id == user_id).update({Job.recruiter_id: None})
    db.query(Course).filter(Course.instructor_id == user_id).update({Course.instructor_id: None})
    db.query(Workshop).filter(Workshop.instructor_id == user_id).update({Workshop.instructor_id: None})
    
    db.delete(user)
    db.commit()
    return True

# Course Lesson CRUD operations
def get_course_lessons(db: Session, course_id: int) -> List[CourseLesson]:
    """Get all lessons for a course"""
    return db.query(CourseLesson).filter(CourseLesson.course_id == course_id).order_by(CourseLesson.order_index).all()

def get_lesson_by_id(db: Session, lesson_id: int) -> Optional[CourseLesson]:
    """Get lesson by ID"""
    return db.query(CourseLesson).filter(CourseLesson.id == lesson_id).first()

def create_course_lesson(db: Session, lesson: schemas.CourseLessonCreate, video_url: str = None) -> CourseLesson:
    """Create a new course lesson"""
    lesson_data = lesson.dict()
    if video_url:
        lesson_data["video_url"] = video_url
    
    db_lesson = CourseLesson(**lesson_data)
    db.add(db_lesson)
    db.commit()
    db.refresh(db_lesson)
    return db_lesson

def update_course_lesson(db: Session, lesson_id: int, lesson_update: schemas.CourseLessonUpdate, video_url: str = None) -> Optional[CourseLesson]:
    """Update course lesson"""
    lesson = db.query(CourseLesson).filter(CourseLesson.id == lesson_id).first()
    if not lesson:
        return None
    
    for field, value in lesson_update.dict(exclude_unset=True).items():
        setattr(lesson, field, value)
    
    if video_url is not None:
        lesson.video_url = video_url
    
    db.commit()
    db.refresh(lesson)
    return lesson

def delete_course_lesson(db: Session, lesson_id: int) -> bool:
    """Delete course lesson"""
    lesson = db.query(CourseLesson).filter(CourseLesson.id == lesson_id).first()
    if not lesson:
        return False
    
    # Delete progress records first
    db.query(LessonProgress).filter(LessonProgress.lesson_id == lesson_id).delete()
    db.delete(lesson)
    db.commit()
    return True

def reorder_course_lessons(db: Session, course_id: int, lesson_orders: List[dict]) -> bool:
    """Reorder course lessons"""
    try:
        for order_data in lesson_orders:
            lesson_id = order_data.get("lesson_id")
            new_order = order_data.get("order_index")
            
            lesson = db.query(CourseLesson).filter(
                CourseLesson.id == lesson_id,
                CourseLesson.course_id == course_id
            ).first()
            
            if lesson:
                lesson.order_index = new_order
        
        db.commit()
        return True
    except Exception:
        db.rollback()
        return False

def get_course_lesson_by_id(db: Session, lesson_id: int) -> Optional[CourseLesson]:
    """Get course lesson by ID"""
    return db.query(CourseLesson).filter(CourseLesson.id == lesson_id).first()

def update_course_lesson_video_url(db: Session, lesson_id: int, video_url: str) -> Optional[CourseLesson]:
    """Update lesson's video URL (for S3 uploads)"""
    lesson = get_course_lesson_by_id(db, lesson_id)
    if lesson:
        lesson.video_url = video_url
        lesson.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(lesson)
    return lesson

# Course Material CRUD operations
def get_course_materials(db: Session, course_id: int) -> List[CourseMaterial]:
    """Get all materials for a course"""
    return db.query(CourseMaterial).filter(CourseMaterial.course_id == course_id).order_by(CourseMaterial.order_index).all()

def get_material_by_id(db: Session, material_id: int) -> Optional[CourseMaterial]:
    """Get material by ID"""
    return db.query(CourseMaterial).filter(CourseMaterial.id == material_id).first()

def create_course_material(db: Session, material: schemas.CourseMaterialCreate, file_url: str) -> CourseMaterial:
    """Create a new course material"""
    material_data = material.dict()
    material_data["file_url"] = file_url
    
    db_material = CourseMaterial(**material_data)
    db.add(db_material)
    db.commit()
    db.refresh(db_material)
    return db_material

def update_course_material(db: Session, material_id: int, material_update: schemas.CourseMaterialUpdate) -> Optional[CourseMaterial]:
    """Update course material"""
    material = db.query(CourseMaterial).filter(CourseMaterial.id == material_id).first()
    if not material:
        return None
    
    for field, value in material_update.dict(exclude_unset=True).items():
        setattr(material, field, value)
    
    db.commit()
    db.refresh(material)
    return material

def delete_course_material(db: Session, material_id: int) -> bool:
    """Delete course material"""
    material = db.query(CourseMaterial).filter(CourseMaterial.id == material_id).first()
    if not material:
        return False
    
    db.delete(material)
    db.commit()
    return True

# Blog CRUD operations
def create_blog(db: Session, blog: schemas.BlogCreate, author_id: int):
    """Create a new blog post"""
    from database import Blog
    import re
    
    # Generate slug from title
    slug = re.sub(r'[^a-z0-9]+', '-', blog.title.lower()).strip('-')
    # Ensure unique slug
    base_slug = slug
    counter = 1
    while db.query(Blog).filter(Blog.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1
    
    db_blog = Blog(
        **blog.dict(),
        slug=slug,
        author_id=author_id
    )
    db.add(db_blog)
    db.commit()
    db.refresh(db_blog)
    return db_blog

def get_blogs(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    search: Optional[str] = None,
    category: Optional[schemas.BlogCategory] = None,
    author_id: Optional[int] = None,
    is_featured: Optional[bool] = None,
    status: Optional[schemas.BlogStatus] = None
):
    """Get blogs with filters"""
    from database import Blog
    
    query = db.query(Blog)
    
    # Apply filters
    if search:
        query = query.filter(
            or_(
                Blog.title.contains(search),
                Blog.content.contains(search),
                Blog.tags.contains(search)
            )
        )
    
    if category:
        query = query.filter(Blog.category == category)
    
    if author_id:
        query = query.filter(Blog.author_id == author_id)
    
    if is_featured is not None:
        query = query.filter(Blog.is_featured == is_featured)
    
    if status:
        query = query.filter(Blog.status == status)
    else:
        # Default to published blogs only
        query = query.filter(Blog.status == schemas.BlogStatus.PUBLISHED)
    
    # Order by created_at descending (newest first)
    query = query.order_by(Blog.created_at.desc())
    
    return query.offset(skip).limit(limit).all()

def get_blog_by_id(db: Session, blog_id: int):
    """Get blog by ID"""
    from database import Blog
    return db.query(Blog).filter(Blog.id == blog_id).first()

def get_blog_by_slug(db: Session, slug: str):
    """Get blog by slug"""
    from database import Blog
    return db.query(Blog).filter(Blog.slug == slug).first()

def update_blog(db: Session, blog_id: int, blog_update: schemas.BlogUpdate):
    """Update blog"""
    from database import Blog
    
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        return None
    
    # Update fields
    for field, value in blog_update.dict(exclude_unset=True).items():
        setattr(blog, field, value)
    
    blog.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(blog)
    return blog

def delete_blog(db: Session, blog_id: int) -> bool:
    """Delete blog"""
    from database import Blog
    
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        return False
    
    db.delete(blog)
    db.commit()
    return True

def increment_blog_views(db: Session, blog_id: int):
    """Increment blog view count"""
    from database import Blog
    
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if blog:
        blog.views_count += 1
        db.commit()
        db.refresh(blog)
    return blog

# Blog Comment CRUD operations
def create_blog_comment(db: Session, comment: schemas.BlogCommentCreate, author_id: int):
    """Create a new blog comment"""
    from database import BlogComment, Blog
    
    db_comment = BlogComment(
        **comment.dict(),
        author_id=author_id
    )
    db.add(db_comment)
    
    # Increment comment count on blog
    blog = db.query(Blog).filter(Blog.id == comment.blog_id).first()
    if blog:
        blog.comments_count += 1
    
    db.commit()
    db.refresh(db_comment)
    return db_comment

def get_blog_comments(db: Session, blog_id: int):
    """Get all comments for a blog"""
    from database import BlogComment
    
    # Get only top-level comments (no parent)
    return db.query(BlogComment).filter(
        and_(
            BlogComment.blog_id == blog_id,
            BlogComment.parent_id == None
        )
    ).order_by(BlogComment.created_at.desc()).all()

def get_comment_by_id(db: Session, comment_id: int):
    """Get comment by ID"""
    from database import BlogComment
    return db.query(BlogComment).filter(BlogComment.id == comment_id).first()

def update_blog_comment(db: Session, comment_id: int, comment_update: schemas.BlogCommentUpdate):
    """Update blog comment"""
    from database import BlogComment
    
    comment = db.query(BlogComment).filter(BlogComment.id == comment_id).first()
    if not comment:
        return None
    
    comment.content = comment_update.content
    comment.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(comment)
    return comment

def delete_blog_comment(db: Session, comment_id: int) -> bool:
    """Delete blog comment"""
    from database import BlogComment, Blog
    
    comment = db.query(BlogComment).filter(BlogComment.id == comment_id).first()
    if not comment:
        return False
    
    # Decrement comment count on blog
    blog = db.query(Blog).filter(Blog.id == comment.blog_id).first()
    if blog:
        blog.comments_count = max(0, blog.comments_count - 1)
    
    db.delete(comment)
    db.commit()
    return True

# Blog Like CRUD operations
def toggle_blog_like(db: Session, blog_id: int, user_id: int):
    """Toggle like on a blog post"""
    from database import BlogLike, Blog
    
    # Check if already liked
    existing_like = db.query(BlogLike).filter(
        and_(
            BlogLike.blog_id == blog_id,
            BlogLike.user_id == user_id
        )
    ).first()
    
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        return None
    
    if existing_like:
        # Unlike
        db.delete(existing_like)
        blog.likes_count = max(0, blog.likes_count - 1)
        db.commit()
        return {"liked": False, "likes_count": blog.likes_count}
    else:
        # Like
        new_like = BlogLike(blog_id=blog_id, user_id=user_id)
        db.add(new_like)
        blog.likes_count += 1
        db.commit()
        return {"liked": True, "likes_count": blog.likes_count}

def toggle_comment_like(db: Session, comment_id: int, user_id: int):
    """Toggle like on a comment"""
    from database import CommentLike, BlogComment
    
    # Check if already liked
    existing_like = db.query(CommentLike).filter(
        and_(
            CommentLike.comment_id == comment_id,
            CommentLike.user_id == user_id
        )
    ).first()
    
    comment = db.query(BlogComment).filter(BlogComment.id == comment_id).first()
    if not comment:
        return None
    
    if existing_like:
        # Unlike
        db.delete(existing_like)
        comment.likes_count = max(0, comment.likes_count - 1)
        db.commit()
        return {"liked": False, "likes_count": comment.likes_count}
    else:
        # Like
        new_like = CommentLike(comment_id=comment_id, user_id=user_id)
        db.add(new_like)
        comment.likes_count += 1
        db.commit()
        return {"liked": True, "likes_count": comment.likes_count}

def check_user_liked_blog(db: Session, blog_id: int, user_id: int) -> bool:
    """Check if user has liked a blog"""
    from database import BlogLike
    
    like = db.query(BlogLike).filter(
        and_(
            BlogLike.blog_id == blog_id,
            BlogLike.user_id == user_id
        )
    ).first()
    
    return like is not None

def check_user_liked_comment(db: Session, comment_id: int, user_id: int) -> bool:
    """Check if user has liked a comment"""
    from database import CommentLike
    
    like = db.query(CommentLike).filter(
        and_(
            CommentLike.comment_id == comment_id,
            CommentLike.user_id == user_id
        )
    ).first()
    
    return like is not None

# ============= Discussion Community CRUD Operations =============

def create_discussion(db: Session, discussion: schemas.DiscussionCreate, author_id: int):
    """Create a new discussion"""
    from database import Discussion
    
    db_discussion = Discussion(
        **discussion.dict(),
        author_id=author_id
    )
    db.add(db_discussion)
    db.commit()
    db.refresh(db_discussion)
    return db_discussion

def get_discussions(
    db: Session,
    search: Optional[str] = None,
    category: Optional[str] = None,
    author_id: Optional[int] = None,
    is_solved: Optional[bool] = None,
    is_pinned: Optional[bool] = None,
    skip: int = 0,
    limit: int = 20
):
    """Get discussions with optional filters"""
    from database import Discussion
    
    query = db.query(Discussion)
    
    # Apply filters
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Discussion.title.ilike(search_term),
                Discussion.content.ilike(search_term),
                Discussion.tags.ilike(search_term)
            )
        )
    
    if category:
        query = query.filter(Discussion.category == category)
    
    if author_id:
        query = query.filter(Discussion.author_id == author_id)
    
    if is_solved is not None:
        query = query.filter(Discussion.is_solved == is_solved)
    
    if is_pinned is not None:
        query = query.filter(Discussion.is_pinned == is_pinned)
    
    # Order by pinned first, then by creation date
    query = query.order_by(Discussion.is_pinned.desc(), Discussion.created_at.desc())
    
    return query.offset(skip).limit(limit).all()

def get_discussion(db: Session, discussion_id: int):
    """Get a single discussion by ID"""
    from database import Discussion
    
    return db.query(Discussion).filter(Discussion.id == discussion_id).first()

def update_discussion(db: Session, discussion_id: int, discussion: schemas.DiscussionUpdate):
    """Update a discussion"""
    from database import Discussion
    
    db_discussion = db.query(Discussion).filter(Discussion.id == discussion_id).first()
    if not db_discussion:
        return None
    
    update_data = discussion.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_discussion, key, value)
    
    db.commit()
    db.refresh(db_discussion)
    return db_discussion

def delete_discussion(db: Session, discussion_id: int):
    """Delete a discussion"""
    from database import Discussion
    
    db_discussion = db.query(Discussion).filter(Discussion.id == discussion_id).first()
    if not db_discussion:
        return False
    
    db.delete(db_discussion)
    db.commit()
    return True

def increment_discussion_views(db: Session, discussion_id: int):
    """Increment view count for a discussion"""
    from database import Discussion
    
    discussion = db.query(Discussion).filter(Discussion.id == discussion_id).first()
    if discussion:
        discussion.views_count += 1
        db.commit()
        return discussion
    return None

# Discussion Reply CRUD
def create_discussion_reply(db: Session, reply: schemas.DiscussionReplyCreate, author_id: int):
    """Create a new reply to a discussion"""
    from database import DiscussionReply, Discussion
    
    db_reply = DiscussionReply(
        content=reply.content,
        discussion_id=reply.discussion_id,
        parent_id=reply.parent_id,
        author_id=author_id
    )
    db.add(db_reply)
    
    # Increment discussion reply count
    discussion = db.query(Discussion).filter(Discussion.id == reply.discussion_id).first()
    if discussion:
        discussion.replies_count += 1
    
    db.commit()
    db.refresh(db_reply)
    return db_reply

def get_discussion_replies(db: Session, discussion_id: int):
    """Get all replies for a discussion (top-level only)"""
    from database import DiscussionReply
    
    return db.query(DiscussionReply).filter(
        and_(
            DiscussionReply.discussion_id == discussion_id,
            DiscussionReply.parent_id == None
        )
    ).order_by(DiscussionReply.created_at.asc()).all()

def update_discussion_reply(db: Session, reply_id: int, reply: schemas.DiscussionReplyUpdate):
    """Update a discussion reply"""
    from database import DiscussionReply
    
    db_reply = db.query(DiscussionReply).filter(DiscussionReply.id == reply_id).first()
    if not db_reply:
        return None
    
    db_reply.content = reply.content
    db.commit()
    db.refresh(db_reply)
    return db_reply

def delete_discussion_reply(db: Session, reply_id: int):
    """Delete a discussion reply"""
    from database import DiscussionReply, Discussion
    
    db_reply = db.query(DiscussionReply).filter(DiscussionReply.id == reply_id).first()
    if not db_reply:
        return False
    
    # Decrement discussion reply count
    discussion = db.query(Discussion).filter(Discussion.id == db_reply.discussion_id).first()
    if discussion:
        discussion.replies_count = max(0, discussion.replies_count - 1)
    
    db.delete(db_reply)
    db.commit()
    return True

def mark_reply_as_solution(db: Session, reply_id: int, discussion_id: int):
    """Mark a reply as the accepted solution"""
    from database import DiscussionReply, Discussion
    
    # Unmark any previous solutions
    previous_solutions = db.query(DiscussionReply).filter(
        and_(
            DiscussionReply.discussion_id == discussion_id,
            DiscussionReply.is_solution == True
        )
    ).all()
    
    for solution in previous_solutions:
        solution.is_solution = False
    
    # Mark new solution
    reply = db.query(DiscussionReply).filter(DiscussionReply.id == reply_id).first()
    if reply:
        reply.is_solution = True
        
        # Mark discussion as solved
        discussion = db.query(Discussion).filter(Discussion.id == discussion_id).first()
        if discussion:
            discussion.is_solved = True
        
        db.commit()
        return reply
    
    return None

# Discussion Like CRUD
def toggle_discussion_like(db: Session, discussion_id: int, user_id: int):
    """Toggle like on a discussion"""
    from database import DiscussionLike, Discussion
    
    # Check if already liked
    existing_like = db.query(DiscussionLike).filter(
        and_(
            DiscussionLike.discussion_id == discussion_id,
            DiscussionLike.user_id == user_id
        )
    ).first()
    
    discussion = db.query(Discussion).filter(Discussion.id == discussion_id).first()
    if not discussion:
        return None
    
    if existing_like:
        # Unlike
        db.delete(existing_like)
        discussion.likes_count = max(0, discussion.likes_count - 1)
        db.commit()
        return {"liked": False, "likes_count": discussion.likes_count}
    else:
        # Like
        new_like = DiscussionLike(discussion_id=discussion_id, user_id=user_id)
        db.add(new_like)
        discussion.likes_count += 1
        db.commit()
        return {"liked": True, "likes_count": discussion.likes_count}

def toggle_discussion_reply_like(db: Session, reply_id: int, user_id: int):
    """Toggle like on a discussion reply"""
    from database import DiscussionReplyLike, DiscussionReply
    
    # Check if already liked
    existing_like = db.query(DiscussionReplyLike).filter(
        and_(
            DiscussionReplyLike.reply_id == reply_id,
            DiscussionReplyLike.user_id == user_id
        )
    ).first()
    
    reply = db.query(DiscussionReply).filter(DiscussionReply.id == reply_id).first()
    if not reply:
        return None
    
    if existing_like:
        # Unlike
        db.delete(existing_like)
        reply.likes_count = max(0, reply.likes_count - 1)
        db.commit()
        return {"liked": False, "likes_count": reply.likes_count}
    else:
        # Like
        new_like = DiscussionReplyLike(reply_id=reply_id, user_id=user_id)
        db.add(new_like)
        reply.likes_count += 1
        db.commit()
        return {"liked": True, "likes_count": reply.likes_count}

def check_user_liked_discussion(db: Session, discussion_id: int, user_id: int) -> bool:
    """Check if user has liked a discussion"""
    from database import DiscussionLike
    
    like = db.query(DiscussionLike).filter(
        and_(
            DiscussionLike.discussion_id == discussion_id,
            DiscussionLike.user_id == user_id
        )
    ).first()
    
    return like is not None

# Event CRUD operations
def create_event(db: Session, event: schemas.EventCreate, organizer_id: Optional[int] = None):
    """Create a new event"""
    db_event = Event(
        **event.dict(),
        organizer_id=organizer_id
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    # Add participants_count for response validation
    db_event.participants_count = 0
    return db_event

def get_event(db: Session, event_id: int):
    """Get event by ID"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if event:
        # Add participants_count dynamically
        event.participants_count = len(event.registrations)
    return event

def get_events(db: Session, skip: int = 0, limit: int = 50, status: Optional[str] = None):
    """Get all events with optional filtering"""
    query = db.query(Event)
    
    if status:
        query = query.filter(Event.status == status)
    
    events = query.order_by(Event.date.desc()).offset(skip).limit(limit).all()
    
    # Add participants_count to each event
    for event in events:
        event.participants_count = len(event.registrations)
    
    return events

def update_event(db: Session, event_id: int, event_update: schemas.EventUpdate):
    """Update event"""
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if not db_event:
        return None
    
    update_data = event_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_event, field, value)
    
    db_event.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_event)
    
    # Add participants_count
    db_event.participants_count = len(db_event.registrations)
    return db_event

def delete_event(db: Session, event_id: int):
    """Delete event"""
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if db_event:
        db.delete(db_event)
        db.commit()
        return True
    return False

def register_for_event(db: Session, event_id: int, user_id: int):
    """Register user for event"""
    # Check if already registered
    existing = db.query(EventRegistration).filter(
        and_(
            EventRegistration.event_id == event_id,
            EventRegistration.participant_id == user_id
        )
    ).first()
    
    if existing:
        return None
    
    registration = EventRegistration(
        event_id=event_id,
        participant_id=user_id
    )
    db.add(registration)
    db.commit()
    db.refresh(registration)
    return registration

def register_for_workshop(db: Session, workshop_id: int, user_id: int):
    """Register user for workshop"""
    # Check if already registered
    existing = db.query(WorkshopRegistration).filter(
        and_(
            WorkshopRegistration.workshop_id == workshop_id,
            WorkshopRegistration.participant_id == user_id
        )
    ).first()
    
    if existing:
        return None
    
    registration = WorkshopRegistration(
        workshop_id=workshop_id,
        participant_id=user_id
    )
    db.add(registration)
    db.commit()
    db.refresh(registration)
    return registration

# Admin CRUD operations
def get_all_users_admin(db: Session, skip: int = 0, limit: int = 100, search: Optional[str] = None, role: Optional[str] = None):
    """Get all users for admin with filtering"""
    query = db.query(User)
    
    if search:
        query = query.filter(
            or_(
                User.email.contains(search),
                User.first_name.contains(search),
                User.last_name.contains(search)
            )
        )
    
    if role:
        query = query.filter(User.role == role)
    
    return query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()

def update_user_role(db: Session, user_id: int, role: schemas.UserRole):
    """Update user role"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    
    user.role = role
    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return user

def toggle_user_status(db: Session, user_id: int):
    """Toggle user active status"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    
    user.is_active = not user.is_active
    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return user

def delete_user(db: Session, user_id: int):
    """Delete user"""
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        db.delete(user)
        db.commit()
        return True
    return False

def get_admin_stats(db: Session):
    """Get admin dashboard statistics"""
    return {
        "total_users": db.query(User).count(),
        "total_courses": db.query(Course).count(),
        "total_workshops": db.query(Workshop).count(),
        "total_events": db.query(Event).count(),
        "total_jobs": db.query(Job).count(),
        "active_users": db.query(User).filter(User.is_active == True).count(),
        "published_courses": db.query(Course).filter(Course.status == "published").count(),
        "upcoming_workshops": db.query(Workshop).filter(Workshop.status == "upcoming").count(),
        "upcoming_events": db.query(Event).filter(Event.status == "upcoming").count(),
        "published_jobs": db.query(Job).filter(Job.status == "published").count(),
    }

# ===========================
# Course Enrollment CRUD
# ===========================

def create_enrollment(db: Session, course_id: int, student_id: int):
    """Create a new course enrollment"""
    from database import CourseEnrollment
    
    # Check if already enrolled
    existing = db.query(CourseEnrollment).filter(
        CourseEnrollment.course_id == course_id,
        CourseEnrollment.student_id == student_id
    ).first()
    
    if existing:
        return existing
    
    enrollment = CourseEnrollment(
        course_id=course_id,
        student_id=student_id,
        enrolled_at=datetime.utcnow()
    )
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment

def get_user_enrollments(db: Session, student_id: int):
    """Get all enrollments for a student"""
    from database import CourseEnrollment
    return db.query(CourseEnrollment).filter(
        CourseEnrollment.student_id == student_id
    ).all()

def get_enrollment(db: Session, course_id: int, student_id: int):
    """Get specific enrollment"""
    from database import CourseEnrollment
    return db.query(CourseEnrollment).filter(
        CourseEnrollment.course_id == course_id,
        CourseEnrollment.student_id == student_id
    ).first()

def get_course_enrollments(db: Session, course_id: int):
    """Get all enrollments for a course"""
    from database import CourseEnrollment
    return db.query(CourseEnrollment).filter(
        CourseEnrollment.course_id == course_id
    ).all()

def update_enrollment_progress(db: Session, enrollment_id: int, progress_percentage: float):
    """Update enrollment progress"""
    from database import CourseEnrollment
    enrollment = db.query(CourseEnrollment).filter(
        CourseEnrollment.id == enrollment_id
    ).first()
    
    if enrollment:
        enrollment.progress_percentage = progress_percentage
        enrollment.last_accessed_at = datetime.utcnow()
        
        if progress_percentage >= 100:
            enrollment.completed = True
        
        db.commit()
        db.refresh(enrollment)
    
    return enrollment

# ===========================
# Lesson Progress CRUD
# ===========================

def create_or_update_lesson_progress(
    db: Session, 
    lesson_id: int, 
    enrollment_id: int,
    current_time: int = 0,
    completed: bool = False
):
    """Create or update lesson progress"""
    from database import LessonProgress
    
    progress = db.query(LessonProgress).filter(
        LessonProgress.lesson_id == lesson_id,
        LessonProgress.enrollment_id == enrollment_id
    ).first()
    
    if progress:
        progress.current_time = current_time
        progress.completed = completed
        progress.last_watched_at = datetime.utcnow()
    else:
        progress = LessonProgress(
            lesson_id=lesson_id,
            enrollment_id=enrollment_id,
            current_time=current_time,
            completed=completed,
            last_watched_at=datetime.utcnow()
        )
        db.add(progress)
    
    db.commit()
    db.refresh(progress)
    return progress

def get_lesson_progress(db: Session, lesson_id: int, enrollment_id: int):
    """Get progress for a specific lesson"""
    from database import LessonProgress
    return db.query(LessonProgress).filter(
        LessonProgress.lesson_id == lesson_id,
        LessonProgress.enrollment_id == enrollment_id
    ).first()

def get_enrollment_progress(db: Session, enrollment_id: int):
    """Get all lesson progress for an enrollment"""
    from database import LessonProgress
    return db.query(LessonProgress).filter(
        LessonProgress.enrollment_id == enrollment_id
    ).all()

# ===========================
# Course Question CRUD
# ===========================

def create_course_question(db: Session, question: schemas.CourseQuestionCreate, student_id: int):
    """Create a new course question"""
    from database import CourseQuestion
    
    db_question = CourseQuestion(
        lesson_id=question.lesson_id,
        student_id=student_id,
        title=question.title,
        content=question.content,
        timestamp=question.timestamp,
        created_at=datetime.utcnow()
    )
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

def get_lesson_questions(db: Session, lesson_id: int):
    """Get all questions for a lesson"""
    from database import CourseQuestion
    return db.query(CourseQuestion).filter(
        CourseQuestion.lesson_id == lesson_id
    ).order_by(CourseQuestion.created_at.desc()).all()

def get_question_by_id(db: Session, question_id: int):
    """Get question by ID"""
    from database import CourseQuestion
    return db.query(CourseQuestion).filter(
        CourseQuestion.id == question_id
    ).first()

def update_question(db: Session, question_id: int, question_update: schemas.CourseQuestionUpdate):
    """Update a question"""
    from database import CourseQuestion
    
    db_question = db.query(CourseQuestion).filter(
        CourseQuestion.id == question_id
    ).first()
    
    if db_question:
        if question_update.title is not None:
            db_question.title = question_update.title
        if question_update.content is not None:
            db_question.content = question_update.content
        if question_update.is_resolved is not None:
            db_question.is_resolved = question_update.is_resolved
        
        db_question.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_question)
    
    return db_question

def delete_question(db: Session, question_id: int):
    """Delete a question"""
    from database import CourseQuestion
    
    question = db.query(CourseQuestion).filter(
        CourseQuestion.id == question_id
    ).first()
    
    if question:
        db.delete(question)
        db.commit()
        return True
    return False

# ===========================
# Question Reply CRUD
# ===========================

def create_question_reply(db: Session, reply: schemas.QuestionReplyCreate, author_id: int, is_instructor: bool = False):
    """Create a reply to a question"""
    from database import QuestionReply
    
    db_reply = QuestionReply(
        question_id=reply.question_id,
        author_id=author_id,
        content=reply.content,
        is_instructor=is_instructor,
        created_at=datetime.utcnow()
    )
    db.add(db_reply)
    db.commit()
    db.refresh(db_reply)
    return db_reply

def get_question_replies(db: Session, question_id: int):
    """Get all replies for a question"""
    from database import QuestionReply
    return db.query(QuestionReply).filter(
        QuestionReply.question_id == question_id
    ).order_by(QuestionReply.created_at.asc()).all()

def update_question_reply(db: Session, reply_id: int, reply_update: schemas.QuestionReplyUpdate):
    """Update a reply"""
    from database import QuestionReply
    
    db_reply = db.query(QuestionReply).filter(
        QuestionReply.id == reply_id
    ).first()
    
    if db_reply:
        db_reply.content = reply_update.content
        db_reply.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_reply)
    
    return db_reply

def delete_question_reply(db: Session, reply_id: int):
    """Delete a reply"""
    from database import QuestionReply
    
    reply = db.query(QuestionReply).filter(
        QuestionReply.id == reply_id
    ).first()
    
    if reply:
        db.delete(reply)
        db.commit()
        return True
    return False

