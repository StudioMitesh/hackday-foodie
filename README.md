# BiggieBack - AI Recipe Generator MVP

A full-stack MVP that extracts ingredients from photos and generates AI-powered recipes using OpenAI Vision and LLM APIs.

## 🏗️ Architecture

- **Frontend**: Next.js 14 (App Router) + TypeScript + TailwindCSS
- **Backend**: FastAPI (Python)
- **Database**: MongoDB Atlas
- **AI**: OpenAI (Vision + GPT-4 + Embeddings)
- **Storage**: Cloudinary

## 📋 Features

1. **Image Upload**: Upload ingredient photos with preview
2. **AI Ingredient Extraction**: Uses OpenAI Vision API to detect ingredients
3. **Recipe Generation**: Generates 2-3 recipes using detected ingredients
4. **Vector Embeddings**: Creates embeddings for recipe similarity search
5. **Real-time Updates**: Frontend polls backend for processing status
6. **Atlas Triggers**: Automatic processing when new sessions are created

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- MongoDB Atlas account
- OpenAI API key
- Cloudinary account

### 1. Clone and Install

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### 2. Environment Setup

#### Frontend (.env.local)

Create `.env.local` in the root directory:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

#### Backend (.env)

Create `.env` in the `backend/` directory:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/biggieback?retryWrites=true&w=majority
MONGODB_DATABASE=biggieback
OPENAI_API_KEY=sk-your-openai-api-key-here
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
PORT=8000
```

### 3. MongoDB Atlas Setup

1. **Create Database and Collection**:
   - Database: `biggieback`
   - Collection: `biggieback_sessions`

2. **Create Indexes**:
   ```javascript
   // TTL index (24 hours)
   db.biggieback_sessions.createIndex(
     { "createdAt": 1 },
     { expireAfterSeconds: 86400 }
   )
   
   // Text index for ingredients
   db.biggieback_sessions.createIndex({ "ingredients": 1 })
   ```

3. **Set Up Atlas Trigger**:
   - Go to Atlas → Triggers
   - Create a new Database Trigger
   - **Name**: `process-session-trigger`
   - **Type**: Database
   - **Event Type**: Insert
   - **Database**: `biggieback`
   - **Collection**: `biggieback_sessions`
   - **Full Document**: Enabled
   - **Function**: Copy the code from `atlas-trigger.js`
   - **Values**: Create a value named `BACKEND_URL` with your backend URL (e.g., `https://your-backend.onrender.com`)

4. **Optional: Vector Search Index** (for recipe similarity):
   - Go to Atlas → Search
   - Create a Vector Search index on `biggieback_sessions`
   - Field: `recipes.embedding`
   - Dimensions: 1536 (for `text-embedding-3-small`)

### 4. Run Locally

#### Start Backend

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python run.py
```

Backend will run on `http://localhost:8000`

#### Start Frontend

```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

### 5. Test the Application

1. Open `http://localhost:3000`
2. Click "Get Started"
3. Upload an ingredient photo
4. Wait for processing (the page will auto-refresh)
5. View detected ingredients and generated recipes

## 📁 Project Structure

```
biggieback/
├── app/                    # Next.js app directory
│   ├── upload/            # Upload page
│   ├── session/[id]/      # Session view page
│   └── layout.tsx         # Root layout
├── backend/
│   ├── app/
│   │   ├── main.py        # FastAPI app
│   │   ├── routes/        # API routes
│   │   └── services/      # Business logic
│   └── requirements.txt   # Python dependencies
├── lib/                   # Frontend utilities
├── atlas-trigger.js       # MongoDB Atlas trigger code
├── .env.example           # Environment variable template
└── README.md              # This file
```

## 🔌 API Endpoints

### POST `/upload-image`
Upload an image and create a session.

**Request**: `multipart/form-data` with `image` field

**Response**:
```json
{
  "sessionId": "507f1f77bcf86cd799439011",
  "imageUrl": "https://res.cloudinary.com/...",
  "status": "pending"
}
```

### GET `/session/{session_id}`
Get session details.

**Response**:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "imageUrl": "https://...",
  "status": "complete",
  "ingredients": ["tomato", "onion", "garlic"],
  "recipes": [
    {
      "name": "Tomato Onion Salad",
      "description": "Fresh and simple",
      "steps": ["Chop tomatoes", "Slice onions", "Mix together"],
      "embedding": [0.123, ...]
    }
  ],
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:05Z"
}
```

### POST `/process/{session_id}`
Process a session (called by Atlas Trigger).

**Response**:
```json
{
  "message": "Processing complete",
  "session_id": "507f1f77bcf86cd799439011",
  "ingredients_count": 3,
  "recipes_count": 2
}
```

## 🚢 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variable:
   - `NEXT_PUBLIC_BACKEND_URL`: Your backend URL
4. Deploy

### Backend (Render)

1. Create a new Web Service
2. Connect your GitHub repository
3. Settings:
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables from `.env.example`
5. Deploy

### Backend (Fly.io)

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Create app
fly launch

# Set secrets
fly secrets set MONGODB_URI="..."
fly secrets set OPENAI_API_KEY="..."
fly secrets set CLOUDINARY_CLOUD_NAME="..."
fly secrets set CLOUDINARY_API_KEY="..."
fly secrets set CLOUDINARY_API_SECRET="..."

# Deploy
fly deploy
```

### MongoDB Atlas

1. Create a free cluster
2. Set up network access (allow all IPs for development, restrict for production)
3. Create database user
4. Configure triggers as described above

## 🔧 Troubleshooting

### Backend won't start
- Check that all environment variables are set
- Verify MongoDB connection string
- Ensure Python dependencies are installed

### Atlas Trigger not firing
- Verify trigger is enabled
- Check trigger logs in Atlas
- Ensure `BACKEND_URL` value is set correctly
- Verify backend endpoint is accessible from Atlas

### Images not uploading
- Check Cloudinary credentials
- Verify file size limits
- Check CORS settings on backend

### AI processing fails
- Verify OpenAI API key is valid
- Check API rate limits
- Review error logs in backend

## 📝 Notes

- Sessions expire after 24 hours (TTL index)
- Vector search is implemented using cosine similarity (for production, use Atlas Vector Search aggregation)
- The frontend polls every 2 seconds for status updates
- For production, restrict CORS origins in `backend/app/main.py`
- MongoDB operations use synchronous pymongo (for production, consider using motor for async operations)
- Recipe similarity search endpoint is available at `/similar-recipes?query=...`

## 🎯 Future Enhancements

- WebSocket/SSE for real-time updates (instead of polling)
- User authentication
- Recipe favorites and history
- Export recipes as PDF
- Use Atlas Vector Search aggregation pipeline for better performance
- Migrate to motor (async MongoDB driver) for better async performance

## 📄 License

MIT

