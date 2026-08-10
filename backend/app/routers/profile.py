from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.auth.dependencies import get_current_user
from app.schemas.profile import ProfileUpdate
from app.services import profile_service
from app.utils.file_utils import save_profile_photo

router = APIRouter(prefix="/api/profile", tags=["Profile"])


@router.get("")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get current user's profile."""
    try:
        profile = await profile_service.get_profile(current_user["id"])
        return profile
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("")
async def update_profile(
    data: ProfileUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Update user profile."""
    try:
        profile = await profile_service.update_profile(
            current_user["id"], data.model_dump(exclude_unset=True)
        )
        return profile
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/photo")
async def upload_photo(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    """Upload profile photo."""
    try:
        photo_url = await save_profile_photo(file, current_user["id"])
        profile = await profile_service.update_profile_photo(current_user["id"], photo_url)
        return {"photo_url": photo_url, "profile": profile}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
