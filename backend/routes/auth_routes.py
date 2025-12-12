from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import timedelta
import crud
import schemas
from database import get_db, User
from auth import create_access_token, verify_token, ACCESS_TOKEN_EXPIRE_MINUTES
from services import social_auth_service
import os
import secrets
import string

from services.auth_service import get_current_user, get_current_user_optional

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()

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
    """Register a new user (requires email verification via link)"""
    
    # Validate password confirmation
    if user.password != user.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )
    
    # Check if user already exists
    # Normalize email for check
    db_user = crud.get_user_by_email(db, email=user.email.lower().strip())
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user with is_verified=False and generate verification link
    new_user = crud.create_user(db=db, user=user)
    
    return {
        "message": "Registration successful! Please check your email for the verification link.",
        "email": new_user.email,
        "requires_verification": True
    }

@router.post("/login", response_model=schemas.Token)
async def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    """Login user"""
    
    # Authenticate user
    # Normalize email for login
    user = crud.authenticate_user(db, user_credentials.email.lower().strip(), user_credentials.password)
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
            detail="Please verify your email first. Check your inbox for the verification link.",
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

# OLD OTP ROUTE - DISABLED (now using email link verification)
# @router.post("/verify-otp", response_model=schemas.Token)
# async def verify_otp(otp_data: schemas.OTPVerification, db: Session = Depends(get_db)):
#     """Verify email OTP and activate user account"""
#     
#     # Verify OTP
#     is_verified = crud.verify_email_otp(db, otp_data.email, otp_data.otp)
#     
#     if not is_verified:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Invalid or expired OTP"
#         )
#     
#     # Get the verified user
#     user = crud.get_user_by_email(db, otp_data.email)
#     
#     # Create access token for the verified user
#     access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
#     access_token = create_access_token(
#         data={"sub": user.email}, expires_delta=access_token_expires
#     )
#     
#     return {
#         "access_token": access_token,
#         "token_type": "bearer",
#         "user": user,
#         "message": "Email verified successfully!"
#     }

@router.get("/verify-email/{token}")
async def verify_email_link(token: str, db: Session = Depends(get_db)):
    """Verify email using token from link"""
    
    # Verify token
    is_verified = crud.verify_email_token(db, token)
    
    if not is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification link"
        )
    
    return {
        "message": "Email verified successfully! You can now login.",
        "verified": True
    }

@router.post("/resend-verification")
async def resend_verification(request: schemas.OTPRequest, db: Session = Depends(get_db)):
    """Resend verification email"""
    
    # Check if user exists
    user = crud.get_user_by_email(db, request.email)
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
    
    # Resend verification token
    success = crud.resend_verification_token(db, request.email)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to resend verification email"
        )
    
    return {
        "message": "Verification email sent successfully! Please check your inbox.",
        "email": request.email
    }

# OLD OTP ROUTE - DISABLED (now using email link verification)
# @router.post("/resend-otp")
# async def resend_otp(otp_request: schemas.OTPRequest, db: Session = Depends(get_db)):
#     """Resend OTP to user email"""
#     
#     # Check if user exists
#     user = crud.get_user_by_email(db, otp_request.email)
#     if not user:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="User not found"
#         )
#     
#     # Check if user is already verified
#     if user.is_verified:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Email is already verified"
#         )
#     
#     # Resend OTP
#     success = crud.resend_otp(db, otp_request.email)
#     
#     if not success:
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail="Failed to resend OTP"
#         )
#     
#     return {
#         "message": "OTP sent successfully! Please check your email.",
#         "email": otp_request.email
#     }

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
    
    try:
        updated_user = crud.update_user_profile(db, current_user.id, profile_data)
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return updated_user
    except IntegrityError as e:
        db.rollback()
        if "username" in str(e.orig):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken. Please choose another one."
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not update profile. Please check your input."
        )

# Social Login Routes

@router.get("/google/login")
async def google_login():
    try:
        auth_url = await social_auth_service.get_google_login_url()
        return RedirectResponse(auth_url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/google/callback")
async def google_callback(code: str, db: Session = Depends(get_db)):
    try:
        user_info = await social_auth_service.get_google_user_info(code)
        email = user_info.get("email")
        
        if not email:
            raise HTTPException(status_code=400, detail="Email not found in Google account")
            
        # Check if user exists
        user = crud.get_user_by_email(db, email=email)
        
        if not user:
            # Create new user
            # Generate random password
            alphabet = string.ascii_letters + string.digits
            password = ''.join(secrets.choice(alphabet) for i in range(12))
            
            user_data = schemas.UserCreate(
                email=email,
                password=password,
                confirm_password=password,
                first_name=user_info.get("given_name", ""),
                last_name=user_info.get("family_name", ""),
                user_type=schemas.UserType.GENERAL_USER # Default to General User
            )
            user = crud.create_user(db=db, user=user_data)
            # Auto-verify email for social login
            user.is_active = True
            user.is_verified = True
            db.commit()
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        
        # Redirect to frontend with token
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        return RedirectResponse(f"{frontend_url}/login?token={access_token}")
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/outlook/login")
async def outlook_login():
    try:
        auth_url = await social_auth_service.get_outlook_login_url()
        return RedirectResponse(auth_url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/outlook/callback")
async def outlook_callback(code: str, db: Session = Depends(get_db)):
    try:
        user_info = await social_auth_service.get_outlook_user_info(code)
        email = user_info.get("mail") or user_info.get("userPrincipalName")
        
        if not email:
            raise HTTPException(status_code=400, detail="Email not found in Outlook account")
            
        # Check if user exists
        user = crud.get_user_by_email(db, email=email)
        
        if not user:
            # Create new user
            alphabet = string.ascii_letters + string.digits
            password = ''.join(secrets.choice(alphabet) for i in range(12))
            
            user_data = schemas.UserCreate(
                email=email,
                password=password,
                confirm_password=password,
                first_name=user_info.get("givenName", ""),
                last_name=user_info.get("surname", ""),
                user_type=schemas.UserType.GENERAL_USER
            )
            user = crud.create_user(db=db, user=user_data)
            user.is_active = True
            user.is_verified = True
            db.commit()
            
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        
        # Redirect to frontend with token
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        return RedirectResponse(f"{frontend_url}/login?token={access_token}")
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))