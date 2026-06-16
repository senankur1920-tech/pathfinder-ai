from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app.models import StudentProfile, CollegePrediction, SavedCollege, ActivityLog
from app.schemas import CollegePredictionCreate, CollegePredictionResponse, SavedCollegeCreate, SavedCollegeResponse
from typing import Any, List

router = APIRouter(prefix="/colleges", tags=["Colleges"])

@router.post("/predict", response_model=CollegePredictionResponse)
def predict_colleges(
    params: CollegePredictionCreate,
    current_user: Any = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rank = params.score_or_rank
    exam = params.exam_type.lower()
    category = params.category.lower()
    state = params.home_state
    branch = params.preferred_branch or "Computer Science"

    predictions = []

    # 1. Rule-based Predictor logic mimicking actual counseling cutoffs (JoSAA/NEET)
    if "jee" in exam:
        # JEE Mains predictions based on mock rank cutoffs
        if rank < 5000:
            predictions = [
                {"college_name": "IIT Bombay", "branch": branch, "cutoff": 3000, "chance": "Reach", "type": "Government", "location": "Mumbai", "fees": "₹2.2 Lakhs/yr"},
                {"college_name": "NIT Trichy", "branch": branch, "cutoff": 6500, "chance": "Safe", "type": "Government", "location": "Trichy", "fees": "₹1.5 Lakhs/yr"},
                {"college_name": "IIIT Hyderabad", "branch": branch, "cutoff": 4500, "chance": "Moderate", "type": "Private-Autonomous", "location": "Hyderabad", "fees": "₹3.6 Lakhs/yr"}
            ]
        elif rank < 15000:
            predictions = [
                {"college_name": "NIT Trichy", "branch": branch, "cutoff": 6500, "chance": "Reach", "type": "Government", "location": "Trichy", "fees": "₹1.5 Lakhs/yr"},
                {"college_name": "NIT Surathkal", "branch": branch, "cutoff": 12000, "chance": "Moderate", "type": "Government", "location": "Mangalore", "fees": "₹1.6 Lakhs/yr"},
                {"college_name": "MNIT Jaipur", "branch": branch, "cutoff": 18000, "chance": "Safe", "type": "Government", "location": "Jaipur", "fees": "₹1.4 Lakhs/yr"}
            ]
        elif rank < 50000:
            predictions = [
                {"college_name": "MNIT Jaipur", "branch": branch, "cutoff": 18000, "chance": "Reach", "type": "Government", "location": "Jaipur", "fees": "₹1.4 Lakhs/yr"},
                {"college_name": "NIT Jalandhar", "branch": branch, "cutoff": 45000, "chance": "Moderate", "type": "Government", "location": "Jalandhar", "fees": "₹1.5 Lakhs/yr"},
                {"college_name": "LMNIIT Jaipur", "branch": branch, "cutoff": 60000, "chance": "Safe", "type": "Private", "location": "Jaipur", "fees": "₹3.2 Lakhs/yr"}
            ]
        else:
            predictions = [
                {"college_name": "NIT Jalandhar", "branch": branch, "cutoff": 45000, "chance": "Reach", "type": "Government", "location": "Jalandhar", "fees": "₹1.5 Lakhs/yr"},
                {"college_name": "JIIT Noida", "branch": branch, "cutoff": 85000, "chance": "Moderate", "type": "Private", "location": "Noida", "fees": "₹2.8 Lakhs/yr"},
                {"college_name": "Amity University", "branch": branch, "cutoff": 150000, "chance": "Safe", "type": "Private", "location": "Noida", "fees": "₹3.5 Lakhs/yr"}
            ]
    elif "neet" in exam:
        # NEET Score predictions (NEET is typically scored out of 720)
        score = rank # For NEET, "rank_or_score" is treated as the score
        if score > 650:
            predictions = [
                {"college_name": "AIIMS New Delhi", "branch": "MBBS", "cutoff": 690, "chance": "Reach", "type": "Government", "location": "Delhi", "fees": "₹1,628/yr"},
                {"college_name": "MAMC Delhi", "branch": "MBBS", "cutoff": 660, "chance": "Moderate", "type": "Government", "location": "Delhi", "fees": "₹15,000/yr"},
                {"college_name": "KGMU Lucknow", "branch": "MBBS", "cutoff": 630, "chance": "Safe", "type": "Government", "location": "Lucknow", "fees": "₹50,000/yr"}
            ]
        elif score > 580:
            predictions = [
                {"college_name": "KGMU Lucknow", "branch": "MBBS", "cutoff": 630, "chance": "Reach", "type": "Government", "location": "Lucknow", "fees": "₹50,000/yr"},
                {"college_name": "IMS BHU Varanasi", "branch": "MBBS", "cutoff": 610, "chance": "Moderate", "type": "Government", "location": "Varanasi", "fees": "₹14,000/yr"},
                {"college_name": "Government Medical College", "branch": "MBBS", "cutoff": 550, "chance": "Safe", "type": "Government", "location": state or "State Capital", "fees": "₹40,000/yr"}
            ]
        else:
            predictions = [
                {"college_name": "Government Medical College", "branch": "MBBS", "cutoff": 550, "chance": "Reach", "type": "Government", "location": state or "State Capital", "fees": "₹40,000/yr"},
                {"college_name": "D.Y. Patil Medical College", "branch": "MBBS", "cutoff": 450, "chance": "Moderate", "type": "Private", "location": "Pune", "fees": "₹22 Lakhs/yr"},
                {"college_name": "KIMS Bangalore", "branch": "MBBS", "cutoff": 400, "chance": "Safe", "type": "Private", "location": "Bangalore", "fees": "₹11 Lakhs/yr"}
            ]
    else:
        # CUET/Other General Admissions
        predictions = [
            {"college_name": "Delhi University (SRCC)", "branch": branch, "cutoff": 98, "chance": "Reach", "type": "Government", "location": "Delhi", "fees": "₹15,000/yr"},
            {"college_name": "Delhi University (LSR)", "branch": branch, "cutoff": 95, "chance": "Moderate", "type": "Government", "location": "Delhi", "fees": "₹18,000/yr"},
            {"college_name": "Banaras Hindu University (BHU)", "branch": branch, "cutoff": 85, "chance": "Safe", "type": "Government", "location": "Varanasi", "fees": "₹8,000/yr"}
        ]

    # Save to history database
    db_pred = CollegePrediction(
        user_id=current_user.id,
        exam_type=params.exam_type,
        score_or_rank=params.score_or_rank,
        category=params.category,
        home_state=params.home_state,
        preferred_branch=params.preferred_branch,
        predictions=predictions
    )
    db.add(db_pred)
    
    # Log activity
    log = ActivityLog(
        user_id=current_user.id,
        action_type="college_prediction",
        description=f"Predicted college options for {params.exam_type} with rank/score {params.score_or_rank}."
    )
    db.add(log)
    
    db.commit()
    db.refresh(db_pred)
    return db_pred

# SAVED WISHLIST ACTIONS
@router.get("/saved", response_model=List[SavedCollegeResponse])
def get_saved_colleges(current_user: Any = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(SavedCollege).filter(SavedCollege.user_id == current_user.id).all()

@router.post("/save", response_model=SavedCollegeResponse)
def save_college(
    params: SavedCollegeCreate,
    current_user: Any = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if duplicate
    existing = db.query(SavedCollege).filter(
        SavedCollege.user_id == current_user.id,
        SavedCollege.college_name == params.college_name,
        SavedCollege.branch == params.branch
    ).first()
    
    if existing:
        return existing

    db_college = SavedCollege(
        user_id=current_user.id,
        college_name=params.college_name,
        branch=params.branch,
        details=params.details
    )
    db.add(db_college)
    
    log = ActivityLog(
        user_id=current_user.id,
        action_type="college_wishlisted",
        description=f"Added {params.college_name} ({params.branch or 'N/A'}) to wishlist."
    )
    db.add(log)
    
    db.commit()
    db.refresh(db_college)
    return db_college

@router.delete("/saved/{id}", status_code=200)
def delete_saved_college(id: str, current_user: Any = Depends(get_current_user), db: Session = Depends(get_db)):
    college = db.query(SavedCollege).filter(SavedCollege.id == id, SavedCollege.user_id == current_user.id).first()
    if not college:
        raise HTTPException(status_code=404, detail="Saved college entry not found")
        
    db.delete(college)
    db.commit()
    return {"status": "success"}
