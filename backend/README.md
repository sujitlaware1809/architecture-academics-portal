# Architecture Academics Backend

FastAPI backend server for the Architecture Academics platform with comprehensive API for blogs, discussions, courses, workshops, events, and job portal.

## 🚀 Features

### Core Functionality
- **Authentication & Authorization**: JWT-based auth with role-based access control (User, Recruiter, Admin)
- **User Management**: Profile creation, updates, avatar management
- **Blog System**: Full CRUD with comments, likes, categories, and tags
- **Discussion Forum**: Q&A platform with replies, solutions, and voting
- **Course Management**: Course creation with modules, videos, materials, and enrollments
- **Workshop System**: Workshop registration and management
- **Event Management**: Event listings with registration tracking
- **Job Portal**: Job postings, applications, and recruiter dashboard
- **File Upload**: Local storage and AWS S3 integration

### Technical Features
- Automatic API documentation (Swagger UI & ReDoc)
- CORS middleware for frontend integration
- SQLAlchemy ORM with SQLite database
- Pydantic schemas for data validation
- Password hashing with bcrypt
- JWT token-based authentication
- Sample data generation on startup

## 📋 Prerequisites

- **Python**: 3.12 or higher
- **pip**: Latest version
- **Virtual Environment**: Recommended for isolation
- **AWS Account**: Optional, for S3 file storage

## 🔧 Installation

### 1. Create Virtual Environment

**Windows:**
```bash
python -m venv winvenv
.\winvenv\Scripts\Activate.ps1
```

**Linux/Mac:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL=sqlite:///./architecture_academics.db

# JWT Configuration
SECRET_KEY=your-super-secret-key-change-this-in-production-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AWS S3 Configuration (Optional)
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=architecture-academics-uploads

# Application Settings
DEBUG=True
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

## 🏃 Running the Server

### Development Mode

```bash
# Using the run script
python run_server.py

# Or using uvicorn directly
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The server will start at `http://localhost:8000`

### Access API Documentation

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`

### Default Accounts

On first startup, the application creates default accounts:

**Admin Account:**
```
Email: admin@architectureacademics.com
Password: Admin@123
```

**Recruiter Account:**
```
Email: recruiter@architectureacademics.com
Password: Recruiter@123
```

**Test User Account:**
```
Email: john.doe@example.com
Password: Password123
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "full_name": "John Doe",
  "role": "USER"
}
```

#### Login
```http
POST /login
Content-Type: application/x-www-form-urlencoded

username=user@example.com&password=SecurePassword123
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "USER"
  }
}
```

### User Endpoints

#### Get Current User
```http
GET /users/me
Authorization: Bearer {token}
```

#### Update Profile
```http
PUT /users/me
Authorization: Bearer {token}
Content-Type: application/json

{
  "full_name": "Jane Doe",
  "bio": "Architecture enthusiast",
  "title": "Architect",
  "company": "ABC Design Studio",
  "location": "New York, USA"
}
```

### Blog Endpoints

#### List Blogs
```http
GET /blogs?skip=0&limit=10&category=Architecture&search=design
```

#### Create Blog
```http
POST /blogs
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Modern Architecture Trends",
  "content": "# Introduction\n\nModern architecture...",
  "excerpt": "Exploring the latest trends in architecture",
  "category": "Architecture",
  "tags": ["design", "modern", "trends"],
  "featured": false,
  "status": "published"
}
```

#### Get Blog by Slug
```http
GET /blogs/modern-architecture-trends
```

#### Update Blog
```http
PUT /blogs/{blog_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content..."
}
```

#### Delete Blog
```http
DELETE /blogs/{blog_id}
Authorization: Bearer {token}
```

#### Like/Unlike Blog
```http
POST /blogs/{blog_id}/like
Authorization: Bearer {token}
```

#### Add Comment
```http
POST /blogs/{blog_id}/comments
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "Great article!"
}
```

### Discussion Endpoints

#### List Discussions
```http
GET /discussions?skip=0&limit=10&category=Technical&search=autocad
```

#### Create Discussion
```http
POST /discussions
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "How to optimize AutoCAD performance?",
  "content": "I'm facing performance issues...",
  "category": "Technical",
  "tags": ["autocad", "performance", "help"]
}
```

#### Get Discussion
```http
GET /discussions/{discussion_id}
```

#### Add Reply
```http
POST /discussions/{discussion_id}/replies
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "Try these optimization steps..."
}
```

#### Mark Reply as Solution
```http
POST /replies/{reply_id}/mark-solution
Authorization: Bearer {token}
```

### Course Endpoints

#### List Courses
```http
GET /courses?skip=0&limit=10
```

#### Create Course
```http
POST /courses
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Introduction to Architecture",
  "description": "Learn the fundamentals...",
  "category": "Architecture",
  "level": "Beginner",
  "duration_hours": 40,
  "price": 99.99,
  "modules": [
    {
      "title": "Module 1: Basics",
      "description": "Introduction to concepts",
      "order": 1
    }
  ]
}
```

#### Enroll in Course
```http
POST /courses/{course_id}/enroll
Authorization: Bearer {token}
```

#### Add Course Review
```http
POST /courses/{course_id}/review
Authorization: Bearer {token}
Content-Type: application/json

{
  "rating": 5,
  "comment": "Excellent course!"
}
```

### Workshop Endpoints

#### List Workshops
```http
GET /workshops?skip=0&limit=10
```

#### Create Workshop
```http
POST /workshops
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "AutoCAD Mastery Workshop",
  "description": "Hands-on AutoCAD training",
  "instructor": "John Smith",
  "start_date": "2025-02-15T10:00:00",
  "end_date": "2025-02-15T16:00:00",
  "location": "New York",
  "capacity": 30,
  "price": 199.99
}
```

#### Register for Workshop
```http
POST /workshops/{workshop_id}/register
Authorization: Bearer {token}
```

### Event Endpoints

#### List Events
```http
GET /events?skip=0&limit=10
```

#### Create Event
```http
POST /events
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Architecture Expo 2025",
  "description": "Annual architecture exhibition",
  "date": "2025-03-20T09:00:00",
  "location": "Convention Center",
  "type": "Exhibition",
  "capacity": 500
}
```

#### Register for Event
```http
POST /events/{event_id}/register
Authorization: Bearer {token}
```

### Job Portal Endpoints

#### List Jobs
```http
GET /jobs?skip=0&limit=10&location=New York&job_type=Full-time
```

#### Create Job Posting
```http
POST /jobs
Authorization: Bearer {token} (Recruiter/Admin only)
Content-Type: application/json

{
  "title": "Senior Architect",
  "description": "We are seeking an experienced architect...",
  "company": "ABC Design Studio",
  "location": "New York, USA",
  "job_type": "Full-time",
  "experience_required": "5+ years",
  "salary_range": "$80,000 - $120,000",
  "requirements": ["Bachelor's degree", "AutoCAD proficiency"],
  "benefits": ["Health insurance", "401k"]
}
```

#### Apply to Job
```http
POST /jobs/{job_id}/apply
Authorization: Bearer {token}
Content-Type: application/json

{
  "cover_letter": "I am interested in this position...",
  "resume_url": "https://example.com/resume.pdf"
}
```

#### Get Job Applications (Recruiter)
```http
GET /jobs/{job_id}/applications
Authorization: Bearer {token} (Recruiter/Admin only)
```

## 🗄️ Database Models

### User Model
```python
- id: Integer (Primary Key)
- email: String (Unique)
- hashed_password: String
- full_name: String
- role: Enum (USER, RECRUITER, ADMIN)
- bio: Text
- avatar_url: String
- title: String
- company: String
- location: String
- website: String
- linkedin: String
- twitter: String
- github: String
- is_active: Boolean
- created_at: DateTime
- updated_at: DateTime
```

### Blog Model
```python
- id: Integer (Primary Key)
- title: String
- slug: String (Unique)
- content: Text
- excerpt: Text
- author_id: Integer (Foreign Key)
- category: Enum
- tags: JSON
- featured: Boolean
- status: Enum (draft, published)
- view_count: Integer
- created_at: DateTime
- updated_at: DateTime
- comments: Relationship
- likes: Relationship
```

### Discussion Model
```python
- id: Integer (Primary Key)
- title: String
- content: Text
- author_id: Integer (Foreign Key)
- category: Enum
- tags: JSON
- view_count: Integer
- is_solved: Boolean
- is_pinned: Boolean
- created_at: DateTime
- updated_at: DateTime
- replies: Relationship
- likes: Relationship
```

### Course Model
```python
- id: Integer (Primary Key)
- title: String
- description: Text
- instructor_id: Integer (Foreign Key)
- category: String
- level: Enum (Beginner, Intermediate, Advanced)
- duration_hours: Integer
- price: Float
- thumbnail_url: String
- is_published: Boolean
- created_at: DateTime
- modules: Relationship
- enrollments: Relationship
- reviews: Relationship
```

## 📁 Project Structure

```
backend/
├── main.py                  # FastAPI application, routes, and startup events
├── database.py              # SQLAlchemy models and database configuration
├── schemas.py               # Pydantic schemas for request/response
├── crud.py                  # Database CRUD operations
├── auth.py                  # Authentication utilities (JWT, password hashing)
├── aws_s3.py               # AWS S3 file upload utilities
├── run_server.py           # Server startup script
├── requirements.txt         # Python dependencies
├── .env                     # Environment variables (create from .env.example)
├── .env.example            # Example environment configuration
├── architecture_academics.db # SQLite database file
├── uploads/                 # Local file storage
│   ├── videos/             # Uploaded videos
│   └── materials/          # Uploaded materials
└── winvenv/                # Virtual environment (Windows)
```

## 🔒 Security

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### JWT Token
- Algorithm: HS256
- Expiration: 30 minutes (configurable)
- Refresh token support (coming soon)

### Role-Based Access Control
- **USER**: Can create blogs, discussions, enroll in courses, apply to jobs
- **RECRUITER**: USER permissions + can create job postings, view applications
- **ADMIN**: Full access to all resources, can create courses/workshops/events

## 🧪 Testing

### Run Tests
```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html
```

### Test Admin Credentials
Use the default admin account for testing admin functionality:
```
Email: admin@architectureacademics.com
Password: Admin@123
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port 8000 (Windows)
netstat -ano | findstr :8000

# Kill the process
taskkill /PID <process_id> /F
```

### Database Locked
```bash
# Stop the server
# Delete the database file
rm architecture_academics.db

# Restart the server (will recreate database)
python run_server.py
```

### Import Errors
```bash
# Reinstall dependencies
pip install --upgrade -r requirements.txt
```

### CORS Issues
Check your `.env` file and ensure `CORS_ORIGINS` includes your frontend URL:
```env
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

## 📦 Dependencies

### Core Dependencies
- **fastapi**: Web framework
- **uvicorn**: ASGI server
- **sqlalchemy**: ORM
- **pydantic**: Data validation
- **python-jose**: JWT tokens
- **passlib**: Password hashing
- **python-multipart**: File uploads
- **boto3**: AWS S3 integration

See `requirements.txt` for complete list.

## 🚀 Production Deployment

### Using Gunicorn

```bash
# Install gunicorn
pip install gunicorn

# Run with multiple workers
gunicorn main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --timeout 120
```

### Environment Variables for Production

Update `.env` with production values:
```env
DEBUG=False
SECRET_KEY=<generate-a-strong-secret-key-at-least-32-characters>
DATABASE_URL=postgresql://user:password@host:port/dbname  # Use PostgreSQL
CORS_ORIGINS=https://yourdomain.com
```

### Database Migration (SQLite to PostgreSQL)

1. Install PostgreSQL dependencies:
```bash
pip install psycopg2-binary
```

2. Update `DATABASE_URL` in `.env`

3. Run migrations (if using Alembic):
```bash
alembic upgrade head
```

## 📝 API Rate Limiting

Consider adding rate limiting for production:

```bash
pip install slowapi
```

## 🔄 Sample Data

The application automatically creates sample data on first startup:
- 8 blog posts across different categories
- 10 discussion topics with replies
- Sample courses, workshops, and events
- Job postings
- Test user accounts

To regenerate sample data, delete the database file and restart the server.

## 📧 Contact & Support

For backend-specific issues:
- Check the logs in the terminal
- Review API documentation at `/docs`
- Check database integrity
- Verify environment variables

---

**Last Updated**: January 2025
**Version**: 1.0.0
