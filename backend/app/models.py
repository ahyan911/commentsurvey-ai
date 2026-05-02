"""
Data models for request validation and response serialization.
"""

from typing import List

from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    """
    Incoming request with a list of raw comment strings.
    """

    comments: List[str] = Field(
        ...,
        min_length=1,
        description="Array of comment strings to analyze",
        examples=[
            [
                "Yes this product is amazing!",
                "No I didn't like it at all",
                "Maybe it's okay but a bit expensive",
            ]
        ],
    )


class SentimentBreakdown(BaseModel):
    positive: float
    negative: float
    neutral: float


class AnalyzeResponse(BaseModel):
    """
    Structured analysis result returned to the frontend.
    """

    yes_percentage: float
    no_percentage: float
    neutral_percentage: float
    sentiment: SentimentBreakdown
    themes: List[str]
    summary: str
    total_comments: int
