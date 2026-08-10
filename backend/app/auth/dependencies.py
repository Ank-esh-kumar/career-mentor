from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.auth.jwt_handler import verify_token
from app.database.mongodb import get_database

security_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
):
    """Extract and verify the current user from the JWT token."""
    token = credentials.credentials
    payload = verify_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    db = get_database()
    from bson import ObjectId
    from bson.errors import InvalidId

    try:
        oid = ObjectId(user_id)
    except (InvalidId, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    user = await db.users.find_one({"_id": oid})
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    user["id"] = str(user["_id"])
    del user["_id"]
    if "password" in user:
        del user["password"]

    return user


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        HTTPBearer(auto_error=False)
    ),
):
    """Optionally extract user — returns None if no valid token."""
    if credentials is None:
        return None
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None


async def require_premium(
    current_user: dict = Depends(get_current_user),
):
    """Require that the current user has an active Pro subscription."""
    plan = current_user.get("subscription_plan", "free")

    # Check if subscription has expired
    if plan == "pro":
        from datetime import datetime, timezone
        expires_at = current_user.get("subscription_expires_at")
        if expires_at and isinstance(expires_at, datetime):
            # Ensure expires_at is timezone-aware
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
                
            if expires_at < datetime.now(timezone.utc):
                # Expired — downgrade in DB
                db = get_database()
                from bson import ObjectId
                await db.users.update_one(
                    {"_id": ObjectId(current_user["id"])},
                    {"$set": {"subscription_plan": "free", "subscription_expires_at": None}},
                )
                current_user["subscription_plan"] = "free"
                plan = "free"

    if plan != "pro":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This feature requires a Pro subscription. Please upgrade to access it.",
        )

    return current_user
