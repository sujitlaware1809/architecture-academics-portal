# Architecture Academics Portal

A unified platform for architecture education featuring NATA courses, job listings, events, workshops, and community discussions.

# Project Overview

## Frontend Technologies

The frontend is built using a modern React-based stack focusing on performance and user experience.

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI (Headless UI primitives), Lucide React (Icons)
- **Animations**: Framer Motion
- **Form Handling**: React Hook Form with Resolvers
- **Utilities**: clsx, class-variance-authority, date-fns

## Backend Technologies

The backend is a high-performance asynchronous API built with Python.

- **Framework**: FastAPI
- **Server**: Uvicorn
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Migrations**: Alembic
- **Authentication**: OAuth2 with JWT (python-jose, passlib, bcrypt)
- **Cloud Storage**: AWS S3 (boto3)
- **Background Tasks**: Celery with Redis
- **Data Processing**: Pandas, OpenPyXL
- **Image Processing**: Pillow

## Folder Structure

### Root Directory
- **backend/**: Contains the FastAPI application code.
- **frontend/**: Contains the Next.js application code.
- **deployment/**: Scripts and configurations for server deployment (EC2, Systemd).
- **deploy.sh**: Main deployment script.

### Backend Structure (backend/)
- **main.py**: Entry point for the FastAPI application.
- **database.py**: Database connection and session management.
- **models.py** (implied): SQLAlchemy database models.
- **schemas.py**: Pydantic models for request/response validation.
- **routes/**: API route handlers organized by feature (auth, blog, courses, etc.).
- **services/**: Business logic layer (auth_service, etc.).
- **middleware/**: Custom middleware (CORS, etc.).
- **utils/**: Utility functions (file handling, responses).
- **uploads/**: Local storage for uploaded files (if not using S3).

### Frontend Structure (frontend/)
- **app/**: Next.js App Router directory containing pages and layouts.
  - **(auth)/**: Authentication related pages.
  - **dashboard/**: User dashboard pages.
  - **admin/**: Admin interface pages.
- **components/**: Reusable UI components.
- **lib/**: Utility functions and shared logic.
- **public/**: Static assets.
- **styles/**: Global styles and CSS configurations.
