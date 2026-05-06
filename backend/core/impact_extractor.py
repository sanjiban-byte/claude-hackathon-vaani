import os, json
from anthropic import Anthropic

_client = None

def _get_client():
    global _client
    if _client is None:
        _client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    return _client


def extract_impacts(policy_text: str) -> list[dict]:
    """
    Given raw policy/budget text, return a JSON list of citizen impact objects.

    Each object:
        {
            "citizen_category":   str,
            "impact_type":        "positive" | "negative" | "neutral",
            "impact_description": str,   # 1-2 plain-language sentences
            "severity":           "high" | "medium" | "low",
            "budget_line":        str    # relevant budget item if found
        }
    """
    system_prompt = """You are a civic policy analyst.
Read the government budget/policy document and identify which citizen groups are affected.
Output ONLY a valid JSON array. No preamble, no explanation, no markdown fences.

Each object must have exactly these keys:
- citizen_category (string): e.g. "Auto Rickshaw Drivers", "Street Vendors", "Slum Residents"
- impact_type (string): one of "positive", "negative", "neutral"
- impact_description (string): 1-2 plain sentences a 10-year-old could understand
- severity (string): one of "high", "medium", "low"
- budget_line (string): the specific budget item/programme that causes this impact, or "" if not found"""

    user_message = f"""Analyse this ward budget document and identify citizen impacts:

{policy_text[:4000]}

Focus on: auto drivers, street vendors, slum residents, market vendors,
homeowners, tenants, elderly residents, schoolchildren, patients/health users."""

    client = _get_client()
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1500,
        system=system_prompt,
        messages=[{"role": "user", "content": user_message}],
    )

    raw = response.content[0].text.strip()

    # strip accidental markdown fences
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    try:
        impacts = json.loads(raw)
        if not isinstance(impacts, list):
            impacts = []
    except json.JSONDecodeError:
        impacts = []

    return impacts