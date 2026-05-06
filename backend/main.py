import os, json
from pathlib import Path
from contextlib import asynccontextmanager

import shutil
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

from core.rag               import ingest_pdfs, query_rag
from core.impact_extractor  import extract_impacts
from core.question_generator import generate_questions
from core.response_clusterer import cluster_responses
from core.silence_detector   import detect_silence

from core.pdf_generator import generate_brief_pdf


# In-memory cache
_impacts_cache: list[dict] = []
_impacts_cache_source: str = ""

# ── paths ───────────────────────────────────────────────────────────────────
BASE_DIR  = Path(__file__).resolve().parent
DATA_DIR  = BASE_DIR / "data"
PDF_DIR   = DATA_DIR / "pdfs"

def _load_json(filename: str):
    path = DATA_DIR / filename
    if not path.exists():
        return None
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

# ── startup ─────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Vaani backend starting up...")
    try:
        n = ingest_pdfs(force=False)
        print(f"✅ RAG index ready — {n} chunks")
    except Exception as e:
        print(f"⚠️  RAG ingestion warning: {e}")
    yield
    print("👋 Vaani backend shutting down.")

app = FastAPI(title="Vaani API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── request / response models ────────────────────────────────────────────────
class QueryRequest(BaseModel):
    question: str
    language: str = "English"   # "English" | "Hindi" | "Marathi"

class QuestionsRequest(BaseModel):
    profile_id: str
    language:   str = "English"

class SubmitResponseRequest(BaseModel):
    profile_id: str
    responses:  list[str]   # citizen's answers to the 3 questions

# ── health ───────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "ok", "service": "Vaani Democratic Signal Engine"}

@app.get("/health")
def health():
    return {"status": "healthy"}

# ── ward info ────────────────────────────────────────────────────────────────
@app.get("/ward")
def get_ward_info():
    """Return ward metadata including active proposal stage."""
    demographics = _load_json("ward_demographics.json")
    if not demographics:
        raise HTTPException(status_code=404, detail="Ward demographics not found.")
    return demographics

@app.get("/profiles")
def get_profiles():
    """Return all citizen profiles for the ward selector."""
    profiles = _load_json("profiles.json")
    if not profiles:
        raise HTTPException(status_code=404, detail="Profiles not found.")
    return profiles

# ── RAG query ─────────────────────────────────────────────────────────────────
@app.post("/query")
def query(req: QueryRequest):
    """
    Ask a question about the ward's budget/policy documents.
    Returns a plain-language answer with source citations.
    """
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
    try:
        result = query_rag(req.question, language=req.language)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── impacts ──────────────────────────────────────────────────────────────────
@app.get("/impacts")
def get_impacts():
    """
    Extract citizen impact categories from the ward PDF(s).
    Result is derived from the first PDF in the pdfs/ folder.
    """
    import pdfplumber
    pdf_files = list(PDF_DIR.glob("*.pdf"))
    if not pdf_files:
        raise HTTPException(status_code=404, detail="No PDF found.")

    # read first 3 pages for impact extraction (enough context, low cost)
    text_sample = ""
    with pdfplumber.open(pdf_files[0]) as pdf:
        for page in pdf.pages[:5]:
            t = page.extract_text()
            if t:
                text_sample += t + "\n"

    try:
        impacts = extract_impacts(text_sample)
        return {"impacts": impacts, "source": pdf_files[0].name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── personalised questions ────────────────────────────────────────────────────
@app.post("/questions")
def get_questions(req: QuestionsRequest):
    global _impacts_cache, _impacts_cache_source

    profiles = _load_json("profiles.json")
    if not profiles:
        raise HTTPException(status_code=404, detail="Profiles not found.")
    profile = next((p for p in profiles if p["id"] == req.profile_id), None)
    if not profile:
        raise HTTPException(status_code=404, detail=f"Profile '{req.profile_id}' not found.")

    # use cached impacts if available — only re-extract if PDF changed
    pdf_files = list(PDF_DIR.glob("*.pdf"))
    cache_key = "_".join(sorted(f.name for f in pdf_files))

    if not _impacts_cache or _impacts_cache_source != cache_key:
        import pdfplumber
        text_sample = ""
        if pdf_files:
            with pdfplumber.open(pdf_files[0]) as pdf:
                for page in pdf.pages[:5]:
                    t = page.extract_text()
                    if t:
                        text_sample += t + "\n"
        _impacts_cache = extract_impacts(text_sample) if text_sample else []
        _impacts_cache_source = cache_key
        print(f"✅ Impacts extracted and cached ({len(_impacts_cache)} items)")
    else:
        print("⚡ Using cached impacts — skipping extraction")

    try:
        questions = generate_questions(profile, _impacts_cache, language=req.language)
        return {"profile": profile, "questions": questions, "language": req.language}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── submit citizen response ───────────────────────────────────────────────────
@app.post("/submit")
def submit_response(req: SubmitResponseRequest):
    """
    Accepts a citizen's answers and appends them to responses.json.
    Returns confirmation.
    """
    responses_path = DATA_DIR / "responses.json"
    if responses_path.exists():
        with open(responses_path, "r", encoding="utf-8") as f:
            all_responses = json.load(f)
    else:
        all_responses = []

    from datetime import datetime
    for ans in req.responses:
        all_responses.append({
            "profile_id":   req.profile_id,
            "response":     ans,
            "submitted_at": datetime.now().isoformat(),
        })

    with open(responses_path, "w", encoding="utf-8") as f:
        json.dump(all_responses, f, ensure_ascii=False, indent=2)

    return {
        "status":  "recorded",
        "message": "Your response has been recorded and will be included in the ward brief.",
    }

# ── government brief ──────────────────────────────────────────────────────────
@app.get("/brief")
def get_brief():
    """
    Generate the full government brief:
    - Response clusters
    - Silence detection flags
    - Ward metadata
    """
    responses    = _load_json("responses.json") or []
    demographics = _load_json("ward_demographics.json")
    if not demographics:
        raise HTTPException(status_code=404, detail="Ward demographics not found.")

    try:
        clusters = cluster_responses(responses)
        silence  = detect_silence(responses, demographics)

        return {
            "ward":         demographics.get("ward_name", "G/North"),
            "ward_code":    demographics.get("ward", "4090"),
            "proposal":     demographics.get("active_proposal", {}),
            "clusters":     clusters,
            "silence":      silence,
            "generated_at": __import__("datetime").datetime.now().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
from fastapi.responses import Response

@app.get("/brief/pdf")
def download_brief_pdf():
    responses    = _load_json("responses.json") or []
    demographics = _load_json("ward_demographics.json")
    if not demographics:
        raise HTTPException(status_code=404, detail="Ward demographics not found.")
    try:
        clusters  = cluster_responses(responses)
        silence   = detect_silence(responses, demographics)
        brief = {
            "ward":         demographics.get("ward_name", "G/North"),
            "ward_code":    demographics.get("ward", "4090"),
            "proposal":     demographics.get("active_proposal", {}),
            "clusters":     clusters,
            "silence":      silence,
            "generated_at": __import__("datetime").datetime.now().isoformat(),
        }
        pdf_bytes = generate_brief_pdf(brief)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="vaani_brief_{brief["ward_code"]}.pdf"'}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
import shutil
from fastapi import UploadFile, File

@app.post("/admin/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """
    Upload a new policy PDF. Saves to pdfs/ folder and re-ingests into Chroma.
    This is the update pipeline — turns Vaani from a demo into a live product.
    """
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files accepted.")
    
    save_path = PDF_DIR / file.filename
    with open(save_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    
    try:
        # force re-ingestion with the new PDF included
        chunk_count = ingest_pdfs(force=True)
        return {
            "status":      "success",
            "filename":    file.filename,
            "message":     f"PDF uploaded and indexed. Total chunks in DB: {chunk_count}",
            "total_chunks": chunk_count,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload succeeded but ingestion failed: {e}")
    
    # reset impacts cache so next question generation re-extracts
    global _impacts_cache, _impacts_cache_source
    _impacts_cache = []
    _impacts_cache_source = ""