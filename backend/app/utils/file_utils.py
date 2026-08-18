import os
import uuid
from typing import Optional
import aiofiles
from fastapi import UploadFile
from app.config import settings


ALLOWED_RESUME_TYPES = {
    "application/pdf": ".pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "application/msword": ".doc",
}


async def save_upload_file(
    upload_file: UploadFile, subfolder: str = "resumes"
) -> dict:
    """Save an uploaded file and return metadata."""
    if upload_file.content_type not in ALLOWED_RESUME_TYPES:
        raise ValueError(
            f"Unsupported file type: {upload_file.content_type}. "
            f"Allowed: PDF, DOCX, DOC"
        )

    content = await upload_file.read()
    file_size = len(content)

    if file_size > settings.max_upload_size:
        raise ValueError(
            f"File too large. Maximum size: {settings.max_upload_size // (1024*1024)}MB"
        )

    ext = ALLOWED_RESUME_TYPES[upload_file.content_type]
    filename = f"{uuid.uuid4().hex}{ext}"
    upload_dir = os.path.join(settings.upload_dir, subfolder)
    os.makedirs(upload_dir, exist_ok=True)
    filepath = os.path.join(upload_dir, filename)

    async with aiofiles.open(filepath, "wb") as f:
        await f.write(content)

    return {
        "filename": upload_file.filename,
        "stored_filename": filename,
        "filepath": filepath,
        "file_size": file_size,
        "file_type": upload_file.content_type,
    }


async def delete_file(filepath: str) -> bool:
    """Delete a file from disk."""
    try:
        if os.path.exists(filepath):
            os.remove(filepath)
            return True
        return False
    except Exception:
        return False


async def save_profile_photo(upload_file: UploadFile, user_id: str) -> str:
    """Save a profile photo and return the URL path."""
    allowed_types = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    if upload_file.content_type not in allowed_types:
        raise ValueError("Unsupported image type. Allowed: JPEG, PNG, WebP, GIF")

    content = await upload_file.read()
    if len(content) > 5 * 1024 * 1024:
        raise ValueError("Photo too large. Maximum size: 5MB")

    ext_map = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "image/gif": ".gif",
    }
    ext = ext_map[upload_file.content_type]
    filename = f"{user_id}{ext}"
    upload_dir = os.path.join(settings.upload_dir, "photos")
    os.makedirs(upload_dir, exist_ok=True)
    filepath = os.path.join(upload_dir, filename)

    async with aiofiles.open(filepath, "wb") as f:
        await f.write(content)

    return f"/uploads/photos/{filename}"
