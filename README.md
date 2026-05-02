# CommentSurvey AI

> Turn social media comments into structured survey insights using AI.

---

## What it does

Paste any batch of comments (from Facebook, YouTube, TikTok, etc.) and the app will:

- Classify each comment as **Yes / No / Neutral** (opinion)
- Detect **Positive / Negative / Neutral** sentiment
- Generate a **percentage breakdown** with charts
- Extract **3–5 key themes**
- Write an **AI summary paragraph** of public opinion

---

## Tech Stack

| Layer    | Tech                        |
|----------|-----------------------------|
| Frontend | Next.js 14 · Tailwind CSS · Chart.js |
| Backend  | Python 3.11 · FastAPI       |
| AI       | OpenAI GPT-4o mini          |

---

## Project Structure

```
commentsurvey-ai/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app + CORS
│   │   ├── models.py            # Pydantic request/response models
│   │   ├── routes/
│   │   │   └── analyze.py       # POST /api/analyze
│   │   └── services/
│   │       └── ai_service.py    # OpenAI calls
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx
    │   │   ├── page.tsx         # Main UI
    │   │   └── globals.css
    │   ├── components/
    │   │   ├── ResultsDashboard.tsx
    │   │   ├── OpinionChart.tsx
    │   │   ├── SentimentChart.tsx
    │   │   ├── ThemesPanel.tsx
    │   │   ├── SummaryCard.tsx
    │   │   ├── StatCard.tsx
    │   │   └── Spinner.tsx
    │   └── lib/
    │       ├── api.ts            # fetch wrapper
    │       └── types.ts          # TypeScript types
    ├── package.json
    └── .env.local.example
```

---

## Setup & Run

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- An **OpenAI API key** → https://platform.openai.com/api-keys

---

### 1 — Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set your OpenAI key
cp .env.example .env
# Edit .env and set: OPENAI_API_KEY=sk-...

# Start the server
uvicorn app.main:app --reload --port 8000
```

Backend will be live at: http://localhost:8000
API docs (Swagger UI): http://localhost:8000/docs

---

### 2 — Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure API URL
cp .env.local.example .env.local
# Default is http://localhost:8000 — no change needed for local dev

# Start dev server
npm run dev
```

Frontend will be live at: http://localhost:3000

---

## API Reference

### `POST /api/analyze`

**Request:**
```json
{
  "comments": [
    "Yes this product is amazing!",
    "No I didn't like it at all.",
    "Maybe it's okay but expensive."
  ]
}
```

**Response:**
```json
{
  "yes_percentage": 33.3,
  "no_percentage": 33.3,
  "neutral_percentage": 33.3,
  "sentiment": {
    "positive": 33.3,
    "negative": 33.3,
    "neutral": 33.3
  },
  "themes": ["product quality", "pricing concerns", "customer satisfaction"],
  "summary": "Opinions are evenly split...",
  "total_comments": 3
}
```

---

## Example Test Data

```
Yes this product is absolutely amazing! Worth every penny.
No I didn't like it, the quality was terrible and it broke after a week.
Maybe it's okay but it's a bit expensive for what you get.
Definitely yes! Best purchase I've made all year.
No way, the customer service was awful and shipping took forever.
Yes, I would totally recommend this to my friends and family.
Not sure honestly, it has pros and cons. The design is nice though.
No, very disappointed. The description was misleading.
Yes! Works exactly as described. Very happy with my order.
Neutral on this one - it does the job but nothing special.
Absolutely yes, game changer for me!
No, I returned it. Didn't meet my expectations at all.
```

Click "Load example →" in the UI to paste this automatically.

---

## Deployment Notes

- Backend: Deploy to **Railway**, **Render**, or any VPS with `uvicorn app.main:app --host 0.0.0.0 --port 8000`
- Frontend: Deploy to **Vercel** — set `NEXT_PUBLIC_API_URL` to your backend URL
- Update `allow_origins` in `backend/app/main.py` to include your production domain

---

## Cost Estimate

Using GPT-4o mini: ~$0.001–0.003 per batch of 20 comments. Very cheap for an MVP.
