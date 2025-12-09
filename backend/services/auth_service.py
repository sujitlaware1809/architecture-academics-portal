from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import crud
import schemas
from database import get_db, User
from auth import create_access_token, verify_token, ACCESS_TOKEN_EXPIRE_MINUTES

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    token = credentials.credentials
    email = verify_token(token)
    
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = crud.get_user_by_email(db, email=email)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

async def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Get current user if authenticated, or None if not"""
    if not credentials:
        return None
        
    try:
        token = credentials.credentials
        email = verify_token(token)
        if email is None:
            return None
            
        user = crud.get_user_by_email(db, email=email)
        return user
    except:
        return None

class AuthService:
    """Service class for authentication-related business logic"""
    
    @staticmethod
    def register_user(db: Session, user_data: schemas.UserCreate) -> dict:
        """Register a new user and return token"""
        
        # Validate password confirmation
        if user_data.password != user_data.confirm_password:
            raise ValueError("Passwords do not match")
        
        # Check if user already exists
        existing_user = crud.get_user_by_email(db, email=user_data.email)
        if existing_user:
            raise ValueError("Email already registered")
        
        # Create user
        new_user = crud.create_user(db=db, user=user_data)
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": new_user.email}, expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": new_user
        }
    
    @staticmethod
    def authenticate_user(db: Session, credentials: schemas.UserLogin) -> dict:
        """Authenticate user and return token"""
        
        # Authenticate user
        user = crud.authenticate_user(db, credentials.email, credentials.password)
        if not user:
            raise ValueError("Incorrect email or password")
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user
        }
    
    @staticmethod
    def verify_user_token(token: str, db: Session) -> Optional[User]:
        """Verify token and return user"""
        email = verify_token(token)
        if email is None:
            return None
        
        user = crud.get_user_by_email(db, email=email)
        return user
    
    @staticmethod
    def update_user_profile(db: Session, user_id: int, profile_data: schemas.UserProfileUpdate) -> User:
        """Update user profile"""
        updated_user = crud.update_user_profile(db, user_id, profile_data)
        if not updated_user:
            raise ValueError("User not found")
        return updated_user
    
    @staticmethod
    def check_user_permissions(user: User, required_role: schemas.UserRole) -> bool:
        """Check if user has required permissions"""
        user_role = user.role
        
        # Handle both enum and string comparisons
        if isinstance(user_role, str):
            return user_role == required_role.value
        else:
            return user_role == required_role