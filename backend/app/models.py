"""
Data models for request validation and response serialization.
"""

from typing import List, Optional

from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    comments: List[str] = Field(
        ...,
        min_length=1,
        description="Array of comment strings to analyze",
    )


class YouTubeAnalyzeRequest(BaseModel):
    url: str = Field(
        ...,
        description="YouTube video URL",
        examples=["https://www.youtube.com/watch?v=dQw4w9WgXcQ"],
    )
    max_comments: int = Field(
        default=500,
        ge=1,
        le=5000,
        description="Maximum number of YouTube comments to fetch and analyze",
    )


class SentimentBreakdown(BaseModel):
    positive: float
    negative: float
    neutral: float


class AnalyzeResponse(BaseModel):
    yes_percentage: float
    no_percentage: float
    neutral_percentage: float
    sentiment: SentimentBreakdown
    themes: List[str]
    summary: str
    total_comments: int

    # Optional YouTube fields
    source: Optional[str] = None
    video_id: Optional[str] = None
    video_title: Optional[str] = None
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    total_youtube_comments: Optional[int] = None
    analyzed_comments: Optional[int] = None
    sample_note: Optional[str] = None
