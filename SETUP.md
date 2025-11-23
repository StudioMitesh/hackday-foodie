# Quick Setup Guide

## 1. Frontend Setup

```bash
# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:8000" > .env.local

# Run development server
npm run dev
```

## 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cat > .env << EOF
MONGODB_URI=your-mongodb-uri
MONGODB_DATABASE=biggieback
OPENAI_API_KEY=your-openai-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
PORT=8000
EOF

# Run backend
python run.py
```

## 3. MongoDB Atlas Setup

1. **Create Collection**: `biggieback_sessions` in database `biggieback`

2. **Create Indexes**:
   ```javascript
   // TTL index
   db.biggieback_sessions.createIndex(
     { "createdAt": 1 },
     { expireAfterSeconds: 86400 }
   )
   ```

3. **Create Trigger**:
   - Name: `process-session-trigger`
   - Type: Database Trigger
   - Event: Insert
   - Collection: `biggieback_sessions`
   - Function: Copy from `atlas-trigger.js`
   - Value: `BACKEND_URL` = your backend URL

## 4. Test

1. Open http://localhost:3000
2. Upload an ingredient photo
3. Wait for processing
4. View results!

