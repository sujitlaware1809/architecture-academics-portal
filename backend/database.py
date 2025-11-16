from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, Text, Enum, ForeignKey, Numeric
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import schemas

DATABASE_URL = "sqlite:///./architecture_academics.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Reuse enum definitions from schemas so there's a single source of truth
from schemas import (
    UserRole,
    JobType,
    WorkMode,
    ExperienceLevel,
    JobStatus,
    ApplicationStatus,
    CourseStatus,
    WorkshopStatus,
    EventStatus,
    CourseLevel,
    BlogStatus,
    BlogCategory,
)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole, values_callable=lambda x: [e.value for e in x]), default=UserRole.USER)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Profile fields
    bio = Column(Text, nullable=True)
    phone = Column(String, nullable=True)
    university = Column(String, nullable=True)
    graduation_year = Column(Integer, nullable=True)
    specialization = Column(String, nullable=True)
    experience_level = Column(String, nullable=True)
    location = Column(String, nullable=True)
    website = Column(String, nullable=True)
    linkedin = Column(String, nullable=True)
    portfolio = Column(String, nullable=True)
    
    # Company fields (for recruiters)
    company_name = Column(String, nullable=True)
    company_website = Column(String, nullable=True)
    company_description = Column(Text, nullable=True)
    
    # Email verification
    email_otp = Column(String, nullable=True)
    email_otp_expires_at = Column(DateTime, nullable=True)
    
    # Password reset
    password_reset_token = Column(String, nullable=True)
    password_reset_expires_at = Column(DateTime, nullable=True)
    
    # Relationships
    posted_jobs = relationship("Job", back_populates="recruiter")
    applications = relationship("JobApplication", back_populates="applicant")
    saved_jobs = relationship("SavedJob", back_populates="user")
    blogs = relationship("Blog", back_populates="author")
    blog_comments = relationship("BlogComment", back_populates="author")
    blog_likes = relationship("BlogLike", back_populates="user")
    comment_likes = relationship("CommentLike", back_populates="user")
    discussions = relationship("Discussion", back_populates="author")
    discussion_replies = relationship("DiscussionReply", back_populates="author")
    discussion_likes = relationship("DiscussionLike", back_populates="user")
    discussion_reply_likes = relationship("DiscussionReplyLike", back_populates="user")

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    company = Column(String, index=True, nullable=False)
    location = Column(String, nullable=False)
    work_mode = Column(Enum(WorkMode, values_callable=lambda x: [e.value for e in x]), nullable=False)
    job_type = Column(Enum(JobType, values_callable=lambda x: [e.value for e in x]), nullable=False)
    experience_level = Column(Enum(ExperienceLevel, values_callable=lambda x: [e.value for e in x]), nullable=False)
    salary_min = Column(Numeric(10, 2), nullable=True)
    salary_max = Column(Numeric(10, 2), nullable=True)
    currency = Column(String, default="INR")
    description = Column(Text, nullable=False)
    requirements = Column(Text, nullable=False)
    benefits = Column(Text, nullable=True)
    tags = Column(String, nullable=True)  # Comma-separated tags
    application_deadline = Column(DateTime, nullable=True)
    contact_email = Column(String, nullable=False)
    company_website = Column(String, nullable=True)
    company_description = Column(Text, nullable=True)
    status = Column(Enum(JobStatus, values_callable=lambda x: [e.value for e in x]), default=JobStatus.PUBLISHED)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign key
    recruiter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    recruiter = relationship("User", back_populates="posted_jobs")
    applications = relationship("JobApplication", back_populates="job")
    saved_by = relationship("SavedJob", back_populates="job")

class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True)
    status = Column(Enum(ApplicationStatus, values_callable=lambda x: [e.value for e in x]), default=ApplicationStatus.PENDING)
    cover_letter = Column(Text, nullable=True)
    resume_url = Column(String, nullable=True)
    notes = Column(Text, nullable=True)  # Private recruiter notes
    messages = Column(Text, nullable=True)  # JSON serialized messages between recruiter and applicant
    applied_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign keys
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    applicant_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    job = relationship("Job", back_populates="applications")
    applicant = relationship("User", back_populates="applications")

class SavedJob(Base):
    __tablename__ = "saved_jobs"

    id = Column(Integer, primary_key=True, index=True)
    saved_at = Column(DateTime, default=datetime.utcnow)
    
    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="saved_jobs")
    job = relationship("Job", back_populates="saved_by")

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=False)
    short_description = Column(String, nullable=True)
    level = Column(Enum(CourseLevel, values_callable=lambda x: [e.value for e in x]), nullable=False)
    duration = Column(String, nullable=False)  # e.g., "8 weeks", "3 months"
    max_students = Column(Integer, default=50)
    price = Column(Numeric(10, 2), nullable=False, default=0.0)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    image_url = Column(String, nullable=True)
    syllabus = Column(Text, nullable=True)  # JSON or text format
    prerequisites = Column(Text, nullable=True)
    status = Column(Enum(CourseStatus, values_callable=lambda x: [e.value for e in x]), default=CourseStatus.DRAFT)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign key
    instructor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    instructor = relationship("User", foreign_keys=[instructor_id])
    enrollments = relationship("CourseEnrollment", back_populates="course")
    lessons = relationship("CourseLesson", back_populates="course", cascade="all, delete-orphan")
    materials = relationship("CourseMaterial", back_populates="course", cascade="all, delete-orphan")

class CourseLesson(Base):
    __tablename__ = "course_lessons"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    video_url = Column(String, nullable=True)  # Path to video file
    video_duration = Column(Integer, nullable=True)  # Duration in seconds
    order_index = Column(Integer, nullable=False, default=0)  # Lesson order
    is_free = Column(Boolean, default=False)  # Free preview lesson
    transcript = Column(Text, nullable=True)  # Video transcript
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign key
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    
    # Relationships
    course = relationship("Course", back_populates="lessons")
    progress = relationship("LessonProgress", back_populates="lesson", cascade="all, delete-orphan")

class CourseMaterial(Base):
    __tablename__ = "course_materials"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    file_url = Column(String, nullable=False)  # Path to file
    file_type = Column(String, nullable=False)  # pdf, doc, ppt, etc.
    file_size = Column(Integer, nullable=True)  # File size in bytes
    order_index = Column(Integer, nullable=False, default=0)
    is_downloadable = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Foreign key
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    
    # Relationships
    course = relationship("Course", back_populates="materials")

class LessonProgress(Base):
    __tablename__ = "lesson_progress"

    id = Column(Integer, primary_key=True, index=True)
    current_time = Column(Integer, default=0)  # Current playback position in seconds
    completed = Column(Boolean, default=False)
    last_watched_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign keys
    lesson_id = Column(Integer, ForeignKey("course_lessons.id"), nullable=False)
    enrollment_id = Column(Integer, ForeignKey("course_enrollments.id"), nullable=False)
    
    # Relationships
    lesson = relationship("CourseLesson", back_populates="progress")
    enrollment = relationship("CourseEnrollment", back_populates="lesson_progress")

class CourseEnrollment(Base):
    __tablename__ = "course_enrollments"

    id = Column(Integer, primary_key=True, index=True)
    enrolled_at = Column(DateTime, default=datetime.utcnow)
    completed = Column(Boolean, default=False)
    progress_percentage = Column(Numeric(5, 2), default=0.0)  # Percentage 0.00-100.00
    last_accessed_at = Column(DateTime, nullable=True)
    
    # Foreign keys
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    course = relationship("Course", back_populates="enrollments")
    student = relationship("User", foreign_keys=[student_id])
    lesson_progress = relationship("LessonProgress", back_populates="enrollment", cascade="all, delete-orphan")

class CourseQuestion(Base):
    __tablename__ = "course_questions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    timestamp = Column(Integer, nullable=True)  # Video timestamp in seconds
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign keys
    lesson_id = Column(Integer, ForeignKey("course_lessons.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    lesson = relationship("CourseLesson")
    student = relationship("User", foreign_keys=[student_id])
    replies = relationship("QuestionReply", back_populates="question", cascade="all, delete-orphan")

class QuestionReply(Base):
    __tablename__ = "question_replies"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    is_instructor = Column(Boolean, default=False)  # Flag if replied by instructor
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign keys
    question_id = Column(Integer, ForeignKey("course_questions.id"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    question = relationship("CourseQuestion", back_populates="replies")
    author = relationship("User", foreign_keys=[author_id])

class Workshop(Base):
    __tablename__ = "workshops"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=False)
    short_description = Column(String, nullable=True)
    date = Column(DateTime, nullable=False)
    duration = Column(Integer, nullable=False)  # Duration in hours
    max_participants = Column(Integer, default=30)
    price = Column(Numeric(10, 2), nullable=False)
    currency = Column(String, default="INR")
    location = Column(String, nullable=True)  # Can be virtual link or physical address
    image_url = Column(String, nullable=True)
    requirements = Column(Text, nullable=True)
    status = Column(Enum(WorkshopStatus, values_callable=lambda x: [e.value for e in x]), default=WorkshopStatus.UPCOMING)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign key
    instructor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    instructor = relationship("User", foreign_keys=[instructor_id])
    registrations = relationship("WorkshopRegistration", back_populates="workshop")

class WorkshopRegistration(Base):
    __tablename__ = "workshop_registrations"

    id = Column(Integer, primary_key=True, index=True)
    registered_at = Column(DateTime, default=datetime.utcnow)
    attended = Column(Boolean, default=False)
    feedback = Column(Text, nullable=True)
    rating = Column(Integer, nullable=True)  # 1-5 stars
    
    # Foreign keys
    workshop_id = Column(Integer, ForeignKey("workshops.id"), nullable=False)
    participant_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    workshop = relationship("Workshop", back_populates="registrations")
    participant = relationship("User", foreign_keys=[participant_id])

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=False)
    short_description = Column(String, nullable=True)
    date = Column(DateTime, nullable=False)
    duration = Column(Integer, nullable=False)  # Duration in hours
    location = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    max_participants = Column(Integer, default=50)
    is_online = Column(Boolean, default=False)
    meeting_link = Column(String, nullable=True)
    requirements = Column(Text, nullable=True)
    status = Column(Enum(EventStatus, values_callable=lambda x: [e.value for e in x]), default=EventStatus.UPCOMING)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign key
    organizer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    organizer = relationship("User", foreign_keys=[organizer_id])
    registrations = relationship("EventRegistration", back_populates="event", cascade="all, delete-orphan")

class EventRegistration(Base):
    __tablename__ = "event_registrations"

    id = Column(Integer, primary_key=True, index=True)
    registered_at = Column(DateTime, default=datetime.utcnow)
    attended = Column(Boolean, default=False)
    feedback = Column(Text, nullable=True)
    rating = Column(Integer, nullable=True)  # 1-5 stars
    
    # Foreign keys
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    participant_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    event = relationship("Event", back_populates="registrations")
    participant = relationship("User", foreign_keys=[participant_id])

class SystemSettings(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True, nullable=False)
    value = Column(Text, nullable=False)
    description = Column(String, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    updated_by_user = relationship("User", foreign_keys=[updated_by])

class Blog(Base):
    __tablename__ = "blogs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    slug = Column(String, unique=True, index=True, nullable=True)
    content = Column(Text, nullable=False)
    excerpt = Column(String, nullable=True)
    category = Column(Enum(BlogCategory, values_callable=lambda x: [e.value for e in x]), nullable=False)
    tags = Column(String, nullable=True)  # Comma-separated tags
    featured_image = Column(String, nullable=True)
    is_featured = Column(Boolean, default=False)
    status = Column(Enum(BlogStatus, values_callable=lambda x: [e.value for e in x]), default=BlogStatus.DRAFT)
    views_count = Column(Integer, default=0)
    likes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    author = relationship("User", back_populates="blogs")
    comments = relationship("BlogComment", back_populates="blog", cascade="all, delete-orphan")
    likes = relationship("BlogLike", back_populates="blog", cascade="all, delete-orphan")

class BlogComment(Base):
    __tablename__ = "blog_comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    blog_id = Column(Integer, ForeignKey("blogs.id"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    parent_id = Column(Integer, ForeignKey("blog_comments.id"), nullable=True)  # For nested comments/replies
    likes_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    blog = relationship("Blog", back_populates="comments")
    author = relationship("User", back_populates="blog_comments")
    parent = relationship("BlogComment", remote_side=[id], backref="replies")
    likes = relationship("CommentLike", back_populates="comment", cascade="all, delete-orphan")

class BlogLike(Base):
    __tablename__ = "blog_likes"

    id = Column(Integer, primary_key=True, index=True)
    blog_id = Column(Integer, ForeignKey("blogs.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    blog = relationship("Blog", back_populates="likes")
    user = relationship("User", back_populates="blog_likes")

class CommentLike(Base):
    __tablename__ = "comment_likes"

    id = Column(Integer, primary_key=True, index=True)
    comment_id = Column(Integer, ForeignKey("blog_comments.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    comment = relationship("BlogComment", back_populates="likes")
    user = relationship("User", back_populates="comment_likes")

# Discussion Community Models
class Discussion(Base):
    __tablename__ = "discussions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    content = Column(Text, nullable=False)
    category = Column(String, nullable=False, index=True)
    tags = Column(String, nullable=True)  # Comma-separated tags
    is_solved = Column(Boolean, default=False)
    is_pinned = Column(Boolean, default=False)
    views_count = Column(Integer, default=0)
    replies_count = Column(Integer, default=0)
    likes_count = Column(Integer, default=0)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    author = relationship("User", back_populates="discussions")
    replies = relationship("DiscussionReply", back_populates="discussion", cascade="all, delete-orphan")
    likes = relationship("DiscussionLike", back_populates="discussion", cascade="all, delete-orphan")

class DiscussionReply(Base):
    __tablename__ = "discussion_replies"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    discussion_id = Column(Integer, ForeignKey("discussions.id"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    parent_id = Column(Integer, ForeignKey("discussion_replies.id"), nullable=True)  # For nested replies
    is_solution = Column(Boolean, default=False)  # Mark as accepted solution
    likes_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    discussion = relationship("Discussion", back_populates="replies")
    author = relationship("User", back_populates="discussion_replies")
    parent = relationship("DiscussionReply", remote_side=[id], backref="replies")
    likes = relationship("DiscussionReplyLike", back_populates="reply", cascade="all, delete-orphan")

class DiscussionLike(Base):
    __tablename__ = "discussion_likes"

    id = Column(Integer, primary_key=True, index=True)
    discussion_id = Column(Integer, ForeignKey("discussions.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    discussion = relationship("Discussion", back_populates="likes")
    user = relationship("User", back_populates="discussion_likes")

class DiscussionReplyLike(Base):
    __tablename__ = "discussion_reply_likes"

    id = Column(Integer, primary_key=True, index=True)
    reply_id = Column(Integer, ForeignKey("discussion_replies.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    reply = relationship("DiscussionReply", back_populates="likes")
    user = relationship("User", back_populates="discussion_reply_likes")

class NATACourse(Base):
    __tablename__ = "nata_courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=False)
    instructor = Column(String, nullable=False)
    duration = Column(String, nullable=False)  # e.g., "8 weeks"
    difficulty = Column(String, nullable=False)  # Beginner, Intermediate, Advanced
    price = Column(Numeric(10, 2), nullable=False)
    original_price = Column(Numeric(10, 2), nullable=False)
    rating = Column(Numeric(2, 1), default=4.5)
    students_enrolled = Column(Integer, default=0)
    lessons_count = Column(Integer, default=0)
    certificate_included = Column(Boolean, default=True)
    moodle_url = Column(String, nullable=True)
    thumbnail = Column(String, nullable=True)
    category = Column(String, nullable=False)  # Drawing, Mathematics, General Aptitude, Full Course
    skills = Column(Text, nullable=True)  # JSON format: ["Sketching", "Perspective Drawing"]
    features = Column(Text, nullable=True)  # JSON format
    syllabus = Column(Text, nullable=True)  # JSON format with modules and lessons
    status = Column(String, default="active")  # active, inactive, archived
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create tables
Base.metadata.create_all(bind=engine)
