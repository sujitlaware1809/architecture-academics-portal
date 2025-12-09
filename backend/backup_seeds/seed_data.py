"""Initial data seeding for the application."""

import schemas
from datetime import datetime, timedelta

def get_sample_courses():
    """Returns a list of sample courses to seed the database."""
    
    now = datetime.utcnow()
    return [
        schemas.CourseCreate(
            title="Introduction to Architectural Design",
            description="""A comprehensive introduction to the fundamentals of architectural design. This course covers basic design principles, spatial organization, and architectural representation methods.

Key Topics:
- Design fundamentals and principles
- Spatial relationships and organization
- Basic architectural drawing techniques
- Introduction to design thinking
- Form and function in architecture
- Site analysis and context

Through practical exercises and theoretical discussions, students will develop a strong foundation in architectural design concepts.""",
            short_description="Learn the fundamental principles of architectural design",
            level=schemas.CourseLevel.BEGINNER,
            duration="8 weeks",
            max_students=100,
            price=0.0,  # Free course
            start_date=now,
            end_date=now + timedelta(weeks=8),
            image_url="https://images.unsplash.com/photo-1487958449943-2429e8be8625",
            syllabus="""Week 1: Design Fundamentals
Week 2: Spatial Organization
Week 3: Architectural Drawing Basics
Week 4: Design Thinking Process
Week 5: Form and Function
Week 6: Site Analysis
Week 7: Project Development
Week 8: Final Presentation""",
            prerequisites="No prior experience required"
        ),
        
        schemas.CourseCreate(
            title="Advanced Sustainable Architecture",
            description="""Master sustainable design principles and green building practices. Learn about energy-efficient design, sustainable materials, and environmental certification systems.

Course Highlights:
- Sustainable design strategies
- Green building materials and technologies
- LEED certification process
- Energy efficiency in architecture
- Water conservation methods
- Waste reduction strategies

This course combines theoretical knowledge with practical applications through case studies and design projects.""",
            short_description="Master sustainable design principles and green building practices",
            level=schemas.CourseLevel.ADVANCED,
            duration="12 weeks",
            max_students=50,
            price=24999.0,
            start_date=now,
            end_date=now + timedelta(weeks=12),
            image_url="https://images.unsplash.com/photo-1518005068251-37900150dfca",
            syllabus="""Week 1-2: Sustainable Design Principles
Week 3-4: Green Building Materials
Week 5-6: Energy Efficiency
Week 7-8: Water Conservation
Week 9-10: LEED Certification
Week 11-12: Capstone Project""",
            prerequisites="Basic understanding of architectural design and building systems"
        ),
        
        schemas.CourseCreate(
            title="Digital Tools for Architects",
            description="""Learn essential digital tools and software used in modern architectural practice. Master industry-standard programs for design, modeling, and presentation.

Software Covered:
- AutoCAD for 2D drafting
- SketchUp for 3D modeling
- Revit for BIM
- Adobe Creative Suite for visualization
- Lumion for rendering
- Rhino basics

Includes hands-on exercises and real-world project examples.""",
            short_description="Master essential digital tools used in modern architectural practice",
            level=schemas.CourseLevel.INTERMEDIATE,
            duration="10 weeks",
            max_students=75,
            price=19999.0,
            start_date=now,
            end_date=now + timedelta(weeks=10),
            image_url="https://images.unsplash.com/photo-1542831371-29b0f74f9713",
            syllabus="""Week 1-2: AutoCAD Essentials
Week 3-4: SketchUp Modeling
Week 5-6: Revit Fundamentals
Week 7: Adobe Suite for Architecture
Week 8-9: Rendering Techniques
Week 10: Final Project""",
            prerequisites="Basic computer skills and understanding of architectural drawing"
        ),
        
        schemas.CourseCreate(
            title="Urban Design and Planning",
            description="""Explore the principles of urban design and city planning. Learn about creating sustainable, livable cities through effective planning and design strategies.

Topics Covered:
- Urban design principles
- City planning processes
- Public space design
- Transportation planning
- Sustainable urban development
- Community engagement

Includes case studies of successful urban design projects worldwide.""",
            short_description="Learn urban design principles and city planning strategies",
            level=schemas.CourseLevel.INTERMEDIATE,
            duration="12 weeks",
            max_students=60,
            price=29999.0,
            start_date=now,
            end_date=now + timedelta(weeks=12),
            image_url="https://images.unsplash.com/photo-1486325212027-8081e485255e",
            syllabus="""Week 1-2: Urban Design Fundamentals
Week 3-4: City Planning Process
Week 5-6: Public Space Design
Week 7-8: Transportation Systems
Week 9-10: Sustainable Development
Week 11-12: Urban Project""",
            prerequisites="Basic architectural design knowledge"
        ),
        
        schemas.CourseCreate(
            title="Architectural History and Theory",
            description="""A journey through the history of architecture and its theoretical foundations. Explore different architectural movements, styles, and their cultural context.

Course Content:
- Ancient architecture
- Classical styles
- Modern movement
- Contemporary architecture
- Theoretical frameworks
- Critical analysis methods

Features virtual tours of significant architectural works.""",
            short_description="Explore architectural history and theoretical foundations",
            level=schemas.CourseLevel.BEGINNER,
            duration="10 weeks",
            max_students=100,
            price=14999.0,
            start_date=now,
            end_date=now + timedelta(weeks=10),
            image_url="https://images.unsplash.com/photo-1495562569060-2eec283d3391",
            syllabus="""Week 1-2: Ancient Architecture
Week 3-4: Classical Period
Week 5-6: Modern Movement
Week 7-8: Contemporary Era
Week 9-10: Theory & Criticism""",
            prerequisites="Interest in architecture and history"
        )
    ]

def get_sample_nata_courses():
    """Returns a list of sample NATA courses to seed the database."""
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
            "moodle_url": "https://moodle.architectureacademics.com/course/nata-drawing",
            "thumbnail": "https://placehold.co/400x250/png?text=Drawing+Course",
            "category": "Drawing",
            "skills": ["Perspective Drawing", "Sketching", "Geometric Construction", "Shading"],
            "features": ["Live interactive sessions", "Personal feedback on drawings", "Practice worksheets", "Mock test papers", "Moodle LMS access"]
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
            "moodle_url": "https://moodle.architectureacademics.com/course/nata-mathematics",
            "thumbnail": "https://placehold.co/400x250/png?text=Mathematics+Course",
            "category": "Mathematics",
            "skills": ["Algebra", "Geometry", "Trigonometry", "Coordinate Geometry"],
            "features": ["Video lectures with animations", "Step-by-step solutions", "Practice questions bank", "Weekly assessments", "Doubt clearing sessions"]
        },
        {
            "title": "NATA General Aptitude & Reasoning",
            "description": "Enhance logical reasoning, visual perception and general aptitude skills for NATA success",
            "instructor": "Mr. Karan Singh",
            "duration": "4 weeks",
            "difficulty": "Beginner",
            "price": 2999,
            "original_price": 4499,
            "rating": 4.6,
            "students_enrolled": 675,
            "lessons_count": 28,
            "certificate_included": True,
            "moodle_url": "https://moodle.architectureacademics.com/course/nata-aptitude",
            "thumbnail": "https://placehold.co/400x250/png?text=General+Aptitude+Course",
            "category": "General Aptitude",
            "skills": ["Logical Reasoning", "Visual Perception", "Spatial Ability", "Pattern Recognition"],
            "features": ["Interactive visual exercises", "Timed practice tests", "Performance analytics", "Mobile app access", "Progress tracking"]
        },
        {
            "title": "Complete NATA Preparation Course",
            "description": "Comprehensive 12-week program covering all NATA subjects with mock tests and personal mentoring",
            "instructor": "Team Architecture Academics",
            "duration": "12 weeks",
            "difficulty": "Advanced",
            "price": 9999,
            "original_price": 15999,
            "rating": 4.9,
            "students_enrolled": 2100,
            "lessons_count": 120,
            "certificate_included": True,
            "moodle_url": "https://moodle.architectureacademics.com/course/complete-nata",
            "thumbnail": "https://placehold.co/400x250/png?text=Complete+Course",
            "category": "Full Course",
            "skills": ["All NATA Skills", "Test Strategy", "Time Management", "Exam Psychology"],
            "features": ["Personal mentor assignment", "Weekly one-on-one sessions", "Full-length mock tests", "Performance analysis reports", "Admission guidance", "Complete Moodle course access"]
        },
        {
            "title": "NATA Advanced Drawing & Visualization",
            "description": "Take your architectural drawing skills to the next level with advanced techniques and visualization methods",
            "instructor": "Ar. Deepika Patel",
            "duration": "10 weeks",
            "difficulty": "Advanced",
            "price": 5999,
            "original_price": 8999,
            "rating": 4.8,
            "students_enrolled": 780,
            "lessons_count": 52,
            "certificate_included": True,
            "moodle_url": "https://moodle.architectureacademics.com/course/nata-advanced-drawing",
            "thumbnail": "https://placehold.co/400x250/png?text=Advanced+Drawing",
            "category": "Drawing",
            "skills": ["3D Visualization", "Architectural Rendering", "Digital Drawing", "Advanced Perspective"],
            "features": ["Advanced drawing workshops", "Digital tools training", "Portfolio development", "Industry expert sessions", "Competition preparation"]
        },
        {
            "title": "NATA Mock Test Series Premium",
            "description": "Intensive practice with full-length mock tests, detailed analysis, and personalized improvement strategies",
            "instructor": "NATA Expert Panel",
            "duration": "4 weeks",
            "difficulty": "Intermediate",
            "price": 2499,
            "original_price": 3999,
            "rating": 4.7,
            "students_enrolled": 1500,
            "lessons_count": 24,
            "certificate_included": True,
            "moodle_url": "https://moodle.architectureacademics.com/course/nata-mock-tests",
            "thumbnail": "https://placehold.co/400x250/png?text=Mock+Tests",
            "category": "Full Course",
            "skills": ["Time Management", "Exam Strategy", "Score Improvement", "Error Analysis"],
            "features": ["15 full-length mock tests", "Detailed solutions", "Performance analytics", "Topic-wise analysis", "Expert review sessions"]
        },
        {
            "title": "NATA Visual Memory & Observation",
            "description": "Specialized training to enhance visual memory, observation skills, and spatial understanding",
            "instructor": "Dr. Neha Gupta",
            "duration": "6 weeks",
            "difficulty": "Intermediate",
            "price": 3499,
            "original_price": 5499,
            "rating": 4.6,
            "students_enrolled": 920,
            "lessons_count": 32,
            "certificate_included": True,
            "moodle_url": "https://moodle.architectureacademics.com/course/nata-visual-memory",
            "thumbnail": "https://placehold.co/400x250/png?text=Visual+Memory",
            "category": "General Aptitude",
            "skills": ["Visual Memory", "Spatial Recognition", "Pattern Analysis", "Quick Sketching"],
            "features": ["Memory enhancement exercises", "Visual perception training", "Pattern recognition practice", "Real-time assessments", "Progress tracking tools"]
        }
    ]


def get_sample_blogs():
    """Returns a list of sample blog posts to seed the database."""
    
    return [
        {
            "title": "The Future of Sustainable Architecture in 2025",
            "content": """Sustainable architecture is no longer just a trend—it's a necessity. As we progress through 2025, the architecture industry is witnessing groundbreaking innovations in eco-friendly design and construction methods.

## Key Trends in Sustainable Design

### 1. Net-Zero Energy Buildings
Modern architects are focusing on designing buildings that produce as much energy as they consume. Through the integration of solar panels, wind turbines, and advanced insulation techniques, net-zero buildings are becoming more accessible and affordable.

### 2. Biophilic Design
Incorporating nature into built environments improves mental health and productivity. Living walls, natural lighting, and indoor gardens are essential elements in contemporary sustainable architecture.

### 3. Smart Building Technology
IoT sensors and AI-powered systems optimize energy consumption, water usage, and indoor air quality in real-time.

The future of architecture lies in sustainability. As professionals in this field, we have the responsibility and opportunity to shape a better, greener future for generations to come.""",
            "excerpt": "Exploring the latest trends and innovations in sustainable architecture, from net-zero buildings to biophilic design and smart technology.",
            "category": "SUSTAINABLE_DESIGN",
            "tags": "sustainability, green architecture, net-zero, biophilic design, smart buildings",
            "is_featured": False,
            "status": "PUBLISHED"
        },
        {
            "title": "Modern Minimalism: Less is More in Contemporary Design",
            "content": """Modern minimalism has revolutionized how we approach architectural design. By focusing on essential elements and removing unnecessary ornamentation, architects create spaces that are both functional and aesthetically pleasing.

## Principles of Minimalist Architecture

### 1. Simplicity and Clean Lines
Minimalist architecture emphasizes clean, straight lines and simple geometric shapes. This creates a sense of order and tranquility in living and working spaces.

### 2. Open Floor Plans
By removing interior walls and creating open spaces, minimalist design promotes better flow, natural light distribution, and a sense of spaciousness.

### 3. Neutral Color Palettes
White, gray, and beige dominate minimalist interiors, creating calm environments that allow residents to focus on what truly matters.

### 4. Function Over Form
Every element in a minimalist space serves a purpose. Furniture, fixtures, and architectural features are chosen for their functionality as much as their aesthetic appeal.

Minimalism in architecture isn't about having less—it's about making room for more: more light, more space, more freedom.""",
            "excerpt": "Discover how minimalist architecture creates peaceful, functional spaces through simplicity, clean lines, and thoughtful design.",
            "category": "ARCHITECTURE_TRENDS",
            "tags": "minimalism, modern design, interior design, clean lines, open spaces",
            "is_featured": False,
            "status": "PUBLISHED"
        },
        {
            "title": "Smart Building Technology: The Internet of Buildings",
            "content": """Smart building technology is transforming how we interact with our built environment. From automated climate control to predictive maintenance systems, technology is making buildings more efficient, comfortable, and sustainable.

## Key Smart Building Features

### 1. IoT Sensors and Automation
Internet of Things (IoT) sensors monitor everything from occupancy to air quality, enabling buildings to automatically adjust lighting, temperature, and ventilation for optimal comfort and efficiency.

### 2. Energy Management Systems
Advanced energy management platforms use AI to predict energy needs and optimize consumption, reducing costs and environmental impact by up to 30%.

### 3. Security and Access Control
Biometric access systems, surveillance integration, and smart locks enhance building security while improving user convenience.

### 4. Predictive Maintenance
AI algorithms analyze building systems to predict failures before they occur, reducing downtime and maintenance costs.

The buildings of tomorrow are not just structures—they're intelligent ecosystems that respond to our needs.""",
            "excerpt": "Explore how IoT sensors, AI-powered energy management, and smart automation are creating the intelligent buildings of the future.",
            "category": "TECHNOLOGY",
            "tags": "smart buildings, IoT, automation, energy management, AI",
            "is_featured": False,
            "status": "PUBLISHED"
        },
        {
            "title": "Historic Preservation Meets Modern Innovation",
            "content": """Preserving architectural heritage while incorporating modern amenities is one of the most challenging and rewarding aspects of contemporary architecture. This delicate balance honors the past while serving present needs.

## Restoration Best Practices

### 1. Structural Assessment
Before any restoration project, thorough structural analysis ensures the building's integrity while identifying areas that need reinforcement or repair.

### 2. Material Authenticity
Using period-appropriate materials and construction techniques maintains historical accuracy while meeting modern safety standards.

### 3. Adaptive Reuse
Converting historic buildings for new purposes—such as transforming old warehouses into modern apartments or factories into creative offices—gives new life to architectural treasures.

### 4. Technology Integration
Modern systems like HVAC, electrical, and plumbing can be integrated thoughtfully without compromising the building's historic character.

Historic preservation is not about freezing buildings in time, but about allowing them to evolve while maintaining their essential character and cultural significance.""",
            "excerpt": "Learn how architects balance historical preservation with modern functionality through careful restoration and adaptive reuse strategies.",
            "category": "CAREER_ADVICE",
            "tags": "historic preservation, restoration, adaptive reuse, heritage buildings",
            "is_featured": False,
            "status": "PUBLISHED"
        },
        {
            "title": "The Rise of Prefab and Modular Construction",
            "content": """Prefabricated and modular construction methods are revolutionizing the building industry, offering faster construction times, reduced costs, and improved quality control.

## Advantages of Modular Construction

### 1. Speed and Efficiency
Factory-built modules can reduce construction time by 30-50% compared to traditional methods, getting projects completed faster and reducing labor costs.

### 2. Quality Control
Controlled factory environments enable consistent quality, reduced material waste, and better precision in manufacturing. Weather delays are eliminated.

### 3. Cost Savings
Reduced construction time, less material waste, and predictable manufacturing costs make modular construction increasingly attractive for developers and homeowners alike.

### 4. Sustainability
Factory construction reduces on-site waste by up to 90%, and many modular systems are designed for disassembly and reuse, promoting circular economy principles.

### 5. Design Flexibility
Modern modular systems offer extensive customization options, from single-family homes to multi-story commercial buildings.

As technology advances and design flexibility improves, prefab and modular construction is moving beyond temporary structures to create permanent, high-quality buildings that rival traditional construction.""",
            "excerpt": "Discover how prefab and modular construction is transforming the industry with faster build times, better quality, and sustainable practices.",
            "category": "ARCHITECTURE_TRENDS",
            "tags": "prefab, modular construction, efficiency, sustainability, innovation",
            "is_featured": False,
            "status": "PUBLISHED"
        }
    ]

def get_sample_events():
    """Returns a list of sample events to seed the database."""
    now = datetime.utcnow()
    return [
        {
            "title": "Annual Architecture Symposium 2025",
            "description": "Join us for the biggest architectural gathering of the year. Featuring keynote speakers from around the globe, panel discussions on sustainable design, and networking opportunities.",
            "short_description": "The biggest architectural gathering of the year with global speakers.",
            "date": now + timedelta(days=30),
            "duration": 8,
            "location": "Mumbai Convention Centre",
            "image_url": "https://images.unsplash.com/photo-1517457373958-b7bdd4587205",
            "max_participants": 500,
            "is_online": False,
            "status": "upcoming"
        },
        {
            "title": "Virtual Design Workshop: Future Cities",
            "description": "An interactive online workshop exploring the concepts of future cities. Participants will work in teams to design conceptual urban environments using digital tools.",
            "short_description": "Interactive online workshop exploring future city concepts.",
            "date": now + timedelta(days=15),
            "duration": 4,
            "location": "Online",
            "image_url": "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df",
            "max_participants": 100,
            "is_online": True,
            "meeting_link": "https://meet.google.com/abc-defg-hij",
            "status": "upcoming"
        },
        {
            "title": "Architectural Photography Masterclass",
            "description": "Learn the art of capturing buildings and spaces. This masterclass covers composition, lighting, and post-processing techniques for architectural photography.",
            "short_description": "Master the art of architectural photography.",
            "date": now + timedelta(days=45),
            "duration": 6,
            "location": "Delhi Habitat Centre",
            "image_url": "https://images.unsplash.com/photo-1486325212027-8081e485255e",
            "max_participants": 50,
            "is_online": False,
            "status": "upcoming"
        },
        # Past Events
        {
            "title": "Sustainable Urban Planning Summit 2024",
            "description": "A retrospective on the challenges and solutions discussed during last year's summit. Key takeaways included green infrastructure and smart city integration.",
            "short_description": "Retrospective on sustainable urban planning challenges.",
            "date": now - timedelta(days=60),
            "duration": 8,
            "location": "Bangalore International Exhibition Centre",
            "image_url": "https://images.unsplash.com/photo-1497366216548-37526070297c",
            "max_participants": 300,
            "is_online": False,
            "status": "completed"
        },
        {
            "title": "History of Indian Architecture Webinar",
            "description": "An in-depth look at the evolution of architectural styles in India, from ancient temples to modern skyscrapers.",
            "short_description": "Evolution of architectural styles in India.",
            "date": now - timedelta(days=120),
            "duration": 2,
            "location": "Online",
            "image_url": "https://images.unsplash.com/photo-1564507592333-c60657eea523",
            "max_participants": 200,
            "is_online": True,
            "meeting_link": "https://meet.google.com/past-event-link",
            "status": "completed"
        }
    ]

def get_sample_workshops():
    """Returns a list of sample workshops to seed the database."""
    now = datetime.utcnow()
    return [
        {
            "title": "Sustainable Materials Workshop",
            "description": "Hands-on workshop exploring various sustainable building materials. Learn about their properties, applications, and environmental impact.",
            "short_description": "Hands-on exploration of sustainable building materials.",
            "date": now + timedelta(days=20),
            "duration": 5,
            "location": "Architecture Lab, Pune",
            "image_url": "https://images.unsplash.com/photo-1518005068251-37900150dfca",
            "max_participants": 30,
            "is_online": False,
            "status": "upcoming",
            "instructor_name": "Dr. Sarah Johnson",
            "price": 1500.0
        },
        {
            "title": "BIM Fundamentals with Revit",
            "description": "Intensive workshop on Building Information Modeling (BIM) using Revit. Covers basic modeling, documentation, and collaboration features.",
            "short_description": "Intensive workshop on BIM using Revit.",
            "date": now + timedelta(days=10),
            "duration": 12,
            "location": "Computer Lab 2",
            "image_url": "https://images.unsplash.com/photo-1542831371-29b0f74f9713",
            "max_participants": 25,
            "is_online": False,
            "status": "upcoming",
            "instructor_name": "Ar. Rahul Verma",
            "price": 3000.0
        },
        {
            "title": "Sketching for Architects",
            "description": "Improve your hand-sketching skills. Focuses on perspective, shading, and quick visualization techniques for architectural concepts.",
            "short_description": "Improve your architectural hand-sketching skills.",
            "date": now + timedelta(days=25),
            "duration": 4,
            "location": "City Park",
            "image_url": "https://images.unsplash.com/photo-1513364776144-60967b0f800f",
            "max_participants": 20,
            "is_online": False,
            "status": "upcoming",
            "instructor_name": "Ar. Meera Patel",
            "price": 1000.0
        },
        # Past Workshops
        {
            "title": "Advanced AutoCAD Techniques",
            "description": "A deep dive into advanced AutoCAD commands and workflows for experienced users.",
            "short_description": "Master advanced AutoCAD workflows.",
            "date": now - timedelta(days=45),
            "duration": 6,
            "location": "Computer Lab 1",
            "image_url": "https://images.unsplash.com/photo-1581092921461-eab62e97a782",
            "max_participants": 20,
            "is_online": False,
            "status": "completed",
            "instructor_name": "Ar. Vikram Singh",
            "price": 2500.0
        },
        {
            "title": "Model Making Workshop",
            "description": "Learn to build physical architectural models using various materials like foam board, wood, and acrylic.",
            "short_description": "Hands-on model making techniques.",
            "date": now - timedelta(days=90),
            "duration": 8,
            "location": "Design Studio",
            "image_url": "https://images.unsplash.com/photo-1531835551805-16d864c8d311",
            "max_participants": 15,
            "is_online": False,
            "status": "completed",
            "instructor_name": "Ar. Anjali Desai",
            "price": 2000.0
        }
    ]

def get_sample_discussions():
    """Returns a list of sample discussions to seed the database."""
    return [
        {
            "title": "Best laptop for architecture students in 2025?",
            "content": "I'm a first-year architecture student looking for a laptop that can handle AutoCAD, Revit, and rendering software. My budget is around 1 Lakh. Any recommendations?",
            "category": "Hardware & Software",
            "tags": "laptop, hardware, student, advice",
            "is_solved": False,
            "is_pinned": False
        },
        {
            "title": "Tips for NATA drawing section",
            "content": "I'm preparing for NATA and struggling with the perspective drawing part. Can anyone share some tips or resources to improve?",
            "category": "NATA Preparation",
            "tags": "NATA, drawing, exam-prep",
            "is_solved": True,
            "is_pinned": True
        },
        {
            "title": "Sustainable architecture thesis topics",
            "content": "I'm in my final year and looking for thesis topics related to sustainable architecture. I'm interested in vernacular architecture and low-cost housing.",
            "category": "Academic",
            "tags": "thesis, sustainability, final-year",
            "is_solved": False,
            "is_pinned": False
        }
    ]