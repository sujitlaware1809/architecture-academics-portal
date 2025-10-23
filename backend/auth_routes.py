from fastapi import FastAPI, Depends, HTTPException, status, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from datetime import timedelta
from typing import Optional
from sqlalchemy.orm import Session

from .auth_config import (
    create_access_token,
    create_auth_response,
    verify_csrf_token,
    get_current_user,
    get_cors_middleware,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from . import crud, schemas
from .database import get_db

app = FastAPI(title="Architecture Academics API")

# Add CORS middleware
app.add_middleware(get_cors_middleware())

# Authentication endpoints
@app.post("/auth/login")
async def login(
    response: Response,
    user_credentials: schemas.UserLogin,
    db: Session = Depends(get_db)
):
    """Login and set secure cookie with JWT token"""
    # Authenticate user
    user = crud.authenticate_user(
        db,
        user_credentials.email,
        user_credentials.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    # Create access token
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    # Return response with secure cookie and CSRF token
    return create_auth_response(access_token, user.dict())

@app.post("/auth/logout")
async def logout(response: Response):
    """Clear authentication cookie"""
    response.delete_cookie(
        key="auth_token",
        domain=COOKIE_DOMAIN,
        secure=SECURE_COOKIES,
        httponly=True
    )
    return {"message": "Logged out successfully"}

@app.get("/auth/me", response_model=schemas.UserResponse)
async def get_current_user_profile(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """Get current user profile with CSRF validation"""
    csrf_token = request.headers.get("csrf-token")
    auth_token = request.cookies.get("auth_token")

    if not auth_token or not csrf_token or not verify_csrf_token(csrf_token, auth_token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid CSRF token"
        )

    return current_user

# Protected route example
@app.get("/protected-resource")
async def protected_resource(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """Example of a protected resource requiring authentication"""
    csrf_token = request.headers.get("csrf-token")
    auth_token = request.cookies.get("auth_token")

    if not auth_token or not csrf_token or not verify_csrf_token(csrf_token, auth_token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid CSRF token"
        )

    return {
        "message": "Access granted to protected resource",
        "user": current_user.email
    }