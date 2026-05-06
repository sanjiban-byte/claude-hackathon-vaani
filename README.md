# Vaani — Democratic Signal Engine

WebApp Link: https://vaani-neon.vercel.app
API: https://claude-hackathon-vaani-production.up.railway.app
API Docs: https://claude-hackathon-vaani-production.up.railway.app/docs

> *Structured citizen voice reaching the decisions that affect their lives.*

Built for the **AIC × Anthropic Claude Hackathon 2025** · Track 4: Governance & Collaboration

---

## The Problem

India does not lack technology. It lacks the interface between citizens and government decisions.

A bill gets proposed. Citizens don't know. No one asks them. The decision gets made without their input. Kiran the auto driver loses his livelihood without ever being consulted. This happens at every level of government, every day.

The numbers behind this:
- **59%** of people across 24 countries believe their government doesn't care what they think *(Pew Research, 2023)*
- India's **74th Amendment** (1992) mandated ward-level citizen participation — it is 33 years old and functionally unimplemented
- In **78%** of South Asian flood responses, aid was shaped by political proximity, not documented need — because no structured channel existed *(Int'l Journal of Disaster Risk Reduction, 2021)*
- Structured trade-off questions produce consensus in **70%** of cases that appear as intractable conflict — polarisation is partly an interface problem *(vTaiwan/Polis, 2014–2018)*

---

## What Vaani Does

Vaani is a **two-speed democratic signal engine**. One shared AI core, two interfaces, one purpose — structured citizen voice reaching the decisions that affect their lives.

### Legislative Mode *(slow democracy — weeks)*
A ward policy is proposed → Vaani parses the document → identifies who is affected → generates personalised trade-off questions per citizen profile → collects structured responses → detects silence → produces a structured brief for government before the vote.

### Crisis Mode *(fast democracy — hours)*
Same engine, compressed time window. Voice-first input. Real-time clustering. Brief regenerated every 3 hours. Designed for floods, public health emergencies, communal incidents — situations where the standard consultation timeline collapses but democratic accountability still matters.

---

## Live Demo

**Ward:** G/North Ward (Area Code 4090), Dharavi, Mumbai  
**Data:** 3 years of real BMC budget PDFs (2022-23, 2023-24, 2025-26)  
**Proposal:** Dharavi Road Widening & Auto Stand Relocation Proposal

---

## Architecture

```
INPUT LAYER
├── BMC / Govt PDFs (legislative mode)
├── Admin upload pipeline (new proposals → instant re-ingestion)
├── Citizen profile JSON (demographic seed data)
└── Ward demographic data (for silence detection)

AI CORE — shared engine, two speeds
├── PDF Parser + Hybrid RAG (BM25 + Vector)
├── Impact Extractor (Claude Haiku)
├── Question Generator (Claude Sonnet)
├── Response Clusterer (Claude Haiku)
└── Silence Detector (pure Python — no LLM)

OUTPUT LAYER
├── Citizen View → personalised Q&A, scheme matching, RAG, submissions
└── Government View → structured brief, silence flags, PDF export
```

### The Transparency Guarantee
Every brief sent to government is simultaneously published on the citizen-facing side. Suppression is architecturally impossible — any citizen can verify what was sent on their behalf.

---

## AI Stack

### Claude API (Anthropic)

| Module | Model | Purpose |
|---|---|---|
| RAG Q&A | `claude-sonnet-4-20250514` | Answer citizen questions with source citations from ward PDFs |
| Impact Extractor | `claude-haiku-4-5-20251001` | Parse policy document → JSON list of affected citizen categories, severity, impact type |
| Question Generator | `claude-sonnet-4-20250514` | Generate 3 personalised trade-off questions per citizen profile based on impacts |
| Response Clusterer | `claude-haiku-4-5-20251001` | Cluster citizen responses into themes → executive summary for councillor |

Why Claude specifically: Constitutional AI alignment matters for a civic tool. Claude is less likely to hallucinate policy details or generate politically leading questions — a real risk when generating consultation questions for government decisions affecting people's livelihoods.

### Hybrid RAG Pipeline — BM25 + Vector Search

The retrieval layer combines two fundamentally different search strategies:

**Vector Search (60% weight)** — Semantic similarity using HuggingFace `all-MiniLM-L6-v2` embeddings stored in ChromaDB. Finds contextually relevant chunks even when exact keywords don't match. Catches paraphrases, related concepts, and policy implications.

**BM25 Search (40% weight)** — Keyword frequency matching via `rank_bm25`. Catches exact terms: budget figures (`₹35,000`), year references (`2022-23`), fund codes (`Fund 44`), programme names (`Clean Dharavi Programme`). Pure vector search misses these because numbers and codes have no semantic neighbourhood.

The ensemble retriever merges results from both, deduplicates, and sends the top 6 unique chunks to Claude with full source citations.

```
Query → [BM25 retriever (k=5)] ──────────────┐
                                               ├──→ EnsembleRetriever → deduplicate → Claude
Query → [Vector retriever (k=5)] ────────────┘
         weights: [0.4, 0.6]
```

**Why hybrid matters:** A query like *"What was the road maintenance budget in 2022-23?"* requires matching the year string `2022-23` exactly (BM25) AND understanding that `Road Maintenance` is semantically related to infrastructure expenditure (vector). Neither alone is sufficient.

### Silence Detector — No LLM Required

The most structurally novel feature. No LLM is used here — intentionally.

```python
participation_pct = (actual_responses / expected_min) * 100

# expected_min = estimated_group_count × 0.02 (2% baseline)

if pct < 5%  → 🔴 CRITICAL SILENCE
if pct < 25% → 🟡 LOW PARTICIPATION  
if pct ≥ 25% → ✅ ADEQUATE
```

Missing data is treated as a **democratic signal**, not a gap. The system flags which groups are absent and forces government to acknowledge that silence before proceeding. No other civic tech platform does this.

The three possible interpretations of silence — low awareness, unwillingness to participate, or complete satisfaction — are explicitly surfaced in the flag message. The system does not claim to know which; it claims the silence is unverified and therefore any decision made over it is made without consent.

### HuggingFace Embeddings (Local)

`sentence-transformers/all-MiniLM-L6-v2` runs entirely locally — no API calls, no rate limits, no cost. Downloads once (~80MB), cached permanently. Converts text chunks to 384-dimensional vectors for semantic retrieval.

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| LLM | Anthropic Claude API | Sonnet for reasoning, Haiku for classification |
| Embeddings | HuggingFace `all-MiniLM-L6-v2` | Local, free, no API key needed |
| Vector DB | ChromaDB (local persistent) | Auto-persists, no separate server |
| BM25 | `rank_bm25` + LangChain BM25Retriever | Exact keyword matching |
| RAG Framework | LangChain + EnsembleRetriever | Hybrid retrieval orchestration |
| PDF Parsing | `pdfplumber` | Handles tables and multi-column layouts |
| Backend | Python + FastAPI | REST API, 8 endpoints |
| Frontend | React + Vite + Tailwind CSS | No component library, inline styles |
| PDF Generation | ReportLab | Formatted ward brief PDF export |
| Deployment | Railway / Render (free tier) | |

---

## Features

### Citizen View
- **Personalised profile system** — 5 citizen archetypes (Auto Driver, Street Vendor, Homeowner, Tenant, Senior Citizen) each generating different questions from the same policy document
- **Proposal stage bar** — real-time countdown to General Body Meeting vote
- **AI-generated trade-off questions** — Claude reads the BMC PDF, extracts impacts per demographic, generates conjoint-style questions specific to that citizen's livelihood
- **RAG Q&A** — ask anything about the proposal in plain language; answers cite specific PDF page and document
- **Hybrid search** — BM25 + vector catches both semantic queries and exact budget references
- **Government scheme matching** — profile-matched central/state schemes with eligibility indicators (✓/✗/?) and clarification modals for partial matches
- **Submission history** — track what you've submitted to the ward brief
- **Multilingual** — full UI and AI responses in English, Hindi (Devanagari), and Marathi
- **Admin PDF upload** — upload new policy documents → auto-ingested into RAG pipeline in ~30 seconds

### Government View
- **Response clustering** — citizen responses grouped into 5 concern themes with demographic breakdown, representative quotes, sentiment analysis
- **Executive summary** — 3-sentence councillor brief generated by Claude Haiku
- **Silence Detector** — identifies which demographic groups are underrepresented with participation percentages and contextual messages
- **Minority positions panel** — logged separately, cannot be dismissed or aggregated away
- **Crisis Mode toggle** — activates 30-second auto-refresh cycle with live indicator
- **PDF brief download** — formatted, branded ward brief with all data — suitable for official record

---

## Data

All ward data is real:

| File | Source | Content |
|---|---|---|
| `4090_GN-2025_26.pdf` | mcgm.gov.in | BMC G/North Ward Budget 2025-26 |
| `4090-GN-2024,25.pdf` | mcgm.gov.in | BMC G/North Ward Budget 2024-25 |
| `4090-GN-2023,24.pdf` | mcgm.gov.in | BMC G/North Ward Budget 2023-24 |
| `ward_demographics.json` | Census of India 2011 | Ward population by occupation group |
| `profiles.json` | Manual | 5 citizen archetypes with demographic fields |
| `responses.json` | Manual seed | 25 seeded citizen responses for demo |

---

## Project Structure

```
vaani/
├── backend/
│   ├── main.py                    # FastAPI app — 8 endpoints
│   ├── requirements.txt
│   ├── .env                       # ANTHROPIC_API_KEY
│   ├── data/
│   │   ├── pdfs/                  # BMC ward budget PDFs
│   │   ├── profiles.json          # 5 citizen profiles
│   │   ├── responses.json         # citizen responses (appended on submit)
│   │   └── ward_demographics.json # ward data + active proposal stage
│   └── core/
│       ├── rag.py                 # Hybrid BM25+vector RAG pipeline
│       ├── impact_extractor.py    # Claude Haiku → JSON impact list
│       ├── question_generator.py  # Claude Sonnet → 3 trade-off questions
│       ├── response_clusterer.py  # Claude Haiku → themed brief
│       ├── silence_detector.py    # Pure Python — no LLM
│       └── pdf_generator.py       # ReportLab → formatted PDF brief
│
└── frontend/
    └── src/
        ├── App.jsx                # Router + nav + language state
        └── pages/
            ├── CitizenView.jsx    # Full citizen dashboard
            └── GovernmentView.jsx # Government brief dashboard
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/ward` | Ward metadata + active proposal stage |
| GET | `/profiles` | All citizen profiles |
| POST | `/query` | RAG Q&A — hybrid search + Claude answer |
| GET | `/impacts` | Extract citizen impacts from ward PDF |
| POST | `/questions` | Generate personalised questions for profile |
| POST | `/submit` | Record citizen response to responses.json |
| GET | `/brief` | Full government brief — clusters + silence |
| GET | `/brief/pdf` | Download formatted PDF ward brief |
| POST | `/admin/upload` | Upload new PDF → auto re-ingestion |

---

## Setup & Running Locally

### Prerequisites
- Python 3.10+
- Node.js 18+
- Anthropic API key

### Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create `backend/.env`:
```
ANTHROPIC_API_KEY=your_key_here
```

Drop BMC PDFs into `backend/data/pdfs/`, then:

```bash
uvicorn main:app --reload --port 8000
```

On first run, HuggingFace downloads the embedding model (~80MB). Subsequent runs load from cache. ChromaDB ingests all PDFs automatically.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

---

## Global Inspirations

| Platform | What we learned |
|---|---|
| **vTaiwan / Polis** | Structured trade-off questions produce consensus in 70% of seemingly intractable conflicts |
| **TheyWorkForYou (UK)** | Parliamentary accountability from public record — transparency as default |
| **Porto Alegre Participatory Budgeting** | Direct citizen input into budget decisions at scale |
| **Estonia Trust Architecture** | Digital civic infrastructure as a right, not a feature |

---

## Ethical Design Principles

**No surveillance.** Citizen profiles are not stored server-side or linked to identity. Ward selector replaces login for the demo.

**Transparency is architectural, not policy.** The brief sent to government is simultaneously readable by citizens. No suppression is technically possible.

**Silence is honest.** We do not claim to know why a group is silent — only that they are, and that a decision made over that silence is unverified.

**Minority positions cannot be dismissed.** Logged separately in the government brief with a structural guarantee that they are preserved in the record regardless of majority sentiment.

**AI generates questions, not opinions.** The Question Generator is explicitly prompted to avoid political framing and leading language. Citizens choose; Vaani structures.

**Multilingual by default.** Full UI and AI responses in English, Hindi, and Marathi. Real deployment is WhatsApp-first — 500M Indians are already there.

---

## Judging Criteria Mapping

| Criterion | Points | How Vaani addresses it |
|---|---|---|
| Impact Potential | 25 | Specific people: ward residents whose voice never reached government. Clear scaling path: every ward in India has the same problem. One config change per ward. |
| Technical Execution | 30 | Working hybrid RAG + Claude API + real BMC data + live demo. Silence Detector as novel algorithm. Admin upload pipeline. Multilingual rendering. |
| Ethical Alignment | 25 | Transparency guarantee (architectural). No surveillance. Minority positions preserved. WhatsApp-first real-world deployment for equity. Honest silence framing. |
| Presentation | 20 | Kiran story as emotional anchor. Real ward data. Live demo on deployed URL. Crisis mode as described extension. |

---

## Team

Built at AIC × Anthropic Claude Hackathon 2025.

---

## License

MIT License — open for ward offices, NGOs, and civic technologists to adapt.

---

*"Every other platform helps citizens understand government. We built the first one that helps government understand citizens — and holds it accountable for what it heard."*
