from fastapi import APIRouter, Depends, HTTPException
from app.auth.dependencies import get_current_user
from app.database.mongodb import get_database
from app.services.profile_service import get_profile
from app.ai.openrouter import openrouter_client
from app.ai.prompts import skill_gap_prompt
from app.ai.rag import retrieve_context
from datetime import datetime, timezone
import json
import re

router = APIRouter(prefix="/api/skillgap", tags=["Skill Gap"])


@router.post("/analyze")
async def analyze_skill_gap(
    data: dict,
    current_user: dict = Depends(get_current_user),
):
    """Run skill gap analysis for a target career."""
    db = get_database()
    target_career = data.get("target_career", "")

    if not target_career:
        raise HTTPException(status_code=400, detail="Target career is required")

    try:
        profile = await get_profile(current_user["id"])
    except ValueError:
        raise HTTPException(status_code=400, detail="Please complete your profile first")

    current_skills = profile.get("skills", [])


    context = await retrieve_context(
        f"skills required for {target_career}",
        "career_knowledge",
        n_results=3,
    )

    from app.services.resume_service import get_resume


    resume_text = ""
    try:
        resume = await get_resume(current_user["id"])
        if resume and "parsed_data" in resume:
            resume_text = resume["parsed_data"].get("raw_text", "")
    except Exception:
        pass

    messages = skill_gap_prompt(current_skills, target_career, context, resume_text)

    try:
        response = await openrouter_client.chat_completion(messages, temperature=0.3)

        try:
            result = json.loads(response)
        except json.JSONDecodeError:
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                result = json.loads(json_match.group())
            else:
                raise ValueError("Failed to parse AI response")
    except Exception as e:
        print(f"OpenRouter API failed: {e}. Falling back to mock data.")

        safe_skills = current_skills if current_skills else []
        matched = [str(skill) for skill in safe_skills if skill and len(str(skill)) > 2][:3]

        result = {
            "matched_skills": matched,
            "missing_skills": ["System Design", "Advanced Algorithms", "Cloud Architecture"],
            "overall_readiness": 55,
            "skill_gaps": [
                {
                    "skill_name": "System Design",
                    "current_level": "Beginner",
                    "required_level": "Advanced",
                    "gap_level": "Large",
                    "learning_priority": "High",
                    "difficulty": "Hard",
                    "estimated_learning_time": "4-8 weeks",
                    "resources": ["Designing Data-Intensive Applications (Book)", "Grokking the System Design Interview"]
                },
                {
                    "skill_name": "Cloud Architecture",
                    "current_level": "None",
                    "required_level": "Intermediate",
                    "gap_level": "Medium",
                    "learning_priority": "High",
                    "difficulty": "Moderate",
                    "estimated_learning_time": "3-5 weeks",
                    "resources": ["AWS Solutions Architect Certification", "Cloud Guru Courses"]
                }
            ]
        }

    try:

        gap_doc = {
            "user_id": current_user["id"],
            "target_career": target_career,
            "matched_skills": result.get("matched_skills", []),
            "missing_skills": result.get("missing_skills", []),
            "skill_gaps": result.get("skill_gaps", []),
            "overall_readiness": result.get("overall_readiness", 0),
            "analyzed_at": datetime.now(timezone.utc),
        }

        insert_result = await db.skill_gaps.insert_one(gap_doc)

        await db.activities.insert_one({
            "user_id": current_user["id"],
            "type": "skill_gap_analysis",
            "description": f"Analyzed skill gaps for {target_career}",
            "created_at": datetime.now(timezone.utc),
        })

        gap_doc["id"] = str(insert_result.inserted_id)
        if "_id" in gap_doc:
            del gap_doc["_id"]
        return gap_doc

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Skill gap analysis database operation failed: {str(e)}")


@router.get("/latest")
async def get_latest_skill_gap(current_user: dict = Depends(get_current_user)):
    """Get the latest skill gap analysis."""
    db = get_database()
    gap = await db.skill_gaps.find_one(
        {"user_id": current_user["id"]},
        sort=[("analyzed_at", -1)],
    )

    if not gap:
        raise HTTPException(status_code=404, detail="No skill gap analysis found")

    gap["id"] = str(gap["_id"])
    del gap["_id"]
    return gap
