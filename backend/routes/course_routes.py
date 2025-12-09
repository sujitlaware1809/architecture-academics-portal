from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from fastapi.responses import FileResponse, StreamingResponse, Response
from sqlalchemy.orm import Session
from typing import Optional, List
from pathlib import Path
import shutil

import crud
import schemas
from database import get_db, User, Course, CourseLesson, CourseEnrollment
from routes.auth_routes import get_current_user, get_current_admin, get_current_user_optional
from aws_s3 import s3_manager

router = APIRouter(prefix="/courses", tags=["Courses"])

# Upload directories
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

# ===============================
# PUBLIC COURSE VIEWING ENDPOINTS (No Authentication Required)
# ===============================

@router.get("", response_model=List[schemas.CourseResponse])
async def get_public_courses(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=100),
    level: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get all published courses for public viewing (no authentication required)"""
    return crud.get_published_courses(db, skip=skip, limit=limit, level=level, search=search)

@router.get("/my-courses")
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

@router.get("/{course_id}", response_model=schemas.CourseDetailResponse)
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

@router.get("/{course_id}/lessons")
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

@router.get("/{course_id}/lessons/{lesson_id}/video-url")
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

@router.get("/{lesson_id}/video-stream")
async def stream_lesson_video(
    lesson_id: int,
    request,
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

# ===============================
# COURSE ENROLLMENT ENDPOINTS
# ===============================

@router.post("/enroll", response_model=schemas.CourseEnrollmentResponse)
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

@router.get("/enrollments", response_model=List[schemas.CourseEnrollmentResponse])
async def get_user_enrollments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all enrollments for current user"""
    return crud.get_user_enrollments(db, current_user.id)

@router.get("/{course_id}/check-enrollment")
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

# ===============================
# LESSON PROGRESS ENDPOINTS
# ===============================

@router.post("/progress", response_model=schemas.LessonProgressResponse)
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

@router.get("/lessons/{lesson_id}/progress")
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

@router.post("/questions", response_model=schemas.CourseQuestionResponse)
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

@router.get("/lessons/{lesson_id}/questions", response_model=List[schemas.CourseQuestionResponse])
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

@router.post("/questions/{question_id}/replies", response_model=schemas.QuestionReplyResponse)
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