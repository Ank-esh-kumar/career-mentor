from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.auth.dependencies import get_current_user, require_premium
from app.services.resume_service import upload_resume, get_resume, delete_resume, get_resume_text
from app.ai.openrouter import openrouter_client
from app.ai.rag import store_resume_embedding
from app.database.mongodb import get_database
from app.schemas.resume import ResumeBuilderPreferences, ResumeDraft
from app.ai.prompts import resume_analysis_prompt, resume_builder_prompt, ats_evaluation_prompt, generate_summary_prompt, auto_fix_resume_prompt
from datetime import datetime, timezone
import json

router = APIRouter(prefix="/api/resume", tags=["Resume"])


@router.post("/upload")
async def upload(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    """Upload a resume file (PDF, DOCX, DOC — max 10MB)."""
    try:
        result = await upload_resume(current_user["id"], file)


        raw_text = result.get("parsed_data", {}).get("raw_text", "")
        if raw_text:
            try:
                await store_resume_embedding(current_user["id"], raw_text)
            except Exception:
                pass

        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("")
async def get_current_resume(current_user: dict = Depends(get_current_user)):
    """Get the current user's resume."""
    resume = await get_resume(current_user["id"])
    if not resume:
        raise HTTPException(status_code=404, detail="No resume found")
    return resume


@router.delete("")
async def remove_resume(current_user: dict = Depends(get_current_user)):
    """Delete the current user's resume."""
    try:
        result = await delete_resume(current_user["id"])
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/analyze")
async def analyze_resume(current_user: dict = Depends(get_current_user)):
    """Trigger AI analysis of the uploaded resume."""
    db = get_database()
    resume = await get_resume(current_user["id"])

    if not resume:
        raise HTTPException(status_code=404, detail="No resume found. Please upload a resume first.")

    parsed = resume.get("parsed_data", {})
    raw_text = parsed.get("raw_text", "")

    if not raw_text:
        raise HTTPException(status_code=400, detail="Could not extract text from resume")


    try:
        messages = resume_analysis_prompt(
            raw_text,
            parsed.get("skills", []),
            parsed.get("education", []),
        )
        response = await openrouter_client.chat_completion(messages, temperature=0.3)


        try:
            analysis = json.loads(response)
        except json.JSONDecodeError:

            import re
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                analysis = json.loads(json_match.group())
            else:
                analysis = {"error": "Failed to parse AI response", "raw_response": response}

        analysis["analyzed_at"] = datetime.now(timezone.utc).isoformat()


        from bson import ObjectId
        await db.resumes.update_one(
            {"user_id": current_user["id"]},
            {"$set": {"analysis": analysis, "is_analyzed": True}},
        )


        await db.activities.insert_one({
            "user_id": current_user["id"],
            "type": "resume_analysis",
            "description": "AI analyzed your resume",
            "created_at": datetime.now(timezone.utc),
        })

        return analysis

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")


@router.get("/analysis")
async def get_analysis(current_user: dict = Depends(get_current_user)):
    """Get the latest AI analysis of the resume."""
    resume = await get_resume(current_user["id"])
    if not resume:
        raise HTTPException(status_code=404, detail="No resume found")

    if not resume.get("is_analyzed") or not resume.get("analysis"):
        raise HTTPException(status_code=404, detail="Resume has not been analyzed yet")

    return resume["analysis"]


@router.post("/generate-draft")
async def generate_resume_draft(
    prefs: ResumeBuilderPreferences,
    current_user: dict = Depends(require_premium)
):
    """Generate an AI-optimized ATS resume draft based on user preferences."""
    print("generate_resume_draft CALLED with prefs:", prefs)
    db = get_database()
    resume = await get_resume(current_user["id"])

    if not resume:
        print("generate_resume_draft ERROR: Base resume not found")
        raise HTTPException(status_code=404, detail="Please upload a base resume first.")

    parsed = resume.get("parsed_data", {})
    analysis = resume.get("analysis", {})

    try:
        messages = resume_builder_prompt(prefs.model_dump(), parsed, analysis)
        print("generate_resume_draft: Sending to OpenRouter...")
        response = await openrouter_client.chat_completion(messages, temperature=0.7)
        print("generate_resume_draft: OpenRouter response received, length:", len(response))


        try:
            draft_content = json.loads(response)
        except json.JSONDecodeError:
            import re
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                draft_content = json.loads(json_match.group())
            else:
                print("generate_resume_draft ERROR: Failed to parse AI response into JSON")
                raise Exception("Failed to parse AI response into JSON")

        print("generate_resume_draft SUCCESS")
        return draft_content

    except Exception as e:
        print(f"generate_resume_draft FATAL ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate draft: {str(e)}")


@router.post("/generate-summary")
async def generate_summary(
    data: dict,
    current_user: dict = Depends(get_current_user),
):
    """Generate a highly tailored professional summary."""
    target_role = data.get("target_role", "")
    current_resume = data.get("current_resume", "")
    ats_insights = data.get("ats_insights", "")

    if not target_role:
        raise HTTPException(status_code=400, detail="Target role is required")

    try:
        messages = generate_summary_prompt(current_resume, target_role, ats_insights)

        response = await openrouter_client.chat_completion(messages, temperature=0.7)
        return {"summary": response.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate summary: {str(e)}")


@router.post("/auto-fix")
async def auto_fix_resume(
    data: dict,
    current_user: dict = Depends(require_premium),
):
    """Auto-fix ATS flagged improvements for a resume draft."""
    draft_content = data.get("content", {})
    improvements = data.get("improvements", [])

    if not draft_content or not improvements:
        raise HTTPException(status_code=400, detail="Draft content and improvements are required")

    try:
        messages = auto_fix_resume_prompt(json.dumps(draft_content), improvements)
        response = await openrouter_client.chat_completion(messages, temperature=0.2)

        try:
            fixed_draft = json.loads(response)
        except json.JSONDecodeError:
            import re
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                fixed_draft = json.loads(json_match.group())
            else:
                raise Exception("Failed to parse AI response")

        return fixed_draft

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ATS auto-fix failed: {str(e)}")


@router.post("/save-draft")
async def save_resume_draft(
    draft: ResumeDraft,
    current_user: dict = Depends(require_premium)
):
    """Save a manually edited resume draft."""
    print("save_resume_draft CALLED for user:", current_user["id"])
    db = get_database()
    draft_dict = draft.model_dump(exclude={"id"})
    draft_dict["user_id"] = current_user["id"]
    draft_dict["updated_at"] = datetime.now(timezone.utc)


    await db.resume_drafts.update_one(
        {"user_id": current_user["id"]},
        {"$set": draft_dict},
        upsert=True
    )
    print("save_resume_draft SUCCESS")
    return {"message": "Draft saved successfully"}


@router.get("/draft")
async def get_resume_draft(current_user: dict = Depends(require_premium)):
    """Get the latest saved resume draft."""
    db = get_database()
    draft = await db.resume_drafts.find_one({"user_id": current_user["id"]})

    if not draft:
        raise HTTPException(status_code=404, detail="No draft found")

    draft["id"] = str(draft["_id"])
    del draft["_id"]
    return draft


@router.post("/ats-evaluate")
async def ats_evaluate(
    data: dict,
    current_user: dict = Depends(require_premium),
):
    """AI-powered deep ATS evaluation of a resume draft (Premium only)."""
    draft_content = data.get("content", {})
    target_role = data.get("target_role", "")

    if not draft_content:
        raise HTTPException(status_code=400, detail="No resume content provided")

    try:
        messages = ats_evaluation_prompt(draft_content, target_role)
        response = await openrouter_client.chat_completion(messages, temperature=0.3)

        try:
            evaluation = json.loads(response)
        except json.JSONDecodeError:
            import re
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                evaluation = json.loads(json_match.group())
            else:
                raise Exception("Failed to parse AI response")

        return evaluation

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ATS evaluation failed: {str(e)}")
