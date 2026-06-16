from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app.models import StudentProfile, ChatMessage, ActivityLog
from app.schemas import ChatMessageCreate, ChatMessageResponse
from app.services.gemini import GeminiService
from typing import Any, List, Optional
import uuid

router = APIRouter(prefix="/coach", tags=["AI Coach"])

@router.get("/history", response_model=List[ChatMessageResponse])
def get_chat_history(
    session_id: Optional[str] = None,
    current_user: Any = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(ChatMessage).filter(ChatMessage.user_id == current_user.id)
    if session_id:
        query = query.filter(ChatMessage.session_id == session_id)
    else:
        # Default to the most recent session
        latest = db.query(ChatMessage).filter(ChatMessage.user_id == current_user.id).order_by(ChatMessage.created_at.desc()).first()
        if latest:
            query = query.filter(ChatMessage.session_id == latest.session_id)
            
    messages = query.order_by(ChatMessage.created_at.asc()).all()
    return messages

@router.post("/chat", response_model=ChatMessageResponse)
def send_chat_message(
    params: ChatMessageCreate,
    current_user: Any = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session_id = params.session_id or str(uuid.uuid4())
    
    # 1. Save student's query in DB
    user_msg = ChatMessage(
        user_id=current_user.id,
        session_id=session_id,
        role="user",
        content=params.content
    )
    db.add(user_msg)
    db.commit()

    # 2. Fetch last few messages in this session for chat context
    history_logs = db.query(ChatMessage).filter(
        ChatMessage.user_id == current_user.id,
        ChatMessage.session_id == session_id
    ).order_by(ChatMessage.created_at.asc()).all()

    chat_history = [{"role": msg.role, "content": msg.content} for msg in history_logs]

    # Fetch student profile to personalize AI response context
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    profile_dict = {}
    if profile:
        profile_dict = {
            "name": profile.name,
            "stream": profile.stream,
            "interests": profile.interests,
            "state": profile.state
        }

    # 3. Request reply from Gemini
    reply_content = GeminiService.get_coach_reply(chat_history, profile_dict)

    # 4. Save AI's response in DB
    ai_msg = ChatMessage(
        user_id=current_user.id,
        session_id=session_id,
        role="assistant",
        content=reply_content
    )
    db.add(ai_msg)
    
    # Log activity
    log = ActivityLog(
        user_id=current_user.id,
        action_type="coach_consulted",
        description="Spoke with AI Career Coach about student questions."
    )
    db.add(log)
    
    db.commit()
    db.refresh(ai_msg)
    
    return ai_msg
