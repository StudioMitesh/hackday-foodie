from fastapi import APIRouter, HTTPException
from app.services.mongodb_service import get_session
from bson import ObjectId

router = APIRouter()

@router.get("/{session_id}")
async def get_session(session_id: str):
    """
    Get session details by ID.
    """
    try:
        # Validate ObjectId format
        if not ObjectId.is_valid(session_id):
            raise HTTPException(status_code=400, detail="Invalid session ID format")
        
        session = await get_session(session_id)
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Convert ObjectId to string
        session["_id"] = str(session["_id"])
        
        return session
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

