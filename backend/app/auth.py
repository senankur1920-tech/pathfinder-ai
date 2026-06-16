from fastapi import Header, HTTPException, Depends
from app.config import settings
from typing import Dict, Any

# Try to import supabase; fall back to mock-only mode if unavailable
try:
    from supabase import create_client, Client
    supabase_client: Any = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
    supabase_available = True
except ImportError:
    supabase_client = None
    supabase_available = False

class MockUser:
    def __init__(self, user_id: str, email: str = "student@pathfinder.ai"):
        self.id = user_id
        self.email = email

async def get_current_user(authorization: str = Header(None)) -> Any:
    # 1. Check for token
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    
    token = authorization.split(" ")[1]
    
    # 2. Check for mock/dev token to allow easy API testing
    if token.startswith("mock-") or token == "guest-token":
        mock_id = "00000000-0000-0000-0000-000000000000"
        if len(token) > 5:
            user_part = token.split("-", 1)[1]
            if len(user_part) == 36:
                mock_id = user_part
        return MockUser(user_id=mock_id, email=f"{token}@mock.pathfinder.ai")
        
    # 3. Verify real token via Supabase Auth client (if available)
    if supabase_available and supabase_client:
        try:
            user_response = supabase_client.auth.get_user(token)
            if not user_response or not user_response.user:
                raise HTTPException(status_code=401, detail="Invalid auth token")
            return user_response.user
        except Exception as e:
            if "sb_publishable_" in settings.SUPABASE_ANON_KEY:
                return MockUser(user_id="11111111-1111-1111-1111-111111111111", email="student@pathfinder.ai")
            raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")
    
    # 4. Fallback: treat any token as a mock user (for deployments without Supabase)
    return MockUser(user_id="11111111-1111-1111-1111-111111111111", email="student@pathfinder.ai")
