from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client: AsyncIOMotorClient = None
db = None


async def connect_to_mongo():
    """Initialize MongoDB connection."""
    global client, db
    try:
        client = AsyncIOMotorClient(
            settings.mongodb_uri,
            serverSelectionTimeoutMS=5000,
        )

        await client.admin.command("ping")
        db = client[settings.mongodb_db_name]


        await db.users.create_index("email", unique=True)
        await db.profiles.create_index("user_id", unique=True)
        await db.resumes.create_index("user_id")
        await db.career_recommendations.create_index("user_id")
        await db.skill_gaps.create_index("user_id")
        await db.career_roadmaps.create_index("user_id")
        await db.chat_messages.create_index([("user_id", 1), ("created_at", -1)])
        await db.saved_careers.create_index([("user_id", 1), ("career_name", 1)], unique=True)
        await db.user_settings.create_index("user_id", unique=True)
        await db.activities.create_index([("user_id", 1), ("created_at", -1)])

        print(f"Connected to MongoDB: {settings.mongodb_db_name}")
    except Exception as e:
        print(f"ERROR: Failed to connect to MongoDB at {settings.mongodb_uri}")
        print(f"  Details: {e}")
        raise


async def close_mongo_connection():
    """Close MongoDB connection."""
    global client
    if client:
        client.close()
        print("MongoDB connection closed.")


def get_database():
    """Get database instance."""
    return db
