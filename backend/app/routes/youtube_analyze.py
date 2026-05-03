"""
POST /api/analyze-youtube

YouTube URL analysis:
1. Extract video ID
2. Fetch video metadata and total comment count
3. Fetch relevant comments
4. Pick most-liked comments from that sample
5. Analyze comments with existing AI pipeline
"""

import asyncio

from fastapi import APIRouter, HTTPException

from app.models import AnalyzeResponse, SentimentBreakdown, YouTubeAnalyzeRequest
from app.routes.analyze import build_stats
from app.services.ai_service import classify_comments, extract_themes, generate_summary
from app.services.youtube_service import (
    extract_video_id,
    fetch_youtube_comments,
    get_youtube_video_info,
)

router = APIRouter()


@router.post("/analyze-youtube", response_model=AnalyzeResponse)
async def analyze_youtube(request: YouTubeAnalyzeRequest):
    try:
        video_id = extract_video_id(request.url)

        video_info = await get_youtube_video_info(video_id)

        comments = await fetch_youtube_comments(
            video_id=video_id,
            max_comments=request.max_comments,
            order="relevance",
            fetch_pool_size=200,
        )

        if not comments:
            raise HTTPException(
                status_code=422,
                detail="No comments could be fetched from this video.",
            )

        classifications, themes = await asyncio.gather(
            classify_comments(comments),
            extract_themes(comments),
        )

        total = len(comments)
        stats = build_stats(classifications, total)
        summary = await generate_summary(comments, stats)

        total_youtube_comments = video_info.get("total_youtube_comments", 0)

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
            source="youtube",
            video_id=video_info.get("video_id"),
            video_title=video_info.get("video_title"),
            video_url=video_info.get("video_url"),
            thumbnail_url=video_info.get("thumbnail_url"),
            total_youtube_comments=total_youtube_comments,
            analyzed_comments=total,
            sample_note=(
                f"Analyzed {total:,} most-liked comments selected from a "
                f"relevance-based YouTube sample. Total reported comments: "
                f"{total_youtube_comments:,}."
            ),
        )

    except HTTPException:
        raise

    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"YouTube analysis failed: {str(error)}",
        ) from error
