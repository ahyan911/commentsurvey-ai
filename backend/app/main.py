"""
CommentSurvey AI - FastAPI Backend
Main entry point for the API server.
"""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import analyze

app = FastAPI(
    title="CommentSurvey AI",
    description="Converts social media comments into structured survey insights",
    version="1.0.0",
)

# Frontend URLs allowed to call this backend.
# For beginner deployment, "*" is easiest.
# Later, replace "*" with your exact Vercel URL for better security.
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router, prefix="/api")


@app.get("/")
def root():
    return {
        "status": "ok",
        "message": "CommentSurvey AI backend is running",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
    }
