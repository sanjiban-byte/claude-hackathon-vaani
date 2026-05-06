"""
Silence Detector — pure Python, no LLM.

Compares expected response counts (from ward demographic data)
against actual responses received, and flags underrepresented groups.
"""

CRITICAL_THRESHOLD = 5.0   # % — below this → 🔴 critical
LOW_THRESHOLD      = 25.0  # % — below this → 🟡 low participation

# Expected participation rate for a ward consultation (realistic baseline)
EXPECTED_PARTICIPATION_RATE = 0.02   # 2% of each group


def detect_silence(
    responses: list[dict],
    ward_demographics: dict,
) -> dict:
    """
    Parameters
    ----------
    responses : list of response dicts with "profile_id" key
    ward_demographics : the ward_demographics.json object

    Returns
    -------
    {
        "flags": [
            {
                "profile_id":       str,
                "label":            str,
                "estimated_count":  int,
                "expected_min":     int,
                "actual_responses": int,
                "participation_pct": float,
                "status":           "critical" | "low" | "adequate",
                "status_emoji":     "🔴" | "🟡" | "✅",
                "message":          str
            }
        ],
        "overall_silence_score": float,   # 0-100, higher = more silent
        "summary": str
    }
    """
    groups      = ward_demographics.get("groups", {})
    total_pop   = ward_demographics.get("total_population", 1)
    ward_name   = ward_demographics.get("ward_name", "this ward")

    # count actual responses per profile_id
    actual: dict[str, int] = {}
    for r in responses:
        pid = r.get("profile_id", "unknown")
        actual[pid] = actual.get(pid, 0) + 1

    flags = []
    silence_scores = []

    for profile_id, group_data in groups.items():
        estimated_count = group_data.get("estimated_count", 0)
        label           = group_data.get("label", profile_id)
        expected_min    = max(1, int(estimated_count * EXPECTED_PARTICIPATION_RATE))
        actual_count    = actual.get(profile_id, 0)

        if expected_min > 0:
            pct = round((actual_count / expected_min) * 100, 1)
        else:
            pct = 100.0

        pct = min(pct, 100.0)   # cap at 100%

        if pct < CRITICAL_THRESHOLD:
            status = "critical"
            emoji  = "🔴"
            msg    = (
                f"Only {actual_count} response(s) from an estimated {estimated_count:,} "
                f"{label} in {ward_name}. "
                f"Decision-makers have almost no signal from this group. "
                f"Reason unknown — could be low awareness, access barrier, or satisfaction."
            )
        elif pct < LOW_THRESHOLD:
            status = "low"
            emoji  = "🟡"
            msg    = (
                f"{actual_count} response(s) received from ~{estimated_count:,} {label}. "
                f"Participation is below expected. "
                f"Recommend outreach before the General Body Meeting vote."
            )
        else:
            status = "adequate"
            emoji  = "✅"
            msg    = (
                f"{actual_count} response(s) from ~{estimated_count:,} {label}. "
                f"Participation is within acceptable range."
            )

        silence_scores.append(100.0 - pct)
        flags.append({
            "profile_id":        profile_id,
            "label":             label,
            "estimated_count":   estimated_count,
            "expected_min":      expected_min,
            "actual_responses":  actual_count,
            "participation_pct": pct,
            "status":            status,
            "status_emoji":      emoji,
            "message":           msg,
        })

    # sort: critical first, then low, then adequate
    order = {"critical": 0, "low": 1, "adequate": 2}
    flags.sort(key=lambda x: order[x["status"]])

    overall_silence_score = round(sum(silence_scores) / len(silence_scores), 1) if silence_scores else 0.0

    critical_groups = [f["label"] for f in flags if f["status"] == "critical"]
    low_groups      = [f["label"] for f in flags if f["status"] == "low"]

    if critical_groups:
        summary = (
            f"⚠️ Critical silence from: {', '.join(critical_groups)}. "
            f"Any decision made now is made without their input. "
            f"These groups must be contacted before the GBM vote."
        )
    elif low_groups:
        summary = (
            f"Low participation from: {', '.join(low_groups)}. "
            f"Outreach recommended before finalising the ward brief."
        )
    else:
        summary = "All groups have adequate representation in the current responses."

    return {
        "flags":                 flags,
        "overall_silence_score": overall_silence_score,
        "summary":               summary,
    }