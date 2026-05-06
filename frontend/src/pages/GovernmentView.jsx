import { useState, useEffect } from "react"

const API = "http://localhost:8000"

function Tag({ children, color = "#FF6B00" }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px", borderRadius: 4,
      fontSize: 11, fontWeight: 600, letterSpacing: "0.06em",
      textTransform: "uppercase", background: color + "22", color,
    }}>{children}</span>
  )
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 16, padding: "1.5rem",
      ...style
    }}>{children}</div>
  )
}

function SilenceFlag({ flag }) {
  const colors = {
    critical: { bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.3)",  text: "#EF4444", label: "CRITICAL SILENCE" },
    low:      { bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.3)", text: "#FBBF24", label: "LOW PARTICIPATION" },
    adequate: { bg: "rgba(19,136,8,0.1)",   border: "rgba(19,136,8,0.3)",   text: "#138808", label: "ADEQUATE" },
  }
  const c = colors[flag.status] || colors.adequate
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 12, padding: "14px 16px", marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>{flag.status_emoji}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{flag.label}</div>
            <div style={{ fontSize: 11, color: c.text, textTransform: "uppercase", letterSpacing: "0.06em" }}>{c.label}</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: c.text }}>{flag.participation_pct}%</div>
          <div style={{ fontSize: 10, color: "#8A9BB0" }}>participation</div>
        </div>
      </div>
      <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 4, marginBottom: 8 }}>
        <div style={{ height: "100%", borderRadius: 4, width: `${Math.min(flag.participation_pct, 100)}%`, background: c.text, transition: "width 0.6s ease" }} />
      </div>
      <div style={{ fontSize: 12, color: "#8A9BB0", lineHeight: 1.5 }}>{flag.message}</div>
      <div style={{ marginTop: 6, fontSize: 11, color: "#4A5568" }}>
        {flag.actual_responses} responses · estimated population {flag.estimated_count?.toLocaleString()}
      </div>
    </div>
  )
}

function ClusterCard({ cluster, index }) {
  const sentimentColor = { concern: "#EF4444", support: "#138808", mixed: "#FBBF24" }[cluster.sentiment] || "#8A9BB0"
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "1.25rem", marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#8A9BB0" }}>#{index + 1}</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>{cluster.theme}</div>
            <div style={{ fontSize: 11, color: sentimentColor, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>{cluster.sentiment}</div>
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>{cluster.count}</div>
          <div style={{ fontSize: 10, color: "#8A9BB0" }}>{cluster.percentage?.toFixed(0)}% of responses</div>
        </div>
      </div>
      <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 4, marginBottom: 10 }}>
        <div style={{ height: "100%", borderRadius: 4, width: `${cluster.percentage}%`, background: `linear-gradient(90deg, ${sentimentColor}88, ${sentimentColor})` }} />
      </div>
      {cluster.representative_quote && (
        <div style={{ padding: "10px 12px", borderLeft: `3px solid ${sentimentColor}`, background: "rgba(255,255,255,0.03)", borderRadius: "0 8px 8px 0", fontSize: 13, color: "#C0CDD8", fontStyle: "italic", lineHeight: 1.6, marginBottom: 10 }}>
          "{cluster.representative_quote}"
        </div>
      )}
      {cluster.demographics?.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {cluster.demographics.map(d => (
            <span key={d} style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, background: "rgba(255,255,255,0.06)", color: "#8A9BB0" }}>{d}</span>
          ))}
        </div>
      )}
    </div>
  )
}

function ResponseBar({ profileId, count, total }) {
  const labels = { auto_driver: "Auto Drivers", street_vendor: "Street Vendors", homeowner: "Homeowners", tenant: "Tenants", elderly_resident: "Senior Citizens" }
  const pct    = total > 0 ? (count / total) * 100 : 0
  const colors = ["#FF6B00", "#138808", "#3B82F6", "#8B5CF6", "#EC4899"]
  const idx    = Object.keys({ auto_driver:1, street_vendor:1, homeowner:1, tenant:1, elderly_resident:1 }).indexOf(profileId)
  const color  = colors[idx] || "#8A9BB0"
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: "#C0CDD8" }}>{labels[profileId] || profileId}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{count}</span>
      </div>
      <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 6 }}>
        <div style={{ height: "100%", borderRadius: 4, width: `${pct}%`, background: color, transition: "width 0.6s ease" }} />
      </div>
    </div>
  )
}

function AdminUpload({ onSuccess }) {
  const [uploading, setUploading] = useState(false)
  const [result, setResult]       = useState(null)
  const [error, setError]         = useState(null)

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true); setResult(null); setError(null)
    const form = new FormData()
    form.append("file", file)
    try {
      const res  = await fetch(`${API}/admin/upload`, { method: "POST", body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Upload failed")
      setResult(data)
      onSuccess()
    } catch (err) { setError(err.message) }
    finally { setUploading(false); e.target.value = "" }
  }

  return (
    <Card style={{ marginBottom: "1.5rem", borderColor: "rgba(59,130,246,0.3)", background: "rgba(59,130,246,0.04)" }}>
      <div style={{ fontSize: 11, color: "#3B82F6", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Upload New Policy Document</div>
      <p style={{ fontSize: 13, color: "#8A9BB0", lineHeight: 1.6, margin: "0 0 14px" }}>
        Upload a new BMC PDF — automatically ingested into the RAG pipeline and available for citizen Q&A immediately.
      </p>
      <label style={{ display: "inline-block", padding: "10px 20px", borderRadius: 10, background: uploading ? "rgba(255,255,255,0.06)" : "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.4)", color: uploading ? "#4A5568" : "#3B82F6", fontSize: 13, fontWeight: 600, cursor: uploading ? "not-allowed" : "pointer" }}>
        {uploading ? "⏳ Uploading & indexing…" : "📄 Choose PDF to Upload"}
        <input type="file" accept=".pdf" onChange={handleUpload} disabled={uploading} style={{ display: "none" }} />
      </label>
      {uploading && <div style={{ marginTop: 12, fontSize: 13, color: "#8A9BB0" }}>Parsing PDF → chunking → embedding → storing in vector DB…</div>}
      {result  && <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, background: "rgba(19,136,8,0.1)", border: "1px solid rgba(19,136,8,0.3)", fontSize: 13, color: "#138808" }}>✅ <strong>{result.filename}</strong> uploaded. {result.message}</div>}
      {error   && <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", fontSize: 13, color: "#EF4444" }}>❌ {error}</div>}
    </Card>
  )
}

/* ── MAIN COMPONENT ───────────────────────────────────────────────────────── */
export default function GovernmentView() {
  // ── ALL hooks at the top — no exceptions ──
  const [brief, setBrief]           = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [crisisMode, setCrisisMode] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const BRIEF_CACHE_MS = 60000  // don't re-fetch if less than 60s old

  const loadBrief = async (force = false) => {
    const now = Date.now()
    if (!force && window._vaaniBriefCache &&
        now - window._vaaniBriefCache.ts < BRIEF_CACHE_MS) {
            setBrief(window._vaaniBriefCache.data)
            setLoading(false)
            return
        }
        setLoading(true); setError(null)
        try {
            const res  = await fetch(`${API}/brief`)
            const data = await res.json()
            window._vaaniBriefCache = { data, ts: Date.now() }
            setBrief(data)
        } catch (e) { setError("Could not load brief. Is the backend running?") }
        finally { setLoading(false) }
    }
    
    useEffect(() => { loadBrief() }, [])
    
    useEffect(() => {
        if (!crisisMode) return
        const interval = setInterval(() => { loadBrief(); setLastRefresh(new Date()) }, 30000)
        return () => clearInterval(interval)
    }, [crisisMode])

  // ── early returns AFTER all hooks ──
  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: 16 }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid rgba(19,136,8,0.3)", borderTopColor: "#138808", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{ fontSize: 13, color: "#8A9BB0" }}>Generating ward brief…</div>
    </div>
  )

  if (error) return (
    <div style={{ maxWidth: 600, margin: "4rem auto", padding: "0 1.5rem", textAlign: "center" }}>
      <div style={{ fontSize: 14, color: "#EF4444" }}>{error}</div>
    </div>
  )

  if (!brief) return null

  const { clusters, silence, proposal } = brief
  const totalResponses = clusters?.total_responses || 0
  const profileCounts  = clusters?.response_by_profile || {}
  const silenceFlags   = silence?.flags || []
  const clusterList    = clusters?.clusters || []
  const criticalCount  = silenceFlags.filter(f => f.status === "critical").length

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>

      {/* Admin upload */}
      <AdminUpload onSuccess={loadBrief} />

      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
          <Tag color="#138808">Government View</Tag>
          <Tag color="#8A9BB0">Ward G/North · 4090</Tag>
          {criticalCount > 0 && <Tag color="#EF4444">⚠ {criticalCount} Critical Silence Flags</Tag>}
          {crisisMode && <Tag color="#EF4444">🚨 Crisis Mode Active</Tag>}
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 700, color: "#fff", margin: "8px 0 6px", lineHeight: 1.2, letterSpacing: "-0.5px" }}>
          Ward Consultation Brief
        </h1>
        {proposal && (
          <div style={{ fontSize: 14, color: "#8A9BB0" }}>
            {proposal.title} · <span style={{ color: "#FF6B00" }}>Stage: {proposal.stage}</span>
            {proposal.days_until_gbm && ` · ${proposal.days_until_gbm} days to GBM vote`}
          </div>
        )}
      </div>

      {/* Crisis banner */}
      {crisisMode && (
        <div style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.5)", borderRadius: 10, padding: "12px 16px", marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <style>{`@keyframes blink { 50% { opacity: 0 } }`}</style>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>🚨</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#EF4444" }}>CRISIS MODE ACTIVE — G/North Ward</div>
              <div style={{ fontSize: 11, color: "#8A9BB0" }}>Auto-refreshing every 30s · Last updated: {lastRefresh.toLocaleTimeString("en-IN")}</div>
            </div>
          </div>
          <div style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(239,68,68,0.2)", fontSize: 11, fontWeight: 700, color: "#EF4444", animation: "blink 1s step-end infinite" }}>● LIVE</div>
        </div>
      )}

      {/* Transparency guarantee + crisis toggle */}
      <div style={{ background: "rgba(19,136,8,0.08)", border: "1px solid rgba(19,136,8,0.2)", borderRadius: 10, padding: "10px 16px", marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16 }}>🔒</span>
          <span style={{ fontSize: 12, color: "#8A9BB0", lineHeight: 1.5 }}>
            <strong style={{ color: "#138808" }}>Transparency Guarantee:</strong> This brief mirrors what citizens see. Nothing withheld.
          </span>
        </div>
        <button
          onClick={() => { setCrisisMode(prev => !prev); if (!crisisMode) loadBrief() }}
          style={{ flexShrink: 0, padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700, background: crisisMode ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.06)", color: crisisMode ? "#EF4444" : "#8A9BB0", border: `1px solid ${crisisMode ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"}`, transition: "all 0.2s", whiteSpace: "nowrap" }}
        >
          {crisisMode ? "🚨 Crisis ON" : "⚡ Activate Crisis Mode"}
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: "1.5rem" }}>
        {[
          { label: "Total Responses", value: totalResponses,  color: "#FF6B00" },
          { label: "Concern Themes",  value: clusterList.length, color: "#3B82F6" },
          { label: "Silent Groups",   value: criticalCount,   color: "#EF4444" },
          { label: "Silence Score",   value: `${silence?.overall_silence_score || 0}%`, color: "#FBBF24" },
        ].map(s => (
          <Card key={s.label} style={{ textAlign: "center", padding: "1rem" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#8A9BB0", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Executive summary */}
      {clusters?.executive_summary && (
        <Card style={{ marginBottom: "1.5rem", borderColor: "rgba(255,107,0,0.2)", background: "rgba(255,107,0,0.04)" }}>
          <div style={{ fontSize: 11, color: "#FF6B00", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Executive Summary for the Councillor</div>
          <p style={{ fontSize: 15, color: "#E8EDF2", lineHeight: 1.7, margin: 0 }}>{clusters.executive_summary}</p>
        </Card>
      )}

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
        <Card>
          <div style={{ fontSize: 13, color: "#8A9BB0", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Response Breakdown</div>
          {Object.keys(profileCounts).length > 0
            ? Object.entries(profileCounts).map(([pid, count]) => <ResponseBar key={pid} profileId={pid} count={count} total={totalResponses} />)
            : <div style={{ fontSize: 13, color: "#4A5568" }}>No responses yet.</div>}
        </Card>
        <div>
          <div style={{ fontSize: 13, color: "#8A9BB0", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Silence Detector</div>
          {silence?.summary && (
            <div style={{ padding: "10px 14px", borderRadius: 10, marginBottom: 12, background: criticalCount > 0 ? "rgba(239,68,68,0.08)" : "rgba(19,136,8,0.08)", border: `1px solid ${criticalCount > 0 ? "rgba(239,68,68,0.2)" : "rgba(19,136,8,0.2)"}`, fontSize: 12, color: "#C0CDD8", lineHeight: 1.6 }}>
              {silence.summary}
            </div>
          )}
          <div style={{ maxHeight: 320, overflowY: "auto" }}>
            {silenceFlags.map(flag => <SilenceFlag key={flag.profile_id} flag={flag} />)}
          </div>
        </div>
      </div>

      {/* Concern clusters */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ fontSize: 13, color: "#8A9BB0", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Concern Clusters — AI Analysis</div>
        {clusterList.length > 0
          ? clusterList.map((c, i) => <ClusterCard key={i} cluster={c} index={i} />)
          : <Card><div style={{ fontSize: 13, color: "#4A5568" }}>No clusters yet.</div></Card>}
      </div>

      {/* Minority positions */}
      <Card style={{ borderColor: "rgba(139,92,246,0.3)", background: "rgba(139,92,246,0.05)", marginBottom: "1.5rem" }}>
        <div style={{ fontSize: 11, color: "#8B5CF6", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Minority Positions — Cannot Be Dismissed</div>
        <p style={{ fontSize: 13, color: "#8A9BB0", lineHeight: 1.6, margin: 0 }}>
          All minority positions are logged separately and preserved. They cannot be overwritten or dismissed before the GBM vote. This is a structural guarantee of the Vaani system.
        </p>
      </Card>

      {/* Actions */}
      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={() => window.open("http://localhost:8000/brief/pdf", "_blank")}
          style={{ flex: 1, padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #138808, #1aaa0a)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          ⬇ Download Ward Brief (PDF)
        </button>
        <button onClick={(e) => { e.preventDefault(); loadBrief(true) }}
          style={{ padding: "13px 20px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#8A9BB0", fontSize: 14, cursor: "pointer" }}>
          ↻ Refresh
        </button>
      </div>

      <div style={{ marginTop: 12, fontSize: 11, color: "#4A5568", textAlign: "center" }}>
        Brief generated at {new Date(brief.generated_at).toLocaleString("en-IN")}
      </div>
    </div>
  )
}
