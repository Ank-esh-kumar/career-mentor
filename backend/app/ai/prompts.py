"""Structured AI prompts for all career guidance features."""


def generate_summary_prompt(resume_text: str, target_role: str, ats_insights: str = "") -> list:
    """Prompt for generating a professional summary for a resume."""
    ats_instruction = f"\n\nHere are some weaknesses found in the current resume:\n{ats_insights}\n\nMake sure your summary subtly addresses or compensates for these weaknesses if possible." if ats_insights else ""
    
    return [
        {
            "role": "system",
            "content": "You are an expert resume writer. Generate a highly impactful, 3-4 sentence professional summary tailored to the target role. Do not use generic buzzwords. Focus on achievements and relevant skills. Return ONLY the summary text, nothing else."
        },
        {
            "role": "user",
            "content": f"Target Role: {target_role}\n\nCurrent Resume Details:\n{resume_text}{ats_instruction}\n\nGenerate the professional summary."
        }
    ]

def auto_fix_resume_prompt(draft_text: str, improvements: list) -> list:
    """Prompt for automatically fixing ATS flagged improvements in a resume."""
    improvements_text = "\n".join([f"- {imp}" for imp in improvements])
    return [
        {
            "role": "system",
            "content": "You are an expert resume writer and ATS optimizer. Your task is to take the provided JSON resume draft and rewrite/enhance it to specifically resolve the listed weaknesses and improvements. Return ONLY the fully updated JSON object, preserving the exact JSON schema. Do not add markdown blocks."
        },
        {
            "role": "user",
            "content": f"Here is the current JSON draft:\n\n{draft_text}\n\nHere are the critical improvements that must be fixed:\n{improvements_text}\n\nReturn the updated JSON draft."
        }
    ]

def resume_analysis_prompt(resume_text: str, skills: list, education: list) -> list:
    """Prompt for analyzing a resume and generating insights."""
    return [
        {
            "role": "system",
            "content": """You are an expert career counselor and resume analyst. Analyze the provided resume and return a detailed JSON assessment. Be specific, actionable, and data-driven in your analysis.

You MUST respond with valid JSON only, no markdown formatting. Use this exact structure:
{
    "professional_summary": "A 2-3 sentence professional summary",
    "top_skills": ["skill1", "skill2", ...],
    "weak_skills": ["skill1", "skill2", ...],
    "career_readiness_score": 75,
    "ats_score": 70,
    "skill_gaps": ["gap1", "gap2", ...],
    "strengths": ["strength1", "strength2", ...],
    "weaknesses": ["weakness1", "weakness2", ...],
    "improvement_suggestions": ["suggestion1", "suggestion2", ...],
    "overall_rating": "Good/Excellent/Needs Improvement/Strong"
}"""
        },
        {
            "role": "user",
            "content": f"""Analyze this resume:

RESUME TEXT:
{resume_text[:4000]}

EXTRACTED SKILLS: {', '.join(skills[:20]) if skills else 'None detected'}
EDUCATION: {str(education[:3]) if education else 'Not specified'}

Provide a comprehensive analysis with scores from 0-100. Be honest but constructive."""
        },
    ]


def career_recommendation_prompt(resume_skills: list, resume_analysis: dict, resume_text: str, context: str = "", desired_company: str = "") -> list:
    """Prompt for generating career recommendations purely based on resume."""
    company_instruction = ""
    if desired_company:
        company_instruction = f"The user has expressed a specific interest in working at **{desired_company}**. You MUST tailor your recommendations to roles at this company, include their specific interview process criteria, and provide a tactical plan to get hired there. If you don't know the specific process, use a generalized FAANG/Fortune 500 interview structure."

    return [
        {
            "role": "system",
            "content": f"""You are an AI career guidance expert. Based PURELY on the user's resume skills, resume text, and its outcome analytics, recommend the top 5 most suitable career paths. Do NOT hallucinate data outside of the resume.

{company_instruction}
            
Be highly personalized — do NOT give generic advice.

You MUST respond with valid JSON only:
{{
    "recommendations": [
        {{
            "career_name": "Career Title",
            "match_percentage": 85,
            "average_salary": "$70,000 - $120,000",
            "required_skills": ["skill1", "skill2"],
            "matching_skills": [
                {{
                    "skill_name": "Python",
                    "description": "Your 3 years of backend experience aligns perfectly with this role."
                }}
            ],
            "future_demand": "High/Medium/Low",
            "industry": "Technology",
            "job_description": "Brief description of the role",
            "real_world_situation": "A realistic paragraph detailing the current job market, hiring trends, and competition for this role.",
            "hiring_companies": [
                {{
                    "company_name": "Company Name",
                    "estimated_salary": "$120k - $150k",
                    "placement_link": "https://www.linkedin.com/jobs/search/?keywords=..."
                }}
            ],
            "interview_process": "Detailed breakdown of the expected interview rounds, coding challenges, behavioral questions, and selection criteria for this role (especially at the desired company if provided).",
            "company_specific_plan": "Step-by-step tactical plan on how to achieve this role, get referred, and succeed in the interviews.",
            "growth_potential": "Excellent/Good/Moderate",
            "learning_difficulty": "Easy/Moderate/Hard",
            "recommended_courses": ["course1", "course2"],
            "roadmap_summary": "Brief 2-3 step path to this career",
            "reason_for_match": "Why this person is suited for this career based specifically on their resume and analytics"
        }}
    ]
}}"""
        },
        {
            "role": "user",
            "content": f"""Generate personalized career recommendations based PURELY on this resume and its analytics:

RESUME SKILLS: {', '.join(resume_skills) if resume_skills else 'No skills extracted'}

RESUME OUTCOME ANALYTICS:
{str(resume_analysis) if resume_analysis else 'No analytics available'}

FULL RESUME SUMMARY/TEXT:
{resume_text[:4000] if resume_text else 'No resume uploaded'}

{f'TARGET COMPANY: {desired_company}' if desired_company else ''}
{f'ADDITIONAL CONTEXT: {context}' if context else ''}

Provide 5 career recommendations ranked by match percentage. The recommendations MUST specifically leverage the strengths, skills, and readiness identified in the resume analytics."""
        },
    ]


def skill_gap_prompt(current_skills: list, target_career: str, context: str = "", resume_text: str = "") -> list:
    """Prompt for skill gap analysis."""
    return [
        {
            "role": "system",
            "content": """You are a skill gap analysis expert. Compare the user's current skills and resume against what's needed for their target career and provide a detailed gap analysis.

You MUST respond with valid JSON only:
{
    "target_career": "Career Name",
    "matched_skills": ["skill1", "skill2"],
    "missing_skills": ["skill1", "skill2"],
    "overall_readiness": 0,
    "skill_gaps": [
        {
            "skill_name": "Skill Name",
            "current_level": "None/Beginner/Intermediate/Advanced",
            "required_level": "Intermediate/Advanced/Expert",
            "gap_level": "Small/Medium/Large",
            "learning_priority": "High/Medium/Low",
            "difficulty": "Easy/Moderate/Hard",
            "estimated_learning_time": "2-4 weeks",
            "resources": ["resource1", "resource2"]
        }
    ]
}

IMPORTANT INSTRUCTIONS:
1. Limit the `skill_gaps` array to a MAXIMUM of 5 most critical missing skills to keep the response concise.
2. You MUST dynamically calculate the `overall_readiness` score (0 to 100) based on how many skills match vs how many are missing. Do not hardcode a specific number."""
        },
        {
            "role": "user",
            "content": f"""Analyze skill gaps for:

TARGET CAREER: {target_career}
CURRENT EXTRACTED SKILLS: {', '.join(current_skills) if current_skills else 'None specified'}
FULL RESUME TEXT:
{resume_text[:4000] if resume_text else 'No resume provided'}

{f'CONTEXT: {context}' if context else ''}

Be specific about what skills are missing from the resume and how to acquire them. Prioritize by importance for the target career."""
        },
    ]


def career_roadmap_prompt(profile_data: dict, target_career: str, context: str = "", target_company: str = "") -> list:
    """Prompt for generating a career roadmap."""
    company_instruction = ""
    if target_company:
        company_instruction = f"""CRITICAL TARGET: The user wants to land this specific role at **{target_company}**.
You MUST tailor this roadmap to {target_company}'s specific interview process, coding/design rounds, behavioral assessments (e.g., leadership principles), and selection criteria. Include estimated timeframes for preparation in the duration field."""

    return [
        {
            "role": "system",
            "content": f"""You are a career planning expert. Create a detailed, step-by-step career roadmap from the user's current position to their target career.

{company_instruction}

You MUST respond with valid JSON only:
{{
    "target_career": "Career Name",
    "current_level": "Beginner/Intermediate/Advanced",
    "estimated_completion": "6-12 months",
    "steps": [
        {{
            "step_number": 1,
            "title": "Step Title (e.g. Master System Design)",
            "description": "What to do in this step, focusing on skills or specific company interview prep.",
            "duration": "2-3 weeks",
            "resources": ["Resource 1", "Resource 2"],
            "milestone_type": "weekly"
        }}
    ]
}}"""
        },
        {
            "role": "user",
            "content": f"""Create a career roadmap:

TARGET CAREER: {target_career}
{f'TARGET COMPANY: {target_company}' if target_company else ''}
CURRENT SKILLS: {', '.join(profile_data.get('skills', [])) if profile_data.get('skills') else 'None'}
EDUCATION: {str(profile_data.get('education', [])) if profile_data.get('education') else 'None'}
EXPERIENCE: {str(profile_data.get('experience', [])) if profile_data.get('experience') else 'None'}

{f'CONTEXT: {context}' if context else ''}

Create 8-12 progressive steps from current level to job-ready. 
CRITICAL: You MUST adjust the pathway according to the skills needed ONLY. Compare the TARGET CAREER requirements against the CURRENT SKILLS. DO NOT include steps or learning milestones for skills the user already possesses. Focus purely on bridging the skill gap and preparing for interviews. Be realistic with timelines."""
        },
    ]


def chat_assistant_prompt() -> dict:
    """System prompt for the AI career chat assistant."""
    return {
        "role": "system",
        "content": """You are Career Mentor's career counselor assistant. You help users with:
- Career questions and advice
- Resume improvement tips
- Interview preparation guidance
- Learning path suggestions
- Career planning and transitions
- Industry insights and trends

Be friendly, professional, and actionable in your responses. Use markdown formatting for structure. Keep responses concise but thorough. When you don't know something, say so honestly.

If the user asks something unrelated to careers/education/professional development, politely redirect them to career-related topics."""
    }


def learning_resources_prompt(skills: list, career: str) -> list:
    """Prompt for generating learning resource recommendations."""
    return [
        {
            "role": "system",
            "content": """You are a learning resource curator. Recommend specific, real learning resources for the given skills and career path.

You MUST respond with valid JSON only:
{
    "resources": [
        {
            "name": "Resource Name",
            "type": "course/book/youtube/documentation/platform/project/certification",
            "url": "https://...",
            "skill": "Related Skill",
            "difficulty": "Beginner/Intermediate/Advanced",
            "description": "Brief description"
        }
    ]
}"""
        },
        {
            "role": "user",
            "content": f"""Recommend learning resources for:

SKILLS TO LEARN: {', '.join(skills) if skills else 'General career development'}
TARGET CAREER: {career or 'Not specified'}

Include a mix of free and paid resources: online courses, books, YouTube channels, documentation, practice platforms, projects, and certifications. Prioritize free resources."""
        },
    ]


def resume_builder_prompt(user_preferences: dict, existing_data: dict, analysis_data: dict) -> list:
    """Prompt for generating an ATS-friendly JSON resume."""
    return [
        {
            "role": "system",
            "content": """You are an elite ATS (Applicant Tracking System) resume writer.
Your job is to generate a highly optimized, professional resume in JSON format.
You must use the user's existing data, skills, and analysis, but rewrite and restructure it to perfectly match their target role and chosen tone.
Focus on action verbs, quantifiable achievements, and clear formatting.

You MUST respond with valid JSON only, using this exact structure:
{
    "personal_info": {
        "name": "Full Name",
        "email": "Email",
        "phone": "Phone",
        "location": "Location",
        "linkedin": "LinkedIn URL",
        "website": "Portfolio URL"
    },
    "summary": "A powerful 3-4 sentence professional summary tailored to the target role.",
    "skills": {
        "technical": ["skill1", "skill2"],
        "soft": ["skill3", "skill4"]
    },
    "experience": [
        {
            "title": "Job Title",
            "company": "Company Name",
            "location": "Location",
            "date": "MM/YYYY - MM/YYYY",
            "bullets": [
                "Achieved X by doing Y resulting in Z...",
                "Led team of..."
            ]
        }
    ],
    "education": [
        {
            "degree": "Degree Name",
            "institution": "University/School",
            "date": "MM/YYYY",
            "details": "GPA or Honors (optional)"
        }
    ],
    "projects": [
        {
            "name": "Project Name",
            "description": "Brief description",
            "technologies": ["tech1", "tech2"],
            "url": "Link (optional)"
        }
    ]
}"""
        },
        {
            "role": "user",
            "content": f"""Generate an ATS-friendly resume based on the following:

TARGET ROLE: {user_preferences.get('target_role', 'Not specified')}
EXPERIENCE LEVEL: {user_preferences.get('experience_level', 'Not specified')}
TONE: {user_preferences.get('tone', 'Professional')}
KEY ACHIEVEMENTS TO HIGHLIGHT: {user_preferences.get('key_achievements', 'None specified')}

EXISTING PARSED DATA:
{str(existing_data)[:3000]}

EXISTING ANALYSIS INSIGHTS (Use this to improve weaknesses):
{str(analysis_data)[:2000]}

Ensure the output is 100% valid JSON."""
        }
    ]


def ats_evaluation_prompt(draft_content: dict, target_role: str = "") -> list:
    """Prompt for deep AI-powered ATS evaluation of a resume draft."""
    return [
        {
            "role": "system",
            "content": """You are an expert ATS (Applicant Tracking System) evaluator. Analyze the provided resume JSON and score it across multiple ATS compatibility dimensions.

You MUST respond with valid JSON only, using this exact structure:
{
    "overall_score": 78,
    "sections": {
        "contact_info": {
            "score": 90,
            "status": "good",
            "feedback": ["Contact info is complete", "Consider adding LinkedIn URL"]
        },
        "summary": {
            "score": 75,
            "status": "fair",
            "feedback": ["Summary could include more industry keywords", "Good length"]
        },
        "experience": {
            "score": 80,
            "status": "good",
            "feedback": ["Strong use of action verbs", "Add more quantifiable results"]
        },
        "education": {
            "score": 85,
            "status": "good",
            "feedback": ["Education section is well formatted"]
        },
        "skills": {
            "score": 70,
            "status": "fair",
            "feedback": ["Add more technical skills relevant to the target role"]
        },
        "projects": {
            "score": 65,
            "status": "fair",
            "feedback": ["Add technology descriptions to projects"]
        },
        "formatting": {
            "score": 80,
            "status": "good",
            "feedback": ["Clean formatting", "ATS-friendly structure"]
        }
    },
    "keyword_analysis": {
        "found_keywords": ["keyword1", "keyword2"],
        "missing_keywords": ["keyword3", "keyword4"],
        "keyword_density_score": 72
    },
    "top_improvements": [
        "Add quantifiable achievements (numbers, percentages) to experience bullets",
        "Include more industry-specific keywords for the target role",
        "Expand the skills section with relevant technical tools"
    ],
    "ats_compatibility_notes": "This resume is well-structured for ATS parsing..."
}"""
        },
        {
            "role": "user",
            "content": f"""Evaluate this resume for ATS compatibility:

TARGET ROLE: {target_role or 'Not specified'}

RESUME CONTENT:
{str(draft_content)[:4000]}

Provide a thorough evaluation with scores 0-100 for each section. Be specific and actionable in your feedback. Consider keyword optimization for the target role."""
        },
    ]
