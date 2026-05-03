"""
YouTube Service.

Handles:
1. Extracting video ID from YouTube URLs
2. Fetching video metadata and total comment count
3. Fetching top-level comments through YouTube Data API v3
"""

import html
import os
import re
from typing import Dict, List, Optional
from urllib.parse import parse_qs, urlparse

import httpx
from dotenv import load_dotenv

load_dotenv()

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

YOUTUBE_VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos"
YOUTUBE_COMMENTS_URL = "https://www.googleapis.com/youtube/v3/commentThreads"


def extract_video_id(url: str) -> str:
    """
    Supports:
    - https://www.youtube.com/watch?v=VIDEO_ID
    - https://youtu.be/VIDEO_ID
    - https://www.youtube.com/shorts/VIDEO_ID
    - https://www.youtube.com/embed/VIDEO_ID
    - raw VIDEO_ID
    """

    value = url.strip()

    if re.fullmatch(r"[A-Za-z0-9_-]{11}", value):
        return value

    parsed = urlparse(value)
    host = parsed.netloc.lower().replace("www.", "")
    path = parsed.path.strip("/")

    if host == "youtu.be":
        video_id = path.split("/")[0]
        if re.fullmatch(r"[A-Za-z0-9_-]{11}", video_id):
            return video_id

    if "youtube.com" in host:
        if path == "watch":
            query = parse_qs(parsed.query)
            video_id = query.get("v", [""])[0]

            if re.fullmatch(r"[A-Za-z0-9_-]{11}", video_id):
                return video_id

        if path.startswith("shorts/") or path.startswith("embed/"):
            parts = path.split("/")

            if len(parts) > 1:
                video_id = parts[1]

                if re.fullmatch(r"[A-Za-z0-9_-]{11}", video_id):
                    return video_id

    raise ValueError("Invalid YouTube URL. Please paste a valid YouTube video link.")


def _require_youtube_key() -> str:
    """
    Ensure Railway has YOUTUBE_API_KEY configured.
    """

    if not YOUTUBE_API_KEY:
        raise RuntimeError("Missing YOUTUBE_API_KEY environment variable")

    return YOUTUBE_API_KEY


def _extract_error_message(data: Dict) -> str:
    """
    Convert YouTube API errors into readable messages.
    """

    error = data.get("error", {})
    message = error.get("message")

    errors = error.get("errors", [])
    reason = None

    if errors and isinstance(errors, list):
        reason = errors[0].get("reason")

    if reason == "commentsDisabled":
        return "Comments are disabled for this YouTube video."

    if reason == "videoNotFound":
        return "YouTube video was not found."

    if reason == "quotaExceeded":
        return "YouTube API quota exceeded. Try again later."

    if reason == "keyInvalid":
        return "Invalid YouTube API key."

    return message or "YouTube API request failed."


async def get_youtube_video_info(video_id: str) -> Dict:
    """
    Fetch video title, thumbnail, and total comment count.
    """

    api_key = _require_youtube_key()

    params = {
        "part": "snippet,statistics",
        "id": video_id,
        "key": api_key,
    }

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(YOUTUBE_VIDEOS_URL, params=params)

    data = response.json()

    if response.status_code != 200:
        raise RuntimeError(_extract_error_message(data))

    items = data.get("items", [])

    if not items:
        raise RuntimeError("YouTube video was not found or is not public.")

    item = items[0]
    snippet = item.get("snippet", {})
    statistics = item.get("statistics", {})
    thumbnails = snippet.get("thumbnails", {})

    best_thumbnail: Optional[str] = None

    for key in ["maxres", "standard", "high", "medium", "default"]:
        if key in thumbnails:
            best_thumbnail = thumbnails[key].get("url")
            break

    return {
        "video_id": video_id,
        "video_title": snippet.get("title", "Untitled video"),
        "video_url": f"https://www.youtube.com/watch?v={video_id}",
        "thumbnail_url": best_thumbnail,
        "total_youtube_comments": int(statistics.get("commentCount", 0)),
    }


async def fetch_youtube_comments(
    video_id: str,
    max_comments: int = 500,
    order: str = "relevance",
) -> List[str]:
    """
    Fetch top-level YouTube comments.

    This MVP fetches top-level comments only, not replies.
    """

    api_key = _require_youtube_key()
    max_comments = max(1, min(max_comments, 5000))

    comments: List[str] = []
    seen = set()
    next_page_token: Optional[str] = None

    async with httpx.AsyncClient(timeout=30) as client:
        while len(comments) < max_comments:
            remaining = max_comments - len(comments)

            params = {
                "part": "snippet",
                "videoId": video_id,
                "key": api_key,
                "maxResults": min(100, remaining),
                "order": order,
                "textFormat": "plainText",
            }

            if next_page_token:
                params["pageToken"] = next_page_token

            response = await client.get(YOUTUBE_COMMENTS_URL, params=params)
            data = response.json()

            if response.status_code != 200:
                raise RuntimeError(_extract_error_message(data))

            items = data.get("items", [])

            if not items:
                break

            for item in items:
                snippet = item.get("snippet", {})
                top_comment = snippet.get("topLevelComment", {})
                top_snippet = top_comment.get("snippet", {})

                text = (
                    top_snippet.get("textOriginal")
                    or top_snippet.get("textDisplay")
                    or ""
                )

                text = html.unescape(text).strip()

                if text and text not in seen:
                    comments.append(text)
                    seen.add(text)

                if len(comments) >= max_comments:
                    break

            next_page_token = data.get("nextPageToken")

            if not next_page_token:
                break

    return comments
