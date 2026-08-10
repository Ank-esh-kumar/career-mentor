from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.user import (
    UserSignup, UserLogin, GoogleAuthRequest,
    ForgotPasswordRequest, ResetPasswordRequest,
)
from app.services import auth_service
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/signup")
async def signup(data: UserSignup):
    """Register a new user."""
    try:
        result = await auth_service.signup_user(data.full_name, data.email, data.password)
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/login")
async def login(data: UserLogin):
    """Login with email and password."""
    try:
        result = await auth_service.login_user(data.email, data.password)
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.post("/google")
async def google_auth(data: GoogleAuthRequest):
    """Authenticate with Google OAuth."""
    try:
        result = await auth_service.google_auth(data.credential)
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest):
    """Send password reset link."""
    result = await auth_service.forgot_password(data.email)
    return result


@router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest):
    """Reset password with token."""
    try:
        result = await auth_service.reset_password(data.token, data.new_password)
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current authenticated user info."""
    return current_user
