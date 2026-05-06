import os
import pdfplumber
from pathlib import Path
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from anthropic import Anthropic

# ── paths ──────────────────────────────────────────────────────────────────
BASE_DIR   = Path(__file__).resolve().parent.parent
PDF_DIR    = BASE_DIR / "data" / "pdfs"
CHROMA_DIR = BASE_DIR / "chroma_db"

# ── singleton objects (loaded once at startup) ─────────────────────────────
_embeddings  = None
_vectorstore = None
_client      = None


def _get_embeddings():
    global _embeddings
    if _embeddings is None:
        print("⏳ Loading HuggingFace embeddings model (first run downloads ~80 MB)...")
        _embeddings = HuggingFaceEmbeddings(
            model_name="all-MiniLM-L6-v2",
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},
        )
        print("✅ Embeddings model ready.")
    return _embeddings


def _get_client():
    global _client
    if _client is None:
        _client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    return _client


# ── ingestion ──────────────────────────────────────────────────────────────

def ingest_pdfs(force: bool = False) -> int:
    """
    Parse every PDF in PDF_DIR, chunk, embed, and store in Chroma.
    Skips ingestion if Chroma DB already exists unless force=True.
    Returns number of chunks stored.
    """
    global _vectorstore

    if CHROMA_DIR.exists() and any(CHROMA_DIR.iterdir()) and not force:
        print("✅ Chroma DB already exists — loading existing index.")
        _vectorstore = Chroma(
            persist_directory=str(CHROMA_DIR),
            embedding_function=_get_embeddings(),
        )
        return _vectorstore._collection.count()

    pdf_files = list(PDF_DIR.glob("*.pdf"))
    if not pdf_files:
        raise FileNotFoundError(f"No PDFs found in {PDF_DIR}. Drop your BMC PDF there first.")

    print(f"📄 Found {len(pdf_files)} PDF(s). Starting ingestion...")

    all_chunks   = []
    all_metadata = []

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=100,
        separators=["\n\n", "\n", ".", " ", ""],
    )

    for pdf_path in pdf_files:
        print(f"  → Parsing: {pdf_path.name}")
        raw_pages = []

        with pdfplumber.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages, start=1):
                text = page.extract_text()
                if text and text.strip():
                    raw_pages.append((page_num, text.strip()))

        # chunk each page's text
        for page_num, page_text in raw_pages:
            chunks = splitter.split_text(page_text)
            for chunk in chunks:
                all_chunks.append(chunk)
                all_metadata.append({
                    "source":   pdf_path.name,
                    "page":     page_num,
                    "ward":     "G/North",
                    "doc_type": "BMC Budget",
                })

    print(f"  → Total chunks: {len(all_chunks)}")

    _vectorstore = Chroma.from_texts(
        texts=all_chunks,
        embedding=_get_embeddings(),
        metadatas=all_metadata,
        persist_directory=str(CHROMA_DIR),
    )
    _vectorstore.persist()
    print(f"✅ Ingestion complete. {len(all_chunks)} chunks stored in Chroma.")
    return len(all_chunks)


def _get_vectorstore() -> Chroma:
    global _vectorstore
    if _vectorstore is None:
        ingest_pdfs()
    return _vectorstore


# ── query ──────────────────────────────────────────────────────────────────

def query_rag(question: str, language: str = "English") -> dict:
    """
    Retrieve top-5 chunks relevant to `question` and generate a
    plain-language answer using Claude Sonnet.

    Returns:
        {
            "answer":   str,
            "sources":  [{"source": str, "page": int, "excerpt": str}],
            "language": str
        }
    """
    vs = _get_vectorstore()

    # retrieve
    docs = vs.similarity_search(question, k=5)
    if not docs:
        return {
            "answer":  "I could not find relevant information in the ward documents.",
            "sources": [],
            "language": language,
        }

    context_blocks = []
    sources        = []
    for i, doc in enumerate(docs, start=1):
        src  = doc.metadata.get("source", "Unknown")
        page = doc.metadata.get("page", "?")
        excerpt = doc.page_content[:200].replace("\n", " ")
        context_blocks.append(
            f"[Source {i}: {src}, page {page}]\n{doc.page_content}"
        )
        sources.append({"source": src, "page": page, "excerpt": excerpt})

    context = "\n\n---\n\n".join(context_blocks)

    lang_instruction = (
        "Respond in Hindi (Devanagari script)." if language == "Hindi"
        else "Respond in Marathi (Devanagari script)." if language == "Marathi"
        else "Respond in English."
    )

    system_prompt = f"""You are a civic information assistant for Mumbai G/North Ward (Dharavi) residents.
Answer the citizen's question using ONLY the context provided below.
Always cite the document name and page number you are drawing from.
If the answer is not in the context, say so clearly — do not make up information.
Respond in simple, plain language that anyone can understand.
{lang_instruction}
Keep your answer under 150 words."""

    user_message = f"""Context from ward documents:

{context}

Citizen's question: {question}"""

    client   = _get_client()
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=512,
        system=system_prompt,
        messages=[{"role": "user", "content": user_message}],
    )

    return {
        "answer":   response.content[0].text,
        "sources":  sources,
        "language": language,
    }