import { useState } from "react"
import CitizenView from "./pages/CitizenView"
import GovernmentView from "./pages/GovernmentView"

const LANGS = ["English", "Hindi", "Marathi"]

export default function App() {
  const [view, setView]       = useState("citizen")
  const [language, setLanguage] = useState("English")

  return (
    <div style={{ minHeight: "100vh", background: "#0A1628", fontFamily: "'DM Sans', sans-serif" }}>

      {/* Nav */}
      <nav style={{
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "0 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "56px",
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(10,22,40,0.95)",
        backdropFilter: "blur(12px)",
      }}>

        {/* Left — logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: "linear-gradient(135deg, #FF6B00, #FF8C3A)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700, color: "#fff",
          }}>व</div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }}>
            Vaani
          </span>
          <span style={{ fontSize: 11, color: "#8A9BB0", marginLeft: 4, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            G/North Ward · Dharavi
          </span>
        </div>

        {/* Right — language + view toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

          {/* Language selector — only show on citizen view */}
          {view === "citizen" && (
            <div style={{ display: "flex", gap: 3, background: "rgba(255,255,255,0.04)", borderRadius: 7, padding: 3, border: "1px solid rgba(255,255,255,0.06)" }}>
              {LANGS.map(l => (
                <button key={l} onClick={() => setLanguage(l)} style={{
                  padding: "4px 11px", borderRadius: 5, border: "none",
                  cursor: "pointer", fontSize: 12, fontWeight: 500,
                  transition: "all 0.15s ease",
                  background: language === l ? "rgba(255,107,0,0.9)" : "transparent",
                  color: language === l ? "#fff" : "#8A9BB0",
                }}>
                  {l === "English" ? "EN" : l === "Hindi" ? "हि" : "म"}
                </button>
              ))}
            </div>
          )}

          {/* View toggle */}
          <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: 3 }}>
            {[["citizen", "Citizen View"], ["government", "Government View"]].map(([key, label]) => (
              <button key={key} onClick={() => setView(key)} style={{
                padding: "6px 16px", borderRadius: 6, border: "none",
                cursor: "pointer", fontSize: 13, fontWeight: 500,
                transition: "all 0.15s ease",
                background: view === key
                  ? (key === "citizen" ? "#FF6B00" : "#138808")
                  : "transparent",
                color: view === key ? "#fff" : "#8A9BB0",
              }}>
                {label}
              </button>
            ))}
          </div>

        </div>
      </nav>

      {view === "citizen"
        ? <CitizenView language={language} setLanguage={setLanguage} />
        : <GovernmentView />
      }
    </div>
  )
}
