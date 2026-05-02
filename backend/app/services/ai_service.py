"""
AI Service — Groq version
Handles:
  1. Comment classification: sentiment + opinion
  2. Theme extraction
  3. Summary generation
"""

import os
import json
import re
from typing import List, Dict, Any

from dotenv import load_dotenv
from openai import AsyncOpenAI

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise RuntimeError("Missing GROQ_API_KEY environment variable")

client = AsyncOpenAI(
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1",
)

MODEL = "llama-3.3-70b-versatile"


def safe_json_loads(text: str) -> Any:
    """
    Safely parse JSON from model output.
    Handles normal JSON and accidental markdown/code-fence output.
    """
    if not text:
        return {}

    cleaned = text.strip()

    cleaned = cleaned.replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    object_match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if object_match:
        try:
            return json.loads(object_match.group())
        except json.JSONDecodeError:
            return {}

    array_match = re.search(r"\[.*\]", cleaned, re.DOTALL)
    if array_match:
        try:
            return json.loads(array_match.group())
        except json.JSONDecodeError:
            return []

    return {}


def normalize_label(value: str, allowed: List[str], default: str = "neutral") -> str:
    value = str(value or "").lower().strip()
    return value if value in allowed else default


CLASSIFY_SYSTEM = """
You are a comment analysis engine.

For each comment in the input JSON array, return one result in the same order.

Each result must contain:
- sentiment: positive, negative, or neutral
- opinion: yes, no, or neutral

Opinion rules:
- yes = agreement, approval, support, or positive stance
- no = disagreement, rejection, criticism, or negative stance
- neutral = unclear, mixed, unrelated, or no clear opinion

Return ONLY valid JSON in this exact format:
{
  "results": [
    {
      "sentiment": "positive",
      "opinion": "yes"
    }
  ]
}
"""


async def classify_comments(comments: List[str]) -> List[Dict[str, str]]:
    payload = json.dumps(comments, ensure_ascii=False)

    response = await client.chat.completions.create(
        model=MODEL,
        temperature=0,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": CLASSIFY_SYSTEM},
            {"role": "user", "content": f"Classify these comments:\n{payload}"},
        ],
    )

    raw = response.choices[0].message.content or ""
    data = safe_json_loads(raw)

    if isinstance(data, dict):
        results = data.get("results", [])
    elif isinstance(data, list):
        results = data
    else:
        results = []

    normalised: List[Dict[str, str]] = []

    for item in results:
        if not isinstance(item, dict):
            item = {}

        normalised.append(
            {
                "sentiment": normalize_label(
                    item.get("sentiment"),
                    ["positive", "negative", "neutral"],
                ),
                "opinion": normalize_label(
                    item.get("opinion"),
                    ["yes", "no", "neutral"],
                ),
            }
        )

    while len(normalised) < len(comments):
        normalised.append({"sentiment": "neutral", "opinion": "neutral"})

    return normalised[: len(comments)]


THEMES_SYSTEM = """
You are a theme extraction engine.

Extract 3 to 5 key themes from the comments.

Rules:
- Themes must be short phrases
- Each theme should be 2 to 4 words
- Avoid duplicate themes
- Do not include explanations

Return ONLY valid JSON in this format:
{
  "themes": ["theme one", "theme two", "theme three"]
}
"""


async def extract_themes(comments: List[str]) -> List[str]:
    joined = "\n".join(f"- {comment}" for comment in comments)

    response = await client.chat.completions.create(
        model=MODEL,
        temperature=0.3,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": THEMES_SYSTEM},
            {"role": "user", "content": joined},
        ],
    )

    raw = response.choices[0].message.content or ""
    data = safe_json_loads(raw)

    themes = data.get("themes", []) if isinstance(data, dict) else []

    clean_themes = []
    for theme in themes:
        if isinstance(theme, str) and theme.strip():
            clean_themes.append(theme.strip())

    return clean_themes[:5]


SUMMARY_SYSTEM = """
You are a professional insights analyst.

Write a concise 2 to 3 sentence summary of public opinion based on the comments and stats.
Be objective, specific, and useful for a business/user.
Do not use bullet points.
"""


async def generate_summary(comments: List[str], stats: Dict) -> str:
    joined = "\n".join(f"- {comment}" for comment in comments)

    context = (
        f"Stats: {stats['yes_pct']:.0f}% yes, "
        f"{stats['no_pct']:.0f}% no, "
        f"{stats['neutral_pct']:.0f}% neutral. "
        f"Sentiment: {stats['pos_pct']:.0f}% positive, "
        f"{stats['neg_pct']:.0f}% negative, "
        f"{stats['neu_pct']:.0f}% neutral."
    )

    response = await client.chat.completions.create(
        model=MODEL,
        temperature=0.5,
        messages=[
            {"role": "system", "content": SUMMARY_SYSTEM},
            {"role": "user", "content": f"{context}\n\nComments:\n{joined}"},
        ],
    )

    return (response.choices[0].message.content or "").strip()
