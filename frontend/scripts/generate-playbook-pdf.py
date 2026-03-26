"""
Generate the 2026 DSCR Investor Playbook PDF for 818 Capital Partners.
Professional layout with cover page, table of contents, charts, tables, and CTAs.
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    KeepTogether, HRFlowable, Flowable
)
from reportlab.graphics.shapes import Drawing, Rect, String, Line, Circle
from reportlab.graphics import renderPDF
import os

# ── Colors ────────────────────────────────────────
NAVY_900 = HexColor('#0F1729')
NAVY_800 = HexColor('#1A2332')
NAVY_700 = HexColor('#2A3A52')
NAVY_500 = HexColor('#64748B')
NAVY_200 = HexColor('#CBD5E1')
NAVY_100 = HexColor('#E2E8F0')
NAVY_50 = HexColor('#F8FAFC')
ACCENT = HexColor('#2563EB')
ACCENT_LIGHT = HexColor('#60A5FA')
GREEN = HexColor('#16A34A')
YELLOW = HexColor('#EAB308')
ORANGE = HexColor('#EA580C')
RED = HexColor('#DC2626')
WHITE = white
BLACK = black

OUTPUT_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'public', 'downloads', '2026-dscr-investor-playbook.pdf')

# ── Custom Flowables ──────────────────────────────
class ColoredBox(Flowable):
    """A colored background box with text."""
    def __init__(self, width, height, bg_color, text, text_color=WHITE, font_size=11):
        Flowable.__init__(self)
        self.box_width = width
        self.box_height = height
        self.bg_color = bg_color
        self.text = text
        self.text_color = text_color
        self.font_size = font_size

    def wrap(self, aW, aH):
        return self.box_width, self.box_height

    def draw(self):
        self.canv.setFillColor(self.bg_color)
        self.canv.roundRect(0, 0, self.box_width, self.box_height, 6, fill=1, stroke=0)
        self.canv.setFillColor(self.text_color)
        self.canv.setFont('Helvetica-Bold', self.font_size)
        self.canv.drawCentredString(self.box_width / 2, self.box_height / 2 - 4, self.text)


class GaugeRow(Flowable):
    """DSCR gauge circles row."""
    def __init__(self, width):
        Flowable.__init__(self)
        self.total_width = width

    def wrap(self, aW, aH):
        return self.total_width, 80

    def draw(self):
        gauges = [
            ('N/A', 'No-Ratio', NAVY_500),
            ('0.75', 'Sub-1.0', ORANGE),
            ('1.0', 'Break-even', YELLOW),
            ('1.25+', 'Sweet Spot', GREEN),
        ]
        spacing = self.total_width / 4
        for i, (val, label, color) in enumerate(gauges):
            cx = spacing * i + spacing / 2
            cy = 50
            r = 25
            self.canv.setStrokeColor(color)
            self.canv.setLineWidth(3)
            self.canv.setFillColor(WHITE)
            self.canv.circle(cx, cy, r, fill=1, stroke=1)
            self.canv.setFillColor(NAVY_900)
            self.canv.setFont('Helvetica-Bold', 12 if len(val) <= 3 else 10)
            self.canv.drawCentredString(cx, cy - 5, val)
            self.canv.setFillColor(NAVY_500)
            self.canv.setFont('Helvetica', 8)
            self.canv.drawCentredString(cx, 12, label)


class HorizBar(Flowable):
    """Horizontal bar chart row."""
    def __init__(self, width, label, value, pct, color):
        Flowable.__init__(self)
        self.total_width = width
        self.label = label
        self.value = value
        self.pct = pct
        self.color = color

    def wrap(self, aW, aH):
        return self.total_width, 28

    def draw(self):
        label_w = 60
        bar_start = label_w + 10
        bar_max = self.total_width - bar_start - 10
        bar_w = bar_max * self.pct

        self.canv.setFillColor(NAVY_700)
        self.canv.setFont('Helvetica-Bold', 9)
        self.canv.drawRightString(label_w, 8, self.label)

        # Background bar
        self.canv.setFillColor(NAVY_200)
        self.canv.roundRect(bar_start, 2, bar_max, 20, 4, fill=1, stroke=0)

        # Value bar
        self.canv.setFillColor(self.color)
        self.canv.roundRect(bar_start, 2, bar_w, 20, 4, fill=1, stroke=0)

        # Value text
        self.canv.setFillColor(WHITE)
        self.canv.setFont('Helvetica-Bold', 8)
        self.canv.drawRightString(bar_start + bar_w - 6, 7, self.value)


class ScalingStep(Flowable):
    """Portfolio scaling step with circle and connector."""
    def __init__(self, width, step, title, subtitle, desc, is_last=False):
        Flowable.__init__(self)
        self.total_width = width
        self.step = step
        self.title = title
        self.subtitle = subtitle
        self.desc = desc
        self.is_last = is_last

    def wrap(self, aW, aH):
        return self.total_width, 55

    def draw(self):
        # Circle
        cx, cy = 20, 35
        self.canv.setFillColor(ACCENT)
        self.canv.circle(cx, cy, 14, fill=1, stroke=0)
        self.canv.setFillColor(WHITE)
        self.canv.setFont('Helvetica-Bold', 12)
        self.canv.drawCentredString(cx, cy - 4, str(self.step))

        # Connector line
        if not self.is_last:
            self.canv.setStrokeColor(ACCENT_LIGHT)
            self.canv.setLineWidth(1.5)
            self.canv.line(cx, cy - 14, cx, 0)

        # Text
        tx = 50
        self.canv.setFillColor(NAVY_900)
        self.canv.setFont('Helvetica-Bold', 11)
        self.canv.drawString(tx, 38, self.title)
        self.canv.setFillColor(NAVY_500)
        self.canv.setFont('Helvetica', 9)
        self.canv.drawString(tx, 24, self.subtitle)
        self.canv.setFont('Helvetica', 8)
        self.canv.drawString(tx, 10, self.desc)


# ── Page Templates ────────────────────────────────
def cover_page(canvas, doc):
    """Draw the cover page."""
    canvas.saveState()
    # Full navy background
    canvas.setFillColor(NAVY_900)
    canvas.rect(0, 0, letter[0], letter[1], fill=1, stroke=0)

    # Accent bar at top
    canvas.setFillColor(ACCENT)
    canvas.rect(0, letter[1] - 8, letter[0], 8, fill=1, stroke=0)

    # Logo area
    canvas.setFillColor(WHITE)
    canvas.setFont('Helvetica-Bold', 14)
    canvas.drawString(72, letter[1] - 72, '818 CAPITAL PARTNERS')
    canvas.setFillColor(ACCENT_LIGHT)
    canvas.setFont('Helvetica', 10)
    canvas.drawString(72, letter[1] - 90, 'Built by Operators. Built for Operators.')

    # Title
    canvas.setFillColor(WHITE)
    canvas.setFont('Helvetica-Bold', 42)
    canvas.drawString(72, 480, 'The 2026')
    canvas.drawString(72, 430, 'DSCR Investor')
    canvas.drawString(72, 380, 'Playbook')

    # Divider
    canvas.setStrokeColor(ACCENT)
    canvas.setLineWidth(3)
    canvas.line(72, 365, 250, 365)

    # Subtitle
    canvas.setFillColor(NAVY_200)
    canvas.setFont('Helvetica', 13)
    canvas.drawString(72, 335, 'Requirements. Rates. Strategies.')
    canvas.setFont('Helvetica', 11)
    canvas.drawString(72, 315, 'From a direct lender that closes in 14 days.')

    # Stats boxes
    stats = [('12+', 'Lenders\nAnalyzed'), ('9', 'Chapters'), ('4', 'Deal\nStudies'), ('38', 'Pages')]
    box_y = 200
    for i, (num, label) in enumerate(stats):
        bx = 72 + i * 120
        canvas.setFillColor(NAVY_800)
        canvas.roundRect(bx, box_y, 100, 65, 6, fill=1, stroke=0)
        canvas.setFillColor(ACCENT_LIGHT)
        canvas.setFont('Helvetica-Bold', 22)
        canvas.drawCentredString(bx + 50, box_y + 35, num)
        canvas.setFillColor(NAVY_500)
        canvas.setFont('Helvetica', 8)
        for j, line in enumerate(label.split('\n')):
            canvas.drawCentredString(bx + 50, box_y + 15 - j * 10, line)

    # Footer
    canvas.setFillColor(NAVY_500)
    canvas.setFont('Helvetica', 9)
    canvas.drawString(72, 72, '818capitalpartners.com')
    canvas.drawRightString(letter[0] - 72, 72, 'deals@818capitalpartners.com')
    canvas.setFont('Helvetica', 8)
    canvas.drawCentredString(letter[0] / 2, 50, '(917) 993-9194')

    canvas.restoreState()


def header_footer(canvas, doc):
    """Standard page header and footer."""
    canvas.saveState()

    # Header line
    canvas.setStrokeColor(NAVY_200)
    canvas.setLineWidth(0.5)
    canvas.line(72, letter[1] - 50, letter[0] - 72, letter[1] - 50)

    # Header text
    canvas.setFillColor(NAVY_500)
    canvas.setFont('Helvetica', 8)
    canvas.drawString(72, letter[1] - 44, '818 Capital Partners')
    canvas.drawRightString(letter[0] - 72, letter[1] - 44, 'The 2026 DSCR Investor Playbook')

    # Footer line
    canvas.line(72, 55, letter[0] - 72, 55)

    # Footer text
    canvas.setFont('Helvetica', 8)
    canvas.drawString(72, 40, '818capitalpartners.com')
    canvas.drawCentredString(letter[0] / 2, 40, f'Page {doc.page}')
    canvas.drawRightString(letter[0] - 72, 40, '(917) 993-9194')

    canvas.restoreState()


# ── Styles ────────────────────────────────────────
styles = getSampleStyleSheet()

style_h1 = ParagraphStyle('H1', parent=styles['Heading1'],
    fontName='Helvetica-Bold', fontSize=26, leading=32,
    textColor=NAVY_900, spaceBefore=20, spaceAfter=12)

style_h2 = ParagraphStyle('H2', parent=styles['Heading2'],
    fontName='Helvetica-Bold', fontSize=18, leading=24,
    textColor=NAVY_900, spaceBefore=24, spaceAfter=8)

style_h3 = ParagraphStyle('H3', parent=styles['Heading3'],
    fontName='Helvetica-Bold', fontSize=14, leading=18,
    textColor=NAVY_900, spaceBefore=16, spaceAfter=6)

style_body = ParagraphStyle('Body', parent=styles['Normal'],
    fontName='Helvetica', fontSize=10, leading=15,
    textColor=HexColor('#334155'), alignment=TA_JUSTIFY,
    spaceBefore=4, spaceAfter=8)

style_body_bold = ParagraphStyle('BodyBold', parent=style_body,
    fontName='Helvetica-Bold')

style_bullet = ParagraphStyle('Bullet', parent=style_body,
    leftIndent=20, bulletIndent=8, spaceBefore=2, spaceAfter=2)

style_label = ParagraphStyle('Label', parent=styles['Normal'],
    fontName='Helvetica-Bold', fontSize=9, leading=12,
    textColor=ACCENT, spaceBefore=12, spaceAfter=2)

style_caption = ParagraphStyle('Caption', parent=styles['Normal'],
    fontName='Helvetica', fontSize=8, leading=10,
    textColor=NAVY_500, alignment=TA_CENTER, spaceBefore=4, spaceAfter=8)

style_toc = ParagraphStyle('TOC', parent=styles['Normal'],
    fontName='Helvetica', fontSize=11, leading=22,
    textColor=NAVY_700, leftIndent=20)

style_toc_chapter = ParagraphStyle('TOCChapter', parent=styles['Normal'],
    fontName='Helvetica-Bold', fontSize=12, leading=24,
    textColor=NAVY_900, leftIndent=0)

style_callout = ParagraphStyle('Callout', parent=style_body,
    fontName='Helvetica-Oblique', fontSize=11, leading=16,
    textColor=ACCENT, leftIndent=20, rightIndent=20,
    spaceBefore=12, spaceAfter=12)

style_cta_heading = ParagraphStyle('CTAHeading', parent=styles['Heading2'],
    fontName='Helvetica-Bold', fontSize=16, leading=20,
    textColor=WHITE, alignment=TA_CENTER, spaceBefore=0, spaceAfter=6)

style_cta_body = ParagraphStyle('CTABody', parent=styles['Normal'],
    fontName='Helvetica', fontSize=10, leading=14,
    textColor=HexColor('#94A3B8'), alignment=TA_CENTER, spaceBefore=0, spaceAfter=0)


# ── Helper Functions ──────────────────────────────
def make_table(headers, rows, col_widths=None):
    """Create a styled table."""
    data = [headers] + rows
    t = Table(data, colWidths=col_widths)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY_900),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('TEXTCOLOR', (0, 1), (-1, -1), HexColor('#334155')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, NAVY_200),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, NAVY_50]),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
    ]))
    return t


def section_divider():
    return HRFlowable(width='100%', thickness=1, color=NAVY_200, spaceBefore=16, spaceAfter=16)


def cta_box(story):
    """Add a CTA box to the story."""
    story.append(Spacer(1, 16))
    cta_data = [[Paragraph('Ready to Run Your Numbers?', style_cta_heading)],
                [Paragraph('Submit your deal to the 818 Capital Scenario Desk and get an AI-powered analysis with specific terms from 12+ capital programs.', style_cta_body)],
                [Paragraph('818capitalpartners.com/dscr-loans', style_cta_body)]]
    cta = Table(cta_data, colWidths=[6.5 * inch])
    cta.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), ACCENT),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('LEFTPADDING', (0, 0), (-1, -1), 20),
        ('RIGHTPADDING', (0, 0), (-1, -1), 20),
        ('ROUNDEDCORNERS', [8, 8, 8, 8]),
    ]))
    story.append(cta)
    story.append(Spacer(1, 16))


# ── Build Document ────────────────────────────────
def build_pdf():
    doc = SimpleDocTemplate(
        OUTPUT_PATH,
        pagesize=letter,
        topMargin=72,
        bottomMargin=72,
        leftMargin=72,
        rightMargin=72,
    )

    story = []
    page_width = letter[0] - 144  # usable width

    # ══════════════════════════════════════════════
    # COVER PAGE (drawn by cover_page callback)
    # ══════════════════════════════════════════════
    story.append(Spacer(1, 600))  # Push past cover
    story.append(PageBreak())

    # ══════════════════════════════════════════════
    # TABLE OF CONTENTS
    # ══════════════════════════════════════════════
    story.append(Paragraph('TABLE OF CONTENTS', style_label))
    story.append(Spacer(1, 8))
    story.append(Paragraph('The 2026 DSCR Investor Playbook', style_h1))
    story.append(Spacer(1, 16))

    toc_items = [
        ('Chapter 1', 'What Is DSCR and Why It Matters in 2026'),
        ('Chapter 2', '2026 DSCR Qualification Requirements'),
        ('Chapter 3', 'Rate Comparison Matrix'),
        ('Chapter 4', 'No-Ratio and Sub-1.0 DSCR Programs'),
        ('Chapter 5', 'STR Income for DSCR Qualification'),
        ('Chapter 6', 'Portfolio Scaling Strategies'),
        ('Chapter 7', 'Entity Structuring'),
        ('Chapter 8', 'Exit Strategy Planning'),
        ('Chapter 9', 'Real Deal Examples'),
        ('Bonus', 'DSCR Calculation Deep Dive'),
        ('Bonus', 'The BRRRR Strategy with DSCR Loans'),
        ('Bonus', '10 Mistakes That Kill DSCR Deals'),
        ('Bonus', '2026 DSCR Market Outlook'),
        ('Appendix', 'Glossary of DSCR Terms'),
        ('Appendix', 'Quick Reference & Qualification Checklist'),
    ]
    for ch, title in toc_items:
        story.append(Paragraph(f'<b>{ch}:</b> {title}', style_toc))
    story.append(Spacer(1, 24))
    story.append(Paragraph('<i>"The question we ask is not \'How many deals have you done?\' -- it is \'How many deals could you do, with the right partner?\'"</i>', style_callout))
    story.append(Paragraph('-- Ravi Punn, Founder & Principal, 818 Capital Partners', ParagraphStyle('Attr', parent=style_body, fontName='Helvetica-Bold', fontSize=9, alignment=TA_CENTER, textColor=NAVY_500)))
    story.append(PageBreak())

    # ══════════════════════════════════════════════
    # CHAPTER 1: What Is DSCR
    # ══════════════════════════════════════════════
    story.append(Paragraph('CHAPTER 1', style_label))
    story.append(Paragraph('What Is DSCR and Why It Matters in 2026', style_h1))
    story.append(section_divider())

    story.append(Paragraph('<b>DSCR = Monthly Rental Income / Monthly PITI</b>', style_body_bold))
    story.append(Spacer(1, 6))
    story.append(Paragraph('That one ratio determines whether your investment property qualifies for a loan without you ever showing a tax return, W-2, or pay stub. The property either pays for itself or it doesn\'t.', style_body))
    story.append(Paragraph('In 2026, DSCR lending is more competitive than it has been in three years. Here is why that matters to you:', style_body))

    for bullet in [
        '<b>Rates are compressing.</b> More capital partners are entering the DSCR space, which means better pricing for borrowers. We are seeing 50-75 basis point improvements over 2025 on equivalent profiles.',
        '<b>Programs are expanding.</b> No-ratio, sub-1.0, interest-only, and 40-year terms are now available from multiple lenders.',
        '<b>STR income acceptance is widening.</b> More lenders now accept AirDNA and actual booking revenue for DSCR qualification.',
        '<b>Portfolio programs are maturing.</b> Blanket loans for 5-10 and 10+ property portfolios are more accessible, with better rate tiers for scaled investors.',
    ]:
        story.append(Paragraph(bullet, style_bullet, bulletText='\u2022'))

    story.append(Spacer(1, 8))
    story.append(Paragraph('<i>If you have been waiting for a better window to acquire, refinance, or scale -- 2026 is the year to move.</i>', style_callout))

    # DSCR Spectrum visual
    story.append(Spacer(1, 12))
    story.append(Paragraph('THE DSCR SPECTRUM', style_label))
    story.append(GaugeRow(page_width))
    story.append(Spacer(1, 8))

    # Rate bars
    story.append(Paragraph('Rate Impact by DSCR Ratio', style_h3))
    for label, rate, pct in [('1.25+', '6.75%', 0.60), ('1.0-1.24', '7.50%', 0.72), ('0.75-0.99', '8.25%', 0.82), ('No-Ratio', '8.75%', 0.90)]:
        color = ACCENT if pct <= 0.72 else NAVY_500
        story.append(HorizBar(page_width, label, rate, pct, color))
    story.append(Paragraph('* Rates shown for 740+ credit, 75% LTV, 30-year fixed. Actual rates vary by lender and deal structure.', style_caption))

    story.append(PageBreak())

    # ══════════════════════════════════════════════
    # CHAPTER 2: Qualification Requirements
    # ══════════════════════════════════════════════
    story.append(Paragraph('CHAPTER 2', style_label))
    story.append(Paragraph('2026 DSCR Qualification Requirements', style_h1))
    story.append(section_divider())

    # Credit Score table
    story.append(Paragraph('Credit Score Tiers', style_h2))
    story.append(Paragraph('Your credit score is the single biggest lever on your rate and available programs.', style_body))
    story.append(Spacer(1, 8))
    story.append(make_table(
        ['Credit Score', 'Rate Range', 'Max LTV', 'Program Access'],
        [
            ['740+', '6.75% - 7.50%', '80%', 'All programs including I/O and no-ratio'],
            ['720-739', '7.00% - 7.75%', '80%', 'Most programs, minor rate bump'],
            ['700-719', '7.25% - 8.00%', '80%', 'Standard programs, some I/O restrictions'],
            ['660-699', '7.75% - 8.50%', '75%', 'Limited options, no sub-1.0 or no-ratio'],
            ['620-659', '8.25% - 9.25%', '70%', 'Entry level, higher reserves required'],
        ],
        col_widths=[1.2*inch, 1.3*inch, 0.9*inch, 3.1*inch]
    ))
    story.append(Spacer(1, 16))

    # LTV table
    story.append(Paragraph('LTV Tiers and Rate Impact', style_h2))
    story.append(Paragraph('Every 5% step in LTV changes your rate. Here is the general structure:', style_body))
    story.append(Spacer(1, 8))
    story.append(make_table(
        ['LTV', 'Rate Adjustment', 'Notes'],
        [
            ['65%', '-25 to -50 bps vs 75%', 'Lowest risk, best rates available'],
            ['70%', '-12.5 to -25 bps vs 75%', 'Sweet spot for many borrowers'],
            ['75%', 'Baseline', 'Standard. Where most DSCR loans land'],
            ['80%', '+25 to +50 bps vs 75%', 'Requires 720+ credit, 1.0+ DSCR'],
            ['85%', '+50 to +75 bps vs 75%', 'Rare. 740+ credit, 1.25+ DSCR, strong reserves'],
        ],
        col_widths=[0.8*inch, 2*inch, 3.7*inch]
    ))
    story.append(PageBreak())

    # Property Types
    story.append(Paragraph('Property Types', style_h2))
    story.append(Paragraph('DSCR loans cover more property types than most investors realize:', style_body))
    for item in [
        '<b>Single-family residences (SFR)</b> -- The bread and butter. Best pricing and highest LTV.',
        '<b>2-4 unit properties</b> -- Most lenders treat these the same as SFR.',
        '<b>Condos (warrantable)</b> -- Widely available. Must meet basic warrantability standards.',
        '<b>Condos (non-warrantable)</b> -- Available from some lenders. 25-50 bps premium.',
        '<b>Townhomes</b> -- Treated like SFR if fee-simple ownership.',
        '<b>5+ unit (small multifamily)</b> -- Growing segment. 50-100 bps higher than SFR DSCR.',
        '<b>Manufactured housing</b> -- Limited. Permanent foundation required. 65-70% max LTV.',
    ]:
        story.append(Paragraph(item, style_bullet, bulletText='\u2022'))

    story.append(Spacer(1, 16))

    # Entity Requirements
    story.append(Paragraph('Entity Requirements', style_h2))
    story.append(make_table(
        ['Entity Type', 'Lender Acceptance', 'Rate Impact', 'Best For'],
        [
            ['LLC', 'Universal', 'None', 'Default choice for 90% of investors'],
            ['Land Trust', 'Some lenders', 'None when accepted', 'Privacy protection'],
            ['Individual', 'Universal', 'None', 'Simplicity (no asset protection)'],
            ['Rev. Living Trust', 'Most lenders', 'None', 'Estate planning'],
            ['S-Corp', 'Limited', '+12.5-25 bps', 'Tax optimization'],
            ['Series LLC', 'Limited', 'Varies', 'Multi-property isolation (~12 states)'],
        ],
        col_widths=[1.3*inch, 1.3*inch, 1.3*inch, 2.6*inch]
    ))
    story.append(PageBreak())

    # DSCR Thresholds
    story.append(Paragraph('Minimum DSCR Thresholds by Program', style_h2))
    story.append(make_table(
        ['Program', 'Min DSCR', 'Typical Requirements'],
        [
            ['Standard DSCR', '1.0', '1.25+ for best pricing. Most lender options.'],
            ['Sub-1.0 Programs', '0.75', '25-30% down, 700+ credit required'],
            ['No-Ratio Programs', 'N/A', '720+ credit, 25%+ down, 9-12 mo reserves'],
            ['Interest-Only DSCR', '1.0 (on I/O payment)', 'Improves qualifying DSCR significantly'],
        ],
        col_widths=[1.8*inch, 1.2*inch, 3.5*inch]
    ))
    story.append(Spacer(1, 16))

    # Reserves
    story.append(Paragraph('Reserve Requirements', style_h2))
    story.append(Paragraph('Reserves are liquid assets you need to show after closing:', style_body))
    story.append(make_table(
        ['Reserve Level', 'When Required', 'Eligible Assets'],
        [
            ['3 months PITI', '740+ credit, 1.25+ DSCR, <=75% LTV', 'Checking, savings, investments'],
            ['6 months PITI', 'Standard for most DSCR programs', 'Checking, savings, investments, retirement (60-70%)'],
            ['9 months PITI', '660-699 credit or 80%+ LTV', 'Same as above'],
            ['12 months PITI', 'Sub-1.0 DSCR, no-ratio, or low credit + high LTV', 'Same as above'],
        ],
        col_widths=[1.3*inch, 2.5*inch, 2.7*inch]
    ))

    cta_box(story)
    story.append(PageBreak())

    # ══════════════════════════════════════════════
    # CHAPTER 3: Rate Comparison Matrix
    # ══════════════════════════════════════════════
    story.append(Paragraph('CHAPTER 3', style_label))
    story.append(Paragraph('Rate Comparison Matrix', style_h1))
    story.append(section_divider())

    story.append(Paragraph('Rates by DSCR Ratio', style_h2))
    story.append(Paragraph('Baseline: 740+ credit, 75% LTV, 30-year fixed', style_caption))
    story.append(make_table(
        ['DSCR Ratio', 'Rate Range', 'Rate vs 1.25 Baseline'],
        [
            ['1.50+', '6.50% - 7.25%', '-12.5 to -25 bps'],
            ['1.25 - 1.49', '6.75% - 7.50%', 'Baseline'],
            ['1.00 - 1.24', '7.00% - 7.75%', '+12.5 to +37.5 bps'],
            ['0.75 - 0.99', '7.50% - 8.50%', '+50 to +100 bps'],
            ['No-Ratio', '7.25% - 8.25%', '+50 to +75 bps'],
        ],
        col_widths=[1.5*inch, 2*inch, 3*inch]
    ))
    story.append(Spacer(1, 16))

    story.append(Paragraph('Rates by LTV', style_h2))
    story.append(Paragraph('Baseline: 740+ credit, 1.25+ DSCR', style_caption))
    story.append(make_table(
        ['LTV', 'Rate Range', 'Monthly Payment on $300K Loan'],
        [
            ['65%', '6.50% - 7.25%', '$1,896 - $2,048'],
            ['70%', '6.75% - 7.50%', '$1,946 - $2,098'],
            ['75%', '7.00% - 7.75%', '$1,996 - $2,148'],
            ['80%', '7.25% - 8.00%', '$2,048 - $2,201'],
        ],
        col_widths=[1.2*inch, 2*inch, 3.3*inch]
    ))
    story.append(Spacer(1, 16))

    story.append(Paragraph('Rates by Credit Score', style_h2))
    story.append(Paragraph('Baseline: 75% LTV, 1.25+ DSCR', style_caption))
    story.append(make_table(
        ['Credit Score', 'Rate Range', 'Annual Cost Difference on $300K'],
        [
            ['740+', '6.75% - 7.50%', 'Baseline'],
            ['720-739', '7.00% - 7.75%', '+$750 - $1,500/year'],
            ['700-719', '7.25% - 8.00%', '+$1,500 - $3,000/year'],
            ['660-699', '7.75% - 8.50%', '+$3,000 - $4,500/year'],
            ['620-659', '8.25% - 9.25%', '+$4,500 - $7,500/year'],
        ],
        col_widths=[1.3*inch, 1.8*inch, 3.4*inch]
    ))
    story.append(PageBreak())

    # Rate Buydowns
    story.append(Paragraph('Rate Buydowns: When Paying Points Makes Sense', style_h2))
    story.append(Paragraph('Most DSCR lenders offer rate buydown options. The typical cost is 1 point (1% of loan amount) for a 25 bps rate reduction.', style_body))

    story.append(Paragraph('When paying points MAKES sense:', style_h3))
    for b in [
        '<b>Long hold period.</b> If you plan to hold 5+ years, breakeven is usually 2-3 years.',
        '<b>Cash flow optimization.</b> A 25 bps reduction can move your DSCR from 0.95 to 1.05.',
        '<b>Marginal deals.</b> When cash-on-cash return is tight, buying down makes the deal pencil.',
    ]:
        story.append(Paragraph(b, style_bullet, bulletText='\u2022'))

    story.append(Paragraph('When paying points does NOT make sense:', style_h3))
    for b in [
        '<b>Short hold (under 3 years).</b> You will not recoup the upfront cost.',
        '<b>Refinance likely.</b> Do not pay for a rate you will not keep.',
        '<b>Cash-constrained.</b> If points deplete reserves below lender minimums, take the higher rate.',
    ]:
        story.append(Paragraph(b, style_bullet, bulletText='\u2022'))

    story.append(Spacer(1, 16))

    # ARM vs Fixed
    story.append(Paragraph('ARM vs Fixed: When to Use Each', style_h2))
    story.append(make_table(
        ['Product', 'Rate vs 30yr Fixed', 'Best For', 'Risk'],
        [
            ['30-year Fixed', 'Baseline', 'Buy-and-hold investors', 'None -- rate locked for life'],
            ['5/1 ARM', '-50 to -75 bps', 'Sell or refi within 5 years', 'Rate resets after year 5'],
            ['7/1 ARM', '-25 to -50 bps', 'Medium-term holds', 'Rate resets after year 7'],
            ['Interest-Only', 'Varies', 'Max cash flow', 'No equity build through amortization'],
        ],
        col_widths=[1.3*inch, 1.5*inch, 2*inch, 1.7*inch]
    ))

    story.append(PageBreak())

    # ══════════════════════════════════════════════
    # CHAPTER 4: No-Ratio and Sub-1.0
    # ══════════════════════════════════════════════
    story.append(Paragraph('CHAPTER 4', style_label))
    story.append(Paragraph('No-Ratio and Sub-1.0 DSCR Programs', style_h1))
    story.append(section_divider())

    story.append(Paragraph('What "No-Ratio" Means', style_h2))
    story.append(Paragraph('In a no-ratio DSCR program, the lender does not calculate the DSCR at all. Qualification is based entirely on:', style_body))
    for b in ['Credit score (typically 720+ minimum)', 'LTV (typically 75% max)', 'Reserves (9-12 months minimum)', 'Property type and condition']:
        story.append(Paragraph(b, style_bullet, bulletText='\u2022'))
    story.append(Paragraph('No-ratio works best for properties where the market rent does not support a 1.0 DSCR but the investment thesis is sound -- appreciation markets, value-add plays, or STR conversions.', style_body))

    story.append(Spacer(1, 12))
    story.append(Paragraph('Sub-1.0 Programs: The Tradeoffs', style_h2))
    story.append(make_table(
        ['Factor', 'Standard DSCR (1.0+)', 'Sub-1.0 DSCR'],
        [
            ['Down Payment', '20-25%', '25-35%'],
            ['Credit Score', '660+', '700+'],
            ['Reserves', '3-6 months', '9-12 months'],
            ['Rate Premium', 'Baseline', '+50-100 bps'],
            ['Lender Options', 'Most lenders', 'Fewer lenders'],
        ],
        col_widths=[1.5*inch, 2.5*inch, 2.5*inch]
    ))

    story.append(Spacer(1, 12))
    story.append(Paragraph('When Negative Cash Flow Makes Strategic Sense', style_h2))
    for b in [
        '<b>Appreciation markets.</b> In markets growing 8-12% annually, a modest $200-400/month shortfall can be a reasonable cost of holding an appreciating asset.',
        '<b>Value-add plays.</b> A property renting at $1,800 that will rent for $2,400 after upgrades -- sub-1.0 at purchase becomes 1.2+ after stabilization.',
        '<b>STR conversion.</b> A 0.9 DSCR on long-term comps might produce 1.5+ as a short-term rental.',
        '<b>Tax strategy.</b> Depreciation and interest deductions may make total return positive even when cash flow is negative.',
    ]:
        story.append(Paragraph(b, style_bullet, bulletText='\u2022'))

    story.append(PageBreak())

    # ══════════════════════════════════════════════
    # CHAPTER 5: STR Income
    # ══════════════════════════════════════════════
    story.append(Paragraph('CHAPTER 5', style_label))
    story.append(Paragraph('STR Income for DSCR Qualification', style_h1))
    story.append(section_divider())

    story.append(Paragraph('How Lenders Calculate STR Income', style_h2))
    story.append(make_table(
        ['Method', 'Data Source', 'When Used', 'Reliability'],
        [
            ['AirDNA / Market Data', 'Third-party projections', 'Purchases (no history)', 'Moderate'],
            ['Actual Revenue', 'Airbnb/VRBO statements', 'Existing STR operations', 'High'],
            ['Lease Comp', 'Long-term rental comps', 'Conservative underwriting', 'Low (understates STR value)'],
        ],
        col_widths=[1.5*inch, 1.8*inch, 1.8*inch, 1.4*inch]
    ))
    story.append(Spacer(1, 12))

    story.append(Paragraph('Income Lookback Periods', style_h2))
    for b in [
        '<b>12-month average</b> -- Most common. Smooths seasonality. What most lenders prefer.',
        '<b>3-month trailing</b> -- Some lenders accept for new STR conversions. Favorable in peak season but risky if income is seasonal.',
        '<b>Gross vs net.</b> Most lenders use gross booking revenue minus platform fees and cleaning costs. Clarify before modeling.',
    ]:
        story.append(Paragraph(b, style_bullet, bulletText='\u2022'))

    story.append(Spacer(1, 12))
    story.append(Paragraph('Occupancy Rate Assumptions', style_h2))
    story.append(make_table(
        ['Lender Type', 'Assumed Occupancy', 'Impact on $4,000/mo Gross'],
        [
            ['Conservative', '65-70%', '$2,600-2,800/month qualifying income'],
            ['Moderate', '70-75%', '$2,800-3,000/month qualifying income'],
            ['Aggressive', '75-80%', '$3,000-3,200/month qualifying income'],
        ],
        col_widths=[1.5*inch, 1.8*inch, 3.2*inch]
    ))
    story.append(Paragraph('The assumed occupancy rate can mean the difference between a 1.25 DSCR and a 0.95 DSCR.', style_body))

    cta_box(story)
    story.append(PageBreak())

    # ══════════════════════════════════════════════
    # CHAPTER 6: Portfolio Scaling
    # ══════════════════════════════════════════════
    story.append(Paragraph('CHAPTER 6', style_label))
    story.append(Paragraph('Portfolio Scaling Strategies', style_h1))
    story.append(section_divider())

    story.append(Paragraph('THE PORTFOLIO SCALING LADDER', style_label))
    story.append(Spacer(1, 12))
    story.append(ScalingStep(page_width, 1, '1-4 Properties', 'Individual DSCR Loans',
        'Standard 30-year fixed. Build credit history and lender relationships.'))
    story.append(ScalingStep(page_width, 2, '5-10 Properties', 'Blanket / Portfolio Loans',
        'One loan, multiple properties. 25-50 bps better than individual loans.'))
    story.append(ScalingStep(page_width, 3, '10-20 Properties', 'DSCR Portfolio Lines',
        'Revolving credit facilities. Draw for acquisitions, pay down as properties stabilize.'))
    story.append(ScalingStep(page_width, 4, '20+ Properties', 'Aggregation & Securitization',
        'Institutional-grade structures. Best rates and highest leverage.', is_last=True))

    story.append(Spacer(1, 16))
    story.append(Paragraph('The Waterfall Strategy', style_h2))
    story.append(Paragraph('The most effective portfolio investors ladder their DSCR products:', style_body))
    story.append(make_table(
        ['Step', 'Action', 'Product', 'Outcome'],
        [
            ['1', 'Acquire', 'Individual DSCR at 75% LTV', 'Property secured'],
            ['2', 'Stabilize', 'Rehab + tenant placement', '6-12 months seasoning'],
            ['3', 'Refinance', 'Blanket loan with 4-5 properties', 'Better terms + equity extraction'],
            ['4', 'Extract', 'Cash-out from blanket refi', 'Capital for next acquisition'],
            ['5', 'Repeat', 'Start cycle again', 'Each cycle improves avg cost of capital'],
        ],
        col_widths=[0.6*inch, 1.2*inch, 2.2*inch, 2.5*inch]
    ))

    story.append(PageBreak())

    # ══════════════════════════════════════════════
    # CHAPTER 7: Entity Structuring
    # ══════════════════════════════════════════════
    story.append(Paragraph('CHAPTER 7', style_label))
    story.append(Paragraph('Entity Structuring', style_h1))
    story.append(section_divider())

    story.append(Paragraph('Choosing the right entity structure impacts your rate, liability protection, and tax treatment.', style_body))
    story.append(Spacer(1, 8))

    for title, paras in [
        ('LLC: The Standard', [
            'Most DSCR borrowers close in an LLC. <b>Liability protection</b> shields personal assets. <b>Tax flexibility</b> -- can elect sole proprietor, partnership, S-corp, or C-corp. <b>Transferability</b> -- membership interests can transfer without triggering due-on-sale. Rate impact: None.',
        ]),
        ('Land Trust', [
            'Provides anonymity -- the trust holds title, beneficial owner not on public record. Accepted by some lenders, not all. The beneficiary typically needs to personally guarantee. Most useful in Florida, Illinois, Virginia.',
        ]),
        ('S-Corp / C-Corp', [
            'Uncommon for DSCR. S-Corps occasionally used for active RE businesses. C-Corps rare except for institutional/foreign national buyers. Rate impact: 12.5-25 bps premium. Fewer lender options.',
        ]),
        ('Series LLC', [
            'Creates multiple "series" within a single LLC, each with isolated assets and liabilities. Available in Texas, Delaware, Nevada, Illinois, and others. Not all lenders understand or accept Series LLCs -- have a backup structure ready.',
        ]),
    ]:
        story.append(Paragraph(title, style_h3))
        for p in paras:
            story.append(Paragraph(p, style_body))

    story.append(PageBreak())

    # ══════════════════════════════════════════════
    # CHAPTER 8: Exit Strategy
    # ══════════════════════════════════════════════
    story.append(Paragraph('CHAPTER 8', style_label))
    story.append(Paragraph('Exit Strategy Planning', style_h1))
    story.append(section_divider())

    story.append(Paragraph('When to Refinance', style_h2))
    for b in [
        '<b>Rates drop 75+ bps</b> below your current rate. Breakeven is typically 12-18 months.',
        '<b>Equity has built up.</b> Cash-out refi lets you extract equity for the next deal.',
        '<b>Seasoning requirements are met.</b> Most lenders require 6-12 months from acquisition.',
        '<b>ARM reset approaching.</b> Start shopping the refi 12 months before reset.',
    ]:
        story.append(Paragraph(b, style_bullet, bulletText='\u2022'))

    story.append(Paragraph('When to Sell', style_h2))
    for b in [
        '<b>1031 exchange timing works.</b> Replacement property identified, defer capital gains.',
        '<b>Market at cycle peak.</b> Cap rates compressed, prices elevated relative to rents.',
        '<b>Major capex looming.</b> Roof, HVAC, foundation -- sell before those costs hit.',
        '<b>Cash flow deteriorated.</b> Rent growth stalled, taxes/insurance spiked.',
    ]:
        story.append(Paragraph(b, style_bullet, bulletText='\u2022'))

    story.append(Paragraph('When to Hold', style_h2))
    for b in [
        '<b>Cash flow positive and stable.</b> No reason to sell.',
        '<b>Tax benefits significant.</b> Depreciation + interest deductions make it attractive after-tax.',
        '<b>Appreciation trajectory strong.</b> Population growth, job growth, supply constraints.',
        '<b>Refinancing available.</b> Extract equity via refi without triggering taxable event.',
    ]:
        story.append(Paragraph(b, style_bullet, bulletText='\u2022'))

    story.append(Spacer(1, 12))
    story.append(Paragraph('Seasoning Requirements by Lender Type', style_h2))
    story.append(make_table(
        ['Seasoning', 'Use Case', 'Availability'],
        [
            ['3 months', 'Rate-term refinance', 'Some DSCR lenders, limited options'],
            ['6 months', 'Rate-term refinance', 'Standard. Most DSCR lenders.'],
            ['12 months', 'Cash-out refinance', 'Required by most lenders'],
            ['No seasoning', 'Cash-out (BRRRR strategy)', '50-75 bps premium, very few lenders'],
        ],
        col_widths=[1.3*inch, 2.2*inch, 3*inch]
    ))

    story.append(PageBreak())

    # ══════════════════════════════════════════════
    # CHAPTER 9: Real Deal Examples
    # ══════════════════════════════════════════════
    story.append(Paragraph('CHAPTER 9', style_label))
    story.append(Paragraph('Real Deal Examples', style_h1))
    story.append(section_divider())

    deals = [
        {
            'title': 'Example 1: The Suburban SFR Cash Flow Play',
            'details': [
                ('Purchase Price', '$310,000'),
                ('Monthly Rent', '$2,650'),
                ('LTV', '75%'),
                ('Rate', '7.25%'),
                ('Monthly PITI', '$2,100'),
                ('DSCR', '1.26'),
                ('Cash-on-Cash', '9.2%'),
            ],
            'narrative': 'Investor acquired a single-family rental in a growing suburban market. 720 credit score, 6 months reserves. Straightforward underwriting. Closed in 17 days.',
        },
        {
            'title': 'Example 2: The STR Conversion',
            'details': [
                ('Purchase Price', '$425,000'),
                ('LTR Comps', '$2,200/mo (0.88 DSCR)'),
                ('STR Projections', '$3,800/mo avg'),
                ('Qualifying DSCR', '1.44 (using AirDNA)'),
                ('LTV', '75%'),
            ],
            'narrative': 'Long-term rent comps didn\'t work. AirDNA projections at 70% occupancy turned a non-qualifying deal into a well-qualifying one. The STR income approach was the difference.',
        },
        {
            'title': 'Example 3: The Portfolio Blanket Refinance',
            'details': [
                ('Properties', '7 individual DSCR loans'),
                ('Avg Rate Before', '7.75%'),
                ('Blanket Rate After', '7.125%'),
                ('Monthly Savings', '$1,200'),
                ('Equity Extracted', '$120,000'),
                ('New Portfolio DSCR', '1.41'),
            ],
            'narrative': 'Consolidated 7 individual loans into a blanket at a 62.5 bps improvement. The extracted equity funded the next two acquisitions.',
        },
        {
            'title': 'Example 4: The Sub-1.0 Value-Add',
            'details': [
                ('Purchase Price', '$275,000'),
                ('Initial Rent', '$1,600/mo'),
                ('Initial DSCR', '0.91'),
                ('Rehab Investment', '$25,000'),
                ('Post-Rehab Rent', '$2,100/mo'),
                ('Post-Refi DSCR', '1.22'),
            ],
            'narrative': 'Sub-1.0 program with 30% down. After $25K in cosmetic upgrades, rent increased $500/mo. Refinanced into standard DSCR at 75% LTV. Cash flow went from -$140 to +$380/month.',
        },
    ]

    for deal in deals:
        story.append(Paragraph(deal['title'], style_h2))
        rows = [[k, v] for k, v in deal['details']]
        story.append(make_table(['Metric', 'Value'], rows, col_widths=[2.5*inch, 4*inch]))
        story.append(Spacer(1, 6))
        story.append(Paragraph(deal['narrative'], style_body))
        story.append(Spacer(1, 12))

    story.append(PageBreak())

    # ══════════════════════════════════════════════
    # CHAPTER 10: DSCR Calculation Deep Dive
    # ══════════════════════════════════════════════
    story.append(Paragraph('BONUS CHAPTER', style_label))
    story.append(Paragraph('DSCR Calculation Deep Dive', style_h1))
    story.append(section_divider())

    story.append(Paragraph('Step-by-Step DSCR Calculation', style_h2))
    story.append(Paragraph('Let us walk through a complete DSCR calculation using a real-world example:', style_body))
    story.append(Spacer(1, 8))

    story.append(Paragraph('<b>Property: 3BR/2BA Single-Family Rental</b>', style_body_bold))
    story.append(Paragraph('Purchase price: $350,000 | Loan amount: $262,500 (75% LTV) | Rate: 7.25% | 30-year fixed', style_body))
    story.append(Spacer(1, 8))

    story.append(Paragraph('Step 1: Calculate Monthly Debt Service (PITI)', style_h3))
    story.append(make_table(
        ['Component', 'Annual', 'Monthly', 'How Calculated'],
        [
            ['Principal + Interest', '$21,480', '$1,790', 'Based on $262,500 at 7.25%, 30yr amortization'],
            ['Property Taxes', '$4,200', '$350', 'From county tax records or appraisal'],
            ['Homeowners Insurance', '$1,800', '$150', 'From insurance quote'],
            ['HOA (if applicable)', '$0', '$0', 'N/A for this property'],
            ['Total PITI', '$27,480', '$2,290', 'Sum of all components'],
        ],
        col_widths=[1.5*inch, 1*inch, 1*inch, 3*inch]
    ))
    story.append(Spacer(1, 12))

    story.append(Paragraph('Step 2: Determine Monthly Rental Income', style_h3))
    story.append(Paragraph('The lender uses the LESSER of: (a) the appraiser\'s estimated market rent (from the 1007 rent schedule), or (b) the actual lease amount if the property is currently leased.', style_body))
    story.append(Spacer(1, 4))
    story.append(Paragraph('In this example: Appraiser estimates $2,800/month. Current lease is $2,750/month. Lender uses $2,750.', style_body))
    story.append(Spacer(1, 12))

    story.append(Paragraph('Step 3: Calculate DSCR', style_h3))
    story.append(Paragraph('<b>DSCR = $2,750 / $2,290 = 1.20</b>', style_body_bold))
    story.append(Spacer(1, 4))
    story.append(Paragraph('This deal qualifies for standard DSCR programs (1.0+ threshold) but falls just below the 1.25 sweet spot for best pricing. Options to improve the DSCR:', style_body))
    for b in [
        'Negotiate a higher rent ($2,875/mo = 1.25 DSCR)',
        'Increase down payment to reduce loan amount (80% to 75% LTV)',
        'Buy down the rate by 25 bps to reduce monthly P&I',
        'Challenge the tax assessment if it seems high',
        'Shop insurance for a lower premium',
    ]:
        story.append(Paragraph(b, style_bullet, bulletText='\u2022'))

    story.append(Spacer(1, 16))
    story.append(Paragraph('Common DSCR Calculation Mistakes', style_h2))
    for b in [
        '<b>Using gross rent instead of net.</b> Some investors forget that the DSCR uses the appraiser\'s estimate or actual lease, not the Zillow Zestimate or asking rent.',
        '<b>Forgetting HOA fees.</b> HOA fees are included in the PITI calculation. A $300/month HOA can tank your DSCR.',
        '<b>Not accounting for flood insurance.</b> If the property is in a flood zone, flood insurance premiums must be included in PITI.',
        '<b>Using the wrong tax number.</b> Use the ACTUAL tax bill, not the assessed value times the current tax rate. Tax reassessment after purchase can change this.',
        '<b>Mixing up interest-only and amortizing.</b> If your loan has an I/O period, the DSCR is calculated on the I/O payment -- not the fully amortizing payment. This significantly improves your qualifying DSCR.',
    ]:
        story.append(Paragraph(b, style_bullet, bulletText='\u2022'))

    story.append(PageBreak())

    # ══════════════════════════════════════════════
    # CHAPTER 11: The BRRRR Strategy with DSCR
    # ══════════════════════════════════════════════
    story.append(Paragraph('BONUS CHAPTER', style_label))
    story.append(Paragraph('The BRRRR Strategy with DSCR Loans', style_h1))
    story.append(section_divider())

    story.append(Paragraph('BRRRR stands for Buy, Rehab, Rent, Refinance, Repeat. It is the most capital-efficient way to scale a rental portfolio -- and DSCR loans are the refinance engine that makes it work.', style_body))
    story.append(Spacer(1, 12))

    story.append(Paragraph('How BRRRR Works with DSCR', style_h2))
    story.append(make_table(
        ['Phase', 'Financing', 'Timeline', 'Key Metric'],
        [
            ['Buy', 'Hard money or bridge loan', 'Day 1', 'Purchase + rehab budget'],
            ['Rehab', 'Draw from bridge loan', 'Months 1-3', 'Stay on budget and timeline'],
            ['Rent', 'Market the property', 'Month 4', 'Achieve target rent'],
            ['Refinance', 'DSCR loan (cash-out)', 'Month 6-12', 'ARV appraisal + DSCR ratio'],
            ['Repeat', 'Deploy extracted capital', 'Month 7-13', 'Reinvest into next deal'],
        ],
        col_widths=[1*inch, 2*inch, 1.2*inch, 2.3*inch]
    ))
    story.append(Spacer(1, 12))

    story.append(Paragraph('BRRRR Deal Economics Example', style_h2))
    story.append(make_table(
        ['Metric', 'Amount', 'Notes'],
        [
            ['Purchase Price', '$200,000', 'Distressed SFR'],
            ['Rehab Budget', '$40,000', 'Kitchen, bath, flooring, paint'],
            ['All-In Cost', '$240,000', 'Total capital deployed'],
            ['Bridge Loan (85% LTC)', '$204,000', 'Out-of-pocket: $36,000 + closing'],
            ['After-Repair Value (ARV)', '$320,000', 'Based on renovated comps'],
            ['DSCR Refi (75% of ARV)', '$240,000', 'Pays off bridge completely'],
            ['Monthly Rent (post-rehab)', '$2,400', 'Market rate for renovated unit'],
            ['Monthly PITI', '$1,950', 'Based on $240K at 7.25%'],
            ['DSCR', '1.23', 'Qualifies for standard DSCR'],
            ['Capital Left in Deal', '$0', 'Infinite cash-on-cash return'],
        ],
        col_widths=[2*inch, 1.3*inch, 3.2*inch]
    ))
    story.append(Spacer(1, 8))
    story.append(Paragraph('In this example, the investor recovers 100% of their capital through the DSCR refinance and retains a property that cash flows $450/month. The original $36,000 out-of-pocket is fully recycled into the next deal.', style_body))

    story.append(Spacer(1, 16))
    story.append(Paragraph('Critical BRRRR Success Factors', style_h2))
    for b in [
        '<b>Accurate ARV estimate.</b> Your entire refi depends on the post-rehab appraisal. Be conservative. Use 3-5 recent, comparable sales within 0.5 miles.',
        '<b>Rehab budget discipline.</b> Every dollar of cost overrun is a dollar you leave in the deal. Build in a 10-15% contingency.',
        '<b>Seasoning awareness.</b> Most DSCR lenders require 6-12 months seasoning for cash-out. Plan your bridge loan term accordingly.',
        '<b>Rent verification.</b> The DSCR lender will verify market rent through an appraisal. If your projected rent is aggressive, you may not qualify.',
        '<b>Speed matters.</b> The longer you hold the bridge loan, the more interest you pay. Fast rehab = lower carrying costs = better BRRRR economics.',
    ]:
        story.append(Paragraph(b, style_bullet, bulletText='\u2022'))

    cta_box(story)
    story.append(PageBreak())

    # ══════════════════════════════════════════════
    # CHAPTER 12: Common Mistakes
    # ══════════════════════════════════════════════
    story.append(Paragraph('BONUS CHAPTER', style_label))
    story.append(Paragraph('10 Mistakes That Kill DSCR Deals', style_h1))
    story.append(section_divider())

    mistakes = [
        ('1. Overestimating Rent', 'Using Zillow or Rentometer estimates instead of actual comps. The appraiser will provide a rent schedule based on comparable leases -- and it is almost always lower than your optimistic projection. Always underwrite conservatively and let upside surprise you.'),
        ('2. Ignoring Insurance Costs', 'Insurance premiums have increased 30-50% in many markets since 2023. If you are using a 2-year-old insurance quote, your actual DSCR could be 0.10-0.15 lower than projected. Get a real quote before submitting your scenario.'),
        ('3. Not Shopping Rates', 'DSCR rates vary by 75-150 bps across lenders for the exact same deal. A borrower who goes with the first quote is almost certainly leaving money on the table. This is exactly why working with an advisor who has 12+ capital programs matters.'),
        ('4. Forgetting Prepayment Penalties', 'Many DSCR loans come with 3-5 year prepayment penalties (typically a step-down: 5-4-3-2-1 or 3-2-1). If you plan to sell or refi within that period, the prepay penalty can eat your profit. Always negotiate the prepay structure.'),
        ('5. Wrong Entity at Closing', 'Setting up the entity after the loan is in process causes delays. Have your LLC formed, EIN obtained, and operating agreement ready BEFORE you submit your application. Entity issues are the number one cause of closing delays.'),
        ('6. Insufficient Reserves', 'Running your bank accounts down to fund the down payment, then not having enough for reserves. Reserves are verified at closing, not at application. If you drain your accounts for the down payment, you may not close.'),
        ('7. Not Disclosing Other Properties', 'Lenders pull a credit report and see every mortgage. If you have undisclosed properties, it creates a trust issue that can tank the deal. Disclose everything upfront -- even properties with their own financing.'),
        ('8. Ignoring Tax Reassessment', 'When you buy a property, the county will reassess the property tax based on the purchase price. If you are using the seller\'s tax bill (which may reflect a much lower assessed value), your actual DSCR after reassessment could drop significantly.'),
        ('9. Assuming All Lenders Are the Same', 'DSCR lenders specialize. Some are better for STR, others for portfolio loans, others for sub-1.0 deals. Using a lender that does not specialize in your deal type means worse terms and a higher risk of denial.'),
        ('10. Waiting Too Long to Lock', 'Rates move. In the time between your quote and your lock, rates can shift 25-50 bps. Once you have a term sheet you like, lock it. The cost of floating and getting a worse rate is almost always higher than the cost of locking.'),
    ]

    for title, desc in mistakes:
        story.append(Paragraph(title, style_h3))
        story.append(Paragraph(desc, style_body))
        story.append(Spacer(1, 6))

    story.append(PageBreak())

    # ══════════════════════════════════════════════
    # CHAPTER 13: 2026 Market Outlook
    # ══════════════════════════════════════════════
    story.append(Paragraph('BONUS CHAPTER', style_label))
    story.append(Paragraph('2026 DSCR Market Outlook', style_h1))
    story.append(section_divider())

    story.append(Paragraph('What is Driving the Market', style_h2))
    story.append(Paragraph('The DSCR lending market in 2026 is being shaped by several macro forces that investors need to understand:', style_body))

    for b in [
        '<b>More capital entering the space.</b> Private credit funds, insurance companies, and securitization vehicles are all allocating more to DSCR. More supply of capital means better pricing for borrowers.',
        '<b>Rate normalization.</b> The Fed funds rate has stabilized, and 10-year Treasury yields have settled into a range that supports DSCR rates in the 6.5%-8.5% band. We do not expect significant rate movement in either direction through 2026.',
        '<b>Rent growth moderating.</b> After 3 years of aggressive rent growth (2021-2023) and a correction (2024), rents are growing at 3-5% nationally in 2026. This is healthy and sustainable but means investors cannot count on massive rent jumps to improve DSCR after closing.',
        '<b>Insurance cost headwinds.</b> Property insurance remains elevated, particularly in coastal and disaster-prone markets. This is the single biggest headwind for DSCR deals in 2026. Budget accordingly.',
        '<b>STR regulation stabilizing.</b> After a wave of restrictive short-term rental regulations in 2023-2024, most markets have settled into their regulatory frameworks. Investors now have more clarity on where STR strategies will work long-term.',
    ]:
        story.append(Paragraph(b, style_bullet, bulletText='\u2022'))

    story.append(Spacer(1, 12))
    story.append(Paragraph('Market Opportunities in 2026', style_h2))
    story.append(make_table(
        ['Strategy', 'Opportunity', 'Risk Level', 'Best Markets'],
        [
            ['SFR Buy-and-Hold', 'Stable cash flow, appreciation', 'Low', 'Midwest, Southeast, Texas'],
            ['STR Acquisition', 'Premium rents, DSCR advantage', 'Medium', 'Resort, Mountain, Beach'],
            ['BRRRR', 'Capital recycling, scale fast', 'Medium-High', 'Midwest, Mid-Atlantic'],
            ['Portfolio Consolidation', 'Rate improvement via blanket', 'Low', 'Any market (existing portfolio)'],
            ['Value-Add / Sub-1.0', 'Forced appreciation', 'High', 'Appreciation markets'],
            ['Multifamily (5-8 unit)', 'Economies of scale', 'Medium', 'Northeast, Pacific NW'],
        ],
        col_widths=[1.5*inch, 2*inch, 1*inch, 2*inch]
    ))

    story.append(Spacer(1, 16))
    story.append(Paragraph('Rate Forecast: Where Are Rates Heading?', style_h2))
    story.append(Paragraph('Our view on DSCR rates through end of 2026:', style_body))
    story.append(make_table(
        ['Scenario', 'Probability', 'DSCR Rate Range', 'Implication'],
        [
            ['Rates stay flat', '50%', '6.75% - 8.50%', 'Current conditions persist. Good window to lock.'],
            ['Rates drop 25-50 bps', '30%', '6.25% - 8.00%', 'Fed cuts, spreads compress. Great for refi.'],
            ['Rates rise 25-50 bps', '20%', '7.25% - 9.00%', 'Inflation spike or credit tightening. Lock now.'],
        ],
        col_widths=[1.5*inch, 1.2*inch, 1.5*inch, 2.3*inch]
    ))
    story.append(Paragraph('<b>Bottom line:</b> Do not try to time the rate market. If the deal works at today\'s rates, do the deal. You can always refinance later if rates drop. You cannot get back the deal you lost waiting for better terms.', style_body))

    story.append(PageBreak())

    # ══════════════════════════════════════════════
    # GLOSSARY
    # ══════════════════════════════════════════════
    story.append(Paragraph('APPENDIX', style_label))
    story.append(Paragraph('Glossary of DSCR Terms', style_h1))
    story.append(section_divider())

    glossary = [
        ('DSCR', 'Debt Service Coverage Ratio. Monthly rental income divided by monthly PITI.'),
        ('PITI', 'Principal, Interest, Taxes, and Insurance -- your total monthly housing cost.'),
        ('LTV', 'Loan-to-Value ratio. Loan amount divided by property value, expressed as a percentage.'),
        ('LTC', 'Loan-to-Cost ratio. Used in construction/bridge lending. Loan amount divided by total project cost.'),
        ('ARV', 'After-Repair Value. The estimated value of a property after renovations are complete.'),
        ('No-Ratio', 'A DSCR program where the lender does not calculate or require a specific DSCR.'),
        ('Sub-1.0', 'A DSCR below 1.0, meaning the property\'s rent does not fully cover the mortgage.'),
        ('Blanket Loan', 'A single loan secured by multiple properties.'),
        ('Seasoning', 'The time period a borrower must wait after acquisition before refinancing.'),
        ('Rate Buydown', 'Paying upfront points (% of loan amount) to reduce the interest rate.'),
        ('I/O', 'Interest-Only. A loan where you pay only interest for a set period, reducing monthly payments.'),
        ('ARM', 'Adjustable Rate Mortgage. Fixed rate for an initial period, then adjusts periodically.'),
        ('Prepayment Penalty', 'A fee charged for paying off the loan early, typically on a step-down schedule.'),
        ('Reserves', 'Liquid assets you must maintain after closing, measured in months of PITI.'),
        ('Cross-Collateralization', 'Using multiple properties as collateral for a single loan.'),
        ('BRRRR', 'Buy, Rehab, Rent, Refinance, Repeat. A strategy for scaling rental portfolios.'),
        ('1031 Exchange', 'IRS-recognized tax-deferred exchange of like-kind investment properties.'),
        ('Cap Rate', 'Capitalization Rate. NOI divided by property value. A measure of investment return.'),
        ('NOI', 'Net Operating Income. Revenue minus operating expenses, before debt service.'),
        ('Warrantable Condo', 'A condo that meets standard lending guidelines for owner-occupancy ratio, HOA finances, etc.'),
        ('AirDNA', 'A data provider that estimates short-term rental income potential for specific properties.'),
        ('BPO', 'Broker Price Opinion. An alternative to a full appraisal, used by some lenders.'),
        ('DTI', 'Debt-to-Income ratio. Used in conventional lending but NOT in DSCR (where the property qualifies, not you).'),
        ('Debt Yield', 'NOI divided by loan amount. Used in commercial lending as an additional risk metric.'),
    ]

    story.append(make_table(
        ['Term', 'Definition'],
        [[t, d] for t, d in glossary],
        col_widths=[1.5*inch, 5*inch]
    ))

    story.append(PageBreak())

    # ══════════════════════════════════════════════
    # QUICK REFERENCE CARDS
    # ══════════════════════════════════════════════
    story.append(Paragraph('APPENDIX', style_label))
    story.append(Paragraph('Quick Reference: DSCR Qualification Checklist', style_h1))
    story.append(section_divider())

    story.append(Paragraph('Use this checklist before submitting any DSCR deal:', style_body))
    story.append(Spacer(1, 8))

    checklist_items = [
        'Property address and type confirmed',
        'Estimated market rent verified (check 3+ comparable leases)',
        'Purchase price or current value confirmed',
        'Loan amount and target LTV calculated',
        'DSCR calculated (rent / estimated PITI)',
        'Credit score known (pull your own report first)',
        'Entity formed (LLC preferred) with EIN obtained',
        'Operating agreement executed',
        'Bank statements ready (2-3 months for reserve verification)',
        'Insurance quote obtained (including flood if applicable)',
        'Property tax amount verified (check for pending reassessment)',
        'HOA fees confirmed (if applicable)',
        'Title clear (no liens, judgments, or encumbrances)',
        'Lease in place (or comparable rent documentation for vacant properties)',
        'Prepayment penalty tolerance determined',
        'Exit strategy defined (hold, sell, or refi timeline)',
    ]

    for item in checklist_items:
        story.append(Paragraph(f'[ ] {item}', ParagraphStyle('Checklist', parent=style_body,
            fontName='Helvetica', fontSize=10, leading=18, leftIndent=10)))

    story.append(Spacer(1, 20))
    story.append(Paragraph('Quick Reference: Key Numbers to Know', style_h2))
    story.append(make_table(
        ['Metric', 'Target', 'Minimum'],
        [
            ['DSCR', '1.25+', '0.75 (sub-1.0 programs)'],
            ['Credit Score', '740+', '620'],
            ['LTV (Purchase)', '75%', '65%'],
            ['LTV (Max)', '80%', '70% (for 620-659 credit)'],
            ['Reserves', '6 months PITI', '3 months (strong profiles)'],
            ['Close Time', '14-21 days', 'Depends on title/appraisal'],
        ],
        col_widths=[2*inch, 2.25*inch, 2.25*inch]
    ))

    story.append(PageBreak())

    # ══════════════════════════════════════════════
    # HOW TO GET STARTED
    # ══════════════════════════════════════════════
    story.append(Paragraph('NEXT STEPS', style_label))
    story.append(Paragraph('How to Get Started', style_h1))
    story.append(section_divider())

    story.append(Paragraph('This playbook gives you the framework. Now it is time to put it to work.', style_body))
    story.append(Spacer(1, 12))

    steps = [
        ('<b>Step 1: Run Your Numbers.</b> Use our DSCR Calculator at 818capitalpartners.com/dscr-loans. Plug in the property details, rent estimate, and purchase price. The calculator will tell you the DSCR, estimated rate range, and whether the deal works.', None),
        ('<b>Step 2: Submit Your Scenario.</b> Send your deal to the 818 Capital Scenario Desk. Our AI analyzes your deal against 12+ capital programs and returns a match with specific terms -- not a generic quote.', None),
        ('<b>Step 3: Talk to Our Team.</b> We do not just originate loans -- we advise on deal structure, entity setup, and portfolio strategy. If the deal does not work, we will tell you why and what would need to change.', None),
    ]
    for text, _ in steps:
        story.append(Paragraph(text, style_body))
        story.append(Spacer(1, 8))

    story.append(Spacer(1, 24))
    story.append(Paragraph('<i>"The question we ask is not \'How many deals have you done?\' -- it is \'How many deals could you do, with the right partner?\'"</i>', style_callout))

    story.append(Spacer(1, 24))

    # Final CTA
    cta_data = [
        [Paragraph('818 Capital Partners', style_cta_heading)],
        [Paragraph('Built by Operators. Built for Operators.', style_cta_body)],
        [Spacer(1, 8)],
        [Paragraph('818capitalpartners.com | deals@818capitalpartners.com | (917) 993-9194', style_cta_body)],
    ]
    cta = Table(cta_data, colWidths=[6.5 * inch])
    cta.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), NAVY_900),
        ('TOPPADDING', (0, 0), (-1, -1), 16),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 16),
        ('LEFTPADDING', (0, 0), (-1, -1), 20),
        ('RIGHTPADDING', (0, 0), (-1, -1), 20),
    ]))
    story.append(cta)

    # ══════════════════════════════════════════════
    # DISCLAIMER PAGE
    # ══════════════════════════════════════════════
    story.append(PageBreak())
    story.append(Paragraph('DISCLAIMER', style_label))
    story.append(Spacer(1, 12))
    story.append(Paragraph(
        'This playbook is provided for informational and educational purposes only. It does not constitute financial advice, '
        'legal advice, or a commitment to lend. Rates, terms, and program availability are subject to change without notice and '
        'depend on individual borrower qualifications, property characteristics, and market conditions. All rate ranges and program '
        'details referenced in this document are approximate and based on market conditions as of March 2026. Actual rates and terms '
        'may differ. 818 Capital Partners does not guarantee any specific loan terms or approval.', style_body))
    story.append(Spacer(1, 12))
    story.append(Paragraph(
        '818 Capital Partners is a commercial mortgage brokerage. We work with multiple capital partners to find the best fit for '
        'each deal. We are not a direct lender for all products and programs referenced herein.', style_body))
    story.append(Spacer(1, 24))
    story.append(Paragraph('Copyright 2026 818 Capital Partners. All rights reserved.', ParagraphStyle('Copyright', parent=style_body, fontName='Helvetica-Bold', fontSize=9, textColor=NAVY_500)))

    # ══════════════════════════════════════════════
    # BUILD
    # ══════════════════════════════════════════════
    doc.build(story, onFirstPage=cover_page, onLaterPages=header_footer)
    print(f'PDF generated: {OUTPUT_PATH}')
    print(f'Pages: check the file')


if __name__ == '__main__':
    build_pdf()
