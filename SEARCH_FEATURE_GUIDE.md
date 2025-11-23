# Recipe Search Feature - Complete Guide

## ✅ What's Been Set Up

### Frontend
- ✅ Beautiful search page at `/search`
- ✅ Search input with real-time query
- ✅ Results display with similarity scores
- ✅ Links to view full recipe sessions
- ✅ Navigation updated with Search link

### Backend
- ✅ `/similar-recipes` endpoint (already existed)
- ✅ Vector embedding generation for queries
- ✅ Cosine similarity search implementation
- ✅ Returns top 5 matching recipes

## 🚀 How to Use

### 1. Generate Some Recipes First
Before searching, you need recipes in your database:
1. Go to `/upload`
2. Upload ingredient images
3. Wait for processing to complete
4. Recipes with embeddings will be stored automatically

### 2. Search for Recipes
1. Go to `/search` (or click "🔍 Search" in navbar)
2. Enter a search query (e.g., "spicy pasta", "healthy salad", "quick breakfast")
3. Click "Search Recipes"
4. View results with similarity scores

## 📊 MongoDB Setup

### Current Implementation (Works Out of the Box!)

**No additional MongoDB setup needed!** The search feature works with your existing setup:

✅ **What you already have:**
- Database: `foodie`
- Collection: `foodie_sessions`
- Recipes with embeddings in `recipes.embedding` field

**How it works:**
- When recipes are generated, embeddings are automatically created
- Search queries are converted to embeddings
- Cosine similarity finds the best matches
- Works great for up to ~500 recipes

### Optional: Atlas Vector Search (For Large Datasets)

If you plan to have 500+ recipes, you can set up Atlas Vector Search for better performance:

1. Go to MongoDB Atlas → **Search** → **Create Search Index**
2. Use JSON Editor with this config:

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

3. Database: `foodie`, Collection: `foodie_sessions`
4. Wait for index to become Active

**Note:** Current implementation works fine for MVP, so this is optional.

## 🔍 How Search Works

1. **User enters query**: "spicy pasta with tomatoes"
2. **Query → Embedding**: OpenAI converts text to 1536-dimensional vector
3. **Compare with recipes**: Cosine similarity calculated for each recipe
4. **Rank results**: Sorted by similarity score (0.0 to 1.0)
5. **Return top 5**: Best matches shown to user

## 📝 Example Searches

Try these types of queries:
- **Dish types**: "pasta", "salad", "soup", "dessert"
- **Cooking methods**: "grilled", "baked", "stir-fried"
- **Flavors**: "spicy", "sweet", "savory", "tangy"
- **Descriptions**: "quick meal", "healthy option", "comfort food"
- **Combinations**: "spicy pasta", "healthy salad", "quick breakfast"

## 🎯 Similarity Scores

- **0.8 - 1.0**: Excellent match (very similar)
- **0.6 - 0.8**: Good match (related)
- **0.4 - 0.6**: Moderate match (somewhat related)
- **< 0.4**: Weak match (not very similar)

## 🐛 Troubleshooting

### "No recipes found"
- **Cause**: No recipes in database yet
- **Solution**: Upload some images first to generate recipes

### Low similarity scores
- **Cause**: Query doesn't match recipe content
- **Solution**: Try different search terms or upload more diverse recipes

### Search is slow
- **Cause**: Too many recipes (500+)
- **Solution**: Set up Atlas Vector Search (see MongoDB Setup above)

## 🎨 Features

- **Semantic Search**: Finds recipes by meaning, not just keywords
- **Similarity Scores**: Shows how well each recipe matches
- **Session Links**: Click to view full recipe details
- **Beautiful UI**: Gradient design matching the rest of the app
- **Real-time Results**: Instant search feedback

## 📚 Technical Details

- **Embedding Model**: OpenAI `text-embedding-3-small` (1536 dimensions)
- **Similarity Metric**: Cosine similarity
- **Search Method**: In-memory comparison (fast for < 500 recipes)
- **Result Limit**: Top 5 matches
- **API Endpoint**: `GET /similar-recipes?query=...`

## ✨ Next Steps

1. ✅ Upload some ingredient images
2. ✅ Wait for recipes to be generated
3. ✅ Try searching for recipes
4. ✅ Enjoy finding similar recipes!

The search feature is fully functional and ready to use!

