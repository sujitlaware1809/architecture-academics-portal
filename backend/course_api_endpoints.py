# Course Management API Endpoints - Add to main.py
# These endpoints provide complete course management functionality

# Add these imports at the top of main.py if not already present:
from fastapi import FastAPI, Depends, HTTPException, status, Query, UploadFile, File, Form, Response, Request
from fastapi.responses import StreamingResponse, FileResponse
from typing import Optional, List
import os
from pathlib import Path

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
    # Check if course exists and is published
    course = crud.get_course_by_id(db, enrollment.course_id)
    if not course or course.status != schemas.CourseStatus.PUBLISHED:
        raise HTTPException(status_code=404, detail="Course not found or not available")
    
    # Create enrollment
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

@app.get("/api/enrollments/{enrollment_id}", response_model=schemas.CourseEnrollmentResponse)
async def get_enrollment_detail(
    enrollment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get enrollment details"""
    from database import CourseEnrollment
    enrollment = db.query(CourseEnrollment).filter(
        CourseEnrollment.id == enrollment_id,
        CourseEnrollment.student_id == current_user.id
    ).first()
    
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    
    return enrollment

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
    from database import CourseEnrollment
    
    # Verify enrollment belongs to current user
    enrollment = db.query(CourseEnrollment).filter(
        CourseEnrollment.id == enrollment_id,
        CourseEnrollment.student_id == current_user.id
    ).first()
    
    if not enrollment:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Update progress
    progress = crud.create_or_update_lesson_progress(
        db, lesson_id, enrollment_id, current_time, completed
    )
    
    # Update overall enrollment progress
    all_progress = crud.get_enrollment_progress(db, enrollment_id)
    if all_progress:
        completed_lessons = sum(1 for p in all_progress if p.completed)
        total_lessons = len(enrollment.course.lessons)
        if total_lessons > 0:
            progress_percentage = (completed_lessons / total_lessons) * 100
            crud.update_enrollment_progress(db, enrollment_id, progress_percentage)
    
    return progress

@app.get("/api/enrollments/{enrollment_id}/progress", response_model=List[schemas.LessonProgressResponse])
async def get_enrollment_progress(
    enrollment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all lesson progress for an enrollment"""
    from database import CourseEnrollment
    
    # Verify enrollment belongs to current user
    enrollment = db.query(CourseEnrollment).filter(
        CourseEnrollment.id == enrollment_id,
        CourseEnrollment.student_id == current_user.id
    ).first()
    
    if not enrollment:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return crud.get_enrollment_progress(db, enrollment_id)

@app.get("/api/lessons/{lesson_id}/progress")
async def get_lesson_progress(
    lesson_id: int,
    enrollment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get progress for a specific lesson"""
    from database import CourseEnrollment
    
    # Verify enrollment belongs to current user
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
    # Verify lesson exists and user is enrolled
    from database import CourseLesson, CourseEnrollment
    
    lesson = db.query(CourseLesson).filter(CourseLesson.id == question.lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    # Check enrollment
    enrollment = crud.get_enrollment(db, lesson.course_id, current_user.id)
    if not enrollment:
        raise HTTPException(status_code=403, detail="You must be enrolled to ask questions")
    
    return crud.create_course_question(db, question, current_user.id)

@app.get("/api/lessons/{lesson_id}/questions", response_model=List[schemas.CourseQuestionResponse])
async def get_lesson_questions(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all questions for a lesson"""
    questions = crud.get_lesson_questions(db, lesson_id)
    
    # Add replies count and replies to each question
    result = []
    for question in questions:
        replies = crud.get_question_replies(db, question.id)
        result.append(schemas.CourseQuestionResponse(
            **question.__dict__,
            replies_count=len(replies),
            replies=[schemas.QuestionReplyResponse(**reply.__dict__) for reply in replies]
        ))
    
    return result

@app.get("/api/questions/{question_id}", response_model=schemas.CourseQuestionResponse)
async def get_question_detail(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get question details with replies"""
    question = crud.get_question_by_id(db, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    replies = crud.get_question_replies(db, question_id)
    return schemas.CourseQuestionResponse(
        **question.__dict__,
        replies_count=len(replies),
        replies=[schemas.QuestionReplyResponse(**reply.__dict__) for reply in replies]
    )

@app.put("/api/questions/{question_id}", response_model=schemas.CourseQuestionResponse)
async def update_question(
    question_id: int,
    question_update: schemas.CourseQuestionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a question"""
    question = crud.get_question_by_id(db, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Only the author can update the question
    if question.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    updated_question = crud.update_question(db, question_id, question_update)
    return updated_question

@app.delete("/api/questions/{question_id}")
async def delete_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a question"""
    question = crud.get_question_by_id(db, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Only the author or admin can delete
    if question.student_id != current_user.id and current_user.role != schemas.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    crud.delete_question(db, question_id)
    return {"message": "Question deleted successfully"}

@app.post("/api/questions/{question_id}/resolve")
async def resolve_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark question as resolved"""
    question = crud.get_question_by_id(db, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Only the author can mark as resolved
    if question.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = schemas.CourseQuestionUpdate(is_resolved=True)
    updated_question = crud.update_question(db, question_id, update_data)
    return updated_question

# ===============================
# QUESTION REPLY ENDPOINTS
# ===============================

@app.post("/api/questions/{question_id}/replies", response_model=schemas.QuestionReplyResponse)
async def create_reply(
    question_id: int,
    content: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Reply to a question"""
    question = crud.get_question_by_id(db, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Check if user is instructor for the course
    from database import CourseLesson
    lesson = db.query(CourseLesson).filter(CourseLesson.id == question.lesson_id).first()
    is_instructor = (lesson and lesson.course.instructor_id == current_user.id) or current_user.role == schemas.UserRole.ADMIN
    
    reply = schemas.QuestionReplyCreate(question_id=question_id, content=content)
    return crud.create_question_reply(db, reply, current_user.id, is_instructor)

@app.get("/api/questions/{question_id}/replies", response_model=List[schemas.QuestionReplyResponse])
async def get_replies(
    question_id: int,
    db: Session = Depends(get_db)
):
    """Get all replies for a question"""
    return crud.get_question_replies(db, question_id)

@app.put("/api/replies/{reply_id}", response_model=schemas.QuestionReplyResponse)
async def update_reply(
    reply_id: int,
    reply_update: schemas.QuestionReplyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a reply"""
    from database import QuestionReply
    
    reply = db.query(QuestionReply).filter(QuestionReply.id == reply_id).first()
    if not reply:
        raise HTTPException(status_code=404, detail="Reply not found")
    
    # Only the author can update
    if reply.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return crud.update_question_reply(db, reply_id, reply_update)

@app.delete("/api/replies/{reply_id}")
async def delete_reply(
    reply_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a reply"""
    from database import QuestionReply
    
    reply = db.query(QuestionReply).filter(QuestionReply.id == reply_id).first()
    if not reply:
        raise HTTPException(status_code=404, detail="Reply not found")
    
    # Only the author or admin can delete
    if reply.author_id != current_user.id and current_user.role != schemas.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    crud.delete_question_reply(db, reply_id)
    return {"message": "Reply deleted successfully"}

# ===============================
# ADMIN COURSE MANAGEMENT
# ===============================

@app.post("/api/admin/courses", response_model=schemas.CourseResponse)
async def create_course(
    course: schemas.CourseCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Create a new course (Admin only)"""
    course_data = course.dict()
    course_data['instructor_id'] = current_admin.id
    return crud.create_course(db, schemas.CourseCreate(**course_data))

@app.put("/api/admin/courses/{course_id}", response_model=schemas.CourseResponse)
async def update_course(
    course_id: int,
    course_update: schemas.CourseUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Update a course (Admin only)"""
    updated_course = crud.update_course(db, course_id, course_update)
    if not updated_course:
        raise HTTPException(status_code=404, detail="Course not found")
    return updated_course

@app.delete("/api/admin/courses/{course_id}")
async def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Delete a course (Admin only)"""
    success = crud.delete_course(db, course_id)
    if not success:
        raise HTTPException(status_code=404, detail="Course not found")
    return {"message": "Course deleted successfully"}

@app.post("/api/admin/courses/{course_id}/publish")
async def publish_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Publish a course (Admin only)"""
    course_update = schemas.CourseUpdate(status=schemas.CourseStatus.PUBLISHED)
    updated_course = crud.update_course(db, course_id, course_update)
    if not updated_course:
        raise HTTPException(status_code=404, detail="Course not found")
    return updated_course

@app.post("/api/admin/courses/{course_id}/archive")
async def archive_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Archive a course (Admin only)"""
    course_update = schemas.CourseUpdate(status=schemas.CourseStatus.ARCHIVED)
    updated_course = crud.update_course(db, course_id, course_update)
    if not updated_course:
        raise HTTPException(status_code=404, detail="Course not found")
    return updated_course

@app.get("/api/admin/courses/{course_id}/enrollments")
async def get_course_enrollments_admin(
    course_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Get all enrollments for a course (Admin only)"""
    enrollments = crud.get_course_enrollments(db, course_id)
    return enrollments

# ===============================
# VIDEO STREAMING WITH RANGE SUPPORT
# ===============================

@app.get("/api/lessons/{lesson_id}/video-stream")
async def stream_lesson_video(
    lesson_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Stream lesson video with range support"""
    from database import CourseLesson
    
    # Get lesson
    lesson = db.query(CourseLesson).filter(CourseLesson.id == lesson_id).first()
    if not lesson or not lesson.video_url:
        raise HTTPException(status_code=404, detail="Video not found")
    
    # Check if lesson is free or user is enrolled
    if not lesson.is_free:
        enrollment = crud.get_enrollment(db, lesson.course_id, current_user.id)
        if not enrollment:
            raise HTTPException(status_code=403, detail="You must be enrolled to access this video")
    
    # Get video file path
    video_path = Path(lesson.video_url)
    if not video_path.exists():
        raise HTTPException(status_code=404, detail="Video file not found")
    
    # Get file size
    file_size = video_path.stat().st_size
    
    # Handle range requests for video seeking
    range_header = request.headers.get("range")
    if range_header:
        # Parse range header
        range_match = range_header.replace("bytes=", "").split("-")
        start = int(range_match[0]) if range_match[0] else 0
        end = int(range_match[1]) if range_match[1] else file_size - 1
        
        # Read chunk
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
    
    # No range header, return full file
    return FileResponse(video_path, media_type="video/mp4")
