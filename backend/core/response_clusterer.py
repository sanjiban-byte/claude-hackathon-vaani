import os, json
from anthropic import Anthropic

_client = None

def _get_client():
    global _client
    if _client is None:
        _client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    return _client


def cluster_responses(responses: list[dict]) -> dict:
    if not responses:
        return {
            "total_responses":     0,
            "clusters":            [],
            "executive_summary":   "No responses received yet.",
            "response_by_profile": {},
        }

    profile_counts: dict[str, int] = {}
    for r in responses:
        pid = r.get("profile_id", "unknown")
        profile_counts[pid] = profile_counts.get(pid, 0) + 1

    responses_text = "\n".join(
        [f"[{r.get('profile_id','?')}] {r.get('response','')}" for r in responses]
    )

    system_prompt = """You are a civic data analyst. Output ONLY raw JSON, no markdown, no backticks, no explanation.

Return exactly this structure:
{
  "clusters": [
    {
      "theme": "short theme name",
      "count": 5,
      "percentage": 20.0,
      "demographics": ["auto_driver", "tenant"],
      "representative_quote": "one anonymised quote",
      "sentiment": "concern"
    }
  ],
  "executive_summary": "3 sentences for the ward councillor."
}

Rules:
- clusters array must have 3 to 5 items
- sentiment must be one of: concern, support, mixed
- percentage is count divided by total responses times 100
- Start your response with { and end with }"""

    user_message = f"""Total responses: {len(responses)}

Responses:
{responses_text[:3000]}

Identify 3-5 themes. Return raw JSON only."""

    client   = _get_client()
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1500,
        system=system_prompt,
        messages=[{"role": "user", "content": user_message}],
    )

    raw = response.content[0].text.strip()

    # aggressive cleaning
    if "```" in raw:
        parts = raw.split("```")
        for part in parts:
            part = part.strip()
            if part.startswith("json"):
                part = part[4:].strip()
            if part.startswith("{"):
                raw = part
                break

    # find first { and last }
    start = raw.find("{")
    end   = raw.rfind("}")
    if start != -1 and end != -1:
        raw = raw[start:end+1]

    try:
        result = json.loads(raw)
        if "clusters" not in result:
            result["clusters"] = []
        if "executive_summary" not in result:
            result["executive_summary"] = "Summary unavailable."
    except json.JSONDecodeError as e:
        print(f"⚠️  Cluster JSON parse failed: {e}\nRaw: {raw[:300]}")
        result = {
            "clusters":          [],
            "executive_summary": "Could not parse response clusters — try refreshing.",
        }

    result["total_responses"]     = len(responses)
    result["response_by_profile"] = profile_counts
    return result