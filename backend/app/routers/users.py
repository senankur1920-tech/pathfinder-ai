from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.auth import get_current_user, MockUser
from app.models import StudentProfile, ActivityLog
from app.schemas import StudentProfileCreate, StudentProfileResponse, StudentProfileBase, UserSignup, UserLogin
from typing import List, Dict, Any
import uuid
import csv
import os
from datetime import datetime
from app.services.email_notifier import send_lead_email

router = APIRouter(prefix="/users", tags=["Users"])

# Path to sales leads CSV file
SALES_LEADS_CSV = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "sales_leads.csv")


def trigger_lead_notification(profile: StudentProfile):
    """
    Check if the student is female. If so, log her details to sales_leads.csv
    and print a visible console alert for the sales team.
    """
    if not profile.gender:
        return

    if profile.gender.strip().lower() != "female":
        return

    name = profile.name or "Unknown"
    email = profile.email or "N/A"
    phone = profile.phone or "N/A"
    state = profile.state or "N/A"
    stream = profile.stream or "N/A"
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # ─── Console Alert ───────────────────────────────────────────────
    print("\n" + "=" * 70)
    print(">>> [SALES ALERT] Female student registered/logged in!")
    print(f"   Name  : {name}")
    print(f"   Email : {email}")
    print(f"   Phone : {phone}")
    print(f"   State : {state}")
    print(f"   Stream: {stream}")
    print(f"   Time  : {timestamp}")
    print("=" * 70 + "\n")

    # ─── Email Notification ──────────────────────────────────────────
    send_lead_email(name=name, email=email, phone=phone, state=state, stream=stream)

    # ─── CSV Lead Log ────────────────────────────────────────────────
    file_exists = os.path.isfile(SALES_LEADS_CSV)
    existing_emails = set()
    existing_phones = set()

    if file_exists:
        try:
            with open(SALES_LEADS_CSV, "r", newline="", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                rows = list(reader)
                for row in rows:
                    if row.get("Email"):
                        existing_emails.add(row["Email"].strip().lower())
                    if row.get("Phone"):
                        existing_phones.add(row["Phone"].strip())
        except Exception:
            rows = []
    else:
        rows = []

    # Check for duplicate by email or phone
    is_duplicate = False
    if email != "N/A" and email.strip().lower() in existing_emails:
        is_duplicate = True
    if phone != "N/A" and phone.strip() in existing_phones:
        is_duplicate = True

    if is_duplicate:
        # Update existing row timestamp
        updated_rows = []
        for row in rows:
            if (email != "N/A" and row.get("Email", "").strip().lower() == email.strip().lower()) or \
               (phone != "N/A" and row.get("Phone", "").strip() == phone.strip()):
                row["Last_Login"] = timestamp
                row["Name"] = name
                if phone != "N/A":
                    row["Phone"] = phone
                if email != "N/A":
                    row["Email"] = email
            updated_rows.append(row)
        try:
            with open(SALES_LEADS_CSV, "w", newline="", encoding="utf-8") as f:
                writer = csv.DictWriter(f, fieldnames=["Name", "Email", "Phone", "State", "Stream", "Registered_At", "Last_Login"])
                writer.writeheader()
                writer.writerows(updated_rows)
        except Exception as e:
            print(f"[SALES LEAD CSV] Error updating row: {e}")
    else:
        # Append new row
        try:
            with open(SALES_LEADS_CSV, "a", newline="", encoding="utf-8") as f:
                writer = csv.DictWriter(f, fieldnames=["Name", "Email", "Phone", "State", "Stream", "Registered_At", "Last_Login"])
                if not file_exists:
                    writer.writeheader()
                writer.writerow({
                    "Name": name,
                    "Email": email,
                    "Phone": phone,
                    "State": state,
                    "Stream": stream,
                    "Registered_At": timestamp,
                    "Last_Login": timestamp,
                })
        except Exception as e:
            print(f"[SALES LEAD CSV] Error writing new row: {e}")


# ─── Auth Mock Routes ────────────────────────────────────────────────────────

@router.post("/signup", status_code=201)
def signup(data: UserSignup, db: Session = Depends(get_db)):
    """
    Mock signup: creates a user_id, stores a minimal profile stub,
    and returns a token the frontend can use for subsequent requests.
    """
    user_id = str(uuid.uuid4())
    token = f"mock-{user_id}"

    # Check for duplicate email/phone
    if data.email:
        existing = db.query(StudentProfile).filter(StudentProfile.email == data.email).first()
        if existing:
            raise HTTPException(status_code=409, detail="Email already registered.")
    if data.phone:
        existing = db.query(StudentProfile).filter(StudentProfile.phone == data.phone).first()
        if existing:
            raise HTTPException(status_code=409, detail="Phone number already registered.")

    return {
        "token": token,
        "user_id": user_id,
        "name": data.name,
        "email": data.email,
        "phone": data.phone,
        "message": "Signup successful. Complete onboarding to build your profile."
    }


@router.post("/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    """
    Mock login: looks up the student profile by email or phone.
    If found and female, triggers the sales lead notification.
    Returns a token and profile summary.
    """
    credential = data.credential.strip()

    # Try matching by email or phone
    profile = db.query(StudentProfile).filter(
        or_(
            StudentProfile.email == credential,
            StudentProfile.phone == credential,
        )
    ).first()

    if not profile:
        # Still allow login with a fresh mock token (for demo/dev purposes)
        user_id = str(uuid.uuid4())
        return {
            "token": f"mock-{user_id}",
            "user_id": user_id,
            "profile": None,
            "message": "No profile found for this credential. Complete onboarding after login."
        }

    token = f"mock-{profile.user_id}"

    # Trigger lead notification if female
    trigger_lead_notification(profile)

    return {
        "token": token,
        "user_id": profile.user_id,
        "profile": {
            "name": profile.name,
            "email": profile.email,
            "phone": profile.phone,
            "gender": profile.gender,
            "state": profile.state,
            "stream": profile.stream,
            "level": profile.current_level,
        },
        "message": "Login successful."
    }


# ─── Existing Profile Routes ────────────────────────────────────────────────

@router.get("/me", response_model=StudentProfileResponse)
def get_my_profile(current_user: Any = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found. Please complete the onboarding wizard."
        )

    # Trigger lead notification on profile fetch (i.e. login session load)
    trigger_lead_notification(profile)

    return profile

@router.post("/onboarding", response_model=StudentProfileResponse, status_code=status.HTTP_201_CREATED)
def create_profile(
    profile_data: StudentProfileCreate,
    current_user: Any = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if profile already exists
    existing = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if existing:
        # Update existing profile
        for key, value in profile_data.model_dump().items():
            setattr(existing, key, value)
        db.commit()
        db.refresh(existing)
        # Log update activity
        log = ActivityLog(user_id=current_user.id, action_type="profile_updated", description="Student profile metrics updated.")
        db.add(log)
        db.commit()

        # Trigger lead notification
        trigger_lead_notification(existing)

        return existing

    # Create new profile
    db_profile = StudentProfile(
        user_id=current_user.id,
        **profile_data.model_dump()
    )
    db.add(db_profile)
    
    # Log creation activity
    log = ActivityLog(user_id=current_user.id, action_type="profile_created", description="Student completed onboarding registration.")
    db.add(log)
    
    db.commit()
    db.refresh(db_profile)

    # Trigger lead notification
    trigger_lead_notification(db_profile)

    return db_profile

@router.put("/me", response_model=StudentProfileResponse)
def update_profile(
    profile_data: StudentProfileCreate,
    current_user: Any = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found. Complete onboarding first.")
        
    for key, value in profile_data.model_dump().items():
        setattr(profile, key, value)
        
    log = ActivityLog(user_id=current_user.id, action_type="profile_updated", description="Student updated profile details in settings.")
    db.add(log)
    
    db.commit()
    db.refresh(profile)

    # Trigger lead notification
    trigger_lead_notification(profile)

    return profile

@router.get("/activities", response_model=List[Dict[str, Any]])
def get_user_activities(current_user: Any = Depends(get_current_user), db: Session = Depends(get_db)):
    logs = db.query(ActivityLog).filter(ActivityLog.user_id == current_user.id).order_by(ActivityLog.created_at.desc()).limit(20).all()
    return [
        {
            "id": l.id,
            "action_type": l.action_type,
            "description": l.description,
            "metadata": l.metadata_fields,
            "created_at": l.created_at
        } for l in logs
    ]

@router.post("/activities", status_code=201)
def log_activity(
    activity_data: Dict[str, Any],
    current_user: Any = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    log = ActivityLog(
        user_id=current_user.id,
        action_type=activity_data.get("action_type", "custom_action"),
        description=activity_data.get("description", "User triggered custom action."),
        metadata_fields=activity_data.get("metadata", {})
    )
    db.add(log)
    db.commit()
    return {"status": "success"}


# ─── Sales Leads Viewer (Admin) ─────────────────────────────────────────────

@router.get("/sales-leads")
def get_sales_leads():
    """
    Returns the current sales_leads.csv contents as JSON.
    Useful for the sales team to check leads via API.
    """
    if not os.path.isfile(SALES_LEADS_CSV):
        return {"leads": [], "total": 0}

    try:
        with open(SALES_LEADS_CSV, "r", newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            leads = list(reader)
        return {"leads": leads, "total": len(leads)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading leads: {e}")
