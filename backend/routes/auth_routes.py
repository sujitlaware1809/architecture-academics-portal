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

@router.post("/register")
async def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Register a new user (requires OTP verification)"""
    
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
    
    # Create user with is_verified=False and generate OTP
    new_user = crud.create_user(db=db, user=user)
    
    return {
        "message": "Registration successful! Please check your email for OTP verification.",
        "email": new_user.email,
        "requires_verification": True
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
    
    # Check if user has verified their email
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Please verify your email first. Check your inbox for the OTP.",
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

@router.post("/verify-otp", response_model=schemas.Token)
async def verify_otp(otp_data: schemas.OTPVerification, db: Session = Depends(get_db)):
    """Verify email OTP and activate user account"""
    
    # Verify OTP
    is_verified = crud.verify_email_otp(db, otp_data.email, otp_data.otp)
    
    if not is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP"
        )
    
    # Get the verified user
    user = crud.get_user_by_email(db, otp_data.email)
    
    # Create access token for the verified user
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
        "message": "Email verified successfully!"
    }

@router.post("/resend-otp")
async def resend_otp(otp_request: schemas.OTPRequest, db: Session = Depends(get_db)):
    """Resend OTP to user email"""
    
    # Check if user exists
    user = crud.get_user_by_email(db, otp_request.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if user is already verified
    if user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already verified"
        )
    
    # Resend OTP
    success = crud.resend_otp(db, otp_request.email)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to resend OTP"
        )
    
    return {
        "message": "OTP sent successfully! Please check your email.",
        "email": otp_request.email
    }

@router.post("/forgot-password")
async def forgot_password(password_reset: schemas.PasswordResetRequest, db: Session = Depends(get_db)):
    """Request password reset via email"""
    
    # Check if user exists
    user = crud.get_user_by_email(db, password_reset.email)
    if not user:
        # Don't reveal if email exists or not for security
        return {
            "message": "If the email exists, password reset instructions have been sent."
        }
    
    # Generate and send password reset token
    success = crud.create_password_reset_token(db, password_reset.email)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send password reset email"
        )
    
    return {
        "message": "If the email exists, password reset instructions have been sent."
    }

@router.post("/reset-password")
async def reset_password(password_reset: schemas.PasswordReset, db: Session = Depends(get_db)):
    """Reset password using token"""
    
    # Reset password
    success = crud.reset_password_with_token(db, password_reset.token, password_reset.new_password)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    return {
        "message": "Password reset successfully! You can now login with your new password."
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