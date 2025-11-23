from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import upload, session, process, similar_recipes

app = FastAPI(title="BiggieBack API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload.router, prefix="/upload-image", tags=["upload"])
app.include_router(session.router, prefix="/session", tags=["session"])
app.include_router(process.router, prefix="/process", tags=["process"])
app.include_router(similar_recipes.router, prefix="/similar-recipes", tags=["similar-recipes"])

@app.get("/")
async def root():
    return {"message": "BiggieBack API is running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

