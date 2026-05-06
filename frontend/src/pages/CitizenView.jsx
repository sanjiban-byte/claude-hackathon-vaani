import { useState, useEffect } from "react"

const API = "http://localhost:8000"

// ── translations ──────────────────────────────────────────────────────────
const T = {
  English: {
    wardTag:"Ward G/North · Dharavi",consultOpen:"Consultation Open",
    hero1:"Your ward. Your voice.",hero2:"Make it count.",
    heroSub:"The BMC has proposed changes in G/North Ward. Before the General Body Meeting vote, your structured input reaches the councillor directly.",
    proposalStage:"Proposal Stage",daysToVote:"days to vote",next:"Next:",
    voiceMsg:"your voice must reach the councillor before then.",
    whoAreYou:"Select your profile",whoSub:"Personalises your questions and scheme matches",
    yourQuestions:"Your Questions",answered:"answered",
    submit:"Submit My Response →",submitting:"Submitting…",submitted:"Response Recorded",
    submittedMsg:"Your structured input has been added to the ward brief. The councillor will see it before the General Body Meeting vote.",
    transparency:"Transparency guarantee: Citizens can see what was sent to government on their behalf.",
    askTitle:"Ask anything about this proposal",askPlaceholder:"e.g. What is the road maintenance budget?",
    askBtn:"Ask",searching:"Searching documents…",sources:"Sources",
    generating:"Generating personalised questions from the BMC document…",
    nav:{ dashboard:"Dashboard", proposal:"Active Proposal", schemes:"My Schemes", submissions:"My Submissions" },
    stageNames:{ "Proposal":"Proposal","Committee Review":"Committee Review","General Body Meeting":"General Body Meeting","Resolution":"Resolution" },
    profiles:{ auto_driver:"Auto Driver",street_vendor:"Street Vendor",homeowner:"Homeowner",tenant:"Tenant",elderly_resident:"Senior Resident" },
  },
  Hindi: {
    wardTag:"वार्ड G/उत्तर · धारावी",consultOpen:"परामर्श खुला है",
    hero1:"आपका वार्ड। आपकी आवाज़।",hero2:"इसे सार्थक बनाएं।",
    heroSub:"BMC ने G/उत्तर वार्ड में बदलाव का प्रस्ताव रखा है। सामान्य निकाय बैठक से पहले आपकी राय पार्षद तक पहुंचती है।",
    proposalStage:"प्रस्ताव चरण",daysToVote:"मतदान के दिन बाकी",next:"अगला:",
    voiceMsg:"आपकी आवाज़ इससे पहले पार्षद तक पहुंचनी चाहिए।",
    whoAreYou:"अपनी पहचान चुनें",whoSub:"आपके प्रश्न और योजनाएं व्यक्तिगत होंगी",
    yourQuestions:"आपके प्रश्न",answered:"उत्तर दिए",
    submit:"मेरा जवाब जमा करें →",submitting:"जमा हो रहा है…",submitted:"जवाब दर्ज किया गया",
    submittedMsg:"आपकी राय वार्ड ब्रीफ में जोड़ दी गई है। पार्षद इसे बैठक से पहले देखेंगे।",
    transparency:"पारदर्शिता गारंटी: नागरिक देख सकते हैं कि उनकी ओर से सरकार को क्या भेजा गया।",
    askTitle:"इस प्रस्ताव के बारे में कुछ भी पूछें",askPlaceholder:"उदाहरण: सड़क मरम्मत का बजट क्या है?",
    askBtn:"पूछें",searching:"दस्तावेज़ खोजे जा रहे हैं…",sources:"स्रोत",
    generating:"BMC दस्तावेज़ से आपके लिए प्रश्न तैयार किए जा रहे हैं…",
    nav:{ dashboard:"डैशबोर्ड",proposal:"सक्रिय प्रस्ताव",schemes:"मेरी योजनाएं",submissions:"मेरे जवाब" },
    stageNames:{ "Proposal":"प्रस्ताव","Committee Review":"समिति समीक्षा","General Body Meeting":"सामान्य निकाय बैठक","Resolution":"प्रस्ताव पारित" },
    profiles:{ auto_driver:"ऑटो चालक",street_vendor:"फेरीवाला",homeowner:"मकान मालिक",tenant:"किरायेदार",elderly_resident:"वरिष्ठ नागरिक" },
  },
  Marathi: {
    wardTag:"वॉर्ड G/उत्तर · धारावी",consultOpen:"सल्लामसलत सुरू",
    hero1:"तुमचा वॉर्ड. तुमचा आवाज.",hero2:"त्याला महत्त्व द्या.",
    heroSub:"BMC ने G/उत्तर वॉर्डमध्ये बदलांचा प्रस्ताव मांडला आहे. सर्वसाधारण सभेपूर्वी तुमचे मत नगरसेवकापर्यंत पोहोचते.",
    proposalStage:"प्रस्ताव टप्पा",daysToVote:"मतदानापूर्वी दिवस",next:"पुढे:",
    voiceMsg:"तुमचा आवाज त्यापूर्वी नगरसेवकापर्यंत पोहोचणे आवश्यक आहे.",
    whoAreYou:"तुमची ओळख निवडा",whoSub:"तुमचे प्रश्न आणि योजना वैयक्तिक असतील",
    yourQuestions:"तुमचे प्रश्न",answered:"उत्तरे दिली",
    submit:"माझे उत्तर सादर करा →",submitting:"सादर होत आहे…",submitted:"उत्तर नोंदवले गेले",
    submittedMsg:"तुमचे मत वॉर्ड ब्रीफमध्ये जोडले गेले आहे. नगरसेवक सर्वसाधारण सभेपूर्वी ते पाहतील.",
    transparency:"पारदर्शकता हमी: नागरिक पाहू शकतात की त्यांच्यावतीने सरकारला काय पाठवले गेले.",
    askTitle:"या प्रस्तावाबद्दल काहीही विचारा",askPlaceholder:"उदा. रस्ता दुरुस्तीचे बजेट किती आहे?",
    askBtn:"विचारा",searching:"कागदपत्रे शोधली जात आहेत…",sources:"स्रोत",
    generating:"BMC कागदपत्रातून तुमच्यासाठी प्रश्न तयार केले जात आहेत…",
    nav:{ dashboard:"डॅशबोर्ड",proposal:"सक्रिय प्रस्ताव",schemes:"माझ्या योजना",submissions:"माझी उत्तरे" },
    stageNames:{ "Proposal":"प्रस्ताव","Committee Review":"समिती पुनरावलोकन","General Body Meeting":"सर्वसाधारण सभा","Resolution":"ठराव" },
    profiles:{ auto_driver:"रिक्षाचालक",street_vendor:"फेरीवाला",homeowner:"घरमालक",tenant:"भाडेकरू",elderly_resident:"ज्येष्ठ नागरिक" },
  },
}

// ── schemes data per profile ───────────────────────────────────────────────
const SCHEMES = {
  auto_driver: [
    { id:"svanidhi", name:"PM SVANidhi — Street Vendor Microloan", ministry:"Ministry of Housing & Urban Affairs", category:"Finance", benefit:"₹10,000–₹50,000 loan", desc:"Working capital loan for street vendors and auto drivers at subsidised rates with digital transaction incentives.", eligibility:"eligible", criteria:[{label:"Mumbai resident",met:true},{label:"Self-employed / vendor",met:true},{label:"No formal employment",met:true},{label:"Active vendor ID",met:null}] },
    { id:"pmjjby", name:"PMJJBY — Life Insurance Scheme", ministry:"Ministry of Finance", category:"Insurance", benefit:"₹2 lakh cover @ ₹436/year", desc:"Life insurance coverage of ₹2 lakh for accidental or natural death. Extremely low premium for low-income workers.", eligibility:"eligible", criteria:[{label:"Age 18–50",met:true},{label:"Bank account holder",met:true},{label:"Aadhaar linked",met:null}] },
    { id:"pmay", name:"PM Awas Yojana — Urban Housing", ministry:"Ministry of Housing", category:"Housing", benefit:"₹2.5 lakh subsidy", desc:"Interest subsidy on home loans for EWS/LIG category. Applicable to first-time homebuyers.", eligibility:"partial", criteria:[{label:"Annual income < ₹3 lakh",met:true},{label:"No pucca house owned",met:null},{label:"First-time buyer",met:null}] },
    { id:"apy", name:"Atal Pension Yojana", ministry:"Ministry of Finance", category:"Pension", benefit:"₹1,000–₹5,000/month pension", desc:"Guaranteed monthly pension post-60 for unorganised sector workers. Government co-contributes 50%.", eligibility:"eligible", criteria:[{label:"Age 18–40",met:true},{label:"Bank account",met:true},{label:"Not an income taxpayer",met:true}] },
  ],
  street_vendor: [
    { id:"svanidhi", name:"PM SVANidhi — Street Vendor Microloan", ministry:"Ministry of Housing & Urban Affairs", category:"Finance", benefit:"₹10,000–₹50,000 loan", desc:"Working capital loan for street vendors. First loan ₹10,000, increases to ₹20,000 and ₹50,000 on timely repayment.", eligibility:"eligible", criteria:[{label:"Street vendor / hawker",met:true},{label:"Mumbai ULB area",met:true},{label:"Vending certificate / LoR",met:null}] },
    { id:"fssai", name:"FSSAI Basic Registration — Food Business", ministry:"Ministry of Health", category:"Licensing", benefit:"Free registration + compliance", desc:"Mandatory food safety registration for street food vendors. Enables legal operation and access to FSSAI benefits.", eligibility:"eligible", criteria:[{label:"Food business operator",met:true},{label:"Turnover < ₹12 lakh/year",met:true}] },
    { id:"pmjdy", name:"PM Jan Dhan Yojana", ministry:"Ministry of Finance", category:"Banking", benefit:"Zero-balance account + ₹10,000 OD", desc:"Free bank account with RuPay debit card, accident insurance cover, and overdraft facility.", eligibility:"eligible", criteria:[{label:"No existing bank account",met:null},{label:"Valid Aadhaar",met:true}] },
    { id:"pmay", name:"PM Awas Yojana — Urban Housing", ministry:"Ministry of Housing", category:"Housing", benefit:"₹2.5 lakh subsidy", desc:"Interest subsidy on home loans for EWS/LIG category.", eligibility:"partial", criteria:[{label:"Income EWS/LIG",met:true},{label:"No pucca house",met:null}] },
  ],
  homeowner: [
    { id:"pmay_clss", name:"PMAY — Credit Linked Subsidy (MIG)", ministry:"Ministry of Housing", category:"Housing", benefit:"₹2.35 lakh interest subsidy", desc:"Interest subsidy on home loan for Middle Income Group. Applicable on loans up to ₹12 lakh for MIG-I.", eligibility:"partial", criteria:[{label:"Annual income ₹6–12 lakh",met:null},{label:"Loan from scheduled bank",met:null},{label:"First-time buyer",met:null}] },
    { id:"prop_tax", name:"BMC Property Tax Rebate — Owner Occupied", ministry:"BMC G/North Ward", category:"Local", benefit:"Up to 40% rebate", desc:"Property tax concession for owner-occupied residential properties in Mumbai. Annual application required.", eligibility:"eligible", criteria:[{label:"Property owner",met:true},{label:"Self-occupied residential",met:true},{label:"No arrears",met:null}] },
    { id:"solar", name:"PM Surya Ghar — Rooftop Solar Subsidy", ministry:"Ministry of New & Renewable Energy", category:"Energy", benefit:"₹30,000–₹78,000 subsidy", desc:"Free rooftop solar installation or subsidy for residential properties. Up to 3kW fully subsidised.", eligibility:"eligible", criteria:[{label:"Residential property owner",met:true},{label:"Grid-connected area",met:true},{label:"Valid electricity connection",met:true}] },
    { id:"pmjjby2", name:"PMJJBY — Life Insurance Scheme", ministry:"Ministry of Finance", category:"Insurance", benefit:"₹2 lakh cover @ ₹436/year", desc:"Life insurance for working age population at extremely low premium.", eligibility:"eligible", criteria:[{label:"Age 18–50",met:true},{label:"Bank account",met:true}] },
  ],
  tenant: [
    { id:"svanidhi2", name:"PM SVANidhi — Working Capital Loan", ministry:"Ministry of Housing", category:"Finance", benefit:"₹10,000 first loan", desc:"Micro-credit facility for urban informal workers including factory workers and small traders.", eligibility:"partial", criteria:[{label:"Urban informal worker",met:true},{label:"No formal employment contract",met:null},{label:"Mumbai resident",met:true}] },
    { id:"pmay_rent", name:"Affordable Rental Housing Complexes", ministry:"Ministry of Housing", category:"Housing", benefit:"Subsidised rent", desc:"Government-built rental housing for urban migrants and industrial workers. Dharavi pilot ongoing.", eligibility:"partial", criteria:[{label:"Urban migrant / industrial worker",met:true},{label:"Monthly income < ₹15,000",met:null},{label:"No owned property",met:true}] },
    { id:"pmjdy2", name:"PM Jan Dhan Yojana", ministry:"Ministry of Finance", category:"Banking", benefit:"Zero-balance account + ₹10,000 OD", desc:"Free bank account with RuPay card and accident insurance. Essential for accessing all other government schemes.", eligibility:"eligible", criteria:[{label:"Valid Aadhaar / ID",met:true},{label:"Mumbai address proof",met:true}] },
    { id:"esic", name:"ESIC — Employee Health Insurance", ministry:"Ministry of Labour", category:"Health", benefit:"Medical + cash benefits", desc:"Health insurance and sickness benefit for factory/industrial workers earning up to ₹21,000/month.", eligibility:"partial", criteria:[{label:"Factory / industrial worker",met:true},{label:"Employer registered with ESIC",met:null},{label:"Salary < ₹21,000/month",met:null}] },
  ],
  elderly_resident: [
    { id:"pvvy", name:"PM Vaya Vandana Yojana", ministry:"Ministry of Finance", category:"Pension", benefit:"7.4% p.a. guaranteed return", desc:"Pension scheme for senior citizens offering guaranteed 7.4% annual return on lump-sum investment. Maximum investment ₹15 lakh.", eligibility:"eligible", criteria:[{label:"Age 60 or above",met:true},{label:"Indian resident",met:true}] },
    { id:"ignoaps", name:"Indira Gandhi National Old Age Pension", ministry:"Ministry of Rural Dev.", category:"Pension", benefit:"₹200–₹500/month", desc:"Monthly pension for BPL senior citizens. State top-up brings total to ₹1,000/month in Maharashtra.", eligibility:"partial", criteria:[{label:"Age 60+",met:true},{label:"BPL household",met:null},{label:"No other pension",met:null}] },
    { id:"pmjay", name:"Ayushman Bharat PM-JAY", ministry:"Ministry of Health", category:"Health", benefit:"₹5 lakh/year health cover", desc:"Cashless health coverage of ₹5 lakh/year per family for secondary and tertiary hospitalisation.", eligibility:"partial", criteria:[{label:"Age 60+",met:true},{label:"SECC / BPL listed",met:null},{label:"Not covered by CGHS/ESIC",met:true}] },
    { id:"varishtha", name:"Varishtha Pension Bima Yojana", ministry:"LIC of India", category:"Insurance", benefit:"Pension + insurance", desc:"Immediate annuity plan for senior citizens with guaranteed pension. Administered by LIC.", eligibility:"eligible", criteria:[{label:"Age 60+",met:true},{label:"Indian citizen",met:true}] },
  ],
}

const PROFILES = [
  { id:"auto_driver", icon:"🛺", desc:"Auto Rickshaw Driver, Low income, Hindi" },
  { id:"street_vendor", icon:"🛒", desc:"Street Food Vendor, Low income, Marathi" },
  { id:"homeowner", icon:"🏠", desc:"Small Business Owner, Middle income" },
  { id:"tenant", icon:"🏘️", desc:"Factory Worker, Low income, Tenant" },
  { id:"elderly_resident", icon:"👴", desc:"Retired, 60+, Marathi" },
]

function devStyle(language) {
  return language !== "English"
    ? { fontFamily:"'Noto Sans Devanagari', sans-serif", lineHeight:1.9 }
    : {}
}

// ── tiny shared components ─────────────────────────────────────────────────
function Tag({ children, color="#FF6B00" }) {
  return <span style={{ display:"inline-block", padding:"2px 8px", borderRadius:4, fontSize:11, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", background:color+"22", color }}>{children}</span>
}

function Card({ children, style={} }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:"1.5rem", ...style }}>{children}</div>
}

// ── Scheme eligibility badge ───────────────────────────────────────────────
function EligBadge({ status }) {
  const map = {
    eligible:{ bg:"rgba(19,136,8,0.15)", color:"#138808", label:"✓ Eligible" },
    partial: { bg:"rgba(251,191,36,0.15)", color:"#FBBF24", label:"? Needs info" },
    not_eligible:{ bg:"rgba(239,68,68,0.1)", color:"#EF4444", label:"✗ Not eligible" },
  }
  const s = map[status] || map.partial
  return <span style={{ padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, background:s.bg, color:s.color }}>{s.label}</span>
}

// ── Scheme modal ───────────────────────────────────────────────────────────
function SchemeModal({ scheme, onClose }) {
  const [selected, setSelected] = useState(null)
  const [confirmed, setConfirmed] = useState(false)
  if (!scheme) return null

  const unknown = scheme.criteria.filter(c => c.met === null)

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}>
      <div onClick={e => e.stopPropagation()} style={{ background:"#0F1E33", border:"1px solid rgba(255,255,255,0.1)", borderRadius:18, width:"100%", maxWidth:520, padding:"1.75rem", maxHeight:"85vh", overflowY:"auto" }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
          <div>
            <div style={{ fontSize:11, color:"#8A9BB0", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>{scheme.ministry}</div>
            <div style={{ fontSize:16, fontWeight:700, color:"#fff", lineHeight:1.4 }}>{scheme.name}</div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#8A9BB0", fontSize:18, cursor:"pointer", padding:"0 4px" }}>✕</button>
        </div>

        {/* Benefit chip */}
        <div style={{ display:"inline-block", padding:"6px 14px", borderRadius:8, background:"rgba(255,107,0,0.12)", border:"1px solid rgba(255,107,0,0.3)", fontSize:13, fontWeight:700, color:"#FF6B00", marginBottom:14 }}>{scheme.benefit}</div>

        <p style={{ fontSize:13, color:"#8A9BB0", lineHeight:1.6, marginBottom:16 }}>{scheme.desc}</p>

        {/* Criteria */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11, color:"#8A9BB0", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>Eligibility Criteria</div>
          {scheme.criteria.map((c,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 10px", borderRadius:8, marginBottom:4, background: c.met===true ? "rgba(19,136,8,0.08)" : c.met===false ? "rgba(239,68,68,0.08)" : "rgba(251,191,36,0.08)" }}>
              <span style={{ fontSize:14, color: c.met===true ? "#138808" : c.met===false ? "#EF4444" : "#FBBF24" }}>
                {c.met===true ? "✓" : c.met===false ? "✗" : "?"}
              </span>
              <span style={{ fontSize:13, color:"#C0CDD8" }}>{c.label}</span>
              {c.met===null && <span style={{ marginLeft:"auto", fontSize:10, color:"#FBBF24", fontWeight:600 }}>NOT IN PROFILE</span>}
            </div>
          ))}
        </div>

        {/* Clarification question if partial */}
        {scheme.eligibility === "partial" && unknown.length > 0 && !confirmed && (
          <div style={{ background:"rgba(251,191,36,0.06)", border:"1px solid rgba(251,191,36,0.2)", borderRadius:12, padding:"14px", marginBottom:14 }}>
            <div style={{ fontSize:12, color:"#FBBF24", fontWeight:600, marginBottom:8 }}>
              AI needs one answer to confirm eligibility
            </div>
            <div style={{ fontSize:13, color:"#E8EDF2", marginBottom:12 }}>
              Do you meet the criteria: <strong>{unknown[0].label}</strong>?
            </div>
            <div style={{ display:"flex", gap:8 }}>
              {["Yes","No","Not sure"].map(opt => (
                <button key={opt} onClick={() => setSelected(opt)} style={{ flex:1, padding:"8px", borderRadius:8, border:`1px solid ${selected===opt ? "#FF6B00" : "rgba(255,255,255,0.1)"}`, background: selected===opt ? "rgba(255,107,0,0.15)" : "transparent", color: selected===opt ? "#FF8C3A" : "#8A9BB0", fontSize:13, cursor:"pointer", transition:"all 0.15s" }}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {confirmed && (
          <div style={{ background:"rgba(19,136,8,0.1)", border:"1px solid rgba(19,136,8,0.3)", borderRadius:10, padding:"12px 14px", marginBottom:14 }}>
            <div style={{ fontSize:14, fontWeight:700, color:"#138808", marginBottom:4 }}>
              {selected==="Yes" ? "✓ Eligible — added to your schemes" : "Profile updated. Check back when criteria change."}
            </div>
            <div style={{ fontSize:12, color:"#8A9BB0" }}>Your answer has been saved to your profile.</div>
          </div>
        )}

        {/* Footer buttons */}
        <div style={{ display:"flex", gap:10, marginTop:4 }}>
          <button onClick={onClose} style={{ flex:1, padding:"10px", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:"#8A9BB0", fontSize:13, cursor:"pointer" }}>
            Close
          </button>
          {!confirmed && (
            <button onClick={() => selected && setConfirmed(true)} disabled={scheme.eligibility!=="partial" || !selected} style={{ flex:2, padding:"10px", borderRadius:10, border:"none", background: selected ? "#FF6B00" : "rgba(255,255,255,0.06)", color: selected ? "#fff" : "#4A5568", fontSize:13, fontWeight:600, cursor: selected ? "pointer" : "not-allowed", transition:"all 0.15s" }}>
              {scheme.eligibility==="eligible" ? "Apply →" : "Confirm & check eligibility →"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── QuestionCard ──────────────────────────────────────────────────────────
function QuestionCard({ q, index, answer, onAnswer, language }) {
  const dv = devStyle(language)
  return (
    <div style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${answer?"rgba(255,107,0,0.4)":"rgba(255,255,255,0.07)"}`, borderRadius:16, padding:"1.5rem", marginBottom:"1rem", transition:"border-color 0.2s" }}>
      <div style={{ display:"flex", gap:10, marginBottom:12 }}>
        <div style={{ width:28, height:28, borderRadius:8, flexShrink:0, background:answer?"rgba(255,107,0,0.2)":"rgba(255,255,255,0.06)", border:`1px solid ${answer?"rgba(255,107,0,0.5)":"rgba(255,255,255,0.1)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:answer?"#FF6B00":"#4A5568" }}>Q{index+1}</div>
        <div>
          <div style={{ fontSize:11, color:"#8A9BB0", marginBottom:4, textTransform:"uppercase", letterSpacing:"0.06em" }}>{q.impact_area}</div>
          <div style={{ fontSize:14, color:"#8A9BB0", lineHeight:1.5, ...dv }}>{q.context}</div>
        </div>
      </div>
      <p style={{ fontSize:15, color:"#E8EDF2", fontWeight:500, margin:"0 0 16px", ...dv }}>{q.question}</p>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {[["A",q.option_a],["B",q.option_b]].map(([opt,text]) => (
          <button key={opt} onClick={() => onAnswer(opt)} style={{ width:"100%", textAlign:"left", padding:"12px 14px", borderRadius:10, cursor:"pointer", border:`1px solid ${answer===opt?"#FF6B00":"rgba(255,255,255,0.08)"}`, background:answer===opt?"rgba(255,107,0,0.12)":"rgba(255,255,255,0.03)", color:answer===opt?"#FF8C3A":"#C0CDD8", fontSize:14, transition:"all 0.15s ease", display:"flex", alignItems:"flex-start", gap:10, ...dv }}>
            <span style={{ flexShrink:0, width:22, height:22, borderRadius:6, background:answer===opt?"#FF6B00":"rgba(255,255,255,0.08)", color:"#fff", fontSize:11, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" }}>{opt}</span>
            {text}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── StageBar ──────────────────────────────────────────────────────────────
function StageBar({ proposal, t, language }) {
  if (!proposal) return null
  const { stage_index, total_stages, stages, stage, days_until_gbm, next_stage } = proposal
  const translatedStages = stages?.map(s => t.stageNames[s]||s)||[]
  const pct = (stage_index/total_stages)*100
  return (
    <Card style={{ marginBottom:"1.5rem" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
        <div>
          <div style={{ fontSize:11, color:"#8A9BB0", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>{t.proposalStage}</div>
          <div style={{ fontSize:15, fontWeight:600, color:"#fff", ...devStyle(language) }}>{t.stageNames[stage]||stage}</div>
        </div>
        {days_until_gbm && (
          <div style={{ background:"rgba(255,107,0,0.12)", border:"1px solid rgba(255,107,0,0.3)", borderRadius:8, padding:"6px 12px", textAlign:"center" }}>
            <div style={{ fontSize:20, fontWeight:700, color:"#FF6B00" }}>{days_until_gbm}</div>
            <div style={{ fontSize:10, color:"#8A9BB0", textTransform:"uppercase", ...devStyle(language) }}>{t.daysToVote}</div>
          </div>
        )}
      </div>
      <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:4, height:6, marginBottom:10 }}>
        <div style={{ height:"100%", borderRadius:4, width:`${pct}%`, background:"linear-gradient(90deg,#FF6B00,#FF8C3A)", transition:"width 0.6s ease" }} />
      </div>
      <div style={{ display:"flex", justifyContent:"space-between" }}>
        {translatedStages.map((s,i) => (
          <span key={s} style={{ fontSize:10, color:i<stage_index?"#FF6B00":i===stage_index?"#fff":"#4A5568", fontWeight:i===stage_index?600:400, ...devStyle(language) }}>{s}</span>
        ))}
      </div>
      {next_stage && <div style={{ marginTop:10, fontSize:12, color:"#8A9BB0", ...devStyle(language) }}>{t.next} <span style={{ color:"#FF6B00" }}>{t.stageNames[next_stage]||next_stage}</span> — {t.voiceMsg}</div>}
    </Card>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════
export default function CitizenView({ language="English", setLanguage }) {
  const [ward, setWard]               = useState(null)
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [tab, setTab]                 = useState("dashboard")
  const [questions, setQuestions]     = useState([])
  const [answers, setAnswers]         = useState({})
  const [query, setQuery]             = useState("")
  const [queryResult, setQueryResult] = useState(null)
  const [loading, setLoading]         = useState(false)
  const [qLoading, setQLoading]       = useState(false)
  const [submitted, setSubmitted]     = useState(false)
  const [submissions, setSubmissions] = useState([])
  const [activeScheme, setActiveScheme] = useState(null)

  const t  = T[language]
  const dv = devStyle(language)

  useEffect(() => {
    fetch(`${API}/ward`).then(r=>r.json()).then(setWard).catch(console.error)
  }, [])

  const loadQuestions = async (profileId, lang) => {
    setQLoading(true); setQuestions([]); setAnswers({}); setSubmitted(false)
    try {
      const res  = await fetch(`${API}/questions`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ profile_id:profileId, language:lang }) })
      const data = await res.json()
      setQuestions(data.questions||[])
    } catch(e){ console.error(e) }
    finally { setQLoading(false) }
  }

  const handleProfileSelect = (p) => {
    setSelectedProfile(p)
    loadQuestions(p.id, language)
    setTab("proposal")
  }

  const handleAnswer = (qIndex, opt) => setAnswers(prev => ({...prev,[qIndex]:opt}))

  const handleSubmit = async () => {
    const answered = questions.map((q,i) => { const opt=answers[i]; return opt==="A"?q.option_a:opt==="B"?q.option_b:"No answer" })
    setLoading(true)
    try {
      await fetch(`${API}/submit`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ profile_id:selectedProfile.id, responses:answered }) })
      setSubmitted(true)
      setSubmissions(prev => [...prev, { profile:selectedProfile.id, questions, answers: {...answers}, time: new Date() }])
    } catch(e){ console.error(e) }
    finally { setLoading(false) }
  }

  const handleQuery = async (q) => {
    const question = q || query
    if (!question.trim()) return
    setQuery(question)
    setLoading(true); setQueryResult(null)
    try {
      const res  = await fetch(`${API}/query`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ question, language }) })
      const data = await res.json()
      setQueryResult(data)
    } catch(e){ console.error(e) }
    finally { setLoading(false) }
  }

  const allAnswered = questions.length > 0 && Object.keys(answers).length === questions.length
  const schemes     = selectedProfile ? (SCHEMES[selectedProfile.id]||[]) : []
  const eligibleCount = schemes.filter(s=>s.eligibility==="eligible").length

  // ── SIDEBAR ──────────────────────────────────────────────────────────────
  const Sidebar = () => (
    <div style={{ width:260, flexShrink:0, background:"rgba(255,255,255,0.02)", borderRight:"1px solid rgba(255,255,255,0.06)", minHeight:"calc(100vh - 56px)", position:"sticky", top:56, height:"calc(100vh - 56px)", overflowY:"auto", display:"flex", flexDirection:"column" }}>

      {/* Profile card */}
      <div style={{ padding:"20px 16px 0" }}>
        <div style={{ fontSize:10, color:"#4A5568", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10 }}>Your Profile</div>

        {selectedProfile ? (
          <div style={{ background:"rgba(19,136,8,0.08)", border:"1px solid rgba(19,136,8,0.2)", borderRadius:12, padding:"14px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
              <div style={{ width:36, height:36, borderRadius:"50%", background:"#138808", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>
                {PROFILES.find(p=>p.id===selectedProfile.id)?.icon}
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:"#fff", ...dv }}>{t.profiles[selectedProfile.id]}</div>
                <div style={{ fontSize:10, color:"#138808" }}>G/North Ward · Dharavi</div>
              </div>
            </div>
            {[
              ["Ward","G/North (4090)"],
              ["Language", language],
              ["Status","Consultation Active"],
            ].map(([k,v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:"1px solid rgba(19,136,8,0.15)", fontSize:11 }}>
                <span style={{ color:"#8A9BB0" }}>{k}</span>
                <span style={{ fontWeight:600, color:"#138808" }}>{v}</span>
              </div>
            ))}
            <button onClick={() => { setSelectedProfile(null); setQuestions([]); setTab("dashboard") }} style={{ marginTop:10, width:"100%", padding:"6px", borderRadius:8, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:"#4A5568", fontSize:11, cursor:"pointer" }}>
              Change profile
            </button>
          </div>
        ) : (
          <div style={{ background:"rgba(255,107,0,0.06)", border:"1px solid rgba(255,107,0,0.2)", borderRadius:12, padding:"12px", fontSize:12, color:"#8A9BB0", ...dv }}>
            {t.whoSub}
          </div>
        )}
      </div>

      {/* Nav links */}
      <div style={{ padding:"20px 10px 0", flex:1 }}>
        <div style={{ fontSize:10, color:"#4A5568", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8, paddingLeft:8 }}>Navigation</div>
        {[
          { key:"dashboard", icon:"⊞", label:t.nav.dashboard },
          { key:"proposal",  icon:"📋", label:t.nav.proposal, badge: questions.length>0 ? questions.length : null },
          { key:"schemes",   icon:"🎯", label:t.nav.schemes,  badge: eligibleCount>0 ? eligibleCount : null },
          { key:"submissions",icon:"✓", label:t.nav.submissions, badge: submissions.length>0 ? submissions.length : null },
        ].map(item => (
          <button key={item.key} onClick={() => setTab(item.key)} style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"9px 10px", borderRadius:8, border:"none", cursor:"pointer", marginBottom:2, background:tab===item.key?"rgba(255,107,0,0.1)":"transparent", color:tab===item.key?"#FF6B00":"#8A9BB0", fontSize:13, textAlign:"left", transition:"all 0.15s" }}>
            <span style={{ fontSize:15, width:20, textAlign:"center" }}>{item.icon}</span>
            <span style={{ ...dv }}>{item.label}</span>
            {item.badge && <span style={{ marginLeft:"auto", background:"#FF6B00", color:"#fff", fontSize:10, padding:"2px 7px", borderRadius:20, fontWeight:700 }}>{item.badge}</span>}
          </button>
        ))}
      </div>

      {/* Bottom ward info */}
      <div style={{ padding:"16px", borderTop:"1px solid rgba(255,255,255,0.05)", margin:"16px 0 0" }}>
        <div style={{ fontSize:10, color:"#4A5568", marginBottom:4 }}>Active Proposal</div>
        <div style={{ fontSize:12, color:"#8A9BB0", lineHeight:1.4 }}>
          {ward?.active_proposal?.title || "Dharavi Road Widening & Auto Stand Relocation"}
        </div>
        {ward?.active_proposal?.days_until_gbm && (
          <div style={{ marginTop:6, fontSize:11, color:"#FF6B00", fontWeight:600 }}>
            {ward.active_proposal.days_until_gbm} days to GBM vote
          </div>
        )}
      </div>
    </div>
  )

  // ── TAB: DASHBOARD ────────────────────────────────────────────────────────
  const DashboardTab = () => (
    <div>
      <div style={{ marginBottom:"2rem" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
          <Tag>{t.wardTag}</Tag>
          <Tag color="#138808">{t.consultOpen}</Tag>
        </div>
        <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:"clamp(24px,4vw,34px)", fontWeight:700, color:"#fff", margin:"8px 0 6px", lineHeight:1.2, letterSpacing:"-0.5px", ...dv }}>
          {t.hero1}<br/><span style={{ color:"#FF6B00" }}>{t.hero2}</span>
        </h1>
        <p style={{ color:"#8A9BB0", fontSize:15, lineHeight:1.6, margin:"0 0 20px", maxWidth:540, ...dv }}>{t.heroSub}</p>
      </div>

      {ward && <StageBar proposal={ward.active_proposal} t={t} language={language} />}

      {!selectedProfile ? (
        <div>
          <div style={{ fontSize:13, color:"#8A9BB0", marginBottom:4, textTransform:"uppercase", letterSpacing:"0.08em" }}>{t.whoAreYou}</div>
          <div style={{ fontSize:12, color:"#4A5568", marginBottom:14, ...dv }}>{t.whoSub}</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
            {PROFILES.map(p => (
              <button key={p.id} onClick={() => handleProfileSelect(p)} style={{ padding:"10px 16px", borderRadius:12, cursor:"pointer", border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.03)", color:"#C0CDD8", fontSize:14, display:"flex", alignItems:"center", gap:8, transition:"all 0.15s" }}>
                <span style={{ fontSize:18 }}>{PROFILES.find(x=>x.id===p.id)?.icon}</span>
                <span style={{ fontWeight:500, ...dv }}>{t.profiles[p.id]}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {[
            { label:"Proposal Stage", value:t.stageNames[ward?.active_proposal?.stage]||"Committee Review", color:"#FF6B00", action:()=>setTab("proposal"), actionLabel:"Answer questions →" },
            { label:"Matched Schemes", value:`${eligibleCount} eligible`, color:"#138808", action:()=>setTab("schemes"), actionLabel:"View schemes →" },
            { label:"Responses Submitted", value:submissions.length, color:"#3B82F6", action:()=>setTab("submissions"), actionLabel:"View history →" },
            { label:"Days to GBM Vote", value:ward?.active_proposal?.days_until_gbm||18, color:"#FBBF24", action:null, actionLabel:"" },
          ].map(s => (
            <Card key={s.label} style={{ padding:"1.25rem" }}>
              <div style={{ fontSize:22, fontWeight:700, color:s.color, marginBottom:4 }}>{s.value}</div>
              <div style={{ fontSize:11, color:"#8A9BB0", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:s.action?10:0 }}>{s.label}</div>
              {s.action && <button onClick={s.action} style={{ fontSize:11, color:s.color, background:"none", border:"none", cursor:"pointer", padding:0, fontWeight:600 }}>{s.actionLabel}</button>}
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  // ── TAB: PROPOSAL (questions + RAG) ──────────────────────────────────────
  const ProposalTab = () => (
    <div>
      <div style={{ marginBottom:"1.5rem" }}>
        <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:24, fontWeight:700, color:"#fff", marginBottom:6 }}>Active Proposal</h2>
        <div style={{ fontSize:13, color:"#8A9BB0" }}>{ward?.active_proposal?.title}</div>
      </div>

      {ward && <StageBar proposal={ward.active_proposal} t={t} language={language} />}

      {!selectedProfile && (
        <Card style={{ textAlign:"center", padding:"2rem", marginBottom:"1.5rem" }}>
          <div style={{ fontSize:14, color:"#8A9BB0", marginBottom:12, ...dv }}>Select your profile from the sidebar to receive personalised questions</div>
        </Card>
      )}

      {qLoading && (
        <Card style={{ textAlign:"center", padding:"2rem" }}>
          <div style={{ fontSize:13, color:"#8A9BB0", marginBottom:12, ...dv }}>{t.generating}</div>
          <div style={{ width:32, height:32, borderRadius:"50%", margin:"0 auto", border:"2px solid rgba(255,107,0,0.3)", borderTopColor:"#FF6B00", animation:"spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </Card>
      )}

      {!qLoading && questions.length>0 && !submitted && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div style={{ fontSize:13, color:"#8A9BB0", textTransform:"uppercase", letterSpacing:"0.08em", ...dv }}>
              {t.yourQuestions} — {t.profiles[selectedProfile?.id]}
            </div>
            <Tag color="#8A9BB0">{Object.keys(answers).length}/{questions.length} {t.answered}</Tag>
          </div>
          {questions.map((q,i) => (
            <QuestionCard key={i} q={q} index={i} answer={answers[i]} onAnswer={(opt)=>handleAnswer(i,opt)} language={language} />
          ))}
          <button onClick={handleSubmit} disabled={!allAnswered||loading} style={{ width:"100%", padding:"14px", borderRadius:12, border:"none", cursor:allAnswered?"pointer":"not-allowed", background:allAnswered?"linear-gradient(135deg,#FF6B00,#FF8C3A)":"rgba(255,255,255,0.06)", color:allAnswered?"#fff":"#4A5568", fontSize:15, fontWeight:600, transition:"all 0.2s", ...dv }}>
            {loading ? t.submitting : t.submit}
          </button>
        </div>
      )}

      {submitted && (
        <Card style={{ textAlign:"center", padding:"2.5rem", borderColor:"rgba(19,136,8,0.4)", marginBottom:"1.5rem" }}>
          <div style={{ fontSize:36, marginBottom:12 }}>✅</div>
          <div style={{ fontSize:18, fontWeight:700, color:"#fff", marginBottom:8, ...dv }}>{t.submitted}</div>
          <div style={{ fontSize:14, color:"#8A9BB0", lineHeight:1.6, ...dv }}>{t.submittedMsg}</div>
          <div style={{ marginTop:16, padding:"10px 16px", background:"rgba(19,136,8,0.1)", borderRadius:8, fontSize:12, color:"#138808", ...dv }}>🔒 {t.transparency}</div>
        </Card>
      )}

      {/* Ask anything */}
      <div style={{ marginTop:"2rem" }}>
        <div style={{ fontSize:13, color:"#8A9BB0", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12, ...dv }}>{t.askTitle}</div>
        <div style={{ display:"flex", gap:10 }}>
          <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleQuery()} placeholder={t.askPlaceholder}
            style={{ flex:1, padding:"12px 16px", borderRadius:10, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"#fff", fontSize:14, outline:"none", ...dv }} />
          <button onClick={()=>handleQuery()} disabled={loading} style={{ padding:"12px 20px", borderRadius:10, border:"none", background:"#FF6B00", color:"#fff", fontSize:14, fontWeight:600, cursor:"pointer", ...dv }}>{t.askBtn}</button>
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:10 }}>
          {["What is the SWM budget for 2025-26?","How has road spending changed since 2023?","What does this proposal say about Dharavi slums?"].map(q => (
            <button key={q} onClick={()=>handleQuery(q)} style={{ padding:"5px 12px", borderRadius:6, border:"1px solid rgba(255,255,255,0.08)", background:"transparent", color:"#4A5568", fontSize:11, cursor:"pointer" }}>{q}</button>
          ))}
        </div>
        {loading && !qLoading && <div style={{ fontSize:13, color:"#8A9BB0", marginTop:12, textAlign:"center", ...dv }}>{t.searching}</div>}
        {queryResult && (
          <Card style={{ marginTop:12 }}>
            <div style={{ fontSize:14, color:"#E8EDF2", lineHeight:1.7, whiteSpace:"pre-wrap", ...dv }}>{queryResult.answer}</div>
            <div style={{ marginTop:12, paddingTop:12, borderTop:"1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize:11, color:"#8A9BB0", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>{t.sources}</div>
              {queryResult.sources?.slice(0,3).map((s,i) => (
                <div key={i} style={{ fontSize:11, color:"#8A9BB0", marginBottom:3, paddingLeft:8, borderLeft:"2px solid rgba(255,107,0,0.4)" }}>{s.source} · page {s.page}</div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )

  // ── TAB: SCHEMES ──────────────────────────────────────────────────────────
  const SchemesTab = () => (
    <div>
      <div style={{ marginBottom:"1.5rem" }}>
        <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:24, fontWeight:700, color:"#fff", marginBottom:6 }}>My Schemes</h2>
        {selectedProfile
          ? <div style={{ fontSize:13, color:"#8A9BB0" }}>Matched for: <span style={{ color:"#FF6B00" }}>{t.profiles[selectedProfile.id]}</span> · {eligibleCount} eligible, {schemes.filter(s=>s.eligibility==="partial").length} need info</div>
          : <div style={{ fontSize:13, color:"#8A9BB0" }}>Select your profile to see matched schemes</div>
        }
      </div>

      {!selectedProfile && (
        <Card style={{ textAlign:"center", padding:"2rem" }}>
          <div style={{ fontSize:32, marginBottom:12 }}>🎯</div>
          <div style={{ fontSize:14, color:"#8A9BB0" }}>Select your profile from the sidebar to see government schemes you may be eligible for</div>
        </Card>
      )}

      {schemes.map(scheme => (
        <div key={scheme.id} onClick={()=>setActiveScheme(scheme)} style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${scheme.eligibility==="eligible"?"rgba(19,136,8,0.3)":scheme.eligibility==="partial"?"rgba(251,191,36,0.2)":"rgba(255,255,255,0.07)"}`, borderRadius:14, padding:"1.25rem", marginBottom:10, cursor:"pointer", transition:"all 0.15s", display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:16 }}>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
              <span style={{ fontSize:10, color:"#8A9BB0", textTransform:"uppercase", letterSpacing:"0.06em" }}>{scheme.ministry}</span>
              <span style={{ fontSize:10, background:"rgba(255,255,255,0.06)", color:"#8A9BB0", padding:"2px 8px", borderRadius:4 }}>{scheme.category}</span>
            </div>
            <div style={{ fontSize:15, fontWeight:600, color:"#fff", marginBottom:6 }}>{scheme.name}</div>
            <div style={{ fontSize:13, color:"#8A9BB0", lineHeight:1.5, marginBottom:10 }}>{scheme.desc}</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {scheme.criteria.map((c,i) => (
                <span key={i} style={{ fontSize:11, padding:"3px 8px", borderRadius:6, background: c.met===true?"rgba(19,136,8,0.1)":c.met===false?"rgba(239,68,68,0.1)":"rgba(251,191,36,0.1)", color: c.met===true?"#138808":c.met===false?"#EF4444":"#FBBF24" }}>
                  {c.met===true?"✓ ":c.met===false?"✗ ":"? "}{c.label}
                </span>
              ))}
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8, flexShrink:0 }}>
            <EligBadge status={scheme.eligibility} />
            <div style={{ fontSize:13, fontWeight:700, color:"#FF6B00" }}>{scheme.benefit}</div>
            <span style={{ fontSize:12, color:"#4A5568" }}>View details →</span>
          </div>
        </div>
      ))}

      {activeScheme && <SchemeModal scheme={activeScheme} onClose={()=>setActiveScheme(null)} />}
    </div>
  )

  // ── TAB: SUBMISSIONS ──────────────────────────────────────────────────────
  const SubmissionsTab = () => (
    <div>
      <div style={{ marginBottom:"1.5rem" }}>
        <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:24, fontWeight:700, color:"#fff", marginBottom:6 }}>My Submissions</h2>
        <div style={{ fontSize:13, color:"#8A9BB0" }}>{submissions.length} response{submissions.length!==1?"s":""} submitted to ward brief</div>
      </div>

      {submissions.length===0 ? (
        <Card style={{ textAlign:"center", padding:"2rem" }}>
          <div style={{ fontSize:32, marginBottom:12 }}>📭</div>
          <div style={{ fontSize:14, color:"#8A9BB0" }}>No submissions yet. Answer questions in the Active Proposal tab to contribute to the ward brief.</div>
        </Card>
      ) : (
        submissions.map((sub,i) => (
          <Card key={i} style={{ marginBottom:10 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
              <div>
                <div style={{ fontSize:14, fontWeight:600, color:"#fff" }}>{t.profiles[sub.profile]}</div>
                <div style={{ fontSize:11, color:"#8A9BB0" }}>{sub.time.toLocaleString("en-IN")}</div>
              </div>
              <Tag color="#138808">Submitted</Tag>
            </div>
            {sub.questions.map((q,qi) => (
              <div key={qi} style={{ padding:"8px 10px", borderRadius:8, background:"rgba(255,255,255,0.03)", marginBottom:6 }}>
                <div style={{ fontSize:12, color:"#8A9BB0", marginBottom:3 }}>Q{qi+1}: {q.question?.slice(0,80)}…</div>
                <div style={{ fontSize:13, color:"#FF8C3A", fontWeight:500 }}>
                  → {sub.answers[qi]==="A"?q.option_a:sub.answers[qi]==="B"?q.option_b:"No answer"}
                </div>
              </div>
            ))}
          </Card>
        ))
      )}
    </div>
  )

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display:"flex", minHeight:"calc(100vh - 56px)" }}>
      <Sidebar />
      <div style={{ flex:1, padding:"2rem 2rem 4rem", maxWidth:780, overflowY:"auto" }}>
        {tab==="dashboard"   && <DashboardTab />}
        {tab==="proposal"    && <ProposalTab />}
        {tab==="schemes"     && <SchemesTab />}
        {tab==="submissions" && <SubmissionsTab />}
      </div>
    </div>
  )
}
