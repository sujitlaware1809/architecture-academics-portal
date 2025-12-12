"""Seed data for jobs in the database."""

import schemas
from datetime import datetime, timedelta

def get_sample_jobs():
    """Returns a list of sample jobs to seed the database."""
    
    now = datetime.utcnow()
    return [
        schemas.JobCreate(
            title="Senior Architect",
            company="Tech Design Studio",
            location="Mumbai, India",
            work_mode=schemas.WorkMode.HYBRID,
            job_type=schemas.JobType.FULL_TIME,
            experience_level=schemas.ExperienceLevel.SENIOR_LEVEL,
            salary_min=1200000,
            salary_max=1500000,
            currency="INR",
            description="""We are looking for an experienced Senior Architect to lead our architectural projects and design innovative spaces.

About the Role:
- Lead architectural design and planning for major projects
- Supervise project teams and ensure quality standards
- Coordinate with clients and consultants
- Manage project timelines and budgets
- Mentor junior architects and designers
- Prepare detailed drawings and specifications

What You'll Get:
- Competitive salary and benefits
- Flexible working hours
- Professional development opportunities
- Creative and collaborative work environment
- Health and wellness programs""",
            requirements="""- Minimum 10 years of architectural experience
- B.Arch degree or equivalent qualification
- Strong knowledge of building codes and regulations
- Proficiency in AutoCAD, Revit, and design software
- Excellent communication and leadership skills
- Portfolio of completed projects
- Valid architect registration""",
            benefits="Health Insurance, Paid Leave, Professional Development, Flexible Hours",
            tags="Architecture, Design, Leadership, BIM, Project Management",
            application_deadline=now + timedelta(days=30),
            contact_email="hr@techdesignstudio.com",
            company_website="https://techdesignstudio.com",
            company_description="Leading architectural firm specializing in sustainable and innovative design solutions"
        ),
        
        schemas.JobCreate(
            title="Architectural Designer",
            company="Green Spaces Architects",
            location="Bangalore, India",
            work_mode=schemas.WorkMode.ON_SITE,
            job_type=schemas.JobType.FULL_TIME,
            experience_level=schemas.ExperienceLevel.MID_LEVEL,
            salary_min=700000,
            salary_max=1000000,
            currency="INR",
            description="""Join our dynamic team as an Architectural Designer and create sustainable spaces.

About the Role:
- Design residential, commercial, and institutional projects
- Create detailed architectural drawings and specifications
- Collaborate with multidisciplinary teams
- Conduct site surveys and feasibility studies
- Present designs to clients and stakeholders
- Ensure compliance with building codes and standards""",
            requirements="""- B.Arch degree from a recognized institution
- 5-8 years of professional experience
- Expertise in sustainable design principles
- Advanced skills in AutoCAD and Revit
- Knowledge of green building standards (LEED, GRIHA)
- Strong problem-solving abilities
- Team collaboration experience""",
            benefits="Competitive Salary, Health Insurance, Skill Enhancement, Flexible Schedule",
            tags="Sustainable Design, Residential, Commercial, Green Building",
            application_deadline=now + timedelta(days=25),
            contact_email="careers@greenspaces.co.in",
            company_website="https://greenspaces.co.in",
            company_description="Premier architectural firm focused on sustainable and eco-friendly design solutions"
        ),
        
        schemas.JobCreate(
            title="Junior Architect",
            company="Urban Innovations",
            location="Delhi, India",
            work_mode=schemas.WorkMode.HYBRID,
            job_type=schemas.JobType.FULL_TIME,
            experience_level=schemas.ExperienceLevel.ENTRY_LEVEL,
            salary_min=400000,
            salary_max=600000,
            currency="INR",
            description="""Start your architectural career with Urban Innovations, an innovative design firm.

About the Role:
- Assist senior architects in project design and planning
- Create 2D and 3D architectural drawings
- Conduct research and site analysis
- Prepare construction documents
- Support client presentations
- Learn industry best practices and tools""",
            requirements="""- B.Arch degree (recent graduates welcome)
- Proficiency in AutoCAD, SketchUp, or similar software
- Basic knowledge of building design principles
- Strong communication and interpersonal skills
- Attention to detail
- Eagerness to learn and grow
- Portfolio of academic/personal projects""",
            benefits="Mentorship, Learning Opportunities, Health Coverage, Competitive Salary",
            tags="Entry Level, Design, CAD, Architecture, Graduate",
            application_deadline=now + timedelta(days=20),
            contact_email="recruitment@urbaninnovations.com",
            company_website="https://urbaninnovations.com",
            company_description="Forward-thinking architectural firm specializing in urban design and innovative projects"
        ),
        
        schemas.JobCreate(
            title="Interior Architect",
            company="Elegant Interiors Ltd",
            location="Pune, India",
            work_mode=schemas.WorkMode.ON_SITE,
            job_type=schemas.JobType.FULL_TIME,
            experience_level=schemas.ExperienceLevel.MID_LEVEL,
            salary_min=600000,
            salary_max=900000,
            currency="INR",
            description="""We're seeking a talented Interior Architect to create beautiful and functional interior spaces.

About the Role:
- Design interior spaces for residential and commercial projects
- Create detailed interior drawings and specifications
- Source materials and finishes
- Manage interior projects from concept to completion
- Coordinate with contractors and suppliers
- Ensure design meets client requirements and budgets""",
            requirements="""- B.Arch or Interior Design degree
- 5-7 years of experience in interior design
- Expertise in space planning and design
- Knowledge of materials, finishes, and furniture
- Proficiency in design software (AutoCAD, Revit, SketchUp)
- Project management experience
- Strong visual and communication skills""",
            benefits="Health Insurance, Project Bonuses, Professional Development, Work-Life Balance",
            tags="Interior Design, Space Planning, Residential, Commercial",
            application_deadline=now + timedelta(days=28),
            contact_email="jobs@elegantinteriors.in",
            company_website="https://elegantinteriors.in",
            company_description="Premium interior design firm creating exceptional spaces for residential and commercial clients"
        ),
        
        schemas.JobCreate(
            title="CAD Specialist",
            company="Design Solutions Pro",
            location="Hyderabad, India",
            work_mode=schemas.WorkMode.REMOTE,
            job_type=schemas.JobType.FULL_TIME,
            experience_level=schemas.ExperienceLevel.MID_LEVEL,
            salary_min=500000,
            salary_max=800000,
            currency="INR",
            description="""Join our team as a CAD Specialist and support architects in creating stunning designs.

About the Role:
- Prepare technical drawings and specifications
- Convert design concepts into detailed CAD models
- Maintain drawing standards and consistency
- Create presentations and documentation
- Assist architects with design development
- Support project teams with CAD expertise""",
            requirements="""- Advanced knowledge of AutoCAD and Revit
- 5+ years of CAD experience in architecture
- Strong understanding of architectural standards
- Ability to work independently and as part of a team
- Attention to detail and accuracy
- Good time management and organizational skills
- Experience with BIM tools is a plus""",
            benefits="Competitive Salary, Remote Work, Health Insurance, Skill Training",
            tags="CAD, AutoCAD, Revit, BIM, Technical Drawing",
            application_deadline=now + timedelta(days=22),
            contact_email="careers@designsolutions.pro",
            company_website="https://designsolutions.pro",
            company_description="Professional CAD and design solutions provider for architectural firms"
        )
    ]
