from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.cloudinary_service import upload_to_cloudinary
from app.services.mongodb_service import create_session

router = APIRouter()

@router.post("")
async def upload_image(image: UploadFile = File(...)):
    """
    Upload an image to Cloudinary and create a MongoDB session.
    Returns the session ID.
    """
    try:
        # Validate file type
        if not image.content_type or not image.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read file content
        file_content = await image.read()
        
        # Upload to Cloudinary
        image_url = await upload_to_cloudinary(file_content, image.filename or "image")
        
        # Create session in MongoDB
        session_id = await create_session(image_url)
        
        return {
            "sessionId": str(session_id),
            "imageUrl": image_url,
            "status": "pending"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

