# Resume Matcher — AI-Powered JD Fit Analyzer

An end-to-end AI tool that semantically matches your resume against a job description, extracts skills with priority classification, computes a weighted match score, and generates actionable improvement suggestions.

![Match Analysis Screenshot](screenshots/match-analysis.png)

## Features

- **Resume Upload** — drag-and-drop PDF or paste text
- **JD Upload** — drag-and-drop PDF or paste text
- **Skill Extraction** — LLaMA 3 via Groq API extracts skills from both resume and JD
- **Priority Classification** — JD skills tagged as `required`, `preferred`, or `nice_to_have` based on JD language cues
- **Weighted Match Score** — required skills weighted 1.0, preferred 0.6, nice-to-have 0.3
- **Semantic Matching** — sentence-transformers (`all-MiniLM-L6-v2`) catches skill synonyms beyond exact keyword overlap
- **Gap Analysis** — missing skills shown with priority badges (red/amber/gray)
- **AI Suggestions** — LLM-generated, resume-aware improvement suggestions
- **Download Report** — export analysis as `.txt`

## Tech Stack

### Backend
| Tech | Purpose |
|------|---------|
| Python + FastAPI | REST API server |
| LangChain + Groq API | LLM orchestration (LLaMA 3.3 70B) |
| pdfplumber | PDF text extraction |
| sentence-transformers | Semantic skill similarity |
| scikit-learn | Cosine similarity scoring |
| Pydantic | Structured LLM output parsing |

### Frontend
| Tech | Purpose |
|------|---------|
| React + TypeScript | UI framework |
| Lovable | AI-assisted frontend builder |
| shadcn/ui | Component library |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| lucide-react | Icons |

## Architecture

```
React Frontend (Lovable)
        │
        │ POST /upload-resume (multipart PDF)
        │ POST /analyze (resume_text + jd_text)
        ▼
FastAPI Backend
        │
        ├── pdfplumber → extract text from PDF
        ├── LangChain + Groq (LLaMA 3) → extract skills from resume
        ├── LangChain + Groq (LLaMA 3) → extract + classify JD skills by priority
        └── sentence-transformers → semantic match scoring
```

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Groq API key → [console.groq.com](https://console.groq.com)

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
```

Create a `.env` file:
```
GROQ_API_KEY=your_groq_api_key_here
```

Start the server:
```bash
python -m uvicorn main:app --reload
```

API runs at `http://localhost:8000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Set environment variable:
```
VITE_API_URL=http://localhost:8000
```

Frontend runs at `http://localhost:8080`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/upload-resume` | Extract text from PDF (multipart) |
| POST | `/analyze` | Full resume-JD analysis |

### POST `/analyze` — Request
```json
{
  "resume_text": "string",
  "jd_text": "string"
}
```

### POST `/analyze` — Response
```json
{
  "match_score": 72,
  "matched_skills": ["Python", "FastAPI", "LangChain"],
  "missing_skills": [
    { "skill": "React", "priority": "preferred" },
    { "skill": "Docker", "priority": "nice_to_have" }
  ],
  "resume_skills": ["Python", "FastAPI", "LangChain", "SQL"],
  "jd_skills": [
    { "skill": "Python", "priority": "required" },
    { "skill": "React", "priority": "preferred" }
  ],
  "suggestions": [
    "⚠ 'React' is a preferred skill — consider adding frontend project experience."
  ],
  "experience_summary": "1 year AI engineering experience",
  "education_summary": "B.E. Computer Science, GTU"
}
```

## Project Structure

```
resume-matcher/
├── backend/
│   ├── main.py              # FastAPI app, endpoints
│   ├── models.py            # Pydantic data models
│   ├── skill_extractor.py   # LangChain + Groq prompts
│   ├── matcher.py           # Scoring + semantic matching
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── routes/index.tsx
│   │   ├── components/resume/
│   │   │   ├── UploadSection.tsx
│   │   │   ├── ResultsDashboard.tsx
│   │   │   ├── ScoreGauge.tsx
│   │   │   ├── SkillBadge.tsx
│   │   │   └── SuggestionCard.tsx
│   │   └── lib/resume-api.ts
│   └── ...
├── screenshots/
├── README.md
└── .gitignore
```

## How Match Score is Calculated

The score uses a **weighted hybrid approach**:

1. **Keyword matching** — exact skill name overlap (case-insensitive)
2. **Semantic matching** — `all-MiniLM-L6-v2` embeddings catch synonyms (threshold: 0.75 cosine similarity)
3. **Priority weighting** — required=1.0, preferred=0.6, nice_to_have=0.3

```
Score = (Σ weight of matched skills) / (Σ weight of all JD skills) × 100
```

This means missing a "nice to have" barely affects the score, while missing a "required" skill has maximum impact.

## Built By

**Vrunda Babariya** — AI Engineer  
[LinkedIn](https://linkedin.com/in/vrunda-babariya) · [GitHub](https://github.com/vrunda-31)  
B.E. Computer Science, New L.J. Institute of Engineering & Technology, GTU (CGPA: 9.18)
