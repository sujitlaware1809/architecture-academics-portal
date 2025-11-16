from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
import os

import crud
import schemas
from database import get_db, User
from routes.auth_routes import get_current_user

# Moodle integration - optional dependency
try:
    from moodle_integration import create_moodle_user_account, enroll_user_in_course, get_sso_login_url
    MOODLE_AVAILABLE = True
except ImportError:
    MOODLE_AVAILABLE = False
    
    # Fallback functions when moodle integration is not available
    def create_moodle_user_account(*args, **kwargs):
        return {"success": False, "message": "Moodle integration not available"}
    
    def enroll_user_in_course(*args, **kwargs):
        return {"success": False, "message": "Moodle integration not available"}
    
    def get_sso_login_url(*args, **kwargs):
        return None

router = APIRouter(prefix="/nata-courses", tags=["NATA Courses"])

@router.get("")
async def get_nata_courses(
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all NATA preparation courses"""
    try:
        # Try to get courses from database
        courses = crud.get_all_nata_courses(db, category=category, status="active")
        
        # If no courses in DB, use sample data for demo
        if not courses:
            nata_courses = [
                {
                    "id": 1,
                    "title": "NATA Drawing Fundamentals",
                    "description": "Master the art of architectural drawing with comprehensive techniques for NATA preparation",
                    "instructor": "Prof. Arjun Mehta",
                    "duration": "8 weeks",
                    "difficulty": "Beginner",
                    "price": 4999,
                    "originalPrice": 7999,
                    "rating": 4.8,
                    "studentsEnrolled": 1250,
                    "lessonsCount": 45,
                    "certificateIncluded": True,
                    "moodleUrl": "https://moodle.architectureacademics.com/course/nata-drawing",
                    "thumbnail": "https://placehold.co/400x250/png?text=Drawing+Course",
                    "category": "Drawing",
                    "skills": ["Perspective Drawing", "Sketching", "Geometric Construction", "Shading"],
                    "features": [
                        "Live interactive sessions",
                        "Personal feedback on drawings",
                        "Practice worksheets",
                        "Mock test papers",
                        "Moodle LMS access"
                    ]
                },
                {
                    "id": 2,
                    "title": "NATA Mathematics Mastery",
                    "description": "Complete mathematics preparation covering all NATA syllabus topics with solved examples",
                    "instructor": "Dr. Priya Sharma",
                    "duration": "6 weeks",
                    "difficulty": "Intermediate",
                    "price": 3999,
                    "originalPrice": 5999,
                    "rating": 4.7,
                    "studentsEnrolled": 890,
                    "lessonsCount": 38,
                    "certificateIncluded": True,
                    "moodleUrl": "https://moodle.architectureacademics.com/course/nata-mathematics",
                    "thumbnail": "https://placehold.co/400x250/png?text=Mathematics+Course",
                    "category": "Mathematics",
                    "skills": ["Algebra", "Geometry", "Trigonometry", "Coordinate Geometry"],
                    "features": [
                        "Video lectures with animations",
                        "Step-by-step solutions",
                        "Practice questions bank",
                        "Weekly assessments",
                        "Doubt clearing sessions"
                    ]
                },
                {
                    "id": 3,
                    "title": "NATA General Aptitude & Reasoning",
                    "description": "Enhance logical reasoning, visual perception and general aptitude skills for NATA success",
                    "instructor": "Mr. Karan Singh",
                    "duration": "4 weeks",
                    "difficulty": "Beginner",
                    "price": 2999,
                    "originalPrice": 4499,
                    "rating": 4.6,
                    "studentsEnrolled": 675,
                    "lessonsCount": 28,
                    "certificateIncluded": True,
                    "moodleUrl": "https://moodle.architectureacademics.com/course/nata-aptitude",
                    "thumbnail": "https://placehold.co/400x250/png?text=General+Aptitude+Course",
                    "category": "General Aptitude",
                    "skills": ["Logical Reasoning", "Visual Perception", "Spatial Ability", "Pattern Recognition"],
                    "features": [
                        "Interactive visual exercises",
                        "Timed practice tests",
                        "Performance analytics",
                        "Mobile app access",
                        "Progress tracking"
                    ]
                },
                {
                    "id": 4,
                    "title": "Complete NATA Preparation Course",
                    "description": "Comprehensive 12-week program covering all NATA subjects with mock tests and personal mentoring",
                    "instructor": "Team Architecture Academics",
                    "duration": "12 weeks",
                    "difficulty": "Advanced",
                    "price": 9999,
                    "originalPrice": 15999,
                    "rating": 4.9,
                    "studentsEnrolled": 2100,
                    "lessonsCount": 120,
                    "certificateIncluded": True,
                    "moodleUrl": "https://moodle.architectureacademics.com/course/complete-nata",
                    "thumbnail": "https://placehold.co/400x250/png?text=Complete+Course",
                    "category": "Full Course",
                    "skills": ["All NATA Skills", "Test Strategy", "Time Management", "Exam Psychology"],
                    "features": [
                        "Personal mentor assignment",
                        "Weekly one-on-one sessions",
                        "Full-length mock tests",
                        "Performance analysis reports",
                        "Admission guidance",
                        "Complete Moodle course access"
                    ]
                },
                {
                    "id": 5,
                    "title": "NATA Advanced Drawing & Visualization",
                    "description": "Take your architectural drawing skills to the next level with advanced techniques and visualization methods",
                    "instructor": "Ar. Deepika Patel",
                    "duration": "10 weeks",
                    "difficulty": "Advanced",
                    "price": 5999,
                    "originalPrice": 8999,
                    "rating": 4.8,
                    "studentsEnrolled": 780,
                    "lessonsCount": 52,
                    "certificateIncluded": True,
                    "moodleUrl": "https://moodle.architectureacademics.com/course/nata-advanced-drawing",
                    "thumbnail": "https://placehold.co/400x250/png?text=Advanced+Drawing",
                    "category": "Drawing",
                    "skills": ["3D Visualization", "Architectural Rendering", "Digital Drawing", "Advanced Perspective"],
                    "features": [
                        "Advanced drawing workshops",
                        "Digital tools training",
                        "Portfolio development",
                        "Industry expert sessions",
                        "Competition preparation"
                    ]
                },
                {
                    "id": 6,
                    "title": "NATA Mock Test Series Premium",
                    "description": "Intensive practice with full-length mock tests, detailed analysis, and personalized improvement strategies",
                    "instructor": "NATA Expert Panel",
                    "duration": "4 weeks",
                    "difficulty": "Intermediate",
                    "price": 2499,
                    "originalPrice": 3999,
                    "rating": 4.7,
                    "studentsEnrolled": 1500,
                    "lessonsCount": 24,
                    "certificateIncluded": True,
                    "moodleUrl": "https://moodle.architectureacademics.com/course/nata-mock-tests",
                    "thumbnail": "https://placehold.co/400x250/png?text=Mock+Tests",
                    "category": "Full Course",
                    "skills": ["Time Management", "Exam Strategy", "Score Improvement", "Error Analysis"],
                    "features": [
                        "15 full-length mock tests",
                        "Detailed solutions",
                        "Performance analytics",
                        "Topic-wise analysis",
                        "Expert review sessions"
                    ]
                },
                {
                    "id": 7,
                    "title": "NATA Visual Memory & Observation",
                    "description": "Specialized training to enhance visual memory, observation skills, and spatial understanding",
                    "instructor": "Dr. Neha Gupta",
                    "duration": "6 weeks",
                    "difficulty": "Intermediate",
                    "price": 3499,
                    "originalPrice": 5499,
                    "rating": 4.6,
                    "studentsEnrolled": 920,
                    "lessonsCount": 32,
                    "certificateIncluded": True,
                    "moodleUrl": "https://moodle.architectureacademics.com/course/nata-visual-memory",
                    "thumbnail": "https://placehold.co/400x250/png?text=Visual+Memory",
                    "category": "General Aptitude",
                    "skills": ["Visual Memory", "Spatial Recognition", "Pattern Analysis", "Quick Sketching"],
                    "features": [
                        "Memory enhancement exercises",
                        "Visual perception training",
                        "Pattern recognition practice",
                        "Real-time assessments",
                        "Progress tracking tools"
                    ]
                }
            ]
            
            # Filter by category if provided
            if category and category != "All":
                nata_courses = [course for course in nata_courses if course["category"] == category]
            
            return {"success": True, "data": nata_courses}
        
        # Convert database courses to dictionary format
        courses_list = []
        import json
        for course in courses:
            course_dict = {
                "id": course.id,
                "title": course.title,
                "description": course.description,
                "instructor": course.instructor,
                "duration": course.duration,
                "difficulty": course.difficulty,
                "price": float(course.price),
                "originalPrice": float(course.original_price),
                "rating": float(course.rating),
                "studentsEnrolled": course.students_enrolled,
                "lessonsCount": course.lessons_count,
                "certificateIncluded": course.certificate_included,
                "moodleUrl": course.moodle_url,
                "thumbnail": course.thumbnail,
                "category": course.category,
                "skills": json.loads(course.skills) if course.skills else [],
                "features": json.loads(course.features) if course.features else []
            }
            courses_list.append(course_dict)
        
        return {"success": True, "data": courses_list}
        
    except Exception as e:
        print(f"Error fetching NATA courses: {str(e)}")
        return {"success": False, "message": f"Error fetching courses: {str(e)}"}

@router.get("/{course_id}")
async def get_nata_course_detail(
    course_id: int,
    db: Session = Depends(get_db)
):
    """Get detailed information about a specific NATA course"""
    # Sample detailed course data
    course_detail = {
        "id": course_id,
        "title": "NATA Drawing Fundamentals",
        "description": "Master the art of architectural drawing with comprehensive techniques for NATA preparation. This course covers everything from basic sketching to advanced perspective drawing, ensuring you're fully prepared for the drawing section of NATA.",
        "instructor": {
            "name": "Prof. Arjun Mehta",
            "bio": "Renowned architect and educator with 15+ years of experience in NATA preparation. Former HOD at SPA Delhi.",
            "rating": 4.9,
            "studentsCount": 5000,
            "image": "https://placehold.co/80x80/png?text=Instructor"
        },
        "duration": "8 weeks",
        "difficulty": "Beginner",
        "price": 4999,
        "originalPrice": 7999,
        "rating": 4.8,
        "studentsEnrolled": 1250,
        "lessonsCount": 45,
        "certificateIncluded": True,
        "moodleUrl": "https://moodle.architectureacademics.com/course/nata-drawing",
        "thumbnail": "https://placehold.co/600x400/png?text=Drawing+Course+Detail",
        "category": "Drawing",
        "skills": ["Perspective Drawing", "Sketching", "Geometric Construction", "Shading", "Composition"],
        "syllabus": [
            {
                "module": "Basic Drawing Techniques",
                "topics": ["Line Drawing", "Basic Shapes", "Proportions", "Hand-eye Coordination"],
                "duration": "2 weeks",
                "lessons": [
                    {"title": "Introduction to Drawing", "type": "video", "duration": "15 min", "preview": True},
                    {"title": "Basic Line Techniques", "type": "video", "duration": "20 min", "preview": True},
                    {"title": "Understanding Proportions", "type": "video", "duration": "25 min"},
                    {"title": "Practice Exercise 1", "type": "assignment", "duration": "30 min"},
                    {"title": "Week 1 Assessment", "type": "quiz", "duration": "15 min"}
                ]
            }
        ],
        "features": [
            "Live interactive sessions twice a week",
            "Personal feedback on all drawing submissions",
            "Downloadable practice worksheets",
            "Access to drawing reference library",
            "Mock test papers with solutions",
            "Moodle LMS with mobile app access",
            "Discussion forums with peers",
            "One-on-one doubt clearing sessions"
        ],
        "requirements": [
            "Basic drawing materials (pencils, paper, ruler)",
            "Scanner or smartphone for submission",
            "Stable internet connection",
            "Dedication of 2-3 hours daily for practice"
        ],
        "outcomes": [
            "Master all NATA drawing techniques",
            "Develop speed and accuracy in sketching",
            "Create impressive architectural drawings",
            "Build confidence for NATA exam",
            "Receive industry-recognized certificate"
        ],
        "reviews": [
            {
                "id": 1,
                "userName": "Priya Sharma",
                "rating": 5,
                "comment": "Excellent course! Prof. Mehta's teaching style is amazing. I improved my drawing skills drastically.",
                "date": "2024-10-15"
            }
        ]
    }
    
    return {"success": True, "data": course_detail}

@router.post("/{course_id}/enroll")
async def enroll_in_nata_course(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Enroll user in a NATA course and create Moodle account with automatic login"""
    try:
        # Check if user already has a Moodle account
        moodle_user_id = getattr(current_user, 'moodle_user_id', None)
        
        if not moodle_user_id:
            # Create Moodle user account
            user_data = {
                "email": current_user.email,
                "first_name": getattr(current_user, 'first_name', current_user.full_name.split()[0] if current_user.full_name else 'Student'),
                "last_name": getattr(current_user, 'last_name', ' '.join(current_user.full_name.split()[1:]) if current_user.full_name and len(current_user.full_name.split()) > 1 else 'User'),
                "city": "Mumbai",  # Default city
                "country": "IN"
            }
            
            moodle_result = await create_moodle_user_account(user_data)
            
            if moodle_result["success"]:
                moodle_user_id = moodle_result["moodle_user_id"]
                # Store Moodle user ID in main database (would need to add this field)
                # current_user.moodle_user_id = moodle_user_id
                # db.commit()
                print(f"✅ Created Moodle user account: {moodle_user_id}")
            else:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Failed to create Moodle account: {moodle_result['error']}"
                )
        
        # Map course_id to actual Moodle course ID (this should be stored in your database)
        moodle_course_mapping = {
            1: 101,  # NATA Drawing Fundamentals
            2: 102,  # NATA Mathematics Foundation
            3: 103,  # NATA General Aptitude
            4: 104,  # NATA Complete Package
            5: 105,  # NATA Advanced Drawing & Visualization
            6: 106,  # NATA Mock Test Series Premium
            7: 107,  # NATA Visual Memory & Observation
        }
        
        moodle_course_id = moodle_course_mapping.get(course_id, course_id)
        
        # Enroll user in the specific NATA course
        enrollment_result = await enroll_user_in_course(moodle_user_id, moodle_course_id)
        
        if not enrollment_result["success"]:
            print(f"❌ Enrollment failed: {enrollment_result['error']}")
            raise HTTPException(
                status_code=400,
                detail=f"Failed to enroll in course: {enrollment_result['error']}"
            )
        
        print(f"✅ User enrolled in Moodle course: {moodle_course_id}")
        
        # Generate SSO URL for direct access to the course
        sso_url = get_sso_login_url(current_user.id, moodle_course_id, moodle_user_id)
        
        # Alternative direct course URL (if SSO is not configured)
        course_url = f"{os.getenv('MOODLE_URL', 'https://moodle.architectureacademics.com')}/course/view.php?id={moodle_course_id}"
        
        enrollment_data = {
            "user_id": current_user.id,
            "course_id": course_id,
            "moodle_course_id": moodle_course_id,
            "moodle_user_id": moodle_user_id,
            "enrollment_date": datetime.utcnow().isoformat(),
            "status": "active",
            "access_granted": True,
            "sso_url": sso_url,
            "course_url": course_url
        }
        
        # TODO: Store enrollment in local database
        # enrollment = crud.create_nata_enrollment(db, enrollment_data)
        
        return {
            "success": True, 
            "message": "Successfully enrolled in NATA course! Redirecting to Moodle LMS...",
            "data": enrollment_data,
            "moodle_direct_url": sso_url,
            "course_access_url": course_url,
            "instructions": {
                "step1": "You will be automatically logged into Moodle LMS",
                "step2": "Access your course materials and videos",
                "step3": "Track your progress through the course modules",
                "step4": "Participate in discussions and submit assignments"
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Enrollment error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Enrollment failed: {str(e)}")

@router.get("/user/enrollments")
async def get_user_nata_enrollments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's NATA course enrollments and progress"""
    # Sample user enrollment data
    enrollments = [
        {
            "course_id": 1,
            "course_title": "NATA Drawing Fundamentals",
            "enrollment_date": "2024-10-01",
            "progress": 65,
            "status": "active",
            "next_lesson": "Perspective Drawing Basics",
            "moodle_course_url": "https://moodle.architectureacademics.com/course/nata-drawing"
        }
    ]
    
    return {"success": True, "data": enrollments}

@router.get("/{course_id}/access")
async def get_course_access_url(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get direct access URL to Moodle course for enrolled users"""
    try:
        # Check if user is enrolled (this should check your database)
        # For now, we'll simulate enrollment check
        moodle_user_id = getattr(current_user, 'moodle_user_id', current_user.id + 1000)  # Temporary mapping
        
        # Map course_id to Moodle course ID
        moodle_course_mapping = {
            1: 101,  # NATA Drawing Fundamentals
            2: 102,  # NATA Mathematics Foundation
            3: 103,  # NATA General Aptitude
            4: 104,  # NATA Complete Package
        }
        
        moodle_course_id = moodle_course_mapping.get(course_id, course_id)
        
        # Generate SSO URL for direct access
        sso_url = get_sso_login_url(current_user.id, moodle_course_id, moodle_user_id)
        course_url = f"{os.getenv('MOODLE_URL', 'https://moodle.architectureacademics.com')}/course/view.php?id={moodle_course_id}"
        
        return {
            "success": True,
            "course_id": course_id,
            "moodle_course_id": moodle_course_id,
            "sso_url": sso_url,
            "course_url": course_url,
            "message": "Click the URL to access your course on Moodle LMS"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get course access: {str(e)}")