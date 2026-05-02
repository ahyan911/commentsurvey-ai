"""
POST /api/analyze
Orchestrates: classify → aggregate → themes → summary
"""

import asyncio
from fastapi import APIRouter, HTTPException
from app.models import AnalyzeRequest, AnalyzeResponse, SentimentBreakdown
from app.services.ai_service import classify_comments, extract_themes, generate_summary

router = APIRouter()


def _pct(count: int, total: int) -> float:
    """Safe percentage rounded to one decimal place."""
    return round((count / total) * 100, 1) if total > 0 else 0.0


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    """
    Main analysis endpoint.
    Accepts a list of comment strings and returns structured survey insights.
    """
    # Strip blank comments
    comments = [c.strip() for c in request.comments if c.strip()]
    if not comments:
        raise HTTPException(status_code=422, detail="No valid comments provided.")
    if len(comments) > 200:
        raise HTTPException(status_code=422, detail="Maximum 200 comments per request.")

    # Run classification, theme extraction, in parallel
    classifications, themes = await asyncio.gather(
        classify_comments(comments),
        extract_themes(comments),
    )

    total = len(comments)

    # Aggregate opinion counts
    yes_count = sum(1 for c in classifications if c["opinion"] == "yes")
    no_count = sum(1 for c in classifications if c["opinion"] == "no")
    neutral_opinion_count = total - yes_count - no_count

    # Aggregate sentiment counts
    pos_count = sum(1 for c in classifications if c["sentiment"] == "positive")
    neg_count = sum(1 for c in classifications if c["sentiment"] == "negative")
    neu_count = total - pos_count - neg_count

    stats = {
        "yes_pct": _pct(yes_count, total),
        "no_pct": _pct(no_count, total),
        "neutral_pct": _pct(neutral_opinion_count, total),
        "pos_pct": _pct(pos_count, total),
        "neg_pct": _pct(neg_count, total),
        "neu_pct": _pct(neu_count, total),
    }

    # Generate summary paragraph after we have stats
    summary = await generate_summary(comments, stats)

    return AnalyzeResponse(
        yes_percentage=stats["yes_pct"],
        no_percentage=stats["no_pct"],
        neutral_percentage=stats["neutral_pct"],
        sentiment=SentimentBreakdown(
            positive=stats["pos_pct"],
            negative=stats["neg_pct"],
            neutral=stats["neu_pct"],
        ),
        themes=themes,
        summary=summary,
        total_comments=total,
    )
