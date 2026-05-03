"""
POST /api/analyze

Manual comments analysis.
"""

import asyncio

from fastapi import APIRouter, HTTPException

from app.models import AnalyzeRequest, AnalyzeResponse, SentimentBreakdown
from app.services.ai_service import classify_comments, extract_themes, generate_summary

router = APIRouter()


def _pct(count: int, total: int) -> float:
    return round((count / total) * 100, 1) if total > 0 else 0.0


def build_stats(classifications, total: int):
    yes_count = sum(1 for item in classifications if item["opinion"] == "yes")
    no_count = sum(1 for item in classifications if item["opinion"] == "no")
    neutral_opinion_count = total - yes_count - no_count

    pos_count = sum(1 for item in classifications if item["sentiment"] == "positive")
    neg_count = sum(1 for item in classifications if item["sentiment"] == "negative")
    neu_count = total - pos_count - neg_count

    return {
        "yes_pct": _pct(yes_count, total),
        "no_pct": _pct(no_count, total),
        "neutral_pct": _pct(neutral_opinion_count, total),
        "pos_pct": _pct(pos_count, total),
        "neg_pct": _pct(neg_count, total),
        "neu_pct": _pct(neu_count, total),
    }


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    comments = [comment.strip() for comment in request.comments if comment.strip()]

    if not comments:
        raise HTTPException(status_code=422, detail="No valid comments provided.")

    if len(comments) > 1000:
        raise HTTPException(
            status_code=422,
            detail="Maximum 1000 manual comments per request.",
        )

    try:
        classifications, themes = await asyncio.gather(
            classify_comments(comments),
            extract_themes(comments),
        )

        total = len(comments)
        stats = build_stats(classifications, total)
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
            source="manual",
            analyzed_comments=total,
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(error)}",
        ) from error
