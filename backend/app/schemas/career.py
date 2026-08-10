from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class CareerRecommendation(BaseModel):
    career_name: str
    match_percentage: int
    average_salary: Optional[str] = None
    required_skills: Optional[List[str]] = []
    future_demand: Optional[str] = None
    industry: Optional[str] = None
    job_description: Optional[str] = None
    growth_potential: Optional[str] = None
    learning_difficulty: Optional[str] = None
    recommended_courses: Optional[List[str]] = []
    roadmap_summary: Optional[str] = None
    reason_for_match: Optional[str] = None


class CareerRecommendationResponse(BaseModel):
    id: str
    user_id: str
    recommendations: List[CareerRecommendation]
    generated_at: datetime
    based_on: Optional[Dict[str, Any]] = None


class SavedCareer(BaseModel):
    career_name: str
    match_percentage: Optional[int] = None
    industry: Optional[str] = None
    average_salary: Optional[str] = None
    details: Optional[Dict[str, Any]] = None


class SkillGapItem(BaseModel):
    skill_name: str
    current_level: Optional[str] = None
    required_level: Optional[str] = None
    gap_level: Optional[str] = None
    learning_priority: Optional[str] = None
    difficulty: Optional[str] = None
    estimated_learning_time: Optional[str] = None
    resources: Optional[List[str]] = []


class SkillGapAnalysis(BaseModel):
    id: str
    user_id: str
    target_career: Optional[str] = None
    matched_skills: Optional[List[str]] = []
    missing_skills: Optional[List[str]] = []
    skill_gaps: Optional[List[SkillGapItem]] = []
    overall_readiness: Optional[int] = 0
    analyzed_at: Optional[datetime] = None


class RoadmapStep(BaseModel):
    step_number: int
    title: str
    description: Optional[str] = None
    duration: Optional[str] = None
    resources: Optional[List[str]] = []
    milestone_type: Optional[str] = None  # weekly, monthly
    is_completed: bool = False


class CareerRoadmap(BaseModel):
    id: str
    user_id: str
    target_career: Optional[str] = None
    current_level: Optional[str] = None
    steps: Optional[List[RoadmapStep]] = []
    estimated_completion: Optional[str] = None
    generated_at: Optional[datetime] = None


class ChatMessage(BaseModel):
    role: str  # user or assistant
    content: str
    timestamp: Optional[datetime] = None


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    timestamp: datetime


class LearningResource(BaseModel):
    name: str
    type: str  # course, book, youtube, documentation, platform, project, certification
    url: Optional[str] = None
    skill: Optional[str] = None
    difficulty: Optional[str] = None
    description: Optional[str] = None
