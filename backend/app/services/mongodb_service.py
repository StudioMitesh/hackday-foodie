from pymongo import MongoClient
from pymongo.collection import Collection
from bson import ObjectId
from datetime import datetime, timedelta
import os
import math
from typing import Optional, Dict, Any, List

# MongoDB connection
MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("MONGODB_DATABASE", "foodie")
COLLECTION_NAME = "foodie_sessions"

client = MongoClient(MONGODB_URI)
db = client[DATABASE_NAME]
collection: Collection = db[COLLECTION_NAME]

# Create indexes on first run
def ensure_indexes():
    """Create TTL index and vector search index (if supported)"""
    # TTL index on createdAt (24 hours)
    collection.create_index("createdAt", expireAfterSeconds=86400)
    
    # Text index for search (optional)
    collection.create_index("ingredients")
    
    print("MongoDB indexes created")

# Initialize indexes
ensure_indexes()

async def create_session(image_url: str) -> ObjectId:
    """
    Create a new session document with status 'pending'.
    Returns the session ID.
    """
    now = datetime.utcnow()
    session_doc = {
        "imageUrl": image_url,
        "status": "pending",
        "ingredients": [],
        "recipes": [],
        "createdAt": now,
        "updatedAt": now
    }
    
    result = collection.insert_one(session_doc)
    return result.inserted_id

async def get_session(session_id: str) -> Optional[Dict[str, Any]]:
    """
    Get a session by ID.
    """
    try:
        session = collection.find_one({"_id": ObjectId(session_id)})
        return session
    except Exception:
        return None

async def update_session(session_id: str, update_data: Dict[str, Any]) -> bool:
    """
    Update a session document.
    """
    try:
        update_data["updatedAt"] = datetime.utcnow()
        result = collection.update_one(
            {"_id": ObjectId(session_id)},
            {"$set": update_data}
        )
        return result.modified_count > 0
    except Exception as e:
        print(f"Error updating session: {e}")
        return False

def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """Calculate cosine similarity between two vectors."""
    if len(vec1) != len(vec2):
        return 0.0
    
    dot_product = sum(a * b for a, b in zip(vec1, vec2))
    magnitude1 = math.sqrt(sum(a * a for a in vec1))
    magnitude2 = math.sqrt(sum(a * a for a in vec2))
    
    if magnitude1 == 0 or magnitude2 == 0:
        return 0.0
    
    return dot_product / (magnitude1 * magnitude2)

async def search_similar_recipes(query_embedding: List[float], limit: int = 5) -> List[Dict[str, Any]]:
    """
    Search for similar recipes using vector similarity.
    Uses cosine similarity to find recipes with similar embeddings.
    
    Note: For production, use Atlas Vector Search aggregation pipeline for better performance.
    """
    try:
        # Get all sessions with completed recipes
        sessions = collection.find({
            "status": "complete",
            "recipes.embedding": {"$exists": True, "$ne": []}
        })
        
        results = []
        
        for session in sessions:
            session_id = str(session["_id"])
            for recipe in session.get("recipes", []):
                if recipe.get("embedding"):
                    similarity = cosine_similarity(query_embedding, recipe["embedding"])
                    results.append({
                        "sessionId": session_id,
                        "recipe": {
                            "name": recipe.get("name"),
                            "description": recipe.get("description"),
                            "steps": recipe.get("steps", [])
                        },
                        "similarity": similarity
                    })
        
        # Sort by similarity (descending) and return top results
        results.sort(key=lambda x: x["similarity"], reverse=True)
        return results[:limit]
        
    except Exception as e:
        print(f"Error searching similar recipes: {e}")
        return []

