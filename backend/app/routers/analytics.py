from fastapi import APIRouter, Depends, HTTPException
from app.auth.dependencies import get_current_user
from app.database.mongodb import get_database
from app.services.profile_service import get_profile
from app.services.resume_service import get_resume
from datetime import datetime, timezone

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/dashboard")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """Get dashboard statistics."""
    db = get_database()
    user_id = current_user["id"]


    try:
        profile = await get_profile(user_id)
        profile_completion = profile.get("profile_completion", 0)
        skills_count = len(profile.get("skills", []))
    except Exception:
        profile_completion = 0
        skills_count = 0


    resume = await get_resume(user_id)
    has_resume = resume is not None
    resume_score = 0
    if resume and resume.get("analysis"):
        resume_score = resume["analysis"].get("career_readiness_score", 0)


    latest_rec = await db.career_recommendations.find_one(
        {"user_id": user_id}, sort=[("generated_at", -1)]
    )
    career_match_score = 0
    latest_career = None
    if latest_rec and latest_rec.get("recommendations"):
        top = latest_rec["recommendations"][0]
        career_match_score = top.get("match_percentage", 0)
        latest_career = top.get("career_name")


    latest_gap = await db.skill_gaps.find_one(
        {"user_id": user_id}, sort=[("analyzed_at", -1)]
    )
    skill_gap_score = 0
    if latest_gap:
        skill_gap_score = latest_gap.get("overall_readiness", 0)


    cursor = db.activities.find({"user_id": user_id}).sort("created_at", -1).limit(5)
    activities = []
    async for activity in cursor:
        activities.append({
            "type": activity["type"],
            "description": activity["description"],
            "timestamp": activity["created_at"],
        })


    saved_count = await db.saved_careers.count_documents({"user_id": user_id})

    return {
        "profile_completion": profile_completion,
        "skills_count": skills_count,
        "has_resume": has_resume,
        "resume_score": resume_score,
        "career_match_score": career_match_score,
        "latest_career": latest_career,
        "skill_gap_score": skill_gap_score,
        "saved_careers_count": saved_count,
        "recent_activities": activities,
    }


@router.get("/career-match")
async def get_career_match_distribution(current_user: dict = Depends(get_current_user)):
    """Get career match score distribution for charts."""
    db = get_database()
    rec = await db.career_recommendations.find_one(
        {"user_id": current_user["id"]}, sort=[("generated_at", -1)]
    )

    if not rec:
        return {"data": []}

    data = []
    for career in rec.get("recommendations", []):
        data.append({
            "name": career.get("career_name", "Unknown"),
            "match": career.get("match_percentage", 0),
            "industry": career.get("industry", ""),
        })

    return {"data": data}


@router.get("/skill-progress")
async def get_skill_progress(current_user: dict = Depends(get_current_user)):
    """Get skill categories and levels."""
    try:
        profile = await get_profile(current_user["id"])
        skills = profile.get("skills", [])


        categories = {
            "Programming": [], "Frontend": [], "Backend": [],
            "Database": [], "DevOps": [], "AI/ML": [],
            "Soft Skills": [], "Other": [],
        }

        programming = {"python", "javascript", "java", "c++", "c#", "go", "rust", "typescript", "ruby", "php", "swift", "kotlin", "r", "scala"}
        frontend = {"react", "angular", "vue", "html", "css", "tailwind", "bootstrap", "next.js", "sass"}
        backend_set = {"node.js", "express", "django", "flask", "fastapi", "spring", "rails", "laravel"}
        database = {"mongodb", "postgresql", "mysql", "redis", "firebase", "elasticsearch", "sql"}
        devops = {"docker", "kubernetes", "aws", "azure", "gcp", "ci/cd", "terraform", "git", "linux"}
        ai_ml = {"machine learning", "deep learning", "nlp", "tensorflow", "pytorch", "pandas", "numpy", "data science"}
        soft = {"communication", "leadership", "teamwork", "problem solving", "project management", "critical thinking"}

        for skill in skills:
            s = skill.lower()
            if s in programming:
                categories["Programming"].append(skill)
            elif s in frontend:
                categories["Frontend"].append(skill)
            elif s in backend_set:
                categories["Backend"].append(skill)
            elif s in database:
                categories["Database"].append(skill)
            elif s in devops:
                categories["DevOps"].append(skill)
            elif s in ai_ml:
                categories["AI/ML"].append(skill)
            elif s in soft:
                categories["Soft Skills"].append(skill)
            else:
                categories["Other"].append(skill)

        data = [{"category": k, "count": len(v), "skills": v} for k, v in categories.items() if v]
        return {"data": data}

    except Exception:
        return {"data": []}


@router.get("/resume-score")
async def get_resume_score_trend(current_user: dict = Depends(get_current_user)):
    """Get resume analysis scores."""
    resume = await get_resume(current_user["id"])

    if not resume or not resume.get("analysis"):
        return {"data": []}

    analysis = resume["analysis"]
    data = [
        {"metric": "Career Readiness", "score": analysis.get("career_readiness_score", 0)},
        {"metric": "ATS Score", "score": analysis.get("ats_score", 0)},
        {"metric": "Skills Match", "score": min(len(analysis.get("top_skills", [])) * 10, 100)},
        {"metric": "Experience", "score": max(0, 100 - len(analysis.get("weaknesses", [])) * 15)},
    ]

    return {"data": data}
