from datetime import datetime, timezone
from bson import ObjectId
from app.database.mongodb import get_database
from app.utils.file_utils import save_upload_file, delete_file
from app.services.resume_parser import parse_resume


async def upload_resume(user_id: str, file) -> dict:
    """Upload and parse a resume file."""
    db = get_database()


    existing = await db.resumes.find_one({"user_id": user_id})
    if existing and existing.get("filepath"):
        await delete_file(existing["filepath"])
        await db.resumes.delete_one({"_id": existing["_id"]})


    file_info = await save_upload_file(file, subfolder="resumes")


    try:
        parsed_data = parse_resume(file_info["filepath"], file_info["file_type"])
    except Exception as e:
        parsed_data = {"error": str(e), "raw_text": ""}


    resume_doc = {
        "user_id": user_id,
        "filename": file_info["filename"],
        "stored_filename": file_info["stored_filename"],
        "filepath": file_info["filepath"],
        "file_size": file_info["file_size"],
        "file_type": file_info["file_type"],
        "parsed_data": parsed_data,
        "analysis": None,
        "is_analyzed": False,
        "uploaded_at": datetime.now(timezone.utc),
    }

    result = await db.resumes.insert_one(resume_doc)


    if parsed_data and "error" not in parsed_data:
        profile_updates = {}
        if parsed_data.get("skills"):
            profile_updates["skills"] = parsed_data["skills"]
        if parsed_data.get("name"):
            profile_updates["full_name"] = parsed_data["name"]
        if parsed_data.get("phone"):
            profile_updates["phone"] = parsed_data["phone"]

        if profile_updates:
            profile_updates["updated_at"] = datetime.now(timezone.utc)
            await db.profiles.update_one(
                {"user_id": user_id},
                {"$set": profile_updates},
            )


    await db.activities.insert_one({
        "user_id": user_id,
        "type": "resume_upload",
        "description": f"Uploaded resume: {file_info['filename']}",
        "created_at": datetime.now(timezone.utc),
    })

    resume_doc["id"] = str(result.inserted_id)
    resume_doc.pop("_id", None)
    return resume_doc


async def get_resume(user_id: str) -> dict:
    """Get user's current resume."""
    db = get_database()
    resume = await db.resumes.find_one({"user_id": user_id})

    if not resume:
        return None

    resume["id"] = str(resume["_id"])
    del resume["_id"]
    return resume


async def delete_resume(user_id: str) -> dict:
    """Delete user's resume."""
    db = get_database()
    resume = await db.resumes.find_one({"user_id": user_id})

    if not resume:
        raise ValueError("No resume found")

    if resume.get("filepath"):
        await delete_file(resume["filepath"])

    await db.resumes.delete_one({"_id": resume["_id"]})

    await db.activities.insert_one({
        "user_id": user_id,
        "type": "resume_delete",
        "description": "Deleted resume",
        "created_at": datetime.now(timezone.utc),
    })

    return {"message": "Resume deleted successfully"}


async def get_resume_text(user_id: str) -> str:
    """Get the raw text of the user's resume."""
    resume = await get_resume(user_id)
    if not resume or not resume.get("parsed_data"):
        return ""
    return resume["parsed_data"].get("raw_text", "")
