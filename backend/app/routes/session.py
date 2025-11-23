from fastapi import APIRouter, HTTPException
from app.services.mongodb_service import get_session as get_session_from_db
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
        
        # Call the MongoDB service function (renamed to avoid conflict)
        session = await get_session_from_db(session_id)
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Convert ObjectId to string for JSON serialization
        if session and "_id" in session:
            session["_id"] = str(session["_id"])
        
        return session
    except HTTPException:
        raise
    except ValueError as e:
        # MongoDB connection/configuration error
        import traceback
        print(f"MongoDB configuration error: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=503, detail=f"Database connection error: {str(e)}")
    except Exception as e:
        # Log the full error for debugging
        import traceback
        print(f"Error getting session: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

