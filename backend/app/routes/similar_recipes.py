from fastapi import APIRouter, HTTPException, Query
from app.services.mongodb_service import search_similar_recipes
from app.services.ai_service import create_embeddings

router = APIRouter()

@router.get("")
async def get_similar_recipes(query: str = Query(..., description="Search query for similar recipes")):
    """
    Find similar recipes using vector similarity search.
    Returns recipes that are semantically similar to the query.
    """
    try:
        # Create embedding for the query
        query_embedding = await create_embeddings(query)
        
        # Search for similar recipes
        similar_recipes = await search_similar_recipes(query_embedding, limit=5)
        
        return {
            "query": query,
            "results": similar_recipes
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

