import os, json
from anthropic import Anthropic

_client = None

def _get_client():
    global _client
    if _client is None:
        _client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    return _client


def generate_questions(
    citizen_profile: dict,
    impacts: list[dict],
    language: str = "English",
) -> list[dict]:
    """
    Given a citizen profile and list of impacts, generate 3 personalised
    trade-off questions for that citizen.

    Returns list of question objects:
        [
            {
                "question":    str,
                "option_a":    str,
                "option_b":    str,
                "context":     str,   # 1-sentence why this matters to them
                "impact_area": str    # e.g. "Roads", "SWM", "Health"
            },
            ...
        ]
    """
    # filter impacts relevant to this citizen
    occupation   = citizen_profile.get("occupation", "")
    housing      = citizen_profile.get("housing", "")
    age_bracket  = citizen_profile.get("age_bracket", "")

    lang_instruction = (
        "Write all questions and options in Hindi (Devanagari script)."
        if language == "Hindi"
        else "Write all questions and options in Marathi (Devanagari script)."
        if language == "Marathi"
        else "Write all questions and options in English."
    )

    system_prompt = f"""You are generating civic consultation questions for a specific Mumbai resident.
Your questions must feel PERSONAL — not generic survey questions.
Each question presents a real trade-off with real consequences for THIS specific person.
Use simple language (8th grade reading level). No political framing. No leading language.
{lang_instruction}

Output ONLY a valid JSON array of exactly 3 objects. No preamble, no markdown fences.
Each object must have exactly these keys:
- question (string): the trade-off question, addressed directly to the person
- option_a (string): first choice, 1 sentence with consequences
- option_b (string): second choice, 1 sentence with consequences
- context (string): 1 sentence explaining why this budget decision affects them specifically
- impact_area (string): short label e.g. "Roads", "Solid Waste", "Health", "Markets", "Slums" """

    user_message = f"""Citizen profile:
{json.dumps(citizen_profile, indent=2)}

Policy impacts from the ward budget document:
{json.dumps(impacts[:6], indent=2)}

Generate 3 personalised trade-off questions for this citizen.
Each question must be about something that DIRECTLY affects their daily life
given their occupation ({occupation}), housing ({housing}), and age ({age_bracket})."""

    client = _get_client()
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1000,
        system=system_prompt,
        messages=[{"role": "user", "content": user_message}],
    )

    raw = response.content[0].text.strip()

    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    try:
        questions = json.loads(raw)
        if not isinstance(questions, list):
            questions = []
    except json.JSONDecodeError:
        questions = []

    return questions[:3]