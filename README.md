# Architecture Academics Portal# Architecture Academics Platform



A comprehensive web platform for architecture students and professionals featuring blogs, discussions, courses, workshops, events, and job portal.## Authentication Credentials



## 🏗️ Architecture Overview### Admin User

- **Email**: admin@architectureacademics.com

This project consists of two main parts:- **Password**: Admin@123

- **Frontend**: Next.js 15 with React 18, TypeScript, and Tailwind CSS

- **Backend**: FastAPI with SQLAlchemy, SQLite database, and JWT authentication### Recruiter User

- **Email**: recruiter@architectureacademics.com

## 📋 Table of Contents- **Password**: Recruiter@123



- [Features](#features)## Setting Up the Backend

- [Tech Stack](#tech-stack)

- [Project Structure](#project-structure)1. Navigate to the backend directory:

- [Prerequisites](#prerequisites)```

- [Installation](#installation)cd backend

- [Running the Application](#running-the-application)```

- [Database Schema](#database-schema)

- [API Documentation](#api-documentation)2. Activate the virtual environment:

- [Environment Variables](#environment-variables)   - Windows:

- [Contributing](#contributing)   ```

   winvenv\Scripts\activate

## ✨ Features   ```

   - Linux/Mac:

### 🎯 Core Features   ```

- **User Authentication & Authorization**: JWT-based authentication with role-based access (User, Recruiter, Admin)   source venv/bin/activate

- **Blogs**: Medium-style blog platform with categories, tags, comments, and likes   ```

- **Discussions**: Stack Overflow-style Q&A forum with replies, solutions, and voting

- **Courses**: Comprehensive course management with modules, videos, and materials3. Run the server with admin user creation:

- **Workshops**: Workshop registration and management system   - Windows:

- **Events**: Event listings with registration capabilities   ```

- **Jobs Portal**: Job postings for recruiters, applications for users   run_with_admin.bat

- **User Profiles**: Customizable user profiles with activity tracking   ```

   - Linux/Mac:

### 🎨 Design Features   ```

- Responsive design for all screen sizes   bash run_with_admin.sh

- Modern UI with Tailwind CSS and shadcn/ui components   ```

- Dark mode support with theme provider

- Smooth animations and transitions4. The server will start at http://localhost:8080

- Accessible components following WCAG guidelines

## Setting Up the Frontend

## 🛠️ Tech Stack

1. Navigate to the frontend directory:

### Frontend```

- **Framework**: Next.js 15.2.4 (App Router)cd arch-client-web-1.0-main/arch-client-web-1.0-main

- **Language**: TypeScript 5```

- **Styling**: Tailwind CSS 3.4

- **UI Components**: shadcn/ui2. Install dependencies:

- **Icons**: Lucide React```

- **State Management**: React Hooksnpm install

- **HTTP Client**: Fetch API with custom wrapper```



### Backend3. Run the development server:

- **Framework**: FastAPI 0.115.6```

- **Language**: Python 3.12npm run dev

- **ORM**: SQLAlchemy 2.0```

- **Database**: SQLite (Development)

- **Authentication**: JWT (python-jose)4. The frontend will be available at http://localhost:3000

- **Password Hashing**: bcrypt

- **File Storage**: AWS S3 (for uploads)## Using the Admin Dashboard

- **CORS**: FastAPI CORS Middleware

1. Log in using the admin credentials above

## 📁 Project Structure2. The Admin Dashboard will be available at http://localhost:3000/admin

3. From here, you can manage:

```   - Events

architecture-academics-portal/   - Workshops

├── arch-client-web-1.0-main/        # Frontend (Next.js)   - Courses

│   └── arch-client-web-1.0-main/   - Jobs

│       ├── app/                      # Next.js App Router pages   - Users

│       │   ├── page.tsx             # Homepage

│       │   ├── blogs/               # Blog pages## Backend API Documentation

│       │   ├── discussions/         # Discussion forum pages

│       │   ├── courses/             # Course pagesThe API documentation is available at http://localhost:8080/docs when the backend is running.

│       │   ├── workshops/           # Workshop pages
│       │   ├── events/              # Event pages
│       │   ├── jobs-portal/         # Jobs pages
│       │   ├── profile/             # User profile
│       │   └── admin/               # Admin dashboard
│       ├── components/              # React components
│       │   ├── ui/                  # shadcn/ui components
│       │   ├── events/              # Event components
│       │   └── workshops/           # Workshop components
│       ├── lib/                     # Utilities and API client
│       │   ├── api.ts              # API wrapper functions
│       │   └── utils.ts            # Helper functions
│       ├── public/                  # Static assets
│       └── styles/                  # Global styles
│
└── backend/                         # Backend (FastAPI)
    ├── main.py                      # FastAPI application & routes
    ├── database.py                  # Database models (SQLAlchemy)
    ├── schemas.py                   # Pydantic schemas
    ├── crud.py                      # Database CRUD operations
    ├── auth.py                      # Authentication utilities
    ├── aws_s3.py                    # AWS S3 file upload
    ├── run_server.py               # Server entry point
    ├── requirements.txt             # Python dependencies
    ├── architecture_academics.db    # SQLite database
    └── uploads/                     # Local file uploads
        ├── videos/                  # Course videos
        └── materials/               # Course materials
```

## 📦 Prerequisites

### Required Software
- **Node.js**: >= 18.0.0
- **Python**: >= 3.12.0
- **npm** or **pnpm**: Latest version
- **Git**: For version control

### Optional
- **AWS Account**: For S3 file storage (optional, uses local storage by default)

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/sujitlaware1809/architecture-academics-portal.git
cd architecture-academics-portal
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (Windows)
python -m venv winvenv

# Activate virtual environment
# Windows PowerShell:
.\winvenv\Scripts\Activate.ps1
# Windows CMD:
.\winvenv\Scripts\activate.bat

# Install dependencies
pip install -r requirements.txt

# Create .env file (copy from .env.example)
cp .env.example .env

# Edit .env with your configuration
# notepad .env
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd arch-client-web-1.0-main/arch-client-web-1.0-main

# Install dependencies
npm install
# or
pnpm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```

## 🏃 Running the Application

### Start Backend Server

```bash
# From backend directory
cd backend

# Activate virtual environment (if not already active)
.\winvenv\Scripts\Activate.ps1

# Run the server
python run_server.py
```

The backend will start on `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Alternative Docs: `http://localhost:8000/redoc`

### Start Frontend Development Server

```bash
# From frontend directory
cd arch-client-web-1.0-main/arch-client-web-1.0-main

# Run development server
npm run dev
# or
pnpm dev
```

The frontend will start on `http://localhost:3000`

### Default Accounts

The application creates default accounts on first startup:

**Admin Account:**
- Email: `admin@architectureacademics.com`
- Password: `Admin@123`

**Recruiter Account:**
- Email: `recruiter@architectureacademics.com`
- Password: `Recruiter@123`

## 🗄️ Database Schema

### Core Models

#### User
- Authentication and profile information
- Roles: USER, RECRUITER, ADMIN
- Profile details: name, email, bio, avatar, etc.

#### Blog
- Title, slug, content, excerpt
- Author (User relation)
- Categories: Architecture, Design, Technology, etc.
- Tags, featured flag, view count
- Comments and likes

#### Discussion
- Question-based forum posts
- Categories: General, Design Help, Technical, etc.
- Replies with solution marking
- View count, solved status
- Likes and reply likes

#### Course
- Course information with modules
- Instructor (User relation)
- Videos and downloadable materials
- Enrollment tracking
- Ratings and reviews

#### Workshop
- Workshop details and scheduling
- Instructor information
- Registration system
- Capacity and location

#### Event
- Event listings
- Date, location, type
- Registration management

#### Job
- Job postings by recruiters
- Job details: title, description, requirements
- Company information
- Application tracking

### Sample Data

On first startup, the application creates sample data:
- 8 blog posts across different categories
- 10 discussion topics with replies
- Sample courses, workshops, and events
- Job postings

## 📚 API Documentation

### Authentication Endpoints

```
POST /register          - Register new user
POST /login            - Login and get JWT token
GET  /users/me         - Get current user profile
PUT  /users/me         - Update user profile
```

### Blog Endpoints

```
GET    /blogs                    - List all blogs (with pagination)
POST   /blogs                    - Create new blog (authenticated)
GET    /blogs/{slug}            - Get blog by slug
PUT    /blogs/{id}              - Update blog (author/admin)
DELETE /blogs/{id}              - Delete blog (author/admin)
POST   /blogs/{id}/like         - Like/unlike blog
GET    /blogs/{id}/comments     - Get blog comments
POST   /blogs/{id}/comments     - Add comment
PUT    /comments/{id}           - Update comment
DELETE /comments/{id}           - Delete comment
POST   /comments/{id}/like      - Like/unlike comment
```

### Discussion Endpoints

```
GET    /discussions                  - List all discussions
POST   /discussions                  - Create new discussion
GET    /discussions/{id}            - Get discussion by ID
PUT    /discussions/{id}            - Update discussion
DELETE /discussions/{id}            - Delete discussion
POST   /discussions/{id}/like       - Like/unlike discussion
GET    /discussions/{id}/replies    - Get discussion replies
POST   /discussions/{id}/replies    - Add reply
PUT    /replies/{id}                - Update reply
DELETE /replies/{id}                - Delete reply
POST   /replies/{id}/like           - Like/unlike reply
POST   /replies/{id}/mark-solution  - Mark reply as solution
```

### Course Endpoints

```
GET    /courses              - List all courses
POST   /courses              - Create course (instructor/admin)
GET    /courses/{id}         - Get course details
PUT    /courses/{id}         - Update course
DELETE /courses/{id}         - Delete course
POST   /courses/{id}/enroll  - Enroll in course
POST   /courses/{id}/review  - Add course review
```

### Workshop Endpoints

```
GET    /workshops                    - List all workshops
POST   /workshops                    - Create workshop (admin)
GET    /workshops/{id}              - Get workshop details
PUT    /workshops/{id}              - Update workshop
DELETE /workshops/{id}              - Delete workshop
POST   /workshops/{id}/register     - Register for workshop
```

### Event Endpoints

```
GET    /events              - List all events
POST   /events              - Create event (admin)
GET    /events/{id}         - Get event details
PUT    /events/{id}         - Update event
DELETE /events/{id}         - Delete event
POST   /events/{id}/register - Register for event
```

### Job Portal Endpoints

```
GET    /jobs                   - List all jobs
POST   /jobs                   - Create job posting (recruiter)
GET    /jobs/{id}             - Get job details
PUT    /jobs/{id}             - Update job
DELETE /jobs/{id}             - Delete job
POST   /jobs/{id}/apply       - Apply to job
GET    /jobs/{id}/applications - Get job applications (recruiter)
```

For detailed API documentation with request/response schemas, visit:
`http://localhost:8000/docs` (after starting the backend)

## 🔐 Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL=sqlite:///./architecture_academics.db

# JWT Authentication
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AWS S3 (Optional)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name

# Application Settings
DEBUG=True
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Frontend (.env.local)

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Optional: For production
# NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd arch-client-web-1.0-main/arch-client-web-1.0-main
npm test
```

## 📦 Production Build

### Backend Production

```bash
cd backend

# Install production dependencies
pip install -r requirements.txt

# Set environment variables for production
# Edit .env file with production values

# Run with gunicorn (install first: pip install gunicorn)
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend Production

```bash
cd arch-client-web-1.0-main/arch-client-web-1.0-main

# Build for production
npm run build

# Start production server
npm start
```

## 🔧 Troubleshooting

### Common Issues

**Backend won't start:**
- Check if port 8000 is already in use
- Ensure Python virtual environment is activated
- Verify all dependencies are installed: `pip install -r requirements.txt`

**Frontend build errors:**
- Clear `.next` folder: `rm -rf .next`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be >= 18)

**Database errors:**
- Delete `architecture_academics.db` and restart backend to recreate
- Check file permissions on the database file

**CORS errors:**
- Verify `CORS_ORIGINS` in backend `.env` includes your frontend URL
- Check that frontend is using correct API URL in `.env.local`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Submit a pull request

### Coding Standards
- Follow PEP 8 for Python code
- Use ESLint/Prettier for JavaScript/TypeScript
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Suresh Sir** - Project Lead
- **Development Team** - Architecture Academics

## 📞 Support

For support, email: support@architectureacademics.com

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- FastAPI team for the fast and modern API framework
- shadcn/ui for beautiful UI components
- Tailwind CSS for the utility-first CSS framework
- All contributors who have helped build this platform

---

**Last Updated**: January 2025
**Version**: 1.0.0
