"""
Seed data for blogs
"""
from database import SessionLocal, Blog
from schemas import BlogCategory, BlogStatus
from datetime import datetime, timedelta


def seed_blogs(db_session=None, default_author_id=None):
    """Create sample blog posts"""
    db = db_session if db_session else SessionLocal()
    should_close = db_session is None
    
    try:
        # Get author ID if not provided
        if not default_author_id:
            # Try to find a user
            from database import User
            user = db.query(User).first()
            if user:
                default_author_id = user.id
            else:
                print("No users found. Cannot seed blogs without an author.")
                return

        # Sample blog posts
        blogs = [
            {
                "title": "Top 10 Architecture Schools in India for 2025",
                "slug": "top-10-architecture-schools-india-2025",
                "excerpt": "Discover the best architecture colleges in India offering world-class education, faculty, and infrastructure for aspiring architects.",
                "content": """
# Top 10 Architecture Schools in India for 2025

India has emerged as a hub for architectural education, with numerous institutions offering world-class programs. Here's our comprehensive guide to the top 10 architecture schools in India.

## 1. IIT Kharagpur - School of Architecture

The School of Architecture at IIT Kharagpur is one of the oldest and most prestigious architecture schools in India. Established in 1951, it offers undergraduate, postgraduate, and doctoral programs.

**Key Highlights:**
- NIRF Ranking: Top 3
- Excellent faculty-student ratio
- State-of-the-art design studios
- Strong industry connections

## 2. School of Planning and Architecture (SPA) Delhi

SPA Delhi is India's premier institution for architecture and planning education. Founded in 1941, it has produced some of the country's finest architects.

**Why Choose SPA Delhi:**
- Autonomous institution
- Excellent placement record
- Urban design specialization
- Research opportunities

## 3. CEPT University, Ahmedabad

CEPT University is known for its innovative teaching methods and focus on sustainable architecture.

## 4. Sir JJ College of Architecture, Mumbai

One of the oldest architecture schools in India, established in 1913.

## 5. IIT Roorkee

Offers comprehensive B.Arch and M.Arch programs with excellent infrastructure.

## Conclusion

Choosing the right architecture school is crucial for your career. Consider factors like faculty, infrastructure, placement records, and specializations when making your decision.
""",
                "category": BlogCategory.EDUCATION.value,
                "tags": "architecture schools, education, career, IIT, SPA",
                "featured_image": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800",
                "author_id": default_author_id,
                "is_featured": True,
                "status": BlogStatus.PUBLISHED.value,
                "views_count": 150,
                "likes_count": 45,
            },
            {
                "title": "NATA 2025: Complete Preparation Guide",
                "slug": "nata-2025-complete-preparation-guide",
                "excerpt": "Everything you need to know about NATA 2025 - exam pattern, syllabus, preparation tips, and best resources to crack the exam.",
                "content": """
# NATA 2025: Complete Preparation Guide

The National Aptitude Test in Architecture (NATA) is the gateway to India's top architecture colleges. Here's your complete guide to ace NATA 2025.

## Understanding NATA Exam Pattern

NATA consists of two parts:
1. **Drawing Test (Part A)**: Tests your drawing and observation skills
2. **Aptitude Test (Part B)**: Tests general aptitude and logical reasoning

## Syllabus Breakdown

### Drawing Section
- Perspective drawing
- Sketching of patterns and textures
- Understanding of scale and proportion
- Color theory and composition

### Aptitude Section
- Mathematics (Class 11 & 12 level)
- General Aptitude
- Logical Reasoning

## Preparation Strategy

### 3 Months Before Exam
- Complete the entire syllabus
- Practice drawing daily
- Strengthen mathematics fundamentals

### 1 Month Before Exam
- Take full-length mock tests
- Revise all topics
- Focus on weak areas

## Best Resources

1. **Books**: Study material from reputed publishers
2. **Online Courses**: Video tutorials and practice tests
3. **Mock Tests**: Regular practice with timed tests

## Tips from Toppers

- Practice drawing every single day
- Time management is crucial
- Don't neglect mathematics
- Stay calm during the exam

## Conclusion

With consistent practice and the right strategy, you can definitely crack NATA 2025. Stay focused and keep practicing!
""",
                "category": BlogCategory.EDUCATION.value,
                "tags": "NATA, exam preparation, architecture entrance, study tips",
                "featured_image": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800",
                "author_id": default_author_id,
                "is_featured": True,
                "status": BlogStatus.PUBLISHED.value,
                "views_count": 200,
                "likes_count": 50,
            },
            {
                "title": "Sustainable Architecture: Future of Building Design",
                "slug": "sustainable-architecture-future-building-design",
                "excerpt": "Explore how sustainable architecture is shaping the future of building design with eco-friendly materials and green technologies.",
                "content": """
# Sustainable Architecture: Future of Building Design

Sustainable architecture is no longer just a trend—it's the future. Here's how architects are revolutionizing building design.

## What is Sustainable Architecture?

Sustainable architecture focuses on minimizing the environmental impact of buildings through:
- Energy efficiency
- Sustainable materials
- Water conservation
- Waste reduction

## Key Principles

### 1. Energy Efficiency
- Solar panels
- Natural ventilation
- LED lighting
- Smart building systems

### 2. Sustainable Materials
- Recycled materials
- Locally sourced materials
- Low-VOC products
- Renewable resources

### 3. Water Conservation
- Rainwater harvesting
- Greywater recycling
- Water-efficient fixtures
- Xeriscaping

## Case Studies

### Bullitt Center, Seattle
The greenest commercial building in the world, achieving net-zero energy and water.

### Edge, Amsterdam
World's smartest building with maximum sustainability and minimal environmental impact.

## The Future

Sustainable architecture will continue to evolve with:
- AI-powered building management
- Carbon-neutral construction
- Circular economy principles
- Biophilic design

## Conclusion

As architects, we have a responsibility to design buildings that are not just beautiful but also sustainable for future generations.
""",
                "category": BlogCategory.SUSTAINABLE_DESIGN.value,
                "tags": "sustainable design, green building, eco-friendly, future architecture",
                "featured_image": "https://images.unsplash.com/photo-1518005068251-37900150dfca?w=800",
                "author_id": default_author_id,
                "is_featured": True,
                "status": BlogStatus.PUBLISHED.value,
                "status": BlogStatus.PUBLISHED.value,
                "published_at": datetime.utcnow() - timedelta(days=7),
                "read_time_minutes": 7,
            },
            {
                "title": "Career Opportunities in Architecture: Beyond Traditional Practice",
                "slug": "career-opportunities-architecture-beyond-traditional",
                "excerpt": "Architecture offers diverse career paths beyond traditional practice. Discover unconventional career options for architecture graduates.",
                "content": """
# Career Opportunities in Architecture: Beyond Traditional Practice

An architecture degree opens doors to numerous career paths. Let's explore diverse opportunities beyond traditional architectural practice.

## Traditional Paths

### 1. Architectural Practice
- Design architect
- Project architect
- Senior architect
- Principal architect

### 2. Urban Planning
- Urban designer
- City planner
- Regional planner

## Alternative Career Paths

### 1. Interior Design
- Residential interior design
- Commercial interior design
- Furniture design

### 2. Landscape Architecture
- Garden design
- Public space design
- Environmental planning

### 3. Construction Management
- Project manager
- Site supervisor
- Construction consultant

### 4. Academia and Research
- Professor/Lecturer
- Research scholar
- Architectural historian

### 5. Digital and Technology
- BIM specialist
- Computational designer
- Virtual reality architect
- Parametric design specialist

### 6. Media and Communication
- Architectural photographer
- Architectural writer
- Blogger/Vlogger
- Social media influencer

### 7. Real Estate
- Real estate consultant
- Property developer
- Real estate marketing

## Skills Required

### Technical Skills
- CAD software (AutoCAD, Revit)
- 3D modeling (SketchUp, Rhino)
- Rendering software (Lumion, V-Ray)
- Graphic design (Adobe Suite)

### Soft Skills
- Communication
- Project management
- Problem-solving
- Leadership

## Salary Expectations

Entry-level positions: ₹3-5 lakhs per annum
Mid-level positions: ₹8-15 lakhs per annum
Senior positions: ₹20-50+ lakhs per annum

## Conclusion

Architecture offers incredible career diversity. Choose a path that aligns with your interests and strengths!
""",
                "category": BlogCategory.CAREER_ADVICE.value,
                "tags": "career, job opportunities, architecture careers, career guide",
                "featured_image": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800",
                "author_id": default_author_id,
                "is_featured": False,
                "status": BlogStatus.PUBLISHED.value,
                "views_count": 120,
                "likes_count": 30,
            },
            {
                "title": "Top Digital Tools Every Architecture Student Should Master",
                "slug": "digital-tools-architecture-students-should-master",
                "excerpt": "From AutoCAD to Revit, discover essential digital tools that every architecture student must learn for a successful career.",
                "content": """
# Top Digital Tools Every Architecture Student Should Master

In today's digital age, proficiency in software tools is essential for architecture students. Here's a comprehensive guide.

## Essential CAD Software

### 1. AutoCAD
**Use Case:** 2D drafting and documentation
**Learning Curve:** Moderate
**Industry Standard:** Yes

**Key Features:**
- Precise 2D drawing
- Layer management
- Annotation tools
- DWG file format

### 2. Revit (BIM)
**Use Case:** Building Information Modeling
**Learning Curve:** Steep
**Industry Demand:** Very High

**Why Learn Revit:**
- Industry-standard BIM software
- Parametric modeling
- Collaboration features
- Construction documentation

## 3D Modeling Software

### 1. SketchUp
**Best For:** Quick conceptual modeling
**Ease of Use:** Easy
**Cost:** Free version available

### 2. Rhino
**Best For:** Complex geometries
**Use Case:** Parametric design
**Industry:** High-end projects

## Rendering Software

### 1. Lumion
- Real-time rendering
- Easy to learn
- Beautiful output

### 2. V-Ray
- Photorealistic renders
- Industry standard
- Advanced lighting

## Graphic Design Tools

### Adobe Creative Suite
1. **Photoshop** - Image editing, post-processing
2. **Illustrator** - Diagrams, presentations
3. **InDesign** - Portfolio layouts

## Emerging Technologies

### 1. Parametric Design
- Grasshopper
- Dynamo

### 2. Virtual Reality
- Enscape
- Twinmotion

### 3. AI Tools
- Midjourney (concept generation)
- Stable Diffusion

## Learning Path

### Year 1-2
- AutoCAD basics
- SketchUp fundamentals
- Adobe Photoshop

### Year 3-4
- Revit (BIM)
- Advanced rendering
- Parametric design basics

### Post-Graduation
- Specialization based on career path
- Advanced tools
- Emerging technologies

## Resources

1. **YouTube Tutorials** - Free learning
2. **Udemy/Coursera** - Structured courses
3. **LinkedIn Learning** - Professional courses
4. **Official Documentation** - In-depth knowledge

## Tips for Learning

- Practice daily
- Work on real projects
- Join online communities
- Stay updated with new tools

## Conclusion

Mastering these digital tools will give you a competitive edge in the architecture industry. Start learning today!
""",
                "category": BlogCategory.TECHNOLOGY.value,
                "tags": "software, digital tools, AutoCAD, Revit, BIM, tutorials",
                "featured_image": "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800",
                "author_id": default_author_id,
                "is_featured": True,
                "status": BlogStatus.PUBLISHED.value,
                "views_count": 180,
                "likes_count": 60,
            },
            {
                "title": "Understanding Different Architectural Styles Through History",
                "slug": "architectural-styles-through-history",
                "excerpt": "Journey through architectural history from ancient civilizations to modern contemporary design.",
                "content": """
# Understanding Different Architectural Styles Through History

Architecture reflects the culture, technology, and aspirations of its time. Let's explore major architectural styles.

## Ancient Architecture

### Egyptian Architecture (3000 BC - 30 BC)
- Pyramids and temples
- Massive stone structures
- Symbolic geometry

### Greek Architecture (800 BC - 146 BC)
- Classical orders (Doric, Ionic, Corinthian)
- Temples and theaters
- Emphasis on proportion and symmetry

### Roman Architecture (509 BC - 476 AD)
- Arches, vaults, and domes
- Concrete construction
- Public buildings and infrastructure

## Medieval Architecture

### Byzantine (330 AD - 1453 AD)
- Domes and pendentives
- Rich decoration
- Religious buildings

### Gothic (12th - 16th century)
- Pointed arches
- Flying buttresses
- Stained glass windows
- Vertical emphasis

## Renaissance to Modern

### Renaissance (14th - 17th century)
- Revival of classical principles
- Symmetry and proportion
- Domes and facades

### Baroque (17th - 18th century)
- Dramatic effects
- Curved lines
- Ornate decoration

### Modern Architecture (20th century)
- Form follows function
- Minimal ornamentation
- New materials (steel, glass, concrete)

## Contemporary Architecture

### Deconstructivism
- Frank Gehry
- Zaha Hadid
- Fragmented forms

### Sustainable Design
- Green building
- Energy efficiency
- Biomimicry

## Regional Styles in India

### Traditional Indian Architecture
- Temple architecture
- Fort architecture
- Haveli design

### Indo-Saracenic
- British colonial influence
- Fusion of Indian and Islamic styles

## Conclusion

Understanding architectural history helps us appreciate the evolution of design and informs our contemporary practice.
""",
                "category": BlogCategory.DESIGN_TRENDS.value,
                "tags": "architectural history, design styles, architecture theory",
                "featured_image": "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800",
                "author_id": default_author_id,
                "is_featured": False,
                "status": BlogStatus.PUBLISHED.value,
                "views_count": 80,
                "likes_count": 25,
            },
        ]
        
        # Create blog posts
        for blog_data in blogs:
            # Check if blog exists
            existing_blog = db.query(Blog).filter(Blog.slug == blog_data["slug"]).first()
            if not existing_blog:
                blog = Blog(**blog_data)
                db.add(blog)
                print(f"Added blog: {blog.title}")
            else:
                print(f"Blog already exists: {blog_data['title']}")
        
        db.commit()
        print(f"✅ Blog seeding completed")
        
    except Exception as e:
        print(f"Error seeding blogs: {e}")
        db.rollback()
    finally:
        if should_close:
            db.close()


if __name__ == "__main__":
    seed_blogs()
