from fastapi import APIRouter, Depends, HTTPException, Body
from app.auth.dependencies import get_current_user
from app.database.mongodb import get_database
from app.services.resume_service import get_resume_text
from app.services.profile_service import get_profile
from app.ai.openrouter import openrouter_client
from app.ai.prompts import career_recommendation_prompt, learning_resources_prompt
from app.ai.rag import retrieve_context
from datetime import datetime, timezone
from bson import ObjectId
import json
import re

router = APIRouter(prefix="/api/career", tags=["Career"])


@router.post("/recommend")
async def generate_recommendations(
    data: dict = Body(default={}),
    current_user: dict = Depends(get_current_user)
):
    """Generate AI career recommendations based on user profile and resume."""
    db = get_database()

    from app.services.resume_service import get_resume
    resume = await get_resume(current_user["id"])

    if not resume:
        raise HTTPException(status_code=400, detail="Please upload and analyze your resume first to get career recommendations.")

    parsed_data = resume.get("parsed_data", {})
    resume_skills = parsed_data.get("skills", [])
    resume_text = parsed_data.get("raw_text", "")
    resume_analysis = resume.get("analysis", {})
    desired_company = data.get("desired_company", "")


    query = f"career recommendations for someone with skills: {', '.join(resume_skills[:10]) if resume_skills else ''}"
    context = await retrieve_context(query, "career_knowledge", n_results=3)

    messages = career_recommendation_prompt(resume_skills, resume_analysis, resume_text, context, desired_company)

    try:
        response = await openrouter_client.chat_completion(messages, temperature=0.5)

        try:
            result = json.loads(response)
        except json.JSONDecodeError:
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                result = json.loads(json_match.group())
            else:
                raise ValueError("Failed to parse AI response")

        recommendations = result.get("recommendations", [])


        rec_doc = {
            "user_id": current_user["id"],
            "recommendations": recommendations,
            "generated_at": datetime.now(timezone.utc),
            "based_on": {
                "skills": resume_skills,
                "has_resume": bool(resume_text),
                "has_analytics": bool(resume_analysis)
            },
        }

        insert_result = await db.career_recommendations.insert_one(rec_doc)


        await db.activities.insert_one({
            "user_id": current_user["id"],
            "type": "career_recommendation",
            "description": f"Generated {len(recommendations)} career recommendations",
            "created_at": datetime.now(timezone.utc),
        })

        return {
            "id": str(insert_result.inserted_id),
            "recommendations": recommendations,
            "generated_at": rec_doc["generated_at"],
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate recommendations: {str(e)}")


@router.get("/recommendations")
async def get_recommendations(current_user: dict = Depends(get_current_user)):
    """Get the latest career recommendations."""
    db = get_database()
    rec = await db.career_recommendations.find_one(
        {"user_id": current_user["id"]},
        sort=[("generated_at", -1)],
    )

    if not rec:
        raise HTTPException(status_code=404, detail="No recommendations found. Generate recommendations first.")

    rec["id"] = str(rec["_id"])
    del rec["_id"]
    return rec


@router.post("/save")
async def save_career(
    data: dict,
    current_user: dict = Depends(get_current_user),
):
    """Save/bookmark a career."""
    db = get_database()

    career_doc = {
        "user_id": current_user["id"],
        "career_name": data.get("career_name"),
        "match_percentage": data.get("match_percentage"),
        "industry": data.get("industry"),
        "average_salary": data.get("average_salary"),
        "details": data,
        "saved_at": datetime.now(timezone.utc),
    }

    try:
        await db.saved_careers.insert_one(career_doc)
        return {"message": "Career saved successfully"}
    except Exception:
        raise HTTPException(status_code=400, detail="Career already saved")


@router.get("/saved")
async def get_saved_careers(current_user: dict = Depends(get_current_user)):
    """Get all saved/bookmarked careers."""
    db = get_database()
    cursor = db.saved_careers.find({"user_id": current_user["id"]}).sort("saved_at", -1)
    careers = []
    async for career in cursor:
        career["id"] = str(career["_id"])
        del career["_id"]
        careers.append(career)
    return careers


@router.delete("/saved/{career_id}")
async def delete_saved_career(
    career_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Remove a saved career."""
    db = get_database()
    result = await db.saved_careers.delete_one({
        "_id": ObjectId(career_id),
        "user_id": current_user["id"],
    })

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Saved career not found")

    return {"message": "Career removed from saved"}


@router.post("/learning-resources")
async def get_learning_resources(
    data: dict,
    current_user: dict = Depends(get_current_user),
):
    """Get AI-recommended learning resources for skills."""
    skills = data.get("skills", [])
    career = data.get("career", "")

    messages = learning_resources_prompt(skills, career)

    try:
        response = await openrouter_client.chat_completion(messages, temperature=0.5)
        try:
            result = json.loads(response)
        except json.JSONDecodeError:
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                result = json.loads(json_match.group())
            else:
                result = {"resources": []}

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get resources: {str(e)}")
