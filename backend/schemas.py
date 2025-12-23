from __future__ import annotations

from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

# Enums
class UserRole(str, Enum):
    USER = "USER"
    RECRUITER = "RECRUITER"
    ADMIN = "ADMIN"

class UserType(str, Enum):
    STUDENT = "STUDENT"
    FACULTY = "FACULTY"
    ARCHITECT = "ARCHITECT"
    GENERAL_USER = "GENERAL_USER"
    NATA_STUDENT = "NATA_STUDENT"

class JobType(str, Enum):
    FULL_TIME = "Full-time"
    PART_TIME = "Part-time"
    CONTRACT = "Contract"
    INTERNSHIP = "Internship"
    FREELANCE = "Freelance"

class WorkMode(str, Enum):
    ON_SITE = "On-site"
    REMOTE = "Remote"
    HYBRID = "Hybrid"

class ExperienceLevel(str, Enum):
    ENTRY_LEVEL = "Entry Level"
    MID_LEVEL = "Mid Level"
    SENIOR_LEVEL = "Senior Level"
    EXECUTIVE = "Executive"

class JobStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    CLOSED = "closed"

class ApplicationStatus(str, Enum):
    PENDING = "pending"
    REVIEWING = "reviewing"
    UNDER_REVIEW = "under_review"
    SHORTLISTED = "shortlisted"
    REJECTED = "rejected"
    ACCEPTED = "accepted"

class NotificationCreate(BaseModel):
    recipient_id: Optional[int] = None
    title: str
    message: str
    link: Optional[str] = None

class EmailSend(BaseModel):
    recipient_id: Optional[int] = None
    subject: str
    body: str

class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    is_read: bool
    created_at: datetime
    link: Optional[str] = None

    class Config:
        from_attributes = True


class CourseStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"

class WorkshopStatus(str, Enum):
    UPCOMING = "upcoming"
    ONGOING = "ongoing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class EventStatus(str, Enum):
    UPCOMING = "upcoming"
    ONGOING = "ongoing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class CourseLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: Optional[str] = None
    first_name: str
    last_name: str

class UserCreate(UserBase):
    password: str
    confirm_password: str
    phone: Optional[str] = None
    role: Optional[UserRole] = UserRole.USER
    user_type: Optional[UserType] = UserType.STUDENT
    
    # Additional profile fields based on user type
    university: Optional[str] = None
    graduation_year: Optional[int] = None
    specialization: Optional[str] = None
    cao_number: Optional[str] = None
    company: Optional[str] = None
    teaching_experience: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class OTPVerification(BaseModel):
    email: EmailStr
    otp: str

class OTPRequest(BaseModel):
    email: EmailStr

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordReset(BaseModel):
    token: str
    new_password: str

class UserProfile(BaseModel):
    bio: Optional[str] = None
    phone: Optional[str] = None
    university: Optional[str] = None
    graduation_year: Optional[int] = None
    specialization: Optional[str] = None
    experience_level: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    linkedin: Optional[str] = None
    portfolio: Optional[str] = None
    profile_image_url: Optional[str] = None
    company_name: Optional[str] = None
    company_website: Optional[str] = None
    company_description: Optional[str] = None
    cao_number: Optional[str] = None
    teaching_experience: Optional[str] = None

class UserProfileUpdate(UserProfile):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    username: Optional[str] = None

class UserResponse(UserBase):
    id: int
    role: UserRole
    user_type: Optional[UserType] = None
    is_active: bool
    is_verified: bool
    created_at: datetime
    bio: Optional[str] = None
    phone: Optional[str] = None
    university: Optional[str] = None
    graduation_year: Optional[int] = None
    specialization: Optional[str] = None
    experience_level: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    linkedin: Optional[str] = None
    portfolio: Optional[str] = None
    profile_image_url: Optional[str] = None
    company_name: Optional[str] = None
    company_website: Optional[str] = None
    company_description: Optional[str] = None

    class Config:
        from_attributes = True
        # Ensure enum values are serialized as their string values
        use_enum_values = True

# Course Schemas
class CourseBase(BaseModel):
    title: str
    description: str
    short_description: Optional[str] = None
    level: CourseLevel
    duration: str
    max_students: int = 50
    price: float = 0.0
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    image_url: Optional[str] = None
    syllabus: Optional[str] = None
    prerequisites: Optional[str] = None

class CourseCreate(CourseBase):
    instructor_id: Optional[int] = None

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    level: Optional[CourseLevel] = None
    duration: Optional[str] = None
    max_students: Optional[int] = None
    price: Optional[float] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    image_url: Optional[str] = None
    syllabus: Optional[str] = None
    prerequisites: Optional[str] = None
    status: Optional[CourseStatus] = None
    instructor_id: Optional[int] = None

class CourseResponse(CourseBase):
    id: int
    status: CourseStatus
    created_at: datetime
    updated_at: datetime
    instructor_id: Optional[int] = None
    enrolled_count: Optional[int] = 0
    total_lessons: Optional[int] = 0
    total_duration: Optional[int] = 0
    has_free_preview: Optional[bool] = False

    class Config:
        from_attributes = True
        use_enum_values = True

class CourseDetailResponse(CourseResponse):
    lessons: List['CourseLessonResponse'] = []
    materials: List['CourseMaterialResponse'] = []

    class Config:
        from_attributes = True
        use_enum_values = True

# Workshop Schemas
class WorkshopBase(BaseModel):
    title: str
    description: str
    short_description: Optional[str] = None
    date: datetime
    duration: int  # Duration in hours
    max_participants: int = 30
    price: float
    currency: str = "INR"
    location: Optional[str] = None
    image_url: Optional[str] = None
    requirements: Optional[str] = None

class WorkshopCreate(WorkshopBase):
    instructor_id: Optional[int] = None

class WorkshopUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    date: Optional[datetime] = None
    duration: Optional[int] = None
    max_participants: Optional[int] = None
    price: Optional[float] = None
    location: Optional[str] = None
    image_url: Optional[str] = None
    requirements: Optional[str] = None
    status: Optional[WorkshopStatus] = None
    instructor_id: Optional[int] = None

class WorkshopResponse(WorkshopBase):
    id: int
    status: WorkshopStatus
    created_at: datetime
    updated_at: datetime
    instructor_id: Optional[int] = None
    registered_count: Optional[int] = 0

    class Config:
        from_attributes = True
        use_enum_values = True

# Course Lesson Schemas
class CourseLessonBase(BaseModel):
    title: str
    description: Optional[str] = None
    video_duration: Optional[int] = None  # Duration in seconds
    order_index: int = 0
    is_free: bool = False
    transcript: Optional[str] = None

class CourseLessonCreate(CourseLessonBase):
    course_id: int

class CourseLessonUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    video_duration: Optional[int] = None
    order_index: Optional[int] = None
    is_free: Optional[bool] = None
    transcript: Optional[str] = None

class CourseLessonResponse(CourseLessonBase):
    id: int
    video_url: Optional[str] = None
    course_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Course Material Schemas
class CourseMaterialBase(BaseModel):
    title: str
    description: Optional[str] = None
    file_type: str
    file_size: Optional[int] = None
    order_index: int = 0
    is_downloadable: bool = True

class CourseMaterialCreate(CourseMaterialBase):
    course_id: int

class CourseMaterialUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    order_index: Optional[int] = None
    is_downloadable: Optional[bool] = None

class CourseMaterialResponse(CourseMaterialBase):
    id: int
    file_url: str
    course_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Enhanced Course Response with lessons and materials
class CourseDetailResponse(CourseResponse):
    lessons: List[CourseLessonResponse] = []
    materials: List[CourseMaterialResponse] = []
    total_lessons: Optional[int] = 0
    total_duration: Optional[int] = 0  # Total course duration in seconds

    class Config:
        from_attributes = True
        use_enum_values = True


# Course review schemas (top-level)
class CourseReviewCreate(BaseModel):
    rating: int
    review_text: Optional[str] = None


class CourseReviewResponse(BaseModel):
    id: int
    course_id: int
    user_id: int
    rating: int
    review_text: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True



# System Settings Schemas
class SystemSettingBase(BaseModel):
    key: str
    value: str
    description: Optional[str] = None

class SystemSettingCreate(SystemSettingBase):
    pass

class SystemSettingUpdate(BaseModel):
    value: str
    description: Optional[str] = None

class SystemSettingResponse(SystemSettingBase):
    id: int
    updated_at: datetime
    updated_by: Optional[int] = None

    class Config:
        from_attributes = True

# Admin User Management
class AdminUserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None

class AdminUserCreate(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    password: str
    role: UserRole = UserRole.USER
    is_active: bool = True
    is_verified: bool = False

# Job Schemas
class JobBase(BaseModel):
    title: str
    company: str
    location: str
    work_mode: WorkMode
    job_type: JobType
    experience_level: ExperienceLevel
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    currency: str = "INR"
    description: str
    requirements: str
    benefits: Optional[str] = None
    tags: Optional[str] = None
    application_deadline: Optional[datetime] = None
    contact_email: EmailStr
    company_website: Optional[str] = None
    company_description: Optional[str] = None

class JobCreate(JobBase):
    pass

class JobUpdate(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    work_mode: Optional[WorkMode] = None
    job_type: Optional[JobType] = None
    experience_level: Optional[ExperienceLevel] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    benefits: Optional[str] = None
    tags: Optional[str] = None
    application_deadline: Optional[datetime] = None
    contact_email: Optional[EmailStr] = None
    company_website: Optional[str] = None
    company_description: Optional[str] = None
    status: Optional[JobStatus] = None

class JobResponse(JobBase):
    id: int
    status: JobStatus
    created_at: datetime
    updated_at: datetime
    recruiter_id: int
    recruiter: Optional[UserResponse] = None
    # Admin/UI convenience fields
    applications_count: Optional[int] = 0
    salary_range: Optional[str] = None
    closing_date: Optional[datetime] = None

    class Config:
        from_attributes = True

# Job Application Schemas
class JobApplicationBase(BaseModel):
    cover_letter: Optional[str] = None
    resume_url: Optional[str] = None

class JobApplicationCreate(JobApplicationBase):
    job_id: int

class JobApplicationResponse(JobApplicationBase):
    id: int
    status: ApplicationStatus
    applied_at: datetime
    job_id: int
    applicant_id: int
    notes: Optional[str] = None
    messages: Optional[str] = None
    job: Optional[JobResponse] = None
    applicant: Optional[UserResponse] = None

    class Config:
        from_attributes = True

class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus

class ApplicationMessageCreate(BaseModel):
    message: str

# Saved Job Schemas
class SavedJobCreate(BaseModel):
    job_id: int

class SavedJobResponse(BaseModel):
    id: int
    saved_at: datetime
    job: JobResponse

    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None

# Job Search/Filter Schemas
class JobSearchParams(BaseModel):
    search: Optional[str] = None
    job_type: Optional[JobType] = None
    work_mode: Optional[WorkMode] = None
    experience_level: Optional[ExperienceLevel] = None
    location: Optional[str] = None
    min_salary: Optional[float] = None
    max_salary: Optional[float] = None
    skip: int = 0
    limit: int = 50

# Blog and Discussion Enums
class BlogStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"

class BlogCategory(str, Enum):
    ARCHITECTURE_NEWS = "Architecture News"
    DESIGN_TRENDS = "Design Trends"
    SUSTAINABLE_DESIGN = "Sustainable Design"
    TECHNOLOGY = "Technology"
    CAREER_ADVICE = "Career Advice"
    PROJECT_SHOWCASE = "Project Showcase"
    EDUCATION = "Education"
    INDUSTRY_INSIGHTS = "Industry Insights"
    GENERAL = "General"

# Blog Schemas
class BlogBase(BaseModel):
    title: str
    content: str
    excerpt: Optional[str] = None
    category: BlogCategory
    tags: Optional[str] = None
    featured_image: Optional[str] = None
    is_featured: bool = False

class BlogCreate(BlogBase):
    pass

class BlogUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    excerpt: Optional[str] = None
    category: Optional[BlogCategory] = None
    tags: Optional[str] = None
    featured_image: Optional[str] = None
    is_featured: Optional[bool] = None
    status: Optional[BlogStatus] = None

class BlogResponse(BlogBase):
    id: int
    status: BlogStatus
    author_id: int
    author: Optional[UserResponse] = None
    created_at: datetime
    updated_at: datetime
    views_count: int = 0
    likes_count: int = 0
    comments_count: int = 0
    slug: Optional[str] = None

    class Config:
        from_attributes = True
        use_enum_values = True

# Blog Comment Schemas
class BlogCommentBase(BaseModel):
    content: str
    parent_id: Optional[int] = None

class BlogCommentCreate(BlogCommentBase):
    blog_id: int

class BlogCommentUpdate(BaseModel):
    content: str

class BlogCommentResponse(BlogCommentBase):
    id: int
    blog_id: int
    author_id: int
    author: Optional[UserResponse] = None
    created_at: datetime
    updated_at: datetime
    likes_count: int = 0
    replies: List['BlogCommentResponse'] = []

    class Config:
        from_attributes = True

# Blog Like Schema
class BlogLikeCreate(BaseModel):
    blog_id: int

class BlogLikeResponse(BaseModel):
    id: int
    blog_id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Comment Like Schema
class CommentLikeCreate(BaseModel):
    comment_id: int

# Blog Search/Filter Schemas
class BlogSearchParams(BaseModel):
    search: Optional[str] = None
    category: Optional[BlogCategory] = None
    author_id: Optional[int] = None
    is_featured: Optional[bool] = None
    status: Optional[BlogStatus] = None
    skip: int = 0
    limit: int = 20

# Discussion Community Schemas
class DiscussionCategory(str, Enum):
    GENERAL = "General Discussion"
    DESIGN_HELP = "Design Help"
    TECHNICAL = "Technical Questions"
    CAREER = "Career Advice"
    SOFTWARE = "Software & Tools"
    EDUCATION = "Education & Learning"
    PROJECTS = "Project Feedback"
    INDUSTRY = "Industry News"
    NETWORKING = "Networking"

class DiscussionBase(BaseModel):
    title: str
    content: str
    category: str
    tags: Optional[str] = None

class DiscussionCreate(DiscussionBase):
    pass

class DiscussionUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[str] = None
    is_solved: Optional[bool] = None

class DiscussionResponse(DiscussionBase):
    id: int
    is_solved: bool
    is_pinned: bool
    views_count: int
    replies_count: int
    likes_count: int
    author_id: int
    author: Optional[UserResponse] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Discussion Reply Schemas
class DiscussionReplyBase(BaseModel):
    content: str

class DiscussionReplyCreate(DiscussionReplyBase):
    discussion_id: int
    parent_id: Optional[int] = None

class DiscussionReplyUpdate(BaseModel):
    content: str

class DiscussionReplyResponse(DiscussionReplyBase):
    id: int
    discussion_id: int
    author_id: int
    author: Optional[UserResponse] = None
    parent_id: Optional[int] = None
    is_solution: bool
    likes_count: int
    created_at: datetime
    updated_at: datetime
    replies: List['DiscussionReplyResponse'] = []

    class Config:
        from_attributes = True

# Discussion Like Schema
class DiscussionLikeCreate(BaseModel):
    discussion_id: int

class DiscussionLikeResponse(BaseModel):
    id: int
    discussion_id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Discussion Search/Filter Schemas
class DiscussionSearchParams(BaseModel):
    search: Optional[str] = None
    category: Optional[str] = None
    author_id: Optional[int] = None

# Event Schemas
class EventBase(BaseModel):
    title: str
    description: str
    short_description: Optional[str] = None
    date: datetime
    duration: int  # Duration in hours
    location: Optional[str] = None
    image_url: Optional[str] = None
    max_participants: Optional[int] = 50
    is_online: bool = False
    meeting_link: Optional[str] = None
    requirements: Optional[str] = None

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    date: Optional[datetime] = None
    duration: Optional[int] = None
    location: Optional[str] = None
    image_url: Optional[str] = None
    max_participants: Optional[int] = None
    is_online: Optional[bool] = None
    meeting_link: Optional[str] = None
    requirements: Optional[str] = None
    status: Optional[EventStatus] = None

class EventResponse(EventBase):
    id: int
    status: EventStatus
    participants_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Event Registration Schema
class EventRegistrationCreate(BaseModel):
    event_id: int

class EventRegistrationResponse(BaseModel):
    id: int
    event_id: int
    participant_id: int
    registered_at: datetime
    attended: bool

    class Config:
        from_attributes = True

# Course Enrollment Schemas
class CourseEnrollmentCreate(BaseModel):
    course_id: int

class CourseEnrollmentResponse(BaseModel):
    id: int
    course_id: int
    student_id: int
    enrolled_at: datetime
    completed: bool
    progress_percentage: Optional[float] = 0.0
    last_accessed_at: Optional[datetime] = None
    course: Optional[CourseResponse] = None
    student: Optional[UserResponse] = None

    class Config:
        from_attributes = True

# Lesson Progress Schemas
class LessonProgressCreate(BaseModel):
    lesson_id: int
    enrollment_id: int

class LessonProgressUpdate(BaseModel):
    current_time: Optional[int] = None
    completed: Optional[bool] = None

class LessonProgressResponse(BaseModel):
    id: int
    lesson_id: int
    enrollment_id: int
    current_time: int  # Current playback position in seconds
    completed: bool
    last_watched_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Course Question/Doubt Schemas
class CourseQuestionCreate(BaseModel):
    lesson_id: int
    title: str
    content: str
    timestamp: Optional[int] = None  # Video timestamp in seconds

class CourseQuestionUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    is_resolved: Optional[bool] = None

# Question Reply Schemas (define before CourseQuestionResponse to resolve forward refs)
class QuestionReplyCreate(BaseModel):
    question_id: int
    content: str


class QuestionReplyUpdate(BaseModel):
    content: str


class QuestionReplyResponse(BaseModel):
    id: int
    question_id: int
    author_id: int
    content: str
    is_instructor: bool
    created_at: datetime
    updated_at: datetime
    author: Optional[UserResponse] = None

    class Config:
        from_attributes = True


# Now define the CourseQuestionResponse which references QuestionReplyResponse directly
class CourseQuestionResponse(BaseModel):
    id: int
    lesson_id: int
    student_id: int
    title: str
    content: str
    timestamp: Optional[int] = None
    is_resolved: bool
    created_at: datetime
    updated_at: datetime
    student: Optional[UserResponse] = None
    replies_count: int = 0
    replies: List['QuestionReplyResponse'] = []

    class Config:
        from_attributes = True

# Discussion Search/Filter Schemas (fixing the broken one)
class DiscussionSearchParams(BaseModel):
    search: Optional[str] = None
    category: Optional[str] = None
    author_id: Optional[int] = None
    is_solved: Optional[bool] = None
    is_pinned: Optional[bool] = None
    skip: int = 0
    limit: int = 20

# Message Schemas
class MessageBase(BaseModel):
    recipient_email: EmailStr
    subject: Optional[str] = None
    content: str

class MessageCreate(MessageBase):
    pass

class MessageResponse(BaseModel):
    id: int
    sender_id: int
    recipient_id: int
    subject: Optional[str]
    content: str
    is_read: bool
    created_at: datetime
    sender: Optional[UserResponse] = None

    class Config:
        from_attributes = True

# Notification Schemas
class NotificationBase(BaseModel):
    title: str
    message: str
    link: Optional[str] = None

class NotificationCreate(NotificationBase):
    recipient_id: int

class NotificationResponse(NotificationBase):
    id: int
    recipient_id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

