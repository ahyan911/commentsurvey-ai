"""
CommentSurvey AI - FastAPI Backend
Main entry point for the API server
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import analyze

app = FastAPI(
    title="CommentSurvey AI",
    description="Converts social media comments into structured survey insights",
    version="1.0.0",
)

# Allow frontend (Next.js dev server) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route modules
app.include_router(analyze.router, prefix="/api")


@app.get("/")
def root():
    return {"status": "ok", "message": "CommentSurvey AI backend is running"}
