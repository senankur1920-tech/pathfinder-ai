from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from decimal import Decimal
from datetime import datetime

# Student Profile Schemas
class StudentProfileBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    current_level: str
    state: str
    category: str
    gender: str
    income_range: str
    stream: str
    class_10_score: Optional[float] = None
    class_12_score: Optional[float] = None
    current_college: Optional[str] = None
    current_branch: Optional[str] = None
    current_cgpa: Optional[float] = None
    exam_scores: Optional[Dict[str, Any]] = {}
    interests: Optional[List[str]] = []
    preferred_work_style: Optional[str] = "collaborative"
    career_goal: Optional[str] = None
    location_preference: Optional[str] = "anywhere"

class StudentProfileCreate(StudentProfileBase):
    pass

class StudentProfileResponse(StudentProfileBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Career Recommendation Schemas
class CareerRecommendationResponse(BaseModel):
    id: str
    user_id: str
    recommendations: List[Dict[str, Any]]
    input_snapshot: Dict[str, Any]
    generated_at: datetime

    class Config:
        from_attributes = True

# College Prediction Schemas
class CollegePredictionCreate(BaseModel):
    exam_type: str
    score_or_rank: int
    category: str
    home_state: str
    preferred_branch: Optional[str] = None

class CollegePredictionResponse(BaseModel):
    id: str
    user_id: str
    exam_type: str
    score_or_rank: int
    category: str
    home_state: str
    preferred_branch: Optional[str] = None
    predictions: List[Dict[str, Any]]
    generated_at: datetime

    class Config:
        from_attributes = True

# Scholarship Match Schemas
class ScholarshipMatchResponse(BaseModel):
    id: str
    user_id: str
    matches: List[Dict[str, Any]]
    total_value: Optional[str] = None
    generated_at: datetime

    class Config:
        from_attributes = True

# Skill Roadmap Schemas
class SkillRoadmapCreate(BaseModel):
    target_career: str

class SkillRoadmapUpdateProgress(BaseModel):
    progress: Dict[str, Any]

class SkillRoadmapResponse(BaseModel):
    id: str
    user_id: str
    target_career: str
    roadmap: Dict[str, Any]
    skill_gaps: Dict[str, Any]
    progress: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Resume Analysis Schemas
class ResumeAnalysisCreate(BaseModel):
    target_role: str
    file_url: str
    overall_score: int
    section_scores: Dict[str, Any]
    suggestions: List[Dict[str, Any]]
    keywords: Dict[str, Any]

class ResumeAnalysisResponse(BaseModel):
    id: str
    user_id: str
    file_url: str
    target_role: str
    overall_score: int
    section_scores: Dict[str, Any]
    suggestions: List[Dict[str, Any]]
    keywords: Dict[str, Any]
    analyzed_at: datetime

    class Config:
        from_attributes = True

# Chat Schemas
class ChatMessageCreate(BaseModel):
    content: str
    session_id: Optional[str] = None

class ChatMessageResponse(BaseModel):
    id: str
    user_id: str
    session_id: str
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

# Saved Item Schemas
class SavedCollegeCreate(BaseModel):
    college_name: str
    branch: Optional[str] = None
    details: Optional[Dict[str, Any]] = {}

class SavedCollegeResponse(BaseModel):
    id: str
    user_id: str
    college_name: str
    branch: Optional[str] = None
    details: Dict[str, Any]
    saved_at: datetime

    class Config:
        from_attributes = True

class SavedScholarshipCreate(BaseModel):
    scholarship_name: str
    details: Optional[Dict[str, Any]] = {}

class SavedScholarshipResponse(BaseModel):
    id: str
    user_id: str
    scholarship_name: str
    details: Dict[str, Any]
    status: str
    saved_at: datetime

    class Config:
        from_attributes = True

# Authentication Schemas
class UserSignup(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    password: str

class UserLogin(BaseModel):
    credential: str # Email or mobile number
    password: str
