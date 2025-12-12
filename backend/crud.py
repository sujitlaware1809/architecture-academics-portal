from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func
from database import User, Job, JobApplication, SavedJob, Course, CourseEnrollment, Workshop, WorkshopRegistration, Event, EventRegistration, SystemSettings, CourseLesson, CourseMaterial, LessonProgress
import schemas
from auth import get_password_hash, verify_password
from typing import Optional, List
from datetime import datetime, timedelta
from email_service import generate_otp, send_otp_email  # Use real email sending

# User CRUD operations
def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get user by email (case-insensitive)"""
    if not email:
        return None
    email = email.lower().strip()
    return db.query(User).filter(func.lower(User.email) == email).first()

def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """Get user by ID"""
    return db.query(User).filter(User.id == user_id).first()

def create_user(db: Session, user: schemas.UserCreate) -> User:
    """Create a new user with email verification link"""
    import secrets
    hashed_password = get_password_hash(user.password)
    
    # Generate verification token
    verification_token = secrets.token_urlsafe(32)
    token_expires = datetime.utcnow() + timedelta(hours=24)  # Token valid for 24 hours
    
    db_user = User(
        email=user.email.lower().strip(),
        first_name=user.first_name,
        last_name=user.last_name,
        hashed_password=hashed_password,
        phone=user.phone if hasattr(user, 'phone') else None,
        role=user.role if hasattr(user, 'role') else schemas.UserRole.USER,
        user_type=user.user_type if hasattr(user, 'user_type') else schemas.UserType.STUDENT,
        is_verified=False,  # Set to False initially
        email_otp=verification_token,  # Reuse this field for verification token
        email_otp_expires_at=token_expires,
        # Profile fields
        university=user.university if hasattr(user, 'university') else None,
        graduation_year=user.graduation_year if hasattr(user, 'graduation_year') else None,
        specialization=user.specialization if hasattr(user, 'specialization') else None,
        cao_number=user.cao_number if hasattr(user, 'cao_number') else None,
        company_name=user.company if hasattr(user, 'company') else None,
        teaching_experience=user.teaching_experience if hasattr(user, 'teaching_experience') else None,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Send verification email with link
    from email_service import send_verification_email
    try:
        send_verification_email(user.email, verification_token, f"{user.first_name} {user.last_name}")
    except Exception as e:
        print(f"Failed to send verification email: {e}")
    
    return db_user

def verify_email_otp(db: Session, email: str, otp: str) -> bool:
    """Verify email OTP and activate user account"""
    user = get_user_by_email(db, email)
    
    if not user:
        return False
    
    # Check if OTP is valid and not expired
    if (user.email_otp == otp and 
        user.email_otp_expires_at and 
        user.email_otp_expires_at > datetime.utcnow()):
        
        # Activate user account
        user.is_verified = True
        user.email_otp = None
        user.email_otp_expires_at = None
        db.commit()
        return True
    
    return False

def verify_email_token(db: Session, token: str) -> bool:
    """Verify email using token from link and activate user account"""
    # Find user with this verification token
    user = db.query(User).filter(
        User.email_otp == token  # Reusing email_otp field for token
    ).first()
    
    if not user:
        print(f"❌ No user found with token: {token[:20]}...")
        return False
    
    # Check if already verified
    if user.is_verified:
        print(f"✅ User {user.email} is already verified")
        return True  # Return True since account is already active
    
    # Check if token expired
    if user.email_otp_expires_at and user.email_otp_expires_at < datetime.utcnow():
        print(f"⏰ Token expired for user {user.email}")
        return False
    
    # Activate user account
    user.is_verified = True
    user.email_otp = None
    user.email_otp_expires_at = None
    db.commit()
    
    print(f"✅ User {user.email} verified successfully!")
    
    # Send welcome email
    from email_service import send_welcome_email
    try:
        send_welcome_email(user.email, f"{user.first_name} {user.last_name}")
    except Exception as e:
        print(f"Failed to send welcome email: {e}")
    
    return True

def resend_verification_token(db: Session, email: str) -> bool:
    """Resend verification token to user email"""
    import secrets
    from email_service import send_verification_email
    
    user = get_user_by_email(db, email)
    
    if not user:
        return False
        
    if user.is_verified:
        return False
    
    # Generate new token
    token = secrets.token_urlsafe(32)
    token_expires = datetime.utcnow() + timedelta(hours=24)
    
    # Update user with new token
    user.email_otp = token
    user.email_otp_expires_at = token_expires
    db.commit()
    
    # Send verification email
    try:
        send_verification_email(user.email, token, f"{user.first_name} {user.last_name}")
        return True
    except Exception as e:
        print(f"Failed to send verification email: {e}")
        return False

def resend_otp(db: Session, email: str) -> bool:
    """Resend OTP to user email"""
    user = get_user_by_email(db, email)
    
    if not user or user.is_verified:
        return False
    
    # Generate new OTP
    otp = generate_otp()
    otp_expires = datetime.utcnow() + timedelta(minutes=10)
    
    # Update user with new OTP
    user.email_otp = otp
    user.email_otp_expires_at = otp_expires
    db.commit()
    
    # Send OTP via email
    send_otp_email(email, otp, f"{user.first_name} {user.last_name}")
    
    return True

def create_password_reset_token(db: Session, email: str) -> bool:
    """Generate and send password reset token via email"""
    from email_service import send_password_reset_email
    import secrets
    
    user = get_user_by_email(db, email)
    if not user:
        # Return True anyway for security (don't reveal if email exists)
        return True
    
    # Generate secure reset token
    reset_token = secrets.token_urlsafe(32)
    reset_expires = datetime.utcnow() + timedelta(minutes=15)  # Token valid for 15 minutes
    
    # Update user with reset token
    user.password_reset_token = reset_token
    user.password_reset_expires_at = reset_expires
    db.commit()
    
    # Send password reset email
    try:
        send_password_reset_email(email, reset_token, f"{user.first_name} {user.last_name}")
        print(f"Password reset email sent to {email}")
        return True
    except Exception as e:
        print(f"Failed to send password reset email to {email}: {e}")
        return False

def reset_password_with_token(db: Session, token: str, new_password: str) -> bool:
    """Reset user password using valid token"""
    # Find user with the reset token
    user = db.query(User).filter(
        User.password_reset_token == token,
        User.password_reset_expires_at > datetime.utcnow()
    ).first()
    
    if not user:
        return False
    
    # Update password and clear reset token
    user.hashed_password = get_password_hash(new_password)
    user.password_reset_token = None
    user.password_reset_expires_at = None
    user.updated_at = datetime.utcnow()
    
    db.commit()
    
    print(f"Password reset successful for user: {user.email}")
    return True

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Authenticate user with email and password"""
    print(f"Authenticating user: {email}")
    user = get_user_by_email(db, email)
    if not user:
        print(f"User not found: {email}")
        return None
    if not verify_password(password, user.hashed_password):
        print(f"Invalid password for user: {email}")
        return None
    print(f"User authenticated successfully: {email}")
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
    jobs = db.query(Job).filter(Job.recruiter_id == recruiter_id).offset(skip).limit(limit).all()
    # Enrich with applications count
    for job in jobs:
        try:
            job.applications_count = len(job.applications) if job.applications else 0
        except Exception:
            job.applications_count = 0
    return jobs

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
    """Get all applications for a user with job details loaded"""
    return db.query(JobApplication).options(
        joinedload(JobApplication.job)
    ).filter(JobApplication.applicant_id == user_id).offset(skip).limit(limit).all()

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
    
    # Import json module
    import json
    
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
    existing_recruiter = get_user_by_email(db, "recruiter@architecture-academics.online")
    if existing_recruiter:
        # Ensure it's verified
        if not existing_recruiter.is_verified:
            existing_recruiter.is_verified = True
            existing_recruiter.email_otp = None
            existing_recruiter.email_otp_expires_at = None
            db.commit()
        return existing_recruiter
    
    recruiter_data = schemas.UserCreate(
        email="recruiter@architecture-academics.online",
        password="Recruiter@123",
        confirm_password="Recruiter@123",
        first_name="Architecture",
        last_name="Recruiter",
        role=schemas.UserRole.RECRUITER
    )
    
    recruiter = create_user(db, recruiter_data)
    
    # Mark as verified immediately (no email verification needed for predefined accounts)
    recruiter.is_verified = True
    recruiter.email_otp = None
    recruiter.email_otp_expires_at = None
    db.commit()
    
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
    existing_admin = get_user_by_email(db, "admin@architecture-academics.online")
    if existing_admin:
        # Ensure it's verified
        if not existing_admin.is_verified:
            existing_admin.is_verified = True
            existing_admin.email_otp = None
            existing_admin.email_otp_expires_at = None
            db.commit()
        return existing_admin
    
    admin_data = schemas.UserCreate(
        email="admin@architecture-academics.online",
        password="Admin@123",
        confirm_password="Admin@123",
        first_name="System",
        last_name="Administrator",
        role=schemas.UserRole.ADMIN
    )
    
    admin = create_user(db, admin_data)
    
    # Mark as verified immediately (no email verification needed for predefined accounts)
    admin.is_verified = True
    admin.email_otp = None
    admin.email_otp_expires_at = None
    db.commit()
    
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


# Analytics helpers
def get_top_blogs(db: Session, limit: int = 5):
    """Return top blogs ordered by views_count (published only)"""
    from database import Blog
    query = db.query(Blog).filter(Blog.status == schemas.BlogStatus.PUBLISHED).order_by(Blog.views_count.desc())
    return query.limit(limit).all()


def get_competition_metrics(db: Session, limit: int = 5):
    """Return events that look like competitions and simple metrics for each"""
    from database import Event, EventRegistration
    from sqlalchemy import or_, func

    # Heuristic: title or short_description contains 'competition'
    q = db.query(Event).filter(
        or_(
            Event.title.ilike('%competition%'),
            Event.short_description.ilike('%competition%')
        )
    ).order_by(Event.date.desc()).limit(limit)

    events = q.all()
    results = []
    for e in events:
        reg_count = db.query(func.count(EventRegistration.id)).filter(EventRegistration.event_id == e.id).scalar() or 0
        attended = db.query(func.count(EventRegistration.id)).filter(EventRegistration.event_id == e.id, EventRegistration.attended == True).scalar() or 0
        results.append({
            'id': e.id,
            'title': e.title,
            'date': e.date,
            'registrations': reg_count,
            'attended': attended,
            'short_description': e.short_description,
            'image_url': e.image_url
        })
    return results


def get_blog_timeseries(db: Session, days: int = 30):
    """Return per-day published blog counts for the last `days` days (best-effort)."""
    from database import Blog
    from sqlalchemy import func
    from datetime import datetime, timedelta

    end = datetime.utcnow().date()
    start = end - timedelta(days=days-1)

    rows = db.query(func.date(Blog.created_at).label('day'), func.count(Blog.id).label('count'))\
        .filter(Blog.created_at >= start, Blog.status == schemas.BlogStatus.PUBLISHED)\
        .group_by(func.date(Blog.created_at))\
        .order_by(func.date(Blog.created_at))\
        .all()

    counts_by_day = {str(r.day): r.count for r in rows}

    series = []
    for i in range(days):
        day = start + timedelta(days=i)
        series.append({ 'date': day.isoformat(), 'count': int(counts_by_day.get(str(day), 0)) })

    return series


def get_competition_timeseries(db: Session, days: int = 30):
    """Return per-day registration counts for competition-like events for the last `days` days."""
    from database import Event, EventRegistration
    from sqlalchemy import func, or_
    from datetime import datetime, timedelta

    # identify competition event ids
    comp_events = db.query(Event.id).filter(
        or_(Event.title.ilike('%competition%'), Event.short_description.ilike('%competition%'))
    ).all()
    comp_ids = [c.id for c in comp_events]

    end = datetime.utcnow().date()
    start = end - timedelta(days=days-1)

    if not comp_ids:
        # return zero series
        return [{ 'date': (start + timedelta(days=i)).isoformat(), 'count': 0 } for i in range(days)]

    rows = db.query(func.date(EventRegistration.registered_at).label('day'), func.count(EventRegistration.id).label('count'))\
        .filter(EventRegistration.registered_at >= start, EventRegistration.event_id.in_(comp_ids))\
        .group_by(func.date(EventRegistration.registered_at))\
        .order_by(func.date(EventRegistration.registered_at))\
        .all()

    counts_by_day = {str(r.day): r.count for r in rows}
    series = []
    for i in range(days):
        day = start + timedelta(days=i)
        series.append({ 'date': day.isoformat(), 'count': int(counts_by_day.get(str(day), 0)) })

    return series


def get_user_competition_rank(db: Session, user_id: int):
    """Return user's competition participation count, rank among users, total users and percentile."""
    from database import Event, EventRegistration
    from sqlalchemy import func, or_

    # identify competition event ids
    comp_events = db.query(Event.id).filter(
        or_(Event.title.ilike('%competition%'), Event.short_description.ilike('%competition%'))
    ).all()
    comp_ids = [c.id for c in comp_events]

    if not comp_ids:
        return {
            'user_participations': 0,
            'rank': 0,
            'total_users': 0,
            'percentile': 0
        }

    # count participations per user for these competition events
    rows = db.query(EventRegistration.participant_id, func.count(EventRegistration.id).label('cnt'))\
        .filter(EventRegistration.event_id.in_(comp_ids))\
        .group_by(EventRegistration.participant_id)\
        .order_by(func.count(EventRegistration.id).desc())\
        .all()

    # build mapping
    counts = {r.participant_id: r.cnt for r in rows}
    total_users = len(counts)
    user_count = counts.get(user_id, 0)

    # rank: 1 + number of users with count greater than user_count
    higher = sum(1 for v in counts.values() if v > user_count)
    rank = higher + 1 if total_users > 0 else 0

    percentile = 0
    if total_users > 0:
        # percentile where higher rank is better; compute percent of users below or equal to user
        num_below_or_equal = sum(1 for v in counts.values() if v <= user_count)
        percentile = round((num_below_or_equal / total_users) * 100)

    return {
        'user_participations': int(user_count),
        'rank': int(rank),
        'total_users': int(total_users),
        'percentile': int(percentile)
    }


def get_user_engagement_timeseries(db: Session, user_id: int, days: int = 30):
    """Return per-day engagement score for a user over the last `days` days.

    Engagement is a best-effort score summing these actions per day:
    - blog posts by user (Blog.created_at)
    - discussion posts by user (Discussion.created_at)
    - event registrations by user (EventRegistration.registered_at)
    - workshop registrations by user (WorkshopRegistration.registered_at)
    - job applications by user (JobApplication.applied_at)
    """
    from database import Blog, Discussion, EventRegistration, WorkshopRegistration, JobApplication
    from sqlalchemy import func
    from datetime import datetime, timedelta

    end = datetime.utcnow().date()
    start = end - timedelta(days=days-1)

    # Blog posts
    blog_rows = db.query(func.date(Blog.created_at).label('day'), func.count(Blog.id).label('count'))\
        .filter(Blog.author_id == user_id, Blog.created_at >= start)\
        .group_by(func.date(Blog.created_at)).all()
    blogs_by_day = {str(r.day): r.count for r in blog_rows}

    # Discussions
    disc_rows = db.query(func.date(Discussion.created_at).label('day'), func.count(Discussion.id).label('count'))\
        .filter(Discussion.author_id == user_id, Discussion.created_at >= start)\
        .group_by(func.date(Discussion.created_at)).all()
    disc_by_day = {str(r.day): r.count for r in disc_rows}

    # Event registrations
    ev_rows = db.query(func.date(EventRegistration.registered_at).label('day'), func.count(EventRegistration.id).label('count'))\
        .filter(EventRegistration.participant_id == user_id, EventRegistration.registered_at >= start)\
        .group_by(func.date(EventRegistration.registered_at)).all()
    ev_by_day = {str(r.day): r.count for r in ev_rows}

    # Workshop registrations
    wk_rows = db.query(func.date(WorkshopRegistration.registered_at).label('day'), func.count(WorkshopRegistration.id).label('count'))\
        .filter(WorkshopRegistration.participant_id == user_id, WorkshopRegistration.registered_at >= start)\
        .group_by(func.date(WorkshopRegistration.registered_at)).all()
    wk_by_day = {str(r.day): r.count for r in wk_rows}

    # Job applications
    job_rows = db.query(func.date(JobApplication.applied_at).label('day'), func.count(JobApplication.id).label('count'))\
        .filter(JobApplication.applicant_id == user_id, JobApplication.applied_at >= start)\
        .group_by(func.date(JobApplication.applied_at)).all()
    job_by_day = {str(r.day): r.count for r in job_rows}

    series = []
    for i in range(days):
        day = start + timedelta(days=i)
        key = str(day)
        score = int(blogs_by_day.get(key, 0) or 0) + int(disc_by_day.get(key, 0) or 0) + int(ev_by_day.get(key, 0) or 0) + int(wk_by_day.get(key, 0) or 0) + int(job_by_day.get(key, 0) or 0)
        series.append({ 'date': day.isoformat(), 'score': score })

    return series

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


# NATA Course CRUD operations
def get_all_nata_courses(db: Session, skip: int = 0, limit: int = 100, category: Optional[str] = None, status: str = "active") -> List:
    """Get all NATA courses with optional filtering"""
    from database import NATACourse
    query = db.query(NATACourse).filter(NATACourse.status == status)
    
    if category and category != "All":
        query = query.filter(NATACourse.category == category)
    
    return query.offset(skip).limit(limit).all()

def get_nata_course_by_id(db: Session, course_id: int):
    """Get a specific NATA course by ID"""
    from database import NATACourse
    return db.query(NATACourse).filter(NATACourse.id == course_id).first()

def create_nata_course(db: Session, course_data: dict):
    """Create a new NATA course"""
    from database import NATACourse
    import json
    
    db_course = NATACourse(
        title=course_data.get("title"),
        description=course_data.get("description"),
        instructor=course_data.get("instructor"),
        duration=course_data.get("duration"),
        difficulty=course_data.get("difficulty"),
        price=course_data.get("price"),
        original_price=course_data.get("original_price"),
        rating=course_data.get("rating", 4.5),
        students_enrolled=course_data.get("students_enrolled", 0),
        lessons_count=course_data.get("lessons_count", 0),
        certificate_included=course_data.get("certificate_included", True),
        moodle_url=course_data.get("moodle_url"),
        thumbnail=course_data.get("thumbnail"),
        category=course_data.get("category"),
        skills=json.dumps(course_data.get("skills", [])),
        features=json.dumps(course_data.get("features", [])),
        syllabus=json.dumps(course_data.get("syllabus", [])),
        status=course_data.get("status", "active")
    )
    
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

def update_nata_course(db: Session, course_id: int, course_data: dict):
    """Update a NATA course"""
    from database import NATACourse
    import json
    
    db_course = db.query(NATACourse).filter(NATACourse.id == course_id).first()
    
    if db_course:
        for key, value in course_data.items():
            if key in ["skills", "features", "syllabus"]:
                setattr(db_course, key, json.dumps(value))
            elif hasattr(db_course, key):
                setattr(db_course, key, value)
        
        db_course.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_course)
    
    return db_course

def delete_nata_course(db: Session, course_id: int) -> bool:
    """Delete a NATA course"""
    from database import NATACourse
    
    db_course = db.query(NATACourse).filter(NATACourse.id == course_id).first()
    
    if db_course:
        db.delete(db_course)
        db.commit()
        return True
    
    return False

# User Dashboard CRUD operations
def get_user_enrollments(db: Session, user_id: int):
    """Get all course enrollments for a user"""
    return db.query(CourseEnrollment).filter(
        CourseEnrollment.student_id == user_id
    ).options(joinedload(CourseEnrollment.course)).all()

def get_user_event_registrations(db: Session, user_id: int):
    """Get all event registrations for a user"""
    return db.query(EventRegistration).filter(
        EventRegistration.participant_id == user_id
    ).options(joinedload(EventRegistration.event)).all()

def get_user_workshop_registrations(db: Session, user_id: int):
    """Get all workshop registrations for a user"""
    return db.query(WorkshopRegistration).filter(
        WorkshopRegistration.participant_id == user_id
    ).options(joinedload(WorkshopRegistration.workshop)).all()

def get_user_job_applications(db: Session, user_id: int):
    """Get all job applications for a user"""
    return db.query(JobApplication).filter(
        JobApplication.applicant_id == user_id
    ).options(joinedload(JobApplication.job)).all()

