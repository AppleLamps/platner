#!/usr/bin/env python3
"""Generate professional opposition research PDF for Graham Platner dossier."""

from __future__ import annotations

import re
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
MD_PATH = ROOT / "docs" / "platner.md"
OUT_PATH = ROOT / "output" / "pdf" / "platner-opposition-research.pdf"

# Palette - restrained professional oppo research
NAVY = colors.HexColor("#1B2838")
SLATE = colors.HexColor("#4A5568")
RULE = colors.HexColor("#CBD5E0")
LIGHT_BG = colors.HexColor("#F7FAFC")
ACCENT = colors.HexColor("#9B2C2C")
WHITE = colors.white
BLACK = colors.HexColor("#111111")


class DossierDoc(BaseDocTemplate):
    def __init__(self, filename: str, **kwargs):
        super().__init__(filename, **kwargs)
        frame = Frame(
            self.leftMargin,
            self.bottomMargin,
            self.width,
            self.height,
            id="normal",
        )
        cover_frame = Frame(0, 0, self.pagesize[0], self.pagesize[1], leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        self.addPageTemplates(
            [
                PageTemplate(id="Cover", frames=[cover_frame], onPage=self._cover_page),
                PageTemplate(id="Body", frames=[frame], onPage=self._body_page),
            ]
        )

    def _cover_page(self, canvas, doc):
        w, h = letter
        canvas.saveState()
        canvas.setFillColor(NAVY)
        canvas.rect(0, h - 1.35 * inch, w, 1.35 * inch, fill=1, stroke=0)
        canvas.setFillColor(ACCENT)
        canvas.rect(0, h - 1.55 * inch, w, 0.2 * inch, fill=1, stroke=0)
        canvas.setFillColor(WHITE)
        canvas.setFont("Helvetica-Bold", 11)
        canvas.drawString(0.85 * inch, h - 0.72 * inch, "OPPOSITION RESEARCH DOSSIER")
        canvas.setFont("Helvetica", 9)
        canvas.drawString(0.85 * inch, h - 0.98 * inch, "Political opposition research - public-record and open-source synthesis")
        canvas.restoreState()

    def _body_page(self, canvas, doc):
        canvas.saveState()
        w, h = letter
        canvas.setStrokeColor(RULE)
        canvas.setLineWidth(0.5)
        canvas.line(0.85 * inch, 0.62 * inch, w - 0.85 * inch, 0.62 * inch)
        canvas.setFillColor(SLATE)
        canvas.setFont("Helvetica", 8)
        canvas.drawString(0.85 * inch, 0.42 * inch, "Graham Platner Opposition Research Dossier")
        canvas.drawRightString(w - 0.85 * inch, 0.42 * inch, f"Page {doc.page}")
        canvas.restoreState()


def styles() -> dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()
    return {
        "cover_title": ParagraphStyle(
            "cover_title",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=28,
            leading=32,
            textColor=NAVY,
            alignment=TA_LEFT,
            spaceAfter=14,
        ),
        "cover_sub": ParagraphStyle(
            "cover_sub",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=12,
            leading=16,
            textColor=SLATE,
            spaceAfter=8,
        ),
        "cover_meta": ParagraphStyle(
            "cover_meta",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=10,
            leading=14,
            textColor=BLACK,
            spaceAfter=6,
        ),
        "cover_class": ParagraphStyle(
            "cover_class",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=9,
            leading=12,
            textColor=ACCENT,
            spaceBefore=18,
            spaceAfter=6,
        ),
        "h1": ParagraphStyle(
            "h1",
            parent=base["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=16,
            leading=20,
            textColor=NAVY,
            spaceBefore=16,
            spaceAfter=10,
            borderPadding=0,
        ),
        "h2": ParagraphStyle(
            "h2",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=15,
            textColor=NAVY,
            spaceBefore=12,
            spaceAfter=6,
        ),
        "h3": ParagraphStyle(
            "h3",
            parent=base["Heading3"],
            fontName="Helvetica-Bold",
            fontSize=10.5,
            leading=13,
            textColor=BLACK,
            spaceBefore=8,
            spaceAfter=4,
        ),
        "body": ParagraphStyle(
            "body",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=9.5,
            leading=13,
            textColor=BLACK,
            alignment=TA_JUSTIFY,
            spaceAfter=6,
        ),
        "bullet": ParagraphStyle(
            "bullet",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=9.5,
            leading=13,
            textColor=BLACK,
            leftIndent=14,
            bulletIndent=0,
            spaceAfter=3,
        ),
        "toc": ParagraphStyle(
            "toc",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=10,
            leading=14,
            textColor=BLACK,
            spaceAfter=4,
        ),
        "small": ParagraphStyle(
            "small",
            parent=base["Normal"],
            fontName="Helvetica-Oblique",
            fontSize=8.5,
            leading=11,
            textColor=SLATE,
            spaceAfter=4,
        ),
    }


def P(text: str, style: ParagraphStyle) -> Paragraph:
    text = text.replace("—", "-").replace("–", "-")
    return Paragraph(text, style)


def strip_md(text: str) -> str:
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = text.replace("`", "")
    return text


def table(data: list[list[str]], col_widths: list[float], header_rows: int = 1) -> Table:
    wrapped = [[P(strip_md(c), styles()["body"]) if isinstance(c, str) else c for c in row] for row in data]
    t = Table(wrapped, colWidths=col_widths, repeatRows=header_rows)
    style_cmds = [
        ("BACKGROUND", (0, 0), (-1, header_rows - 1), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, header_rows - 1), WHITE),
        ("FONTNAME", (0, 0), (-1, header_rows - 1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8.5),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.25, RULE),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]
    for i in range(header_rows, len(data)):
        if i % 2 == 0:
            style_cmds.append(("BACKGROUND", (0, i), (-1, i), LIGHT_BG))
    t.setStyle(TableStyle(style_cmds))
    return t


def bullets(items: list[str], st: dict[str, ParagraphStyle], numbered: bool = False) -> list:
    flow = []
    for i, item in enumerate(items, 1):
        prefix = f"{i}. " if numbered else "- "
        flow.append(P(f"{prefix}{strip_md(item)}", st["bullet"]))
    return flow


def build_story() -> list:
    st = styles()
    s: list = []
    usable = letter[0] - 1.7 * inch

    # Cover content (positioned with spacers inside cover frame)
    s.append(Spacer(1, 1.85 * inch))
    s.append(P("Graham Platner", st["cover_title"]))
    s.append(P("U.S. Senate Candidate, Maine (2026)", st["cover_sub"]))
    s.append(Spacer(1, 0.35 * inch))
    for line in [
        "<b>Subject:</b> Graham Platner, Democratic nominee for U.S. Senate",
        "<b>Opponent:</b> Susan Collins (R), incumbent",
        "<b>Prepared:</b> June 2026",
        "<b>Office sought:</b> United States Senate, State of Maine",
    ]:
        s.append(P(line, st["cover_meta"]))
    s.append(P("CLASSIFICATION: Political opposition research", st["cover_class"]))
    s.append(
        P(
            "This document synthesizes public-record reporting and open-source political discourse. "
            "Claims should be verified against primary sources before paid media or legal use.",
            st["small"],
        )
    )
    s.append(NextPageTemplate("Body"))
    s.append(PageBreak())

    # TOC
    s.append(P("Table of Contents", st["h1"]))
    s.append(Spacer(1, 6))
    toc_items = [
        "1. Executive Summary",
        "2. Subject Profile",
        "3. Key Vulnerabilities",
        "4. Scandal Inventory",
        "5. Argument Matrix",
        "6. Chronology",
        "7. Progressive Left Landscape",
        "8. Institutional Actors",
        "9. Policy Record",
        "10. Hard Opposition Arguments",
        "11. Strategic Assessment",
        "12. Research Notes",
    ]
    for item in toc_items:
        s.append(P(item, st["toc"]))
    s.append(PageBreak())

    # 1 Executive Summary
    s.append(P("1. Executive Summary", st["h1"]))
    s.append(
        P(
            "Graham Platner is a Marine veteran, former private-security contractor, and oyster farmer running as a "
            "populist progressive against Susan Collins. His stated platform - wealth tax, Medicare for All, "
            "anti-AIPAC positioning, Gaza opposition, anti-billionaire rhetoric - places him to Collins's left and "
            "has drawn national progressive attention.",
            st["body"],
        )
    )
    s.append(P("<b>Core vulnerability:</b> Platner's biography, not his platform, dominates the political fight. "
               "A Totenkopf chest tattoo, extensive Reddit history, Blackwater/Constellis employment, Fight Agency "
               "consultancy ties, and June 2026 New York Times abuse allegations form a layered character record that "
               "opponents and skeptical allies treat as disqualifying or high-risk.", st["body"]))
    s.append(P("<b>Strategic picture:</b> Progressive discourse fractures into five camps. Larger instances lean "
               "support-with-caveats; Marxist-Leninist and anti-imperialist spaces lean hard rejection. The unresolved "
               "electoral question is whether Platner is a usable Democratic nominee or a Fetterman-style trap.", st["body"]))
    s.append(P("Highest-value attack lines", st["h2"]))
    s.extend(bullets([
        "Totenkopf tattoo - knowledge vs. ignorance both damaging; campaign staff knew early; cover-up timeline",
        "Military/contractor record - volunteered post-invasion, combat enthusiasm in own words, Blackwater stint, no reparative accounting to war victims",
        "Reddit archive - racism, homophobia, sexual-assault dismissals, kill-for-fun posts into the 2020s",
        "Fetterman parallel - same populist aesthetic, Fight Agency overlap, staff echoes (Rebecca Katz, Joe Calvello)",
        "Manufactured authenticity - Fight Agency, Schumer accommodation after Mills dropout, thin pre-2025 political resume",
        "NYT abuse allegations (June 2026) - pattern argument; Heritage/Kavanaugh ties to accuser Lyndsey Fifield fuel hit-job counter-narrative",
    ], st))
    s.append(P("<b>Defender counter-narratives to anticipate:</b> AIPAC/pro-Collins/GOP hit job; Mamdani-style scandal survival; town-hall competence and Maine ground game; Bernie/AFL-CIO/Common Defense endorsements; purity tests help fascists.", st["body"]))

    # 2 Subject Profile
    s.append(P("2. Subject Profile", st["h1"]))
    s.append(table(
        [
            ["Field", "Detail"],
            ["Office sought", "U.S. Senate, Maine"],
            ["Party", "Democratic"],
            ["Background", "U.S. Marine Corps (multiple tours, post-2003 invasion enlistment); Constellis/Blackwater contractor; oyster farmer, Maine"],
            ["Primary opponent (resolved)", "Janet Mills - Schumer-backed establishment pick; dropped out after polls and fundraising collapsed"],
            ["General election opponent", "Susan Collins (R), incumbent"],
            ["Stated platform", "Wealth tax, M4A, anti-AIPAC, Gaza opposition, anti-billionaire, anti-forever-war, impeach Trump, investigate corruption, affordability"],
            ["Key endorsements cited", "Bernie Sanders, AFL-CIO, Common Defense, Working Families Party"],
            ["Consultancy tie", "Fight Agency (also linked to Zohran Mamdani campaign)"],
        ],
        [1.4 * inch, usable - 1.4 * inch],
    ))
    s.append(Spacer(1, 8))
    s.append(P("Electoral framing: The ballot question is not whether Platner is good but <b>Platner vs. Collins</b>. During the primary it was <b>Platner vs. Mills</b>. Maine-local voices emphasize on-the-ground organizing; national critics insist biography matters for a Senate seat and movement credibility.", st["body"]))

    # 3 Key Vulnerabilities
    s.append(PageBreak())
    s.append(P("3. Key Vulnerabilities", st["h1"]))

    vuln_sections = [
        ("3.1 Totenkopf Tattoo", "The hinge issue across skeptical and hard-opposition camps.", [
            "<b>He knew:</b> Jewish Insider 2012 my Totenkopf quote; CNN KFile; acquaintance testimony; campaign director aware since August - then public claims of ignorance.",
            "<b>He didn't know:</b> Disqualifying ignorance for a Senate candidate; military history buff who discussed Totenkopf on Reddit while deflecting to Punisher skull imagery.",
            "Tattoo on chest for approximately 18 years before cover-up.",
            "Covered only when campaign forced it, not when staff first flagged it.",
            "Campaign manager / political director resignation undercuts nothingburger framing.",
            "Lying about knowledge is harder to forgive than the tattoo itself.",
            "<b>Defender frame:</b> Obscure symbol; ignorance plausible; covered quickly; not George Santos-level fabrication.",
        ]),
        ("3.2 Military and Contractor History", None, [
            "Enlisted in Marines after Iraq invasion began; own Reddit language about volunteering to kill people and have adventure.",
            "Multiple combat tours; re-enlisted; old posts describe enjoyment of combat.",
            "Blackwater/Constellis employment - defenders: short diplomatic-security work; critics: mercenary service.",
            "Reddit posts reference mortar/grenade workarounds after orders to stop indirect fire in urban areas.",
            "Class narrative vulnerability: prep school, parents' restaurant, scholarship vs. working-class oyster farmer branding.",
            "No documented apology or reparative work toward Iraqi or Afghan victims.",
            "Policy contradiction: rebuild/make military more efficient, not defund - budget nationalism, not anti-imperialism.",
            "<b>Hard-opposition frame:</b> War crimes participation; unrepentant mass murderer.",
            "<b>Defender frame:</b> PTSD redemption arc; quit contractor work disillusioned with MIC.",
        ]),
        ("3.3 Reddit and Social Media Archive", None, [
            "Homophobic slurs (instances as recent as 2020 cited), racist comments, sexual assault dismissals, anti-LGBTQ jokes.",
            "Pattern extends beyond 2009-2013 edgelord phase into 2020s.",
            "Post deletion before campaign launch reads as cover-up.",
            "Trans town hall praised but separate discourse flags civility double standard on tattoo pushback.",
        ]),
        ("3.4 Fight Agency and Institutional Ties", None, [
            "Fight Agency linked to Platner and Mamdani campaigns.",
            "Staff overlap with Fetterman orbit (Rebecca Katz, Joe Calvello).",
            "Sheepdog theory: hand-picked aesthetic anti-establishment candidate to absorb left energy into Democratic Party.",
            "Schumer/DSCC backed Mills; dirty oppo ran; Mills dropped; Schumer later accommodated Platner.",
            "Thin political resume before 2025 - FILE NOT FOUND on movement credentials in skeptical discourse.",
        ]),
        ("3.5 Relationship and Character Allegations (June 2026)", None, [
            "New York Times: three ex-partners describe unsettling behavior and physical intimidation; Platner denies.",
            "Accuser Lyndsey Fifield tied to Heritage Foundation / Ladies for Kavanaugh.",
            "Sexting controversy; wife Amy Gertner statement framed as mutual understanding.",
            "Pattern argument (skeptics): tattoo, Reddit, sexting, abuse allegations form escalating character record.",
            "Hit-job argument (defenders): GOP operative ties; $50M pro-Collins PAC spending.",
        ]),
        ("3.6 Electoral and Movement Risk - Fetterman Comparison", "Central trauma frame for skeptical progressives.", [
            "Same populist aesthetic, consultancy echoes, working-class branding.",
            "Fear he will flip on Gaza/Zionism once seated.",
            "No Mamdani-style pedigree: no DSA chapter, no vouching network.",
            "Political Pascal's wager: bet, not faith.",
            "Alternatives Smith-Rodriguez, David Costello not mobilized; ranked-choice underused.",
            "Trust is conditional: use him if necessary, then make him prove it.",
        ]),
    ]
    for title, lead, items in vuln_sections:
        s.append(P(title, st["h2"]))
        if lead:
            s.append(P(lead, st["body"]))
        s.extend(bullets(items, st))
        s.append(Spacer(1, 4))

    # 4 Scandal Inventory
    s.append(PageBreak())
    s.append(P("4. Scandal Inventory", st["h1"]))
    s.append(table(
        [
            ["Issue", "Pragmatic read", "Skeptical read", "Hard opposition read"],
            ["Totenkopf tattoo", "Ignorance / obscure symbol", "Knew and lied; staff knew", "Disqualifying Nazi symbolism"],
            ["Reddit history", "Outgrew; chronology matters", "Pattern into 2020s; cover-up", "Racist war-criminal posts"],
            ["Blackwater/Constellis", "Short bodyguard stint", "Mercenary service", "War crimes; no reparative accounting"],
            ["Fight Agency", "Coincidence; Mamdani too", "Manufactured run", "DNC sheepdog"],
            ["Schumer tie", "Proves establishment feared him", "Proves inside tent", "Proof of co-option"],
            ["Sexting (2026)", "Overblown", "Character pattern", "-"],
            ["NYT abuse (2026)", "Fifield hit job", "Behavior pattern", "-"],
            ["Homophobic posts", "Military bro phase", "2020 slurs", "-"],
            ["Sexual assault Reddit", "Misread / context", "Dismissive of victims", "-"],
            ["Bot armies / astroturf", "Opponent psyop", "Both sides alleged", "Psyop speculation"],
        ],
        [1.1 * inch, 1.35 * inch, 1.35 * inch, usable - 3.8 * inch],
    ))

    # 5 Argument Matrix
    s.append(Spacer(1, 12))
    s.append(P("5. Argument Matrix - Attack vs. Defense", st["h1"]))
    s.append(table(
        [
            ["Topic", "Defense narrative", "Attack narrative"],
            ["Totenkopf", "Ignorance; covered fast; obscure symbol", "Knew for years; my Totenkopf; lied; staff knew"],
            ["Military", "PTSD redemption; protested then served", "Volunteered to kill; re-enlisted; Blackwater; no apology to war victims"],
            ["Reddit", "Outgrew 2009-2013; growth chronology", "Racism, homophobia, rape dismissals into 2020s"],
            ["Fetterman", "Different person; no prior political career", "Same staff; same aesthetic; will betray"],
            ["Fight Agency", "They fear him", "Manufactured candidate"],
            ["Schumer", "Proves establishment feared him", "Proves inside tent"],
            ["Policy vs. character", "Judge M4A, Gaza, wealth tax, town-hall competence", "Judge actions; words cheap; trust must be earned"],
            ["Fifield / abuse", "GOP operative hit job", "Pattern of behavior"],
            ["Alternatives", "Collins / Mills only viable", "Costello, Smith-Rodriguez, ranked choice unused"],
            ["Hegseth / Trump", "Hypocrisy to focus on Platner ink", "Platner undermines Nazi attacks on the right"],
        ],
        [1.0 * inch, (usable - 1.0 * inch) / 2, (usable - 1.0 * inch) / 2],
    ))

    # 6 Chronology
    s.append(PageBreak())
    s.append(P("6. Chronology", st["h1"]))
    chronology = [
        ("August-September 2025 - Campaign Launch", [
            "Oligarchy is the enemy campaign launch.",
            "Janet Mills positioned as Schumer's establishment pick.",
            "Immediate skepticism from anti-imperialist corners.",
        ]),
        ("October-November 2025 - Tattoo and Reddit Scandal", [
            "Totenkopf tattoo discovered; cover-up timeline; Jewish Insider; CNN KFile; campaign director resignation.",
            "Reddit dump: homophobia, racism, rape comments, kill-for-fun posts.",
            "Jacobin bulk chronology defense; trans town hall redemption peak.",
            "Smith-Rodriguez raised as less-baggage alternative - failed to gain traction.",
        ]),
        ("Winter-Spring 2026 - Primary Consolidation", [
            "Jon Stewart / DNC snub discourse; Fetterman 2.0 comparison intensifies.",
            "Mills as weak Schumer pick vs. Platner ground game.",
            "Platner as Maine entry in broader populist wave.",
        ]),
        ("April-May 2026 - Post-Mills", [
            "Mills dropout celebrated as voter revolt; polls ahead of Collins fuel pragmatists.",
            "Chat, be normal culture war: accept imperfect populists vs. purity.",
        ]),
        ("June 2026 - Relationship and Abuse Wave", [
            "NYT ex-partner story; Fifield Heritage/Kavanaugh framing dominates pragmatic response.",
            "Pragmatic coalition largely holds; skeptical center deepens.",
        ]),
    ]
    for title, items in chronology:
        s.append(P(title, st["h2"]))
        s.extend(bullets(items, st))

    # 7 Progressive Left Landscape
    s.append(PageBreak())
    s.append(P("7. Progressive Left Landscape", st["h1"]))
    s.append(P("Discourse across feddit.dk search results (25 pages, sort=New) reveals five recurring camps:", st["body"]))
    s.append(table(
        [
            ["Camp", "Core claim", "Discourse weight"],
            ["Pragmatic harm-reduction", "Flawed but best instrument to beat Collins", "~40%"],
            ["Skeptical conditional", "Red flags real; Collins worse; harm reduction not movement trust", "~25%"],
            ["Hard anti-imperialist", "Disqualifying regardless of Collins", "~20%"],
            ["Establishment-skeptic boosters", "DNC tried to stop him - proves authenticity", "~10%"],
            ["Anarchist / anti-electoral", "Forgiveness not owed; Democrats absorb left energy", "~5%"],
        ],
        [1.5 * inch, usable - 2.2 * inch, 0.7 * inch],
    ))
    s.append(Spacer(1, 8))
    s.append(P("Instance split", st["h2"]))
    s.extend(bullets([
        "lemmy.world / progressivepolitics: lean pragmatic support (~70/30 support/reject)",
        "lemmy.ml / ML-aligned: lean hard rejection (~15/85)",
        "Trans / identity-focused spaces: higher bar for leaders (~40/60)",
    ], st))
    s.append(P("Near-consensus across camps", st["h2"]))
    s.extend(bullets([
        "Susan Collins is bad - even many anti-Platner voices prefer almost anyone to her",
        "Janet Mills was the wrong Democratic pick",
        "Fetterman comparison haunts all sides - outcome unknowable",
        "Stated platform is left of typical Democrats",
        "No organized alternative emerged",
        "Biography is the battleground",
        "Trust is conditional - sympathetic support is provisional",
    ], st))

    # 8 Institutional Actors
    s.append(P("8. Institutional Actors", st["h1"]))
    s.append(table(
        [
            ["Actor", "Role in discourse"],
            ["Bernie Sanders", "Legitimacy for pragmatists; skeptics ask if endorsement erases red flags"],
            ["Working Families Party", "Endorsement; internal critique of Fetterman-style laundering"],
            ["AFL-CIO / Common Defense", "Legitimacy signal for defenders"],
            ["Schumer / DSCC", "Opposed Mills first; later worked with Platner - cited both ways"],
            ["Jacobin", "Bulk-of-posts defense; attacked on ML instances"],
            ["AIPAC / pro-Collins PACs", "Opposition research funding; hit-job narrative anchor"],
            ["Mamdani", "Scandal-survival template for defenders; authenticity benchmark Platner fails for skeptics"],
            ["Maureen Galindo", "Contrast case - real left candidate crushed"],
        ],
        [1.5 * inch, usable - 1.5 * inch],
    ))

    # 9 Policy Record
    s.append(PageBreak())
    s.append(P("9. Policy Record - Stated Positions", st["h1"]))
    s.append(P("Left-populist emphasis (defender frame)", st["h2"]))
    s.extend(bullets([
        "Wealth tax, M4A, anti-AIPAC, Gaza genocide opposition, anti-forever-war",
        "Affordability, anti-data-center / anti-billionaire energy costs",
        "ICE resistance, voter ID fights, food pantries, grassroots campaigning",
        "Trans rights, LGBTQ+ defense; no super-PAC / no AIPAC money (claimed)",
        "Town-hall detail and organizing language as policy competence signal",
    ], st))
    s.append(P("Imperialism and military criticism (attack frame)", st["h2"]))
    s.extend(bullets([
        "Rebuild military efficiency, not defund - imperialism with better accounting",
        "Unjust wars wording - indistinguishable from warmonger Democrats",
        "Anti-war interviews without anti-imperialist record",
        "Populist nationalism vs. international solidarity",
        "No explicit apology, reparative work, or sustained empathy toward Iraqis/Afghans harmed by wars he joined",
    ], st))

    # 10 Hard Opposition
    s.append(P("10. Hard Opposition - Disqualification Arguments", st["h1"]))
    s.extend(bullets([
        "Nazi tattoo + war participation + contractor work = cannot be redeemed into Senate leadership",
        "Supporting him legitimizes empire; shifts Overton window toward acceptable proximity to Nazis",
        "Progressive label as sheepdogging - nationalist left aesthetics, not anti-imperialism",
        "Efficient military-industrial complex under Platner worse than incompetent status quo",
        "Democrats as honeypot: Fetterman 2.0 / WFP laundering pattern",
        "Schumer endorsement paradox: cannot be outsider if Chuck backs you",
        "Electoral nihilism: third party / don't vote Dem",
    ], st))
    s.append(P("Specific disputed claims: Abu Ghraib guard (exaggerated per some analysis); IDF ties / stepbrother propagandist (weak evidence per defenders); Ryan Grim / Drop Site glazing a war criminal; bot/astroturf allegations on both sides.", st["body"]))

    # 11 Strategic Assessment
    s.append(P("11. Strategic Assessment", st["h1"]))
    s.append(P("Movement energy trends toward using Platner as an electoral vehicle. Ideological energy trends toward treating support as litmus-test failure. The fediverse progressive left wants Platner's policies in the Senate and does not want Platner the person in their movement.", st["body"]))
    s.append(P("Recent abuse allegations (June 2026) have not collapsed the pragmatic coalition but deepen skepticism in the watch-like-a-hawk center. October-November 2025 tattoo/Reddit scandal set permanent camps.", st["body"]))
    s.append(P("Maine ground game: weekly town halls, anti-Washington authenticity, Sinclair local news focus on Reddit posts, Collins ads using Mills praising Collins.", st["body"]))
    s.append(P("Recommended opposition emphasis", st["h2"]))
    s.extend(bullets([
        "Tattoo knowledge timeline and campaign cover-up - hardest to spin for general audiences",
        "Own-words military Reddit archive - volunteer-to-kill framing, corpse desecration, combat enthusiasm",
        "Fetterman/Fight Agency institutional tie - preempt redemption narrative",
        "No reparative accounting to war victims - undercuts anti-imperialist branding with left audiences",
        "Abuse pattern argument - pair with acknowledgment of Fifield ties to inoculate hit-job counter",
        "Thin pre-2025 resume - FILE NOT FOUND on movement credentials",
    ], st))

    # 12 Research Notes
    s.append(P("12. Research Notes", st["h1"]))
    s.extend(bullets([
        "Primary open-source corpus: feddit.dk search results for platner, 25 pages, sort=New (Lemmy/fediverse instances). Supplementary public reporting includes Jewish Insider, CNN KFile, New York Times, Jacobin.",
        "Discourse synthesis captures arguments circulating in progressive spaces, not adjudicated fact. Biographical claims should be verified against primary reporting before paid media or legal use.",
        "Other Platner mentions in the search index are negligible; subject is Graham Platner, Maine Senate candidate.",
    ], st))
    s.append(Spacer(1, 20))
    s.append(P("End of dossier.", st["small"]))

    return s


def main() -> None:
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    doc = DossierDoc(
        str(OUT_PATH),
        pagesize=letter,
        leftMargin=0.85 * inch,
        rightMargin=0.85 * inch,
        topMargin=0.85 * inch,
        bottomMargin=0.85 * inch,
        title="Graham Platner Opposition Research Dossier",
        author="Opposition Research",
    )
    doc.build(build_story())
    print(f"Wrote {OUT_PATH}")


if __name__ == "__main__":
    main()
