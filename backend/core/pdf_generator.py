"""
pdf_generator.py — Generates a formatted ward brief PDF using reportlab.
"""

import io
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether
)
from reportlab.lib.colors import HexColor


# ── brand colours ────────────────────────────────────────────────────────────
NAVY      = HexColor("#0A1628")
SAFFRON   = HexColor("#FF6B00")
GREEN     = HexColor("#138808")
RED       = HexColor("#EF4444")
AMBER     = HexColor("#FBBF24")
SLATE     = HexColor("#1E2D45")
LIGHT     = HexColor("#E8EDF2")
MUTED     = HexColor("#8A9BB0")
WHITE     = colors.white
BLACK     = colors.black

PAGE_W, PAGE_H = A4


def _styles():
    base = getSampleStyleSheet()
    custom = {
        "title": ParagraphStyle("title",
            fontName="Helvetica-Bold", fontSize=20, textColor=WHITE,
            leading=26, spaceAfter=4),
        "subtitle": ParagraphStyle("subtitle",
            fontName="Helvetica", fontSize=11, textColor=MUTED,
            leading=16, spaceAfter=2),
        "section_head": ParagraphStyle("section_head",
            fontName="Helvetica-Bold", fontSize=10, textColor=SAFFRON,
            leading=14, spaceBefore=14, spaceAfter=6,
            textTransform="uppercase"),
        "body": ParagraphStyle("body",
            fontName="Helvetica", fontSize=10, textColor=LIGHT,
            leading=15, spaceAfter=4),
        "body_small": ParagraphStyle("body_small",
            fontName="Helvetica", fontSize=8, textColor=MUTED,
            leading=12, spaceAfter=2),
        "bold": ParagraphStyle("bold",
            fontName="Helvetica-Bold", fontSize=10, textColor=LIGHT,
            leading=14, spaceAfter=2),
        "quote": ParagraphStyle("quote",
            fontName="Helvetica-Oblique", fontSize=9, textColor=LIGHT,
            leading=14, leftIndent=12, spaceAfter=4),
        "flag_critical": ParagraphStyle("flag_critical",
            fontName="Helvetica-Bold", fontSize=9, textColor=RED, leading=12),
        "flag_low": ParagraphStyle("flag_low",
            fontName="Helvetica-Bold", fontSize=9, textColor=AMBER, leading=12),
        "flag_ok": ParagraphStyle("flag_ok",
            fontName="Helvetica-Bold", fontSize=9, textColor=GREEN, leading=12),
        "tag": ParagraphStyle("tag",
            fontName="Helvetica-Bold", fontSize=8, textColor=SAFFRON,
            leading=10, spaceAfter=0),
    }
    return custom


def generate_brief_pdf(brief: dict) -> bytes:
    """
    Generate a formatted PDF ward brief.
    Returns raw PDF bytes.
    """
    buf    = io.BytesIO()
    doc    = SimpleDocTemplate(
        buf, pagesize=A4,
        leftMargin=18*mm, rightMargin=18*mm,
        topMargin=20*mm, bottomMargin=20*mm,
    )
    S      = _styles()
    story  = []
    W      = PAGE_W - 36*mm   # usable width

    clusters  = brief.get("clusters", {})
    silence   = brief.get("silence", {})
    proposal  = brief.get("proposal", {})
    ward_name = brief.get("ward", "G/North")
    ward_code = brief.get("ward_code", "4090")
    gen_at    = brief.get("generated_at", datetime.now().isoformat())

    total_responses  = clusters.get("total_responses", 0)
    cluster_list     = clusters.get("clusters", [])
    silence_flags    = silence.get("flags", [])
    exec_summary     = clusters.get("executive_summary", "")
    profile_counts   = clusters.get("response_by_profile", {})
    overall_silence  = silence.get("overall_silence_score", 0)

    critical_count = sum(1 for f in silence_flags if f.get("status") == "critical")

    # ── HEADER BLOCK ──────────────────────────────────────────────────────────
    def header_bg(canvas, doc):
        canvas.saveState()
        canvas.setFillColor(NAVY)
        canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
        # saffron top bar
        canvas.setFillColor(SAFFRON)
        canvas.rect(0, PAGE_H - 8, PAGE_W, 8, fill=1, stroke=0)
        canvas.restoreState()

    doc.build(story, onFirstPage=header_bg, onLaterPages=header_bg)

    # rebuild with content
    story = []

    # logo row
    logo_data = [[
        Paragraph("<b>व</b>", ParagraphStyle("logo",
            fontName="Helvetica-Bold", fontSize=18, textColor=WHITE)),
        Paragraph(
            f"<b>VAANI</b> — Democratic Signal Engine<br/>"
            f"<font size='9' color='#8A9BB0'>Ward {ward_name} · BMC Area Code {ward_code}</font>",
            ParagraphStyle("logo_text", fontName="Helvetica-Bold", fontSize=13,
                           textColor=WHITE, leading=18)),
        Paragraph(
            f"<font size='8' color='#8A9BB0'>Generated<br/>"
            f"{datetime.fromisoformat(gen_at).strftime('%d %b %Y, %H:%M')}</font>",
            ParagraphStyle("date", fontName="Helvetica", fontSize=8,
                           textColor=MUTED, alignment=TA_RIGHT, leading=12)),
    ]]
    logo_tbl = Table(logo_data, colWidths=[12*mm, W - 52*mm, 40*mm])
    logo_tbl.setStyle(TableStyle([
        ("VALIGN",     (0,0), (-1,-1), "MIDDLE"),
        ("BACKGROUND", (0,0), (0,0),   SAFFRON),
        ("ROUNDEDCORNERS", [4]),
        ("LEFTPADDING",  (0,0), (0,0), 8),
        ("RIGHTPADDING", (0,0), (0,0), 8),
        ("LEFTPADDING",  (1,0), (1,0), 10),
    ]))
    story.append(logo_tbl)
    story.append(Spacer(1, 10))

    # title
    story.append(Paragraph("Ward Consultation Brief", S["title"]))
    if proposal.get("title"):
        story.append(Paragraph(proposal["title"], S["subtitle"]))
    if proposal.get("stage"):
        stage_txt = (
            f"Stage: {proposal['stage']}"
            + (f"  ·  {proposal.get('days_until_gbm')} days to General Body Meeting"
               if proposal.get("days_until_gbm") else "")
        )
        story.append(Paragraph(stage_txt, S["subtitle"]))
    story.append(Spacer(1, 6))

    # transparency guarantee box
    tg_data = [[Paragraph(
        "🔒  TRANSPARENCY GUARANTEE — This brief is generated from the same data "
        "citizens can view on their side. No information has been withheld or altered.",
        ParagraphStyle("tg", fontName="Helvetica", fontSize=8, textColor=GREEN,
                       leading=12, leftIndent=0)
    )]]
    tg_tbl = Table(tg_data, colWidths=[W])
    tg_tbl.setStyle(TableStyle([
        ("BACKGROUND",   (0,0), (-1,-1), HexColor("#0d2e0d")),
        ("BOX",          (0,0), (-1,-1), 0.5, GREEN),
        ("LEFTPADDING",  (0,0), (-1,-1), 8),
        ("RIGHTPADDING", (0,0), (-1,-1), 8),
        ("TOPPADDING",   (0,0), (-1,-1), 6),
        ("BOTTOMPADDING",(0,0), (-1,-1), 6),
    ]))
    story.append(tg_tbl)
    story.append(Spacer(1, 12))
    story.append(HRFlowable(width=W, thickness=0.5, color=HexColor("#1E2D45")))
    story.append(Spacer(1, 8))

    # ── STATS ROW ─────────────────────────────────────────────────────────────
    story.append(Paragraph("Overview", S["section_head"]))
    stats_data = [[
        Paragraph(f"<b><font size='18' color='#FF6B00'>{total_responses}</font></b><br/>"
                  "<font size='8' color='#8A9BB0'>TOTAL RESPONSES</font>",
                  ParagraphStyle("stat", fontName="Helvetica", fontSize=8,
                                 textColor=MUTED, leading=22, alignment=TA_CENTER)),
        Paragraph(f"<b><font size='18' color='#3B82F6'>{len(cluster_list)}</font></b><br/>"
                  "<font size='8' color='#8A9BB0'>CONCERN THEMES</font>",
                  ParagraphStyle("stat", fontName="Helvetica", fontSize=8,
                                 textColor=MUTED, leading=22, alignment=TA_CENTER)),
        Paragraph(f"<b><font size='18' color='#EF4444'>{critical_count}</font></b><br/>"
                  "<font size='8' color='#8A9BB0'>SILENT GROUPS</font>",
                  ParagraphStyle("stat", fontName="Helvetica", fontSize=8,
                                 textColor=MUTED, leading=22, alignment=TA_CENTER)),
        Paragraph(f"<b><font size='18' color='#FBBF24'>{overall_silence}%</font></b><br/>"
                  "<font size='8' color='#8A9BB0'>SILENCE SCORE</font>",
                  ParagraphStyle("stat", fontName="Helvetica", fontSize=8,
                                 textColor=MUTED, leading=22, alignment=TA_CENTER)),
    ]]
    col_w = W / 4
    stats_tbl = Table(stats_data, colWidths=[col_w]*4)
    stats_tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), HexColor("#0F1E33")),
        ("BOX",           (0,0), (-1,-1), 0.5, HexColor("#1E2D45")),
        ("INNERGRID",     (0,0), (-1,-1), 0.5, HexColor("#1E2D45")),
        ("TOPPADDING",    (0,0), (-1,-1), 10),
        ("BOTTOMPADDING", (0,0), (-1,-1), 10),
        ("ALIGN",         (0,0), (-1,-1), "CENTER"),
        ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
    ]))
    story.append(stats_tbl)
    story.append(Spacer(1, 14))

    # ── EXECUTIVE SUMMARY ────────────────────────────────────────────────────
    if exec_summary:
        story.append(Paragraph("Executive Summary", S["section_head"]))
        es_data = [[Paragraph(exec_summary,
            ParagraphStyle("es", fontName="Helvetica", fontSize=10,
                           textColor=LIGHT, leading=16))]]
        es_tbl = Table(es_data, colWidths=[W])
        es_tbl.setStyle(TableStyle([
            ("BACKGROUND",   (0,0), (-1,-1), HexColor("#1a1200")),
            ("LEFTBORDER",   (0,0), (0,-1), 3, SAFFRON),
            ("BOX",          (0,0), (-1,-1), 0.5, HexColor("#FF6B0033")),
            ("LEFTPADDING",  (0,0), (-1,-1), 12),
            ("RIGHTPADDING", (0,0), (-1,-1), 10),
            ("TOPPADDING",   (0,0), (-1,-1), 10),
            ("BOTTOMPADDING",(0,0), (-1,-1), 10),
        ]))
        story.append(es_tbl)
        story.append(Spacer(1, 14))

    # ── SILENCE DETECTOR ─────────────────────────────────────────────────────
    story.append(Paragraph("Silence Detector — Unheard Groups", S["section_head"]))

    if silence.get("summary"):
        story.append(Paragraph(silence["summary"], S["body"]))
        story.append(Spacer(1, 6))

    if silence_flags:
        flag_rows = [["Group", "Est. Population", "Responses", "Participation", "Status"]]
        for flag in silence_flags:
            status_style = {
                "critical": S["flag_critical"],
                "low":      S["flag_low"],
                "adequate": S["flag_ok"],
            }.get(flag.get("status", "adequate"), S["flag_ok"])

            flag_rows.append([
                Paragraph(flag.get("label", ""), S["bold"]),
                Paragraph(f"{flag.get('estimated_count', 0):,}", S["body_small"]),
                Paragraph(str(flag.get("actual_responses", 0)), S["body_small"]),
                Paragraph(f"{flag.get('participation_pct', 0)}%", S["body_small"]),
                Paragraph(
                    f"{flag.get('status_emoji','')} {flag.get('status','').upper()}",
                    status_style
                ),
            ])

        flag_tbl = Table(flag_rows,
            colWidths=[W*0.28, W*0.18, W*0.14, W*0.16, W*0.24])
        flag_tbl.setStyle(TableStyle([
            ("BACKGROUND",    (0,0), (-1,0),  HexColor("#1E2D45")),
            ("TEXTCOLOR",     (0,0), (-1,0),  MUTED),
            ("FONTNAME",      (0,0), (-1,0),  "Helvetica-Bold"),
            ("FONTSIZE",      (0,0), (-1,0),  8),
            ("ROWBACKGROUNDS",(0,1), (-1,-1),
             [HexColor("#0F1E33"), HexColor("#0A1628")]),
            ("BOX",           (0,0), (-1,-1), 0.5, HexColor("#1E2D45")),
            ("INNERGRID",     (0,0), (-1,-1), 0.3, HexColor("#1E2D45")),
            ("TOPPADDING",    (0,0), (-1,-1), 6),
            ("BOTTOMPADDING", (0,0), (-1,-1), 6),
            ("LEFTPADDING",   (0,0), (-1,-1), 8),
            ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
        ]))
        story.append(flag_tbl)

    story.append(Spacer(1, 14))

    # ── RESPONSE BREAKDOWN ────────────────────────────────────────────────────
    if profile_counts:
        story.append(Paragraph("Response Breakdown by Citizen Group", S["section_head"]))
        profile_labels = {
            "auto_driver": "Auto Rickshaw Drivers",
            "street_vendor": "Street Vendors",
            "homeowner": "Property Owners",
            "tenant": "Tenants / Renters",
            "elderly_resident": "Senior Citizens (60+)",
        }
        pb_rows = [["Citizen Group", "Responses", "Share of Total"]]
        for pid, count in profile_counts.items():
            pct = (count / total_responses * 100) if total_responses else 0
            pb_rows.append([
                Paragraph(profile_labels.get(pid, pid), S["body"]),
                Paragraph(str(count), S["body"]),
                Paragraph(f"{pct:.1f}%", S["body"]),
            ])
        pb_tbl = Table(pb_rows, colWidths=[W*0.55, W*0.2, W*0.25])
        pb_tbl.setStyle(TableStyle([
            ("BACKGROUND",    (0,0), (-1,0),  HexColor("#1E2D45")),
            ("TEXTCOLOR",     (0,0), (-1,0),  MUTED),
            ("FONTNAME",      (0,0), (-1,0),  "Helvetica-Bold"),
            ("FONTSIZE",      (0,0), (-1,0),  8),
            ("ROWBACKGROUNDS",(0,1), (-1,-1),
             [HexColor("#0F1E33"), HexColor("#0A1628")]),
            ("BOX",           (0,0), (-1,-1), 0.5, HexColor("#1E2D45")),
            ("INNERGRID",     (0,0), (-1,-1), 0.3, HexColor("#1E2D45")),
            ("TOPPADDING",    (0,0), (-1,-1), 6),
            ("BOTTOMPADDING", (0,0), (-1,-1), 6),
            ("LEFTPADDING",   (0,0), (-1,-1), 8),
        ]))
        story.append(pb_tbl)
        story.append(Spacer(1, 14))

    # ── CONCERN CLUSTERS ─────────────────────────────────────────────────────
    if cluster_list:
        story.append(Paragraph("Concern Clusters — AI Analysis", S["section_head"]))

        sentiment_colors = {
            "concern": RED, "support": GREEN, "mixed": AMBER
        }

        for i, cluster in enumerate(cluster_list):
            sent_color = sentiment_colors.get(cluster.get("sentiment", ""), MUTED)
            theme      = cluster.get("theme", f"Theme {i+1}")
            count      = cluster.get("count", 0)
            pct        = cluster.get("percentage", 0)
            quote      = cluster.get("representative_quote", "")
            demos      = ", ".join(cluster.get("demographics", []))
            sentiment  = cluster.get("sentiment", "").upper()

            cluster_content = [
                [
                    Paragraph(f"<b>#{i+1}  {theme}</b>",
                        ParagraphStyle("ch", fontName="Helvetica-Bold", fontSize=10,
                                       textColor=WHITE, leading=14)),
                    Paragraph(
                        f"<font color='#{sent_color.hexval()[2:]}'>{sentiment}</font>  "
                        f"<b>{count}</b> responses  ({pct:.0f}%)",
                        ParagraphStyle("cm", fontName="Helvetica", fontSize=9,
                                       textColor=MUTED, leading=12, alignment=TA_RIGHT)),
                ]
            ]
            cluster_tbl = Table(cluster_content, colWidths=[W*0.65, W*0.35])
            cluster_tbl.setStyle(TableStyle([
                ("BACKGROUND",   (0,0), (-1,-1), HexColor("#0F1E33")),
                ("TOPPADDING",   (0,0), (-1,-1), 8),
                ("BOTTOMPADDING",(0,0), (-1,-1), 8),
                ("LEFTPADDING",  (0,0), (-1,-1), 10),
                ("VALIGN",       (0,0), (-1,-1), "MIDDLE"),
                ("LINEBELOW",    (0,0), (-1,-1), 0.3, sent_color),
            ]))
            story.append(cluster_tbl)

            detail_rows = []
            if quote:
                detail_rows.append(Paragraph(f'"{quote}"', S["quote"]))
            if demos:
                detail_rows.append(Paragraph(
                    f"Most represented: {demos}",
                    ParagraphStyle("dem", fontName="Helvetica", fontSize=8,
                                   textColor=MUTED, leading=11)))

            if detail_rows:
                detail_data = [[item] for item in detail_rows]
                detail_tbl  = Table(detail_data, colWidths=[W])
                detail_tbl.setStyle(TableStyle([
                    ("BACKGROUND",   (0,0), (-1,-1), HexColor("#080F1A")),
                    ("LEFTPADDING",  (0,0), (-1,-1), 12),
                    ("RIGHTPADDING", (0,0), (-1,-1), 10),
                    ("TOPPADDING",   (0,0), (-1,-1), 6),
                    ("BOTTOMPADDING",(0,0), (-1,-1), 6),
                ]))
                story.append(detail_tbl)
            story.append(Spacer(1, 6))

    # ── MINORITY POSITIONS NOTE ───────────────────────────────────────────────
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width=W, thickness=0.5, color=HexColor("#1E2D45")))
    story.append(Spacer(1, 8))
    mn_data = [[Paragraph(
        "<b>MINORITY POSITIONS — CANNOT BE DISMISSED</b><br/>"
        "<font size='8' color='#8A9BB0'>All minority positions captured in this consultation "
        "are logged separately and preserved in the official record. "
        "They cannot be overwritten or aggregated away before the GBM vote. "
        "This is a structural guarantee of the Vaani system.</font>",
        ParagraphStyle("mn", fontName="Helvetica", fontSize=9, textColor=HexColor("#A78BFA"),
                       leading=14))]]
    mn_tbl = Table(mn_data, colWidths=[W])
    mn_tbl.setStyle(TableStyle([
        ("BACKGROUND",   (0,0), (-1,-1), HexColor("#120d1f")),
        ("BOX",          (0,0), (-1,-1), 0.5, HexColor("#8B5CF6")),
        ("LEFTPADDING",  (0,0), (-1,-1), 10),
        ("RIGHTPADDING", (0,0), (-1,-1), 10),
        ("TOPPADDING",   (0,0), (-1,-1), 8),
        ("BOTTOMPADDING",(0,0), (-1,-1), 8),
    ]))
    story.append(mn_tbl)
    story.append(Spacer(1, 10))

    # footer
    story.append(Paragraph(
        f"Vaani Democratic Signal Engine  ·  AIC × Anthropic Claude Hackathon 2025  ·  "
        f"Ward {ward_name} ({ward_code})  ·  "
        f"Generated {datetime.fromisoformat(gen_at).strftime('%d %b %Y %H:%M')}",
        ParagraphStyle("footer", fontName="Helvetica", fontSize=7, textColor=MUTED,
                       leading=10, alignment=TA_CENTER)
    ))

    # ── BUILD ─────────────────────────────────────────────────────────────────
    buf = io.BytesIO()
    doc2 = SimpleDocTemplate(
        buf, pagesize=A4,
        leftMargin=18*mm, rightMargin=18*mm,
        topMargin=20*mm, bottomMargin=20*mm,
    )

    def bg(canvas, doc):
        canvas.saveState()
        canvas.setFillColor(NAVY)
        canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
        canvas.setFillColor(SAFFRON)
        canvas.rect(0, PAGE_H - 6, PAGE_W, 6, fill=1, stroke=0)
        canvas.setFillColor(GREEN)
        canvas.rect(0, 0, PAGE_W, 4, fill=1, stroke=0)
        canvas.restoreState()

    doc2.build(story, onFirstPage=bg, onLaterPages=bg)
    return buf.getvalue()
