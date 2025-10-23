from fastapi import HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
import os
from dotenv import load_dotenv

load_dotenv()

# Security configurations
SECRET_KEY = os.getenv("SECRET_KEY", "your-secure-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

# Cookie configurations
COOKIE_DOMAIN = os.getenv("COOKIE_DOMAIN", ".architectureacademics.com")
SECURE_COOKIES = os.getenv("SECURE_COOKIES", "true").lower() == "true"
COOKIE_SAMESITE = os.getenv("COOKIE_SAMESITE", "Lax")

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme for token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token with enhanced security"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),  # Issued at
        "type": "access"  # Token type
    })
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_auth_response(token: str, user_data: dict) -> JSONResponse:
    """Create a response with secure cookie and CSRF token"""
    response = JSONResponse(content={
        "user": user_data,
        "csrf_token": token[:32]  # First 32 chars as CSRF token
    })
    
    # Set secure cookie with token
    response.set_cookie(
        key="auth_token",
        value=token,
        httponly=True,
        secure=SECURE_COOKIES,
        domain=COOKIE_DOMAIN,
        samesite=COOKIE_SAMESITE,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60  # Convert to seconds
    )
    
    return response

def verify_csrf_token(request_csrf_token: str, auth_token: str) -> bool:
    """Verify CSRF token matches first 32 chars of auth token"""
    return request_csrf_token == auth_token[:32]

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Validate token and return current user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_type: str = payload.get("type")
        if token_type != "access":
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    user = get_user(email=token_data.email)
    if user is None:
        raise credentials_exception
    return user

# CORS middleware settings
def get_cors_middleware():
    """Configure CORS for cross-subdomain requests"""
    origins = os.getenv("CORS_ORIGINS", "").split(",")
    return CORSMiddleware(
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["csrf-token"],  # Expose CSRF token header
        max_age=1800  # Cache preflight requests for 30 minutes
    )