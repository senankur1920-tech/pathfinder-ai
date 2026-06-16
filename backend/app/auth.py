from fastapi import Header, HTTPException, Depends
from supabase import create_client, Client
from app.config import settings
from typing import Dict, Any

supabase_client: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)

class MockUser:
    def __init__(self, user_id: str, email: str = "student@pathfinder.ai"):
        self.id = user_id
        self.email = email

async def get_current_user(authorization: str = Header(None)) -> Any:
    # 1. Check for token
    if not authorization or not authorization.startswith("Bearer "):
        # Raise 401
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    
    token = authorization.split(" ")[1]
    
    # 2. Check for mock/dev token to allow easy API testing
    if token.startswith("mock-") or token == "guest-token":
        mock_id = "00000000-0000-0000-0000-000000000000"
        if len(token) > 5:
            # Try to format something readable
            user_part = token.split("-")[1]
            if len(user_part) == 36: # If valid UUID length
                mock_id = user_part
        return MockUser(user_id=mock_id, email=f"{token}@mock.pathfinder.ai")
        
    # 3. Verify real token via Supabase Auth client
    try:
        user_response = supabase_client.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid auth token")
        return user_response.user
    except Exception as e:
        # Fallback for local sandbox testing if keys are default publishable keys
        if "sb_publishable_" in settings.SUPABASE_ANON_KEY:
            # The token could be a client-side mock UUID or simple session token
            # Let's return a stable mock user so the development server doesn't block the frontend mockup
            return MockUser(user_id="11111111-1111-1111-1111-111111111111", email="student@pathfinder.ai")
        
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")
