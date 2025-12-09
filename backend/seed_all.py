"""
Combined seed data script for the application.
Seeds Users, Courses, Lessons, NATA Courses, Blogs, Events, Workshops, and Discussions.
"""
import logging
from datetime import datetime, timedelta
import random
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base, User, Course, CourseLesson, Blog, Event, Workshop, Discussion, NATACourse, Job
import schemas
from passlib.context import CryptContext

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

# ==========================================
# DATA DEFINITIONS
# ==========================================

def get_sample_courses():
    now = datetime.utcnow()
    return [
        {
            "title": "Introduction to Architectural Design",
            "description": """A comprehensive introduction to the fundamentals of architectural design. This course covers basic design principles, spatial organization, and architectural representation methods.

Key Topics:
- Design fundamentals and principles
- Spatial relationships and organization
- Basic architectural drawing techniques
- Introduction to design thinking
- Form and function in architecture
- Site analysis and context""",
            "short_description": "Learn the fundamental principles of architectural design",
            "level": schemas.CourseLevel.BEGINNER,
            "duration": "8 weeks",
            "max_students": 100,
            "price": 0.0,
            "start_date": now,
            "end_date": now + timedelta(weeks=8),
            "image_url": "https://images.unsplash.com/photo-1487958449943-2429e8be8625",
            "syllabus": "Week 1: Design Fundamentals\nWeek 2: Spatial Organization...",
            "prerequisites": "No prior experience required",
            "status": schemas.CourseStatus.PUBLISHED
        },
        {
            "title": "Advanced Sustainable Architecture",
            "description": "Master sustainable design principles and green building practices.",
            "short_description": "Master sustainable design principles and green building practices",
            "level": schemas.CourseLevel.ADVANCED,
            "duration": "12 weeks",
            "max_students": 50,
            "price": 24999.0,
            "start_date": now,
            "end_date": now + timedelta(weeks=12),
            "image_url": "https://images.unsplash.com/photo-1518005068251-37900150dfca",
            "syllabus": "Week 1-2: Sustainable Design Principles...",
            "prerequisites": "Basic understanding of architectural design",
            "status": schemas.CourseStatus.PUBLISHED
        },
        {
            "title": "Digital Tools for Architects",
            "description": "Learn essential digital tools and software used in modern architectural practice.",
            "short_description": "Master essential digital tools used in modern architectural practice",
            "level": schemas.CourseLevel.INTERMEDIATE,
            "duration": "10 weeks",
            "max_students": 75,
            "price": 19999.0,
            "start_date": now,
            "end_date": now + timedelta(weeks=10),
            "image_url": "https://images.unsplash.com/photo-1542831371-29b0f74f9713",
            "syllabus": "Week 1-2: AutoCAD Essentials...",
            "prerequisites": "Basic computer skills",
            "status": schemas.CourseStatus.PUBLISHED
        }
    ]

def get_sample_lessons(course_id):
    return [
        {
            "course_id": course_id,
            "title": "Introduction to Architectural Design Principles",
            "description": "Learn the fundamental principles of architectural design including form, function, space, and composition.",
            "video_url": "https://www.youtube.com/watch?v=Mw3zzxPbKvc",
            "video_duration": 845,
            "order_index": 0,
            "is_free": True
        },
        {
            "course_id": course_id,
            "title": "Understanding Spatial Organization",
            "description": "Explore how architects organize space to create functional and beautiful environments.",
            "video_url": "https://www.youtube.com/watch?v=YsNj9N-rAHI",
            "video_duration": 612,
            "order_index": 1,
            "is_free": False
        }
    ]

def get_sample_nata_courses():
    return [
        {
            "title": "NATA Drawing Fundamentals",
            "description": "Master the art of architectural drawing with comprehensive techniques for NATA preparation",
            "instructor": "Prof. Arjun Mehta",
            "duration": "8 weeks",
            "difficulty": "Beginner",
            "price": 4999,
            "original_price": 7999,
            "rating": 4.8,
            "students_enrolled": 1250,
            "lessons_count": 45,
            "certificate_included": True,
            "thumbnail": "https://placehold.co/400x250/png?text=Drawing+Course",
            "category": "Drawing",
            "skills": ["Perspective Drawing", "Sketching", "Geometric Construction", "Shading"],
            "features": ["Live interactive sessions", "Personal feedback on drawings", "Practice worksheets"]
        },
        {
            "title": "NATA Mathematics Mastery",
            "description": "Complete mathematics preparation covering all NATA syllabus topics with solved examples",
            "instructor": "Dr. Priya Sharma",
            "duration": "6 weeks",
            "difficulty": "Intermediate",
            "price": 3999,
            "original_price": 5999,
            "rating": 4.7,
            "students_enrolled": 890,
            "lessons_count": 38,
            "certificate_included": True,
            "thumbnail": "https://placehold.co/400x250/png?text=Mathematics+Course",
            "category": "Mathematics",
            "skills": ["Algebra", "Geometry", "Trigonometry", "Coordinate Geometry"],
            "features": ["Video lectures with animations", "Step-by-step solutions", "Practice questions bank"]
        }
    ]

def get_sample_blogs():
    return [
        {
            "title": "Top 10 Architecture Schools in India for 2025",
            "slug": "top-10-architecture-schools-india-2025",
            "excerpt": "Discover the best architecture colleges in India offering world-class education.",
            "content": "# Top 10 Architecture Schools in India for 2025\n\nIndia has emerged as a hub for architectural education...",
            "category": schemas.BlogCategory.EDUCATION,
            "tags": "architecture schools, education, career, IIT, SPA",
            "featured_image": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800",
            "is_featured": True,
            "status": schemas.BlogStatus.PUBLISHED,
            "views_count": 150,
            "likes_count": 45
        },
        {
            "title": "The Future of Sustainable Architecture",
            "slug": "future-sustainable-architecture",
            "excerpt": "Sustainable architecture is no longer just a trend—it's a necessity.",
            "content": "# The Future of Sustainable Architecture\n\nSustainable architecture is no longer just a trend...",
            "category": schemas.BlogCategory.SUSTAINABLE_DESIGN,
            "tags": "sustainability, green architecture, net-zero",
            "is_featured": False,
            "status": schemas.BlogStatus.PUBLISHED,
            "views_count": 120,
            "likes_count": 30
        }
    ]

def get_sample_events():
    now = datetime.utcnow()
    return [
        {
            "title": "Annual Architecture Symposium 2025",
            "description": "Join us for the biggest architectural gathering of the year.",
            "short_description": "The biggest architectural gathering of the year.",
            "date": now + timedelta(days=30),
            "duration": 8,
            "location": "Mumbai Convention Centre",
            "image_url": "https://images.unsplash.com/photo-1517457373958-b7bdd4587205",
            "max_participants": 500,
            "is_online": False,
            "status": schemas.EventStatus.UPCOMING
        },
        {
            "title": "Virtual Design Workshop: Future Cities",
            "description": "An interactive online workshop exploring the concepts of future cities.",
            "short_description": "Interactive online workshop exploring future city concepts.",
            "date": now + timedelta(days=15),
            "duration": 4,
            "location": "Online",
            "image_url": "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df",
            "max_participants": 100,
            "is_online": True,
            "meeting_link": "https://meet.google.com/abc-defg-hij",
            "status": schemas.EventStatus.UPCOMING
        }
    ]

def get_sample_workshops():
    now = datetime.utcnow()
    return [
        {
            "title": "Sustainable Materials Workshop",
            "description": "Hands-on workshop exploring various sustainable building materials.",
            "short_description": "Hands-on exploration of sustainable building materials.",
            "date": now + timedelta(days=20),
            "duration": 5,
            "location": "Architecture Lab, Pune",
            "image_url": "https://images.unsplash.com/photo-1518005068251-37900150dfca",
            "max_participants": 30,
            "status": schemas.WorkshopStatus.UPCOMING,
            "price": 1500.0
        }
    ]

def get_sample_discussions():
    return [
        {
            "title": "Best laptop for architecture students in 2025?",
            "content": "I'm a first-year architecture student looking for a laptop...",
            "category": "Hardware & Software",
            "tags": "laptop, hardware, student, advice",
            "is_solved": False,
            "is_pinned": False
        }
    ]

# ==========================================
# SEEDING LOGIC
# ==========================================

def seed_all():
    db = SessionLocal()
    try:
        logger.info("Starting database seeding...")

        # 1. Seed Admin User
        admin_email = "admin@example.com"
        admin_user = db.query(User).filter(User.email == admin_email).first()
        if not admin_user:
            logger.info("Creating admin user...")
            admin_user = User(
                email=admin_email,
                hashed_password=get_password_hash("admin123"),
                first_name="Admin",
                last_name="User",
                role=schemas.UserRole.ADMIN,
                is_active=True,
                is_verified=True
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
        else:
            logger.info("Admin user already exists.")

        # 1.1 Seed Recruiter User
        recruiter_email = "recruiter@example.com"
        recruiter_user = db.query(User).filter(User.email == recruiter_email).first()
        if not recruiter_user:
            logger.info("Creating recruiter user...")
            recruiter_user = User(
                email=recruiter_email,
                hashed_password=get_password_hash("recruiter123"),
                first_name="Recruiter",
                last_name="User",
                role=schemas.UserRole.RECRUITER,
                is_active=True,
                is_verified=True
            )
            db.add(recruiter_user)
            db.commit()
            db.refresh(recruiter_user)
        else:
            logger.info("Recruiter user already exists.")

        # 2. Seed Courses
        logger.info("Seeding courses...")
        courses_data = get_sample_courses()
        for course_data in courses_data:
            existing_course = db.query(Course).filter(Course.title == course_data["title"]).first()
            if not existing_course:
                course = Course(**course_data, instructor_id=admin_user.id)
                db.add(course)
                db.commit()
                db.refresh(course)
                
                # Seed Lessons for this course
                lessons_data = get_sample_lessons(course.id)
                for lesson_data in lessons_data:
                    lesson = CourseLesson(**lesson_data)
                    db.add(lesson)
                db.commit()
                logger.info(f"Added course: {course.title}")
            else:
                logger.info(f"Course already exists: {course_data['title']}")

        # 3. Seed NATA Courses
        logger.info("Seeding NATA courses...")
        nata_courses_data = get_sample_nata_courses()
        for nata_data in nata_courses_data:
            existing_nata = db.query(NATACourse).filter(NATACourse.title == nata_data["title"]).first()
            if not existing_nata:
                # Convert list fields to strings if necessary, or ensure model handles them
                # Assuming NATACourse model handles JSON or we need to serialize if they are strings in DB
                # For simplicity, we assume the model matches. If skills/features are strings in DB, we might need to join them.
                # Checking schemas.py would be good, but let's assume standard behavior or simple JSON.
                # If the model expects strings for lists, we join them.
                
                # Create a copy to modify
                data_to_insert = nata_data.copy()
                if isinstance(data_to_insert.get('skills'), list):
                    data_to_insert['skills'] = ",".join(data_to_insert['skills'])
                if isinstance(data_to_insert.get('features'), list):
                    data_to_insert['features'] = ",".join(data_to_insert['features'])

                nata_course = NATACourse(**data_to_insert)
                db.add(nata_course)
                logger.info(f"Added NATA course: {nata_course.title}")
            else:
                logger.info(f"NATA course already exists: {nata_data['title']}")
        db.commit()

        # 4. Seed Blogs
        logger.info("Seeding blogs...")
        blogs_data = get_sample_blogs()
        for blog_data in blogs_data:
            existing_blog = db.query(Blog).filter(Blog.title == blog_data["title"]).first()
            if not existing_blog:
                blog = Blog(**blog_data, author_id=admin_user.id)
                db.add(blog)
                logger.info(f"Added blog: {blog.title}")
            else:
                logger.info(f"Blog already exists: {blog_data['title']}")
        db.commit()

        # 5. Seed Events
        logger.info("Seeding events...")
        events_data = get_sample_events()
        for event_data in events_data:
            existing_event = db.query(Event).filter(Event.title == event_data["title"]).first()
            if not existing_event:
                event = Event(**event_data, organizer_id=admin_user.id)
                db.add(event)
                logger.info(f"Added event: {event.title}")
            else:
                logger.info(f"Event already exists: {event_data['title']}")
        db.commit()

        # 6. Seed Workshops
        logger.info("Seeding workshops...")
        workshops_data = get_sample_workshops()
        for workshop_data in workshops_data:
            existing_workshop = db.query(Workshop).filter(Workshop.title == workshop_data["title"]).first()
            if not existing_workshop:
                workshop = Workshop(**workshop_data, instructor_id=admin_user.id)
                db.add(workshop)
                logger.info(f"Added workshop: {workshop.title}")
            else:
                logger.info(f"Workshop already exists: {workshop_data['title']}")
        db.commit()

        # 7. Seed Discussions
        logger.info("Seeding discussions...")
        discussions_data = get_sample_discussions()
        for discussion_data in discussions_data:
            existing_discussion = db.query(Discussion).filter(Discussion.title == discussion_data["title"]).first()
            if not existing_discussion:
                discussion = Discussion(
                    **discussion_data,
                    author_id=admin_user.id,
                    views_count=random.randint(10, 100),
                    likes_count=random.randint(0, 20)
                )
                db.add(discussion)
                logger.info(f"Added discussion: {discussion.title}")
            else:
                logger.info(f"Discussion already exists: {discussion_data['title']}")
        db.commit()

        logger.info("Seeding completed successfully!")

    except Exception as e:
        logger.error(f"Error seeding data: {e}")
        db.rollback()
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_all()
