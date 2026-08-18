from fastapi import APIRouter, Depends, HTTPException
from app.auth.dependencies import get_current_user
from app.database.mongodb import get_database
from app.services.profile_service import get_profile
from app.ai.openrouter import openrouter_client
from app.ai.prompts import career_roadmap_prompt
from app.ai.rag import retrieve_context
from datetime import datetime, timezone
import json
import re

router = APIRouter(prefix="/api/roadmap", tags=["Roadmap"])


@router.post("/generate")
async def generate_roadmap(
    data: dict,
    current_user: dict = Depends(get_current_user),
):
    """Generate a personalized career roadmap."""
    db = get_database()
    target_career = data.get("target_career", "")
    target_company = data.get("target_company", "")

    if not target_career:
        raise HTTPException(status_code=400, detail="Target career is required")

    try:
        profile = await get_profile(current_user["id"])
    except ValueError:
        raise HTTPException(status_code=400, detail="Please complete your profile first")

    context = await retrieve_context(
        f"career roadmap for {target_career}",
        "career_knowledge",
        n_results=3,
    )

    messages = career_roadmap_prompt(profile, target_career, context, target_company)

    try:
        response = await openrouter_client.chat_completion(messages, temperature=0.5)


        cleaned_response = response.strip()
        if cleaned_response.startswith("```json"):
            cleaned_response = cleaned_response[7:]
        if cleaned_response.startswith("```"):
            cleaned_response = cleaned_response[3:]
        if cleaned_response.endswith("```"):
            cleaned_response = cleaned_response[:-3]
        cleaned_response = cleaned_response.strip()

        try:
            result = json.loads(cleaned_response)
        except json.JSONDecodeError:
            json_match = re.search(r'\{[\s\S]*\}', cleaned_response)
            if json_match:
                try:
                    result = json.loads(json_match.group())
                except json.JSONDecodeError:
                    raise ValueError("Failed to parse AI response JSON")
            else:
                raise ValueError("Failed to parse AI response")

        roadmap_doc = {
            "user_id": current_user["id"],
            "target_career": target_career,
            "target_company": target_company,
            "current_level": result.get("current_level", "Beginner"),
            "steps": result.get("steps", []),
            "estimated_completion": result.get("estimated_completion", ""),
            "generated_at": datetime.now(timezone.utc),
        }

        insert_result = await db.career_roadmaps.insert_one(roadmap_doc)

        await db.activities.insert_one({
            "user_id": current_user["id"],
            "type": "roadmap_generation",
            "description": f"Generated roadmap for {target_career}",
            "created_at": datetime.now(timezone.utc),
        })

        roadmap_doc["id"] = str(insert_result.inserted_id)
        roadmap_doc.pop("_id", None)
        return roadmap_doc

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Roadmap generation failed: {str(e)}")


@router.get("/latest")
async def get_latest_roadmap(current_user: dict = Depends(get_current_user)):
    """Get the latest career roadmap."""
    db = get_database()
    roadmap = await db.career_roadmaps.find_one(
        {"user_id": current_user["id"]},
        sort=[("generated_at", -1)],
    )

    if not roadmap:
        raise HTTPException(status_code=404, detail="No roadmap found")

    roadmap["id"] = str(roadmap["_id"])
    del roadmap["_id"]
    return roadmap


@router.put("/step/{roadmap_id}/{step_number}")
async def toggle_step(
    roadmap_id: str,
    step_number: int,
    current_user: dict = Depends(get_current_user),
):
    """Toggle completion status of a roadmap step."""
    db = get_database()
    from bson import ObjectId

    roadmap = await db.career_roadmaps.find_one({
        "_id": ObjectId(roadmap_id),
        "user_id": current_user["id"],
    })

    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    steps = roadmap.get("steps", [])
    for step in steps:
        if step.get("step_number") == step_number:
            step["is_completed"] = not step.get("is_completed", False)
            break

    await db.career_roadmaps.update_one(
        {"_id": ObjectId(roadmap_id)},
        {"$set": {"steps": steps}},
    )

    return {"message": "Step updated", "steps": steps}
