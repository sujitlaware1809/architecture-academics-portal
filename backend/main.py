from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import crud
import schemas
from database import SessionLocal
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import route modules
from routes import (
    auth_routes,
    job_routes,
    application_routes,
    course_routes,
    blog_routes,
    discussion_routes,
    nata_course_routes,
    event_routes,
    workshop_routes,
    admin_routes,
    registration_routes,
    test_routes,
    user_routes,
    message_routes,
    notification_routes,
    search_routes
)

# Import middleware
import os
import ast
from fastapi.middleware.cors import CORSMiddleware

# Create FastAPI app
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
VIDEO_DIR.mkdir(exist_ok=True)
MATERIAL_DIR.mkdir(exist_ok=True)
RESUME_DIR.mkdir(exist_ok=True)

# Serve static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# Configure CORS middleware
origins = [
    "http://localhost:3000",     # Next.js development server
    "http://127.0.0.1:3000",
    "http://localhost:8000",     # Backend API
    "http://127.0.0.1:8000",
    "http://15.206.47.135",      # Production EC2
    "http://15.206.47.135:3000",
    "http://15.206.47.135:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route modules with /api prefix
app.include_router(admin_routes.router, prefix="/api")
app.include_router(auth_routes.router, prefix="/api")
app.include_router(job_routes.router, prefix="/api")
app.include_router(application_routes.router, prefix="/api")
app.include_router(course_routes.router, prefix="/api")
app.include_router(blog_routes.router, prefix="/api")
app.include_router(discussion_routes.router, prefix="/api")
app.include_router(nata_course_routes.router, prefix="/api")
app.include_router(event_routes.router, prefix="/api")
app.include_router(workshop_routes.router, prefix="/api")
app.include_router(registration_routes.router, prefix="/api")
app.include_router(test_routes.router, prefix="/api")
app.include_router(user_routes.router, prefix="/api")
app.include_router(message_routes.router, prefix="/api")
app.include_router(notification_routes.router, prefix="/api")
app.include_router(search_routes.router, prefix="/api")

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Architecture Academics API with Jobs Portal", "status": "running"}

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Jobs Portal API is running"}

# Development route for creating predefined recruiter
@app.post("/dev/create-recruiter")
async def create_predefined_recruiter():
    """Create predefined recruiter account (development only)"""
    db = SessionLocal()
    try:
        recruiter = crud.create_predefined_recruiter(db)
        return {
            "message": "Predefined recruiter created successfully",
            "email": "recruiter@architectureacademics.com",
            "password": "Recruiter@123",
            "user": recruiter
        }
    finally:
        db.close()

@app.on_event("startup")
async def startup_event():
    """Create predefined admin, recruiter and sample data on startup"""
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
        
        # Create sample courses if none exist
        from database import Course
        existing_courses_count = db.query(Course).count()
        
        if existing_courses_count == 0:
            print("📚 Creating sample courses...")
            from seed_data import get_sample_courses
            from seed_lessons import get_sample_lessons_for_course, get_digital_tools_lessons, get_sustainable_architecture_lessons
            from database import CourseLesson
            
            sample_courses = get_sample_courses()
            created_courses = 0
            
            for idx, course_data in enumerate(sample_courses):
                try:
                    course = crud.create_course(db, course_data)
                    if course:
                        created_courses += 1
                        print(f"✅ Created course: {course.title}")
                        
                        # Add lessons to the course
                        if idx == 0:  # First course - Introduction to Architectural Design
                            lessons = get_sample_lessons_for_course(course.id)
                        elif idx == 2:  # Third course - Digital Tools
                            lessons = get_digital_tools_lessons(course.id)
                        elif idx == 1:  # Second course - Sustainable Architecture
                            lessons = get_sustainable_architecture_lessons(course.id)
                        else:
                            lessons = get_sample_lessons_for_course(course.id)
                        
                        for lesson_data in lessons:
                            lesson = CourseLesson(**lesson_data)
                            db.add(lesson)
                        
                        db.commit()
                        print(f"   📹 Added {len(lessons)} lessons with YouTube videos")
                        
                except Exception as e:
                    print(f"❌ Failed to create course: {e}")
                    db.rollback()
            
            print(f"🎉 Created {created_courses} sample courses with video lessons!")
        else:
            print(f"✅ Found {existing_courses_count} existing courses in database")
        
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
        
        # Seed sample blogs if none exist
        from database import Blog
        existing_blogs_count = db.query(Blog).count()
        
        if existing_blogs_count == 0:
            print("📝 Seeding sample blog posts...")
            try:
                from seed_blogs import seed_blogs
                seed_blogs()
            except Exception as e:
                print(f"❌ Failed to seed blogs: {e}")
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
                )
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
        else:
            print(f"✅ Found {existing_discussions_count} existing discussions in database")
            
    except Exception as e:
        print(f"❌ Error during startup: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)