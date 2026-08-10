from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


class Education(BaseModel):
    degree: Optional[str] = None
    university: Optional[str] = None
    graduation_year: Optional[int] = None
    field_of_study: Optional[str] = None
    gpa: Optional[float] = None


class Experience(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None
    is_current: bool = False


class Project(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    technologies: Optional[List[str]] = []
    url: Optional[str] = None


class Certification(BaseModel):
    name: Optional[str] = None
    issuer: Optional[str] = None
    date: Optional[str] = None
    url: Optional[str] = None


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    education: Optional[List[Education]] = []
    skills: Optional[List[str]] = []
    interests: Optional[List[str]] = []
    languages: Optional[List[str]] = []
    experience: Optional[List[Experience]] = []
    projects: Optional[List[Project]] = []
    certifications: Optional[List[Certification]] = []
    career_preferences: Optional[List[str]] = []
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None


class ProfileResponse(BaseModel):
    id: str
    user_id: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    photo_url: Optional[str] = None
    education: Optional[List[Education]] = []
    skills: Optional[List[str]] = []
    interests: Optional[List[str]] = []
    languages: Optional[List[str]] = []
    experience: Optional[List[Experience]] = []
    projects: Optional[List[Project]] = []
    certifications: Optional[List[Certification]] = []
    career_preferences: Optional[List[str]] = []
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    profile_completion: Optional[int] = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
