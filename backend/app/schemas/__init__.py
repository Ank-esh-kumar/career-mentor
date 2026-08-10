from app.schemas.user import (
    UserSignup, UserLogin, GoogleAuthRequest, ForgotPasswordRequest,
    ResetPasswordRequest, ChangePasswordRequest, UserResponse, TokenResponse,
)
from app.schemas.profile import (
    Education, Experience, Project, Certification,
    ProfileUpdate, ProfileResponse,
)
from app.schemas.resume import (
    ResumeUploadResponse, ParsedResume, ResumeAnalysis, ResumeResponse,
)
from app.schemas.career import (
    CareerRecommendation, CareerRecommendationResponse, SavedCareer,
    SkillGapItem, SkillGapAnalysis, RoadmapStep, CareerRoadmap,
    ChatMessage, ChatRequest, ChatResponse, LearningResource,
)
