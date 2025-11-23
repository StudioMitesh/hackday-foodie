# MongoDB Search Feature Setup Guide

This guide explains how to set up the recipe search feature in MongoDB Atlas. The search uses vector embeddings for semantic similarity matching.

## How It Works

1. When recipes are generated, embeddings are created for each recipe using OpenAI's embedding model
2. These embeddings are stored in the `recipes.embedding` field in MongoDB
3. When you search, your query is converted to an embedding
4. The system uses cosine similarity to find the most similar recipes

## MongoDB Setup

### Option 1: Using Cosine Similarity (Current Implementation - Works Out of the Box)

**No additional MongoDB setup required!** The current implementation uses cosine similarity calculation in Python, which works with your existing MongoDB setup.

**What you need:**
- ✅ Database: `foodie`
- ✅ Collection: `foodie_sessions`
- ✅ Recipes with embeddings stored in `recipes.embedding` field

**How it works:**
- The backend fetches all completed sessions with recipe embeddings
- Calculates cosine similarity between query embedding and each recipe embedding
- Returns top matches sorted by similarity score

**Pros:**
- Works immediately with your current setup
- No additional MongoDB configuration needed
- Good for small to medium datasets

**Cons:**
- Slower for very large datasets (1000+ recipes)
- Loads all recipes into memory for comparison

### Option 2: Atlas Vector Search (Recommended for Production)

For better performance with large datasets, you can use MongoDB Atlas Vector Search.

#### Step 1: Create Vector Search Index

1. Go to MongoDB Atlas → **Search** (left sidebar, under "Services")
2. Click **"Create Search Index"**
3. Choose **"JSON Editor"**
4. Configure:
   - **Database**: `foodie`
   - **Collection**: `foodie_sessions`
   - **Index Name**: `recipe_embeddings_vector`
5. Paste this configuration:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "recipes.embedding",
      "numDimensions": 1536,
      "similarity": "cosine"
    }
  ]
}
```

**Important Notes:**
- `numDimensions: 1536` matches OpenAI's `text-embedding-3-small` model
- `similarity: "cosine"` uses cosine similarity (same as current implementation)
- This index will be created on the `recipes.embedding` field

6. Click **"Next"** → **"Create Search Index"**
7. Wait for status to show **"Active"** (may take 5-10 minutes)

#### Step 2: Update Backend Code (Optional - for Atlas Vector Search)

If you want to use Atlas Vector Search instead of the current cosine similarity approach, you would need to update the `search_similar_recipes` function in `backend/app/services/mongodb_service.py` to use the aggregation pipeline.

**Current implementation works fine for MVP**, so this is optional.

## Testing the Search Feature

### 1. Ensure Recipes Have Embeddings

When you upload an image and generate recipes, embeddings are automatically created. Verify this:

1. Go to MongoDB Atlas → Database → `foodie` → `foodie_sessions`
2. Find a completed session (status: "complete")
3. Check that recipes have an `embedding` field with an array of numbers

### 2. Test the Search Endpoint

You can test the search API directly:

```bash
# Using curl
curl "http://localhost:8000/similar-recipes?query=spicy%20pasta"

# Or in your browser
http://localhost:8000/similar-recipes?query=spicy+pasta
```

Expected response:
```json
{
  "query": "spicy pasta",
  "results": [
    {
      "sessionId": "...",
      "recipe": {
        "name": "Recipe Name",
        "description": "...",
        "steps": ["..."]
      },
      "similarity": 0.85
    }
  ]
}
```

### 3. Test from Frontend

1. Upload some ingredient images to create recipes
2. Go to the Search page in your app
3. Enter a search query (e.g., "pasta", "salad", "spicy")
4. Results should show matching recipes with similarity scores

## Troubleshooting

### No Results Returned

**Possible causes:**
1. **No recipes in database**: Upload some images first to generate recipes
2. **Recipes don't have embeddings**: Check that `recipes.embedding` field exists
3. **All sessions are pending**: Wait for processing to complete

**Solution:**
- Upload at least one image and wait for processing
- Verify in MongoDB that sessions have status "complete" and recipes have embeddings

### Low Similarity Scores

**Possible causes:**
1. Query doesn't match any recipe content
2. Not enough recipes in database
3. Embeddings weren't created properly

**Solution:**
- Try different search queries
- Upload more diverse ingredient images
- Check that embeddings are being created (should be arrays of 1536 numbers)

### Search is Slow

**If you have 100+ recipes:**
- Consider setting up Atlas Vector Search (Option 2 above)
- This will significantly improve performance

**Current implementation is fine for:**
- < 100 recipes: Very fast
- 100-500 recipes: Acceptable
- 500+ recipes: Consider Atlas Vector Search

## Current Implementation Details

The search feature uses:
- **Embedding Model**: OpenAI `text-embedding-3-small` (1536 dimensions)
- **Similarity Metric**: Cosine similarity
- **Search Method**: In-memory comparison (all recipes loaded, then sorted)
- **Result Limit**: Top 5 matches by default

## Next Steps

1. ✅ Upload some images to generate recipes with embeddings
2. ✅ Test the search feature from the frontend
3. ✅ (Optional) Set up Atlas Vector Search for better performance
4. ✅ Enjoy finding similar recipes!

## Notes

- Embeddings are created automatically when recipes are generated
- Each recipe gets its own embedding based on: `name + description + steps`
- Search works across all sessions in your database
- Similarity scores range from 0.0 (no match) to 1.0 (perfect match)
- Results are sorted by similarity (highest first)

