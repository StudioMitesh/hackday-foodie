from fastapi import APIRouter, HTTPException
from app.services.mongodb_service import get_session, update_session
from app.services.ai_service import extract_ingredients, generate_recipes, create_embeddings
from bson import ObjectId

router = APIRouter()

@router.post("/{session_id}")
async def process_session(session_id: str):
    """
    Process a session: extract ingredients, generate recipes, create embeddings.
    This endpoint is called by the Atlas Trigger.
    """
    try:
        # Validate ObjectId format
        if not ObjectId.is_valid(session_id):
            raise HTTPException(status_code=400, detail="Invalid session ID format")
        
        # Get session
        session = await get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Check if already processed
        if session.get("status") != "pending":
            return {"message": f"Session already {session.get('status')}", "session_id": session_id}
        
        # Update status to processing
        await update_session(session_id, {"status": "processing"})
        
        try:
            image_url = session.get("imageUrl")
            if not image_url:
                raise ValueError("Image URL not found in session")
            
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
            
            return {
                "message": "Processing complete",
                "session_id": session_id,
                "ingredients_count": len(ingredients),
                "recipes_count": len(recipes)
            }
        except Exception as e:
            # Update status to error
            await update_session(session_id, {
                "status": "error",
                "error": str(e)
            })
            raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

