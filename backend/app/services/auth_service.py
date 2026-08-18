from datetime import datetime, timezone
from typing import Optional
from bson import ObjectId
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from app.database.mongodb import get_database
from app.auth.jwt_handler import (
    create_access_token, hash_password, verify_password, create_reset_token,
)
from app.config import settings


async def signup_user(full_name: str, email: str, password: str) -> dict:
    """Register a new user with email/password."""
    db = get_database()

    existing = await db.users.find_one({"email": email})
    if existing:
        raise ValueError("An account with this email already exists")

    hashed = hash_password(password)
    user_doc = {
        "full_name": full_name,
        "email": email,
        "password": hashed,
        "auth_provider": "email",
        "is_verified": False,
        "photo_url": None,
        "subscription_plan": "free",
        "subscription_expires_at": None,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)


    await db.profiles.insert_one({
        "user_id": user_id,
        "full_name": full_name,
        "email": email,
        "phone": None,
        "location": None,
        "bio": None,
        "photo_url": None,
        "education": [],
        "skills": [],
        "interests": [],
        "languages": [],
        "experience": [],
        "projects": [],
        "certifications": [],
        "career_preferences": [],
        "linkedin_url": None,
        "github_url": None,
        "portfolio_url": None,
        "profile_completion": 0,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    })


    await db.user_settings.insert_one({
        "user_id": user_id,
        "notifications": {"email": True, "career_updates": True, "weekly_digest": True},
        "privacy": {"profile_visible": False, "show_email": False},
        "theme": "dark",
        "created_at": datetime.now(timezone.utc),
    })

    token = create_access_token({"sub": user_id, "email": email})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "full_name": full_name,
            "email": email,
            "photo_url": None,
            "auth_provider": "email",
            "is_verified": False,
            "subscription_plan": "free",
            "created_at": user_doc["created_at"],
        },
    }


async def login_user(email: str, password: str) -> dict:
    """Authenticate user with email/password."""
    db = get_database()

    user = await db.users.find_one({"email": email})
    if not user:
        raise ValueError("Invalid email or password")

    if user.get("auth_provider") == "google":
        raise ValueError("This account uses Google sign-in. Please use Google to log in.")

    if not verify_password(password, user["password"]):
        raise ValueError("Invalid email or password")

    user_id = str(user["_id"])
    token = create_access_token({"sub": user_id, "email": email})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "full_name": user["full_name"],
            "email": user["email"],
            "photo_url": user.get("photo_url"),
            "auth_provider": user.get("auth_provider", "email"),
            "is_verified": user.get("is_verified", False),
            "subscription_plan": user.get("subscription_plan", "free"),
            "created_at": user.get("created_at"),
        },
    }


async def google_auth(credential: str) -> dict:
    """Authenticate or register user via Google OAuth."""
    db = get_database()

    try:
        idinfo = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            settings.google_client_id,
        )
    except Exception:
        raise ValueError("Invalid Google credential")

    email = idinfo.get("email")
    full_name = idinfo.get("name", "")
    photo_url = idinfo.get("picture")

    user = await db.users.find_one({"email": email})

    if user:
        user_id = str(user["_id"])

        if photo_url and user.get("photo_url") != photo_url:
            await db.users.update_one(
                {"_id": user["_id"]},
                {"$set": {"photo_url": photo_url, "updated_at": datetime.now(timezone.utc)}},
            )
        user_created_at = user.get("created_at", datetime.now(timezone.utc))
        user_full_name = user.get("full_name", full_name)
    else:
        user_doc = {
            "full_name": full_name,
            "email": email,
            "password": None,
            "auth_provider": "google",
            "is_verified": True,
            "photo_url": photo_url,
            "subscription_plan": "free",
            "subscription_expires_at": None,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }
        result = await db.users.insert_one(user_doc)
        user_id = str(result.inserted_id)
        user_created_at = user_doc["created_at"]
        user_full_name = full_name

        await db.profiles.insert_one({
            "user_id": user_id,
            "full_name": full_name,
            "email": email,
            "photo_url": photo_url,
            "phone": None, "location": None, "bio": None,
            "education": [], "skills": [], "interests": [], "languages": [],
            "experience": [], "projects": [], "certifications": [],
            "career_preferences": [],
            "linkedin_url": None, "github_url": None, "portfolio_url": None,
            "profile_completion": 10,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        })

        await db.user_settings.insert_one({
            "user_id": user_id,
            "notifications": {"email": True, "career_updates": True, "weekly_digest": True},
            "privacy": {"profile_visible": False, "show_email": False},
            "theme": "dark",
            "created_at": datetime.now(timezone.utc),
        })

    token = create_access_token({"sub": user_id, "email": email})


    if user:
        sub_plan = user.get("subscription_plan", "free")
    else:
        sub_plan = "free"

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "full_name": user_full_name,
            "email": email,
            "photo_url": photo_url,
            "auth_provider": "google",
            "is_verified": True,
            "subscription_plan": sub_plan,
            "created_at": user_created_at,
        },
    }


async def forgot_password(email: str) -> dict:
    """Generate a password reset token."""
    db = get_database()
    user = await db.users.find_one({"email": email})


    if not user:
        return {"message": "If this email exists, a reset link has been sent."}

    if user.get("auth_provider") == "google":
        return {"message": "This account uses Google sign-in. Password reset is not applicable."}

    reset_token = create_reset_token(email)



    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"reset_token": reset_token, "updated_at": datetime.now(timezone.utc)}},
    )

    return {
        "message": "If this email exists, a reset link has been sent.",
        "reset_token": reset_token if settings.app_env == "development" else None,
    }


async def reset_password(token: str, new_password: str) -> dict:
    """Reset password using a valid reset token."""
    from app.auth.jwt_handler import verify_reset_token

    email = verify_reset_token(token)
    if not email:
        raise ValueError("Invalid or expired reset token")

    db = get_database()
    user = await db.users.find_one({"email": email})
    if not user:
        raise ValueError("User not found")

    hashed = hash_password(new_password)
    await db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "password": hashed,
                "reset_token": None,
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )

    return {"message": "Password has been reset successfully"}


async def change_password(user_id: str, current_password: str, new_password: str) -> dict:
    """Change password for authenticated user."""
    db = get_database()
    user = await db.users.find_one({"_id": ObjectId(user_id)})

    if not user:
        raise ValueError("User not found")

    if user.get("auth_provider") == "google":
        raise ValueError("Cannot change password for Google sign-in accounts")

    if not verify_password(current_password, user["password"]):
        raise ValueError("Current password is incorrect")

    hashed = hash_password(new_password)
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"password": hashed, "updated_at": datetime.now(timezone.utc)}},
    )

    return {"message": "Password changed successfully"}
