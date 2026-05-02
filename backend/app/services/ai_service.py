"""
AI Service — wraps OpenAI API calls for:
  1. Per-comment classification (sentiment + opinion)
  2. Theme extraction
  3. Summary generation
"""

import os
import json
from typing import List, Dict
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

# Initialise async OpenAI client from env key
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# -------------------------------------------------------------------
# STEP 1 — Classify each comment individually
# -------------------------------------------------------------------
CLASSIFY_SYSTEM = """You are a comment analysis engine.
For each comment in the provided JSON array, return a JSON array of objects.
Each object must have exactly two fields:
  - "sentiment": one of "positive", "negative", "neutral"
  - "opinion": one of "yes", "no", "neutral"

Opinion rules:
  - "yes"  → comment expresses agreement, approval, or a positive stance on the subject
  - "no"   → comment expresses disagreement, disapproval, or a negative stance
  - "neutral" → ambiguous, mixed, or irrelevant

Return ONLY valid JSON, no markdown, no explanation."""


async def classify_comments(comments: List[str]) -> List[Dict[str, str]]:
    """
    Send all comments to GPT in a single batch call.
    Returns list of {sentiment, opinion} dicts.
    """
    payload = json.dumps(comments, ensure_ascii=False)

    response = await client.chat.completions.create(
        model="gpt-4o-mini",          # fast + cheap, great for classification
        temperature=0,                 # deterministic output
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": CLASSIFY_SYSTEM},
            {
                "role": "user",
                "content": f"Classify these comments:\n{payload}\n\nRespond with JSON like: {{\"results\": [...]}}",
            },
        ],
    )

    raw = response.choices[0].message.content
    data = json.loads(raw)

    # Handle both {"results": [...]} and bare [...] responses
    if isinstance(data, list):
        results = data
    else:
        results = data.get("results", [])

    # Normalise and fill missing values defensively
    normalised = []
    for i, item in enumerate(results):
        normalised.append({
            "sentiment": item.get("sentiment", "neutral").lower(),
            "opinion": item.get("opinion", "neutral").lower(),
        })

    # Pad with neutrals if GPT returned fewer items than input
    while len(normalised) < len(comments):
        normalised.append({"sentiment": "neutral", "opinion": "neutral"})

    return normalised[:len(comments)]


# -------------------------------------------------------------------
# STEP 2 — Extract themes
# -------------------------------------------------------------------
THEMES_SYSTEM = """You are a theme extraction engine.
Given a list of social media comments, identify the 3 to 5 most prominent themes.
Return ONLY a JSON object like: {"themes": ["theme one", "theme two", "theme three"]}
Themes should be short noun phrases (2–4 words). No markdown, no explanation."""


async def extract_themes(comments: List[str]) -> List[str]:
    """Return 3–5 key themes from the full comment set."""
    joined = "\n".join(f"- {c}" for c in comments)

    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0.3,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": THEMES_SYSTEM},
            {"role": "user", "content": joined},
        ],
    )

    raw = response.choices[0].message.content
    data = json.loads(raw)
    return data.get("themes", [])


# -------------------------------------------------------------------
# STEP 3 — Generate summary paragraph
# -------------------------------------------------------------------
SUMMARY_SYSTEM = """You are a professional insights analyst.
Write a concise 2–3 sentence summary of public opinion based on the comments provided.
Be objective, specific, and actionable. Do not use bullet points."""


async def generate_summary(comments: List[str], stats: Dict) -> str:
    """Produce a plain-English summary paragraph."""
    joined = "\n".join(f"- {c}" for c in comments)
    context = (
        f"Stats: {stats['yes_pct']:.0f}% yes, {stats['no_pct']:.0f}% no, "
        f"{stats['neutral_pct']:.0f}% neutral. "
        f"Sentiment: {stats['pos_pct']:.0f}% positive, "
        f"{stats['neg_pct']:.0f}% negative, {stats['neu_pct']:.0f}% neutral."
    )

    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0.5,
        messages=[
            {"role": "system", "content": SUMMARY_SYSTEM},
            {"role": "user", "content": f"{context}\n\nComments:\n{joined}"},
        ],
    )

    return response.choices[0].message.content.strip()
