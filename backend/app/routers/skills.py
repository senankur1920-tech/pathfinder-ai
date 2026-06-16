from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app.models import StudentProfile, SkillRoadmap, ActivityLog
from app.schemas import SkillRoadmapCreate, SkillRoadmapUpdateProgress, SkillRoadmapResponse
from app.services.gemini import GeminiService
from typing import Any

router = APIRouter(prefix="/skills", tags=["Skills"])

@router.post("/roadmap", response_model=SkillRoadmapResponse)
def generate_skills_roadmap(
    params: SkillRoadmapCreate,
    current_user: Any = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch profile to identify current skills/interests
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    interests = profile.interests if profile else []
    
    # 1. Check if roadmap for this career already exists to avoid calling Gemini again
    existing = db.query(SkillRoadmap).filter(
        SkillRoadmap.user_id == current_user.id,
        SkillRoadmap.target_career == params.target_career
    ).first()
    
    if existing:
        return existing

    # 2. Call Gemini service
    result = GeminiService.generate_skill_roadmap(params.target_career, interests)

    # 3. Create database entry
    db_roadmap = SkillRoadmap(
        user_id=current_user.id,
        target_career=params.target_career,
        roadmap=result.get("roadmap", {}),
        skill_gaps=result.get("skill_gaps", {}),
        progress={} # Empty completion tracker initially
    )
    db.add(db_roadmap)
    
    log = ActivityLog(
        user_id=current_user.id,
        action_type="skills_roadmap_generated",
        description=f"Generated interactive week-by-week learning roadmap for '{params.target_career}'."
    )
    db.add(log)
    
    db.commit()
    db.refresh(db_roadmap)
    return db_roadmap

@router.get("/roadmap/{id}", response_model=SkillRoadmapResponse)
def get_roadmap_by_id(id: str, current_user: Any = Depends(get_current_user), db: Session = Depends(get_db)):
    roadmap = db.query(SkillRoadmap).filter(SkillRoadmap.id == id, SkillRoadmap.user_id == current_user.id).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Skill roadmap not found.")
    return roadmap

@router.put("/roadmap/{id}/progress", response_model=SkillRoadmapResponse)
def update_roadmap_progress(
    id: str,
    params: SkillRoadmapUpdateProgress,
    current_user: Any = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    roadmap = db.query(SkillRoadmap).filter(SkillRoadmap.id == id, SkillRoadmap.user_id == current_user.id).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Skill roadmap not found.")
        
    roadmap.progress = params.progress
    db.commit()
    db.refresh(roadmap)
    return roadmap
