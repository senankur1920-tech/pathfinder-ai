import uuid
from sqlalchemy import Column, String, Integer, Numeric, DateTime, ForeignKey, Text, JSON, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=True)
    phone = Column(String(50), unique=True, nullable=True)
    current_level = Column(String(50), nullable=False)
    state = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)
    gender = Column(String(50), nullable=False)
    income_range = Column(String(50), nullable=False)
    stream = Column(String(50), nullable=False)
    class_10_score = Column(Numeric(5, 2))
    class_12_score = Column(Numeric(5, 2))
    current_college = Column(String(255))
    current_branch = Column(String(255))
    current_cgpa = Column(Numeric(4, 2))
    exam_scores = Column(JSON, default=dict)
    interests = Column(JSON, default=list) # Using JSON for SQLite/Postgres cross compatibility instead of Postgres ARRAY
    preferred_work_style = Column(String(50), default="collaborative")
    career_goal = Column(Text)
    location_preference = Column(String(100), default="anywhere")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

class CareerRecommendation(Base):
    __tablename__ = "career_recommendations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=False)
    recommendations = Column(JSON, nullable=False)
    input_snapshot = Column(JSON, nullable=False)
    generated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class CollegePrediction(Base):
    __tablename__ = "college_predictions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=False)
    exam_type = Column(String(50), nullable=False)
    score_or_rank = Column(Integer, nullable=False)
    category = Column(String(50), nullable=False)
    home_state = Column(String(100), nullable=False)
    preferred_branch = Column(String(100))
    predictions = Column(JSON, nullable=False)
    generated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class ScholarshipMatch(Base):
    __tablename__ = "scholarship_matches"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=False)
    matches = Column(JSON, nullable=False)
    total_value = Column(String(100))
    generated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class SkillRoadmap(Base):
    __tablename__ = "skill_roadmaps"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=False)
    target_career = Column(String(255), nullable=False)
    roadmap = Column(JSON, nullable=False)
    skill_gaps = Column(JSON, nullable=False)
    progress = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=False)
    file_url = Column(Text, nullable=False)
    target_role = Column(String(255), nullable=False)
    overall_score = Column(Integer, nullable=False)
    section_scores = Column(JSON, nullable=False)
    suggestions = Column(JSON, nullable=False)
    keywords = Column(JSON, nullable=False)
    analyzed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=False)
    session_id = Column(String(36), nullable=False, default=lambda: str(uuid.uuid4()))
    role = Column(String(50), nullable=False) # user or assistant
    content = Column(Text, nullable=False)
    metadata_fields = Column(JSON, name="metadata", default=dict) # mapped to metadata in database, using metadata_fields in python
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class SavedCollege(Base):
    __tablename__ = "saved_colleges"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=False)
    college_name = Column(String(255), nullable=False)
    branch = Column(String(255))
    details = Column(JSON, default=dict)
    saved_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class SavedScholarship(Base):
    __tablename__ = "saved_scholarships"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=False)
    scholarship_name = Column(String(255), nullable=False)
    details = Column(JSON, default=dict)
    status = Column(String(50), default="saved")
    saved_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class ActivityLog(Base):
    __tablename__ = "activity_log"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=False)
    action_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    metadata_fields = Column(JSON, name="metadata", default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
