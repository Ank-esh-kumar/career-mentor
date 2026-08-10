from fastapi import APIRouter, Depends, HTTPException
from app.auth.dependencies import get_current_user
from app.database.mongodb import get_database
from app.services.auth_service import change_password
from datetime import datetime, timezone
from bson import ObjectId

router = APIRouter(prefix="/api/settings", tags=["Settings"])


@router.get("")
async def get_settings(current_user: dict = Depends(get_current_user)):
    """Get user settings."""
    db = get_database()
    settings_doc = await db.user_settings.find_one({"user_id": current_user["id"]})

    if not settings_doc:
        return {
            "notifications": {"email": True, "career_updates": True, "weekly_digest": True},
            "privacy": {"profile_visible": False, "show_email": False},
            "theme": "dark",
        }

    settings_doc["id"] = str(settings_doc["_id"])
    del settings_doc["_id"]
    return settings_doc


@router.put("")
async def update_settings(
    data: dict,
    current_user: dict = Depends(get_current_user),
):
    """Update user settings."""
    db = get_database()
    data["updated_at"] = datetime.now(timezone.utc)

    await db.user_settings.update_one(
        {"user_id": current_user["id"]},
        {"$set": data},
        upsert=True,
    )

    return {"message": "Settings updated successfully"}


@router.post("/change-password")
async def change_user_password(
    data: dict,
    current_user: dict = Depends(get_current_user),
):
    """Change user password."""
    try:
        result = await change_password(
            current_user["id"],
            data.get("current_password", ""),
            data.get("new_password", ""),
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/account")
async def delete_account(current_user: dict = Depends(get_current_user)):
    """Delete user account and all associated data."""
    db = get_database()
    user_id = current_user["id"]

    # Delete all user data
    await db.profiles.delete_many({"user_id": user_id})
    await db.resumes.delete_many({"user_id": user_id})
    await db.career_recommendations.delete_many({"user_id": user_id})
    await db.skill_gaps.delete_many({"user_id": user_id})
    await db.career_roadmaps.delete_many({"user_id": user_id})
    await db.chat_messages.delete_many({"user_id": user_id})
    await db.saved_careers.delete_many({"user_id": user_id})
    await db.user_settings.delete_many({"user_id": user_id})
    await db.activities.delete_many({"user_id": user_id})
    await db.users.delete_one({"_id": ObjectId(user_id)})

    return {"message": "Account deleted successfully"}
