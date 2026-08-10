from fastapi import APIRouter, Depends, HTTPException
from app.auth.dependencies import get_current_user
from app.database.mongodb import get_database
from datetime import datetime, timezone, timedelta
from bson import ObjectId

router = APIRouter(prefix="/api/subscription", tags=["Subscription"])


@router.get("")
async def get_subscription(current_user: dict = Depends(get_current_user)):
    """Get the current user's subscription status."""
    db = get_database()
    user = await db.users.find_one({"_id": ObjectId(current_user["id"])})

    plan = user.get("subscription_plan", "free") if user else "free"
    expires_at = user.get("subscription_expires_at") if user else None

    # Auto-downgrade if expired
    if plan == "pro" and expires_at and isinstance(expires_at, datetime):
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
            
        if expires_at < datetime.now(timezone.utc):
            await db.users.update_one(
                {"_id": ObjectId(current_user["id"])},
                {"$set": {"subscription_plan": "free", "subscription_expires_at": None}},
            )
            plan = "free"
            expires_at = None

    return {
        "plan": plan,
        "is_premium": plan == "pro",
        "expires_at": expires_at.isoformat() if expires_at else None,
        "features": _get_plan_features(plan),
    }


@router.post("/activate")
async def activate_subscription(current_user: dict = Depends(get_current_user)):
    """Simulate activating a Pro subscription (demo mode).

    In production, this would be called after payment verification
    from Razorpay/Stripe webhook.
    """
    db = get_database()
    expires_at = datetime.now(timezone.utc) + timedelta(days=30)

    await db.users.update_one(
        {"_id": ObjectId(current_user["id"])},
        {
            "$set": {
                "subscription_plan": "pro",
                "subscription_expires_at": expires_at,
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )

    # Log activity
    await db.activities.insert_one({
        "user_id": current_user["id"],
        "type": "subscription_activated",
        "description": "Upgraded to Pro subscription",
        "created_at": datetime.now(timezone.utc),
    })

    return {
        "message": "Pro subscription activated successfully!",
        "plan": "pro",
        "is_premium": True,
        "expires_at": expires_at.isoformat(),
        "features": _get_plan_features("pro"),
    }


@router.post("/cancel")
async def cancel_subscription(current_user: dict = Depends(get_current_user)):
    """Cancel the Pro subscription (revert to free)."""
    db = get_database()

    await db.users.update_one(
        {"_id": ObjectId(current_user["id"])},
        {
            "$set": {
                "subscription_plan": "free",
                "subscription_expires_at": None,
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )

    # Log activity
    await db.activities.insert_one({
        "user_id": current_user["id"],
        "type": "subscription_cancelled",
        "description": "Cancelled Pro subscription",
        "created_at": datetime.now(timezone.utc),
    })

    return {
        "message": "Subscription cancelled. You are now on the Free plan.",
        "plan": "free",
        "is_premium": False,
        "expires_at": None,
        "features": _get_plan_features("free"),
    }


def _get_plan_features(plan: str) -> dict:
    """Return feature flags for the given plan."""
    if plan == "pro":
        return {
            "resume_builder": True,
            "ats_evaluation": True,
            "deep_ats_scan": True,
            "unlimited_ai_chat": True,
            "export_reports": True,
            "priority_processing": True,
        }
    return {
        "resume_builder": False,
        "ats_evaluation": False,
        "deep_ats_scan": False,
        "unlimited_ai_chat": False,
        "export_reports": False,
        "priority_processing": False,
    }
