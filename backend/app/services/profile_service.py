from datetime import datetime, timezone
from bson import ObjectId
from app.database.mongodb import get_database
from app.utils.helpers import calculate_profile_completion


async def get_profile(user_id: str) -> dict:
    """Get user profile."""
    db = get_database()
    profile = await db.profiles.find_one({"user_id": user_id})

    if not profile:
        raise ValueError("Profile not found")

    profile["id"] = str(profile["_id"])
    del profile["_id"]
    return profile


async def update_profile(user_id: str, data: dict) -> dict:
    """Update user profile."""
    db = get_database()


    update_data = {k: v for k, v in data.items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)


    current = await db.profiles.find_one({"user_id": user_id})
    if current:
        merged = {**current, **update_data}
        update_data["profile_completion"] = calculate_profile_completion(merged)

    await db.profiles.update_one(
        {"user_id": user_id},
        {"$set": update_data},
        upsert=True,
    )


    if "full_name" in update_data:
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"full_name": update_data["full_name"], "updated_at": datetime.now(timezone.utc)}},
        )


    await db.activities.insert_one({
        "user_id": user_id,
        "type": "profile_update",
        "description": "Updated profile information",
        "created_at": datetime.now(timezone.utc),
    })

    return await get_profile(user_id)


async def update_profile_photo(user_id: str, photo_url: str) -> dict:
    """Update profile photo URL."""
    db = get_database()

    await db.profiles.update_one(
        {"user_id": user_id},
        {"$set": {"photo_url": photo_url, "updated_at": datetime.now(timezone.utc)}},
    )
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"photo_url": photo_url, "updated_at": datetime.now(timezone.utc)}},
    )

    return await get_profile(user_id)
