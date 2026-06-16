from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app.models import StudentProfile, CareerRecommendation, ActivityLog
from app.schemas import CareerRecommendationResponse
from app.services.gemini import GeminiService
from typing import Any, Dict

router = APIRouter(prefix="/careers", tags=["Careers"])

@router.get("/recommend", response_model=CareerRecommendationResponse)
def get_career_recommendations(
    current_user: Any = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Fetch student profile
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found. Please complete the onboarding wizard."
        )

    # Convert profile model to dict for AI context
    profile_dict = {
        "stream": profile.stream,
        "current_level": profile.current_level,
        "class_10_score": float(profile.class_10_score) if profile.class_10_score else None,
        "class_12_score": float(profile.class_12_score) if profile.class_12_score else None,
        "interests": profile.interests,
        "income_range": profile.income_range,
        "exam_scores": profile.exam_scores,
        "career_goal": profile.career_goal,
        "preferred_work_style": profile.preferred_work_style
    }

    # 2. Check if recommendations already generated for this exact interest/stream set (simple caching/retrieval)
    existing = db.query(CareerRecommendation).filter(
        CareerRecommendation.user_id == current_user.id
    ).order_by(CareerRecommendation.generated_at.desc()).first()

    if existing:
        # Check if interests are identical to avoid regenerating needlessly
        existing_snapshot = existing.input_snapshot
        if existing_snapshot.get("interests") == profile.interests and existing_snapshot.get("stream") == profile.stream:
            return existing

    # 3. Call Gemini service
    recommendations = GeminiService.generate_career_recommendations(profile_dict)

    # 4. Save in DB
    db_rec = CareerRecommendation(
        user_id=current_user.id,
        recommendations=recommendations,
        input_snapshot=profile_dict
    )
    db.add(db_rec)
    
    # Log activity
    log = ActivityLog(
        user_id=current_user.id,
        action_type="career_recommendation_generated",
        description="Generated new AI career match recommendation options."
    )
    db.add(log)
    
    db.commit()
    db.refresh(db_rec)
    return db_rec
