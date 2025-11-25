from fastapi.middleware.cors import CORSMiddleware
from typing import List
import os

def get_cors_origins() -> List[str]:
    """Get CORS origins based on environment"""
    
    # Get environment configuration
    ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
    CORS_ORIGINS_ENV = os.getenv("CORS_ORIGINS", "")
    
    # Base local development origins
    local_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ]
    
    # Production origins
    production_origins = [
        "https://architecture-academics.online",
        "https://www.architecture-academics.online",
        "https://courses.architecture-academics.online",
        "https://jobs.architecture-academics.online", 
        "https://events.architecture-academics.online",
        "https://workshops.architecture-academics.online",
        "https://blogs.architecture-academics.online",
        "https://discussions.architecture-academics.online",
        "https://admin.architecture-academics.online",
        
        # HTTP versions for testing
        "http://architecture-academics.online",
        "http://www.architecture-academics.online",
        "http://courses.architecture-academics.online",
        "http://jobs.architecture-academics.online",
        "http://events.architecture-academics.online", 
        "http://workshops.architecture-academics.online",
        "http://blogs.architecture-academics.online",
        "http://discussions.architecture-academics.online",
        "http://admin.architecture-academics.online",
    ]
    
    # Environment variable override
    if CORS_ORIGINS_ENV:
        env_origins = [origin.strip() for origin in CORS_ORIGINS_ENV.split(",")]
        return env_origins + local_origins
    
    # Production environment
    if ENVIRONMENT == "production":
        return production_origins + local_origins
    
    # Development environment  
    return local_origins + production_origins

def configure_cors(app):
    """Configure CORS middleware for the FastAPI app"""
    
    # Get environment configuration
    ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
    
    # Configure CORS origins
    cors_origins = get_cors_origins()

    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_origin_regex=r"^https?://((localhost|127\.0\.0\.1)|(192\.168\.[0-9]{1,3}\.[0-9]{1,3})|(10\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})|(172\.(1[6-9]|2[0-9]|3[0-1])\.[0-9]{1,3}\.[0-9]{1,3})|([a-zA-Z0-9\-]+\.architecture-academics\.online))(\:[0-9]{2,5})?$",
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=[
            "accept",
            "accept-encoding", 
            "authorization",
            "content-type",
            "dnt",
            "origin",
            "user-agent",
            "x-csrftoken",
            "x-requested-with",
            "cache-control",
            "pragma",
        ],
    )

    print(f"🚀 Environment: {ENVIRONMENT}")
    print(f"🌐 CORS Origins: {len(cors_origins)} configured")
    print(f"🔧 Production-ready CORS configuration loaded")