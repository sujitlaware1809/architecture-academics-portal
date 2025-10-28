from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import timedelta
import crud
import schemas
from database import get_db, User
from auth import create_access_token, verify_token, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/auth", tags=["Authentication"])
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
) -> User:
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

async def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    """Get current authenticated admin"""
    expected_role = schemas.UserRole.ADMIN
    user_role = current_user.role
    
    is_admin = False
    if isinstance(user_role, str):
        is_admin = user_role == expected_role.value
    else:
        is_admin = user_role == expected_role
    
    if not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions. Admin access required."
        )
    return current_user

async def get_current_recruiter(current_user: User = Depends(get_current_user)) -> User:
    """Get current authenticated recruiter"""
    print(f"Checking recruiter access for user: {current_user.email}, role: {current_user.role}")
    print(f"Role type: {type(current_user.role)}")
    
    # Handle both enum and string comparisons
    expected_role = schemas.UserRole.RECRUITER
    user_role = current_user.role
    
    # If the role is already a string, we need to compare with the enum's value
    # If the role is an enum, we can compare directly
    is_recruiter = False
    if isinstance(user_role, str):
        is_recruiter = user_role == expected_role.value
        print(f"Comparing string role: {user_role} == {expected_role.value} -> {is_recruiter}")
    else:
        is_recruiter = user_role == expected_role
        print(f"Comparing enum role: {user_role} == {expected_role} -> {is_recruiter}")
    
    if not is_recruiter:
        print(f"Access denied: User {current_user.email} does not have RECRUITER role")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions. Recruiter access required."
        )
    print(f"Access granted: User {current_user.email} has RECRUITER role")
    return current_user

@router.post("/register", response_model=schemas.Token)
async def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    
    # Validate password confirmation
    if user.password != user.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )
    
    # Check if user already exists
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    new_user = crud.create_user(db=db, user=user)
    
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

@router.post("/login", response_model=schemas.Token)
async def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    """Login user"""
    
    # Authenticate user
    user = crud.authenticate_user(db, user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
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

@router.get("/me", response_model=schemas.UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return current_user

@router.put("/profile", response_model=schemas.UserResponse)
async def update_profile(
    profile_data: schemas.UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile"""
    
    updated_user = crud.update_user_profile(db, current_user.id, profile_data)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return updated_user