"""
CommentSurvey AI - FastAPI Backend
Main entry point for the API server.
"""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.analyze import router as analyze_router
from app.routes.youtube_analyze import router as youtube_analyze_router

app = FastAPI(
    title="CommentSurvey AI",
    description="Converts social media and YouTube comments into structured survey insights",
    version="1.1.0",
)

allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router, prefix="/api")
app.include_router(youtube_analyze_router, prefix="/api")


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
