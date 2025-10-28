from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import crud
import schemas
from database import SessionLocal

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
    test_routes
)

# Import middleware
from middleware.cors_middleware import configure_cors

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
configure_cors(app)

# Register route modules
app.include_router(auth_routes.router)
app.include_router(job_routes.router)
app.include_router(application_routes.router)
app.include_router(course_routes.router)
app.include_router(blog_routes.router)
app.include_router(discussion_routes.router)
app.include_router(nata_course_routes.router)
app.include_router(event_routes.router)
app.include_router(workshop_routes.router)
app.include_router(admin_routes.router)
app.include_router(registration_routes.router)
app.include_router(test_routes.router)

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

The future of architecture lies in sustainability. As professionals in this field, we have the responsibility and opportunity to shape a better, greener future for generations to come.""",
                    excerpt="Exploring the latest trends and innovations in sustainable architecture, from net-zero buildings to biophilic design and smart technology.",
                    category=schemas.BlogCategory.SUSTAINABLE_DESIGN,
                    tags="sustainability, green architecture, net-zero, biophilic design, smart buildings",
                    is_featured=True,
                    status=schemas.BlogStatus.PUBLISHED
                )
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
    uvicorn.run(app, host="0.0.0.0", port=8000)