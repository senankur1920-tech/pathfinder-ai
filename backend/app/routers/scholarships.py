from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app.models import StudentProfile, ScholarshipMatch, SavedScholarship, ActivityLog
from app.schemas import SavedScholarshipCreate, SavedScholarshipResponse, ScholarshipMatchResponse
from typing import Any, List

router = APIRouter(prefix="/scholarships", tags=["Scholarships"])

# Standard National and State Scholarship Database
SCHOLARSHIP_DB = [
    {
        "name": "Central Sector Scheme of Scholarship for College and University Students",
        "provider": "Ministry of Education, Govt of India",
        "value": "₹12,000 - 20,000 / year",
        "eligibility": "Class 12 score > 80th percentile and Family Income < ₹4.5 LPA.",
        "requirements": ["Class 12 Marksheet", "Income Certificate", "Aadhaar Card", "Bank Passbook"],
        "category_matches": ["general", "obc", "sc", "st", "ews"],
        "min_score_12": 80.0,
        "max_income_lpa": 4.5,
        "gender_pref": "all"
    },
    {
        "name": "Post Matric Scholarship Scheme for SC Students",
        "provider": "Ministry of Social Justice and Empowerment",
        "value": "Full tuition fee reimbursement + maintenance allowance",
        "eligibility": "Belong to SC category and Family Income < ₹2.5 LPA.",
        "requirements": ["Caste Certificate", "Income Certificate", "Previous Marksheet", "Fee Receipt"],
        "category_matches": ["sc"],
        "min_score_12": 0.0,
        "max_income_lpa": 2.5,
        "gender_pref": "all"
    },
    {
        "name": "Post Matric Scholarship Scheme for ST Students",
        "provider": "Ministry of Tribal Affairs",
        "value": "Full tuition fee reimbursement + books allowance",
        "eligibility": "Belong to ST category and Family Income < ₹2.5 LPA.",
        "requirements": ["Caste/Tribe Certificate", "Income Certificate", "Marksheet"],
        "category_matches": ["st"],
        "min_score_12": 0.0,
        "max_income_lpa": 2.5,
        "gender_pref": "all"
    },
    {
        "name": "Pragati Scholarship Scheme for Girl Students (Technical Degree)",
        "provider": "AICTE, Govt of India",
        "value": "₹50,000 / year",
        "eligibility": "Girl child admitted to 1st year B.Tech/B.Arch; Family Income < ₹8 LPA.",
        "requirements": ["Admission Letter", "Income Certificate", "Affidavit for single girl child (if applicable)", "Class 12 Marksheet"],
        "category_matches": ["general", "obc", "sc", "st", "ews"],
        "min_score_12": 0.0,
        "max_income_lpa": 8.0,
        "gender_pref": "female"
    },
    {
        "name": "Prime Minister's Scholarship Scheme (PMSS)",
        "provider": "Welfare and Rehabilitation Board",
        "value": "₹30,000 / year for girls, ₹24,000 / year for boys",
        "eligibility": "Wards of deceased/ex-servicemen of Armed Forces; Class 12 score > 60%.",
        "requirements": ["Ex-servicemen Certificate", "Class 12 Marksheet", "Bonafide Certificate"],
        "category_matches": ["general", "obc", "sc", "st", "ews"],
        "min_score_12": 60.0,
        "max_income_lpa": 999.0, # no income limit
        "gender_pref": "all"
    },
    {
        "name": "NSDL Shiksha Sahyog Scholarship",
        "provider": "NSDL e-Governance",
        "value": "₹10,000 - 25,000 / year",
        "eligibility": "Family income < ₹3 LPA. Open to students pursuing graduation/B.Tech.",
        "requirements": ["Income Certificate", "Marksheet", "College Admission Proof"],
        "category_matches": ["general", "obc", "sc", "st", "ews"],
        "min_score_12": 60.0,
        "max_income_lpa": 3.0,
        "gender_pref": "all"
    }
]

@router.get("/match", response_model=ScholarshipMatchResponse)
def match_scholarships(
    current_user: Any = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Student profile not found. Complete onboarding first.")

    # Convert income range to numeric LPA
    income_val = 15.0 # default high
    inc = profile.income_range.lower()
    if "below_1" in inc:
        income_val = 1.0
    elif "1_3" in inc:
        income_val = 3.0
    elif "3_6" in inc:
        income_val = 6.0
    elif "6_10" in inc:
        income_val = 10.0
    elif "above_10" in inc:
        income_val = 15.0

    score_12 = float(profile.class_12_score) if profile.class_12_score else 0.0
    category = profile.category.lower()
    gender = profile.gender.lower()

    matches = []
    total_val = 0

    for s in SCHOLARSHIP_DB:
        # Match checks
        if category not in s["category_matches"]:
            continue
        if income_val > s["max_income_lpa"]:
            continue
        if score_12 < s["min_score_12"]:
            continue
        if s["gender_pref"] != "all" and gender != s["gender_pref"]:
            continue

        # Valid match
        matches.append({
            "name": s["name"],
            "provider": s["provider"],
            "value": s["value"],
            "eligibility": s["eligibility"],
            "requirements": s["requirements"]
        })

    # Save to history database
    db_match = ScholarshipMatch(
        user_id=current_user.id,
        matches=matches,
        total_value=f"₹{len(matches) * 20000}+ per year" if matches else "₹0"
    )
    db.add(db_match)
    
    log = ActivityLog(
        user_id=current_user.id,
        action_type="scholarship_matched",
        description=f"Auto-discovered {len(matches)} eligible scholarship schemes based on profile."
    )
    db.add(log)
    
    db.commit()
    db.refresh(db_match)
    return db_match

# SAVED WISHLIST ACTIONS
@router.get("/saved", response_model=List[SavedScholarshipResponse])
def get_saved_scholarships(current_user: Any = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(SavedScholarship).filter(SavedScholarship.user_id == current_user.id).all()

@router.post("/save", response_model=SavedScholarshipResponse)
def save_scholarship(
    params: SavedScholarshipCreate,
    current_user: Any = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if duplicate
    existing = db.query(SavedScholarship).filter(
        SavedScholarship.user_id == current_user.id,
        SavedScholarship.scholarship_name == params.scholarship_name
    ).first()
    
    if existing:
        return existing

    db_scholarship = SavedScholarship(
        user_id=current_user.id,
        scholarship_name=params.scholarship_name,
        details=params.details,
        status="saved"
    )
    db.add(db_scholarship)
    
    log = ActivityLog(
        user_id=current_user.id,
        action_type="scholarship_saved",
        description=f"Saved scholarship scheme '{params.scholarship_name}' to tracker."
    )
    db.add(log)
    
    db.commit()
    db.refresh(db_scholarship)
    return db_scholarship

@router.delete("/saved/{id}", status_code=200)
def delete_saved_scholarship(id: str, current_user: Any = Depends(get_current_user), db: Session = Depends(get_db)):
    scholarship = db.query(SavedScholarship).filter(SavedScholarship.id == id, SavedScholarship.user_id == current_user.id).first()
    if not scholarship:
        raise HTTPException(status_code=404, detail="Saved scholarship not found")
        
    db.delete(scholarship)
    db.commit()
    return {"status": "success"}
