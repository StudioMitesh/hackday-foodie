from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from app.services.cloudinary_service import upload_to_cloudinary
from app.services.mongodb_service import create_session, update_session
from app.services.ai_service import extract_ingredients, generate_recipes, create_embeddings

router = APIRouter()

async def process_session_background(session_id: str, image_url: str):
    """
    Background task to process a session.
    This can be called directly or by the Atlas Trigger.
    """
    try:
        # Update status to processing
        await update_session(session_id, {"status": "processing"})
        
        # Step 1: Extract ingredients using Vision API
        ingredients = await extract_ingredients(image_url)
        
        # Step 2: Generate recipes
        recipes = await generate_recipes(ingredients)
        
        # Step 3: Create embeddings for each recipe
        for recipe in recipes:
            recipe_text = f"{recipe['name']} {recipe['description']} {' '.join(recipe['steps'])}"
            embedding = await create_embeddings(recipe_text)
            recipe["embedding"] = embedding
        
        # Step 4: Update session with results
        await update_session(session_id, {
            "status": "complete",
            "ingredients": ingredients,
            "recipes": recipes
        })
        
        print(f"Successfully processed session {session_id}")
    except Exception as e:
        # Update status to error
        await update_session(session_id, {
            "status": "error",
            "error": str(e)
        })
        print(f"Error processing session {session_id}: {e}")
        import traceback
        print(traceback.format_exc())

@router.post("")
async def upload_image(
    image: UploadFile = File(...),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """
    Upload an image to Cloudinary and create a MongoDB session.
    Processes the session immediately in the background (for MVP).
    In production, you can rely on Atlas Triggers instead.
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
        session_id_str = str(session_id)
        
        # Process session immediately in background (for MVP)
        # This ensures sessions are processed even without Atlas Triggers
        background_tasks.add_task(process_session_background, session_id_str, image_url)
        
        return {
            "sessionId": session_id_str,
            "imageUrl": image_url,
            "status": "processing"  # Changed from "pending" since we're processing immediately
        }
    except Exception as e:
        import traceback
        print(f"Error in upload_image: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

