from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class ResumeUploadResponse(BaseModel):
    id: str
    filename: str
    file_size: int
    file_type: str
    uploaded_at: datetime
    parsed_data: Optional[Dict[str, Any]] = None
    is_analyzed: bool = False


class ParsedResume(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    summary: Optional[str] = None
    education: Optional[List[Dict[str, Any]]] = []
    experience: Optional[List[Dict[str, Any]]] = []
    skills: Optional[List[str]] = []
    projects: Optional[List[Dict[str, Any]]] = []
    certifications: Optional[List[str]] = []
    achievements: Optional[List[str]] = []
    technologies: Optional[List[str]] = []
    languages: Optional[List[str]] = []


class ResumeAnalysis(BaseModel):
    professional_summary: Optional[str] = None
    top_skills: Optional[List[str]] = []
    weak_skills: Optional[List[str]] = []
    career_readiness_score: Optional[int] = 0
    ats_score: Optional[int] = 0
    skill_gaps: Optional[List[str]] = []
    strengths: Optional[List[str]] = []
    weaknesses: Optional[List[str]] = []
    improvement_suggestions: Optional[List[str]] = []
    overall_rating: Optional[str] = None
    analyzed_at: Optional[datetime] = None


class ResumeResponse(BaseModel):
    id: str
    user_id: str
    filename: str
    file_size: int
    file_type: str
    file_url: Optional[str] = None
    parsed_data: Optional[ParsedResume] = None
    analysis: Optional[ResumeAnalysis] = None
    is_analyzed: bool = False
    uploaded_at: Optional[datetime] = None


class ResumeBuilderPreferences(BaseModel):
    target_role: str
    experience_level: str
    key_achievements: str
    tone: str = "Professional"


class ResumeDraft(BaseModel):
    id: Optional[str] = None
    user_id: Optional[str] = None
    target_role: str
    content: Dict[str, Any]  # The JSON structure of the resume (summary, experience, etc.)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
