from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.errors import ConfigurationError, ServerSelectionTimeoutError
from bson import ObjectId
from datetime import datetime, timedelta
import os
import math
from typing import Optional, Dict, Any, List

# MongoDB configuration
MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("MONGODB_DATABASE", "foodie")
COLLECTION_NAME = "foodie_sessions"

# Lazy connection - only connect when needed
_client: Optional[MongoClient] = None
_db = None
_collection: Optional[Collection] = None
_indexes_created = False
_initializing = False  # Guard against recursive initialization

def get_client() -> MongoClient:
    """Get or create MongoDB client with lazy initialization."""
    global _client, _initializing
    
    if _client is not None:
        return _client
    
    if _initializing:
        raise RuntimeError("MongoDB client initialization already in progress")
    
    if not MONGODB_URI:
        raise ValueError("MONGODB_URI environment variable is not set")
    
    _initializing = True
    try:
        _client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        # Test connection
        _client.admin.command('ping')
    except (ConfigurationError, ServerSelectionTimeoutError) as e:
        _client = None
        raise ValueError(f"Failed to connect to MongoDB: {str(e)}. Please check your MONGODB_URI.")
    finally:
        _initializing = False
    
    return _client

def get_db():
    """Get database instance."""
    global _db
    if _db is None:
        client = get_client()
        _db = client[DATABASE_NAME]
    return _db

def get_collection() -> Collection:
    """Get collection instance with lazy initialization."""
    global _collection, _indexes_created
    
    # Return existing collection if already initialized
    if _collection is not None:
        return _collection
    
    # Get collection
    db = get_db()
    _collection = db[COLLECTION_NAME]
    
    # Create indexes on first access (only once)
    if not _indexes_created:
        _create_indexes(_collection)
    
    return _collection

def _create_indexes(collection: Collection):
    """Helper function to create indexes."""
    global _indexes_created
    if _indexes_created:
        return
    
    try:
        # TTL index on createdAt (24 hours)
        collection.create_index("createdAt", expireAfterSeconds=86400)
        # Text index for search (optional)
        collection.create_index("ingredients")
        _indexes_created = True
        print("MongoDB indexes created")
    except Exception as e:
        print(f"Warning: Could not create indexes: {e}")
        # Set to True even on failure to prevent infinite retries
        _indexes_created = True

async def create_session(image_url: str) -> ObjectId:
    """
    Create a new session document with status 'pending'.
    Returns the session ID.
    """
    # Get collection outside try block to avoid recursion if get_collection fails
    collection = get_collection()
    
    now = datetime.utcnow()
    session_doc = {
        "imageUrl": image_url,
        "status": "pending",
        "ingredients": [],
        "recipes": [],
        "createdAt": now,
        "updatedAt": now
    }
    
    try:
        result = collection.insert_one(session_doc)
        return result.inserted_id
    except Exception as e:
        error_msg = str(e)
        # Avoid recursion by not calling get_collection() again in error handling
        raise RuntimeError(f"Failed to create session in MongoDB: {error_msg}")

async def get_session(session_id: str) -> Optional[Dict[str, Any]]:
    """
    Get a session by ID.
    """
    try:
        collection = get_collection()
        session = collection.find_one({"_id": ObjectId(session_id)})
        return session
    except ValueError as e:
        # MongoDB connection or configuration error
        print(f"MongoDB error in get_session: {e}")
        raise
    except Exception as e:
        # Other errors (invalid ObjectId, etc.)
        print(f"Error getting session {session_id}: {e}")
        return None

async def update_session(session_id: str, update_data: Dict[str, Any]) -> bool:
    """
    Update a session document.
    """
    try:
        collection = get_collection()
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
        collection = get_collection()
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

