from datetime import datetime, timezone
from io import BytesIO
from math import cos, pi, sin
from pathlib import Path
from typing import Any

from reportlab.lib import colors
from reportlab.lib.enums import (
    TA_LEFT,
    TA_RIGHT,
)
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import (
    ParagraphStyle,
    getSampleStyleSheet,
)
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import (
    Flowable,
    HRFlowable,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)
from app.schemas.report import ReportResponse


# ============================================================
# Assets
# ============================================================

ASSETS_DIR = (
    Path(__file__).resolve().parents[1]
    / "assets"
)


def _find_logo_path() -> Path:
    candidates = [
        ASSETS_DIR / "logo.png",
        Path.cwd() / "app" / "assets" / "logo.png",
    ]

    for candidate in candidates:
        if candidate.is_file():
            return candidate

    raise FileNotFoundError(
        "InterviewIQ logo not found. "
        "Expected backend/app/assets/logo.png"
    )


LOGO_PATH = _find_logo_path()


# ============================================================
# InterviewIQ theme
# ============================================================

NAVY = colors.HexColor("#050D1D")

CARD = colors.HexColor("#111A2D")
CARD_DARK = colors.HexColor("#0C1527")
CARD_SOFT = colors.HexColor("#152039")

BLUE = colors.HexColor("#2563EB")
LIGHT_BLUE = colors.HexColor("#60A5FA")

GREEN = colors.HexColor("#34D399")
GREEN_DARK = colors.HexColor("#082B25")

AMBER = colors.HexColor("#F59E0B")
AMBER_DARK = colors.HexColor("#2D2107")

PURPLE = colors.HexColor("#A78BFA")
PURPLE_DARK = colors.HexColor("#21153D")

RED = colors.HexColor("#F87171")

WHITE = colors.HexColor("#F8FAFC")
TEXT = colors.HexColor("#CBD5E1")
MUTED = colors.HexColor("#94A3B8")

BORDER = colors.HexColor("#26344D")
TRACK = colors.HexColor("#1E293B")


# ============================================================
# Page 1 dashboard
# ============================================================


class DashboardSummary(Flowable):
    """
    Draw the first page as an absolute-positioned
    dashboard instead of nested Platypus tables.
    """

    def __init__(
        self,
        interview: Any,
        report: ReportResponse,
        profile: dict[str, object],
        styles: dict[str, ParagraphStyle],
        width: float,
        height: float,
    ) -> None:
        super().__init__()

        self.interview = interview
        self.report = report
        self.profile = profile
        self.styles = styles

        self.width = width
        self.height = height

    # --------------------------------------------------------
    # Main renderer
    # --------------------------------------------------------

    def draw(self) -> None:
        canvas = self.canv

        page_width = self.width
        page_height = self.height

        # ====================================================
        # Header
        # ====================================================

        self._draw_logo(
            canvas=canvas,
            x=2 * mm,
            y=page_height - 3 * mm,
            max_width=72 * mm,
            max_height=19 * mm,
        )

        generated_at = datetime.now(
            timezone.utc
        )

        canvas.setFillColor(
            MUTED
        )

        canvas.setFont(
            "Helvetica",
            6.5,
        )

        canvas.drawRightString(
            page_width - 2 * mm,
            page_height - 4 * mm,
            "Generated on",
        )

        canvas.setFillColor(
            TEXT
        )

        canvas.setFont(
            "Helvetica-Bold",
            7,
        )

        canvas.drawRightString(
            page_width - 2 * mm,
            page_height - 9 * mm,
            generated_at.strftime(
                "%b %d, %Y"
            ),
        )

        canvas.setFillColor(
            MUTED
        )

        canvas.setFont(
            "Helvetica",
            6.5,
        )

        canvas.drawRightString(
            page_width - 2 * mm,
            page_height - 14 * mm,
            generated_at.strftime(
                "%H:%M UTC"
            ),
        )

        # ====================================================
        # Main heading
        # ====================================================

        canvas.setFillColor(
            WHITE
        )

        canvas.setFont(
            "Helvetica-Bold",
            24,
        )

        canvas.drawString(
            2 * mm,
            page_height - 32 * mm,
            "Interview Report",
        )

        canvas.setFillColor(
            MUTED
        )

        canvas.setFont(
            "Helvetica",
            8.5,
        )

        canvas.drawString(
            2 * mm,
            page_height - 39 * mm,
            (
                "Your performance overview "
                "and personalized interview insights"
            ),
        )

        # ====================================================
        # Interview details
        # ====================================================

        details_top = (
            page_height
            - 46 * mm
        )

        details_height = (
            36 * mm
        )

        self._draw_interview_details_card(
            canvas=canvas,
            x=0,
            y=(
                details_top
                - details_height
            ),
            width=page_width,
            height=details_height,
        )

        # ====================================================
        # Overall performance
        # ====================================================

        overall_top = (
            details_top
            - details_height
            - 4 * mm
        )

        overall_height = (
            57 * mm
        )

        overall_y = (
            overall_top
            - overall_height
        )

        self._rounded_card(
            canvas=canvas,
            x=0,
            y=overall_y,
            width=page_width,
            height=overall_height,
            fill=CARD,
            stroke=BORDER,
        )

        # Score ring
        ring_center_x = (
            25 * mm
        )

        ring_center_y = (
            overall_y
            + overall_height / 2
            - 1 * mm
        )

        self._draw_score_ring(
            canvas=canvas,
            center_x=ring_center_x,
            center_y=ring_center_y,
            radius=18 * mm,
            score=self.report.overall_score,
        )

        # Separator
        canvas.setStrokeColor(
            BORDER
        )

        canvas.setLineWidth(
            0.6
        )

        canvas.line(
            49 * mm,
            overall_y + 9 * mm,
            49 * mm,
            overall_y
            + overall_height
            - 9 * mm,
        )

        # Overall text
        text_x = (
            55 * mm
        )

        canvas.setFillColor(
            WHITE
        )

        canvas.setFont(
            "Helvetica-Bold",
            10,
        )

        canvas.drawString(
            text_x,
            overall_y
            + overall_height
            - 11 * mm,
            "Overall Performance",
        )

        performance_color = (
            ReportGenerator
            ._score_color(
                self.report.overall_score
            )
        )

        canvas.setFillColor(
            performance_color
        )

        canvas.setFont(
            "Helvetica-Bold",
            12,
        )

        canvas.drawString(
            text_x,
            overall_y
            + overall_height
            - 22 * mm,
            (
                ReportGenerator
                ._performance_label(
                    self.report.overall_score
                )
            ),
        )

        self._draw_paragraph(
            canvas=canvas,
            text=(
                ReportGenerator
                ._performance_message(
                    self.report.overall_score
                )
            ),
            style=self.styles["body"],
            x=text_x,
            y_top=(
                overall_y
                + overall_height
                - 28 * mm
            ),
            width=58 * mm,
        )

        # Separator before radar
        canvas.setStrokeColor(
            BORDER
        )

        canvas.line(
            116 * mm,
            overall_y + 9 * mm,
            116 * mm,
            overall_y
            + overall_height
            - 9 * mm,
        )

        # Radar
        self._draw_radar_chart(
            canvas=canvas,
            center_x=151 * mm,
            center_y=(
                overall_y
                + overall_height / 2
            ),
            radius=18.5 * mm,
        )

        # ====================================================
        # Category scores
        # ====================================================

        score_top = (
            overall_y
            - 4 * mm
        )

        score_height = (
            40 * mm
        )

        score_y = (
            score_top
            - score_height
        )

        self._draw_score_section(
            canvas=canvas,
            x=0,
            y=score_y,
            width=page_width,
            height=score_height,
        )

        # ====================================================
        # Strengths / improvements
        # ====================================================

        feedback_top = (
            score_y
            - 4 * mm
        )

        feedback_height = (
            32 * mm
        )

        feedback_y = (
            feedback_top
            - feedback_height
        )

        feedback_gap = (
            4 * mm
        )

        feedback_width = (
            page_width
            - feedback_gap
        ) / 2

        self._draw_feedback_card(
            canvas=canvas,
            x=0,
            y=feedback_y,
            width=feedback_width,
            height=feedback_height,
            title="Strengths",
            items=self.report.strengths,
            accent=GREEN,
            background=GREEN_DARK,
        )

        self._draw_feedback_card(
            canvas=canvas,
            x=(
                feedback_width
                + feedback_gap
            ),
            y=feedback_y,
            width=feedback_width,
            height=feedback_height,
            title="Areas to Improve",
            items=self.report.weaknesses,
            accent=AMBER,
            background=AMBER_DARK,
        )

        # ====================================================
        # Recommendations
        # ====================================================

        recommendation_top = (
            feedback_y
            - 4 * mm
        )

        recommendation_height = (
            27 * mm
        )

        recommendation_y = (
            recommendation_top
            - recommendation_height
        )

        self._draw_recommendation_card(
            canvas=canvas,
            x=0,
            y=recommendation_y,
            width=page_width,
            height=recommendation_height,
        )

    # --------------------------------------------------------
    # Logo
    # --------------------------------------------------------

    def _draw_logo(
        self,
        canvas: Canvas,
        x: float,
        y: float,
        max_width: float,
        max_height: float,
    ) -> None:
        image = ImageReader(
            str(LOGO_PATH)
        )

        image_width, image_height = (
            image.getSize()
        )

        scale = min(
            max_width / image_width,
            max_height / image_height,
        )

        draw_width = (
            image_width * scale
        )

        draw_height = (
            image_height * scale
        )

        canvas.drawImage(
            image,
            x,
            y - draw_height,
            width=draw_width,
            height=draw_height,
            preserveAspectRatio=True,
            mask="auto",
        )

    # --------------------------------------------------------
    # Interview details
    # --------------------------------------------------------

    def _draw_interview_details_card(
        self,
        canvas: Canvas,
        x: float,
        y: float,
        width: float,
        height: float,
    ) -> None:
        self._rounded_card(
            canvas=canvas,
            x=x,
            y=y,
            width=width,
            height=height,
            fill=CARD,
            stroke=BORDER,
        )

        canvas.setFillColor(
            LIGHT_BLUE
        )

        canvas.setFont(
            "Helvetica-Bold",
            8,
        )

        canvas.drawString(
            x + 5 * mm,
            y
            + height
            - 8 * mm,
            "Interview Details",
        )

        completed_at = (
            self.interview.completed_at
        )

        completed_text = (
            completed_at.strftime(
                "%b %d, %Y"
            )
            if completed_at
            else "--"
        )

        values = [
            (
                "Job Role",
                str(
                    self.interview.job_role
                ),
            ),
            (
                "Interview Type",
                ReportGenerator
                ._format_label(
                    ReportGenerator
                    ._enum_value(
                        self.interview
                        .interview_type
                    )
                ),
            ),
            (
                "Difficulty",
                ReportGenerator
                ._format_label(
                    ReportGenerator
                    ._enum_value(
                        self.interview
                        .difficulty
                    )
                ),
            ),
            (
                "Questions",
                str(
                    self.interview
                    .question_count
                ),
            ),
            (
                "Completed On",
                completed_text,
            ),
            (
                "Active Duration",
                ReportGenerator
                ._format_duration(
                    self.interview
                    .duration_seconds
                ),
            ),
        ]

        column_width = (
            width - 10 * mm
        ) / 3

        for index, (
            label,
            value,
        ) in enumerate(
            values
        ):
            row = (
                index // 3
            )

            column = (
                index % 3
            )

            cell_x = (
                x
                + 5 * mm
                + column
                * column_width
            )

            cell_y = (
                y
                + height
                - 15 * mm
                - row
                * 13 * mm
            )

            canvas.setFillColor(
                MUTED
            )

            canvas.setFont(
                "Helvetica",
                5.2,
            )

            canvas.drawString(
                cell_x,
                cell_y,
                label,
            )

            canvas.setFillColor(
                WHITE
            )

            canvas.setFont(
                "Helvetica-Bold",
                7.2,
            )

            canvas.drawString(
                cell_x,
                cell_y - 5 * mm,
                value[:24],
            )

    # --------------------------------------------------------
    # Score ring
    # --------------------------------------------------------

    def _draw_score_ring(
        self,
        canvas: Canvas,
        center_x: float,
        center_y: float,
        radius: float,
        score: float,
    ) -> None:
        safe_score = max(
            0.0,
            min(
                float(score),
                100.0,
            ),
        )

        canvas.setStrokeColor(
            TRACK
        )

        canvas.setLineWidth(
            8
        )

        canvas.circle(
            center_x,
            center_y,
            radius,
            stroke=1,
            fill=0,
        )

        canvas.setStrokeColor(
            ReportGenerator
            ._score_color(
                safe_score
            )
        )

        canvas.setLineWidth(
            8
        )

        canvas.arc(
            center_x - radius,
            center_y - radius,
            center_x + radius,
            center_y + radius,
            startAng=90,
            extent=(
                -safe_score
                * 3.6
            ),
        )

        canvas.setFillColor(
            WHITE
        )

        canvas.setFont(
            "Helvetica-Bold",
            25,
        )

        canvas.drawCentredString(
            center_x,
            center_y + 3,
            str(
                round(
                    safe_score
                )
            ),
        )

        canvas.setFillColor(
            MUTED
        )

        canvas.setFont(
            "Helvetica",
            8,
        )

        canvas.drawCentredString(
            center_x,
            center_y - 11,
            "/ 100",
        )

    # --------------------------------------------------------
    # Radar
    # --------------------------------------------------------

    def _draw_radar_chart(
        self,
        canvas: Canvas,
        center_x: float,
        center_y: float,
        radius: float,
    ) -> None:
        values = [
            self.report.technical_score,
            self.report.communication_score,
            self.report.confidence_score,
            self.report.fluency_score,
            self.report.overall_score,
        ]

        labels = [
            "Technical",
            "Communication",
            "Confidence",
            "Fluency",
            "Overall",
        ]

        outer_points: list[
            tuple[float, float]
        ] = []

        for index in range(5):
            angle = (
                pi / 2
                - index
                * 2
                * pi
                / 5
            )

            outer_points.append(
                (
                    center_x
                    + radius
                    * cos(angle),
                    center_y
                    + radius
                    * sin(angle),
                )
            )

        canvas.setStrokeColor(
            colors.HexColor(
                "#475569"
            )
        )

        canvas.setLineWidth(
            0.5
        )

        for level in (
            0.25,
            0.50,
            0.75,
            1.0,
        ):
            path = (
                canvas.beginPath()
            )

            for index, (
                x,
                y,
            ) in enumerate(
                outer_points
            ):
                point_x = (
                    center_x
                    + (
                        x
                        - center_x
                    )
                    * level
                )

                point_y = (
                    center_y
                    + (
                        y
                        - center_y
                    )
                    * level
                )

                if index == 0:
                    path.moveTo(
                        point_x,
                        point_y,
                    )
                else:
                    path.lineTo(
                        point_x,
                        point_y,
                    )

            path.close()

            canvas.drawPath(
                path,
                stroke=1,
                fill=0,
            )

        for (
            x,
            y,
        ) in outer_points:
            canvas.line(
                center_x,
                center_y,
                x,
                y,
            )

        value_points: list[
            tuple[float, float]
        ] = []

        for index, score in enumerate(
            values
        ):
            normalized = (
                max(
                    0.0,
                    min(
                        float(score),
                        100.0,
                    ),
                )
                / 100.0
            )

            x, y = (
                outer_points[
                    index
                ]
            )

            value_points.append(
                (
                    center_x
                    + (
                        x
                        - center_x
                    )
                    * normalized,
                    center_y
                    + (
                        y
                        - center_y
                    )
                    * normalized,
                )
            )

        path = (
            canvas.beginPath()
        )

        for index, (
            x,
            y,
        ) in enumerate(
            value_points
        ):
            if index == 0:
                path.moveTo(
                    x,
                    y,
                )
            else:
                path.lineTo(
                    x,
                    y,
                )

        path.close()

        canvas.setFillColor(
            colors.Color(
                37 / 255,
                99 / 255,
                235 / 255,
                alpha=0.30,
            )
        )

        canvas.setStrokeColor(
            LIGHT_BLUE
        )

        canvas.setLineWidth(
            1.2
        )

        canvas.drawPath(
            path,
            stroke=1,
            fill=1,
        )

        canvas.setFillColor(
            LIGHT_BLUE
        )

        for (
            x,
            y,
        ) in value_points:
            canvas.circle(
                x,
                y,
                1.8,
                stroke=0,
                fill=1,
            )

        # Keep every radar label inside the overall-performance card.
        # The radar occupies the right-hand area beginning after x=116 mm.
        label_positions = [
            (
                center_x,
                center_y
                + radius
                + 3.5 * mm,
                "center",
            ),
            (
                center_x
                + radius
                + 2.5 * mm,
                center_y
                + 1.5 * mm,
                "left",
            ),
            (
                center_x
                + radius
                + 1.5 * mm,
                center_y
                - radius
                - 1.0 * mm,
                "left",
            ),
            (
                center_x
                - radius
                - 1.5 * mm,
                center_y
                - radius
                - 1.0 * mm,
                "right",
            ),
            (
                center_x
                - radius
                - 2.5 * mm,
                center_y
                + 1.5 * mm,
                "right",
            ),
        ]

        for index, (
            label_x,
            label_y,
            alignment,
        ) in enumerate(
            label_positions
        ):
            canvas.setFillColor(
                MUTED
            )

            canvas.setFont(
                "Helvetica",
                5.8,
            )

            label = (
                labels[index]
            )

            score = (
                round(
                    values[index]
                )
            )

            if alignment == "center":
                canvas.drawCentredString(
                    label_x,
                    label_y,
                    label,
                )

                canvas.setFillColor(
                    WHITE
                )

                canvas.setFont(
                    "Helvetica-Bold",
                    5.9,
                )

                canvas.drawCentredString(
                    label_x,
                    label_y - 3 * mm,
                    str(score),
                )

            elif alignment == "left":
                canvas.drawString(
                    label_x,
                    label_y,
                    label,
                )

                canvas.setFillColor(
                    WHITE
                )

                canvas.setFont(
                    "Helvetica-Bold",
                    5.9,
                )

                canvas.drawString(
                    label_x,
                    label_y - 3 * mm,
                    str(score),
                )

            else:
                canvas.drawRightString(
                    label_x,
                    label_y,
                    label,
                )

                canvas.setFillColor(
                    WHITE
                )

                canvas.setFont(
                    "Helvetica-Bold",
                    5.9,
                )

                canvas.drawRightString(
                    label_x,
                    label_y - 3 * mm,
                    str(score),
                )

    # --------------------------------------------------------
    # Category scores
    # --------------------------------------------------------

    def _draw_score_section(
        self,
        canvas: Canvas,
        x: float,
        y: float,
        width: float,
        height: float,
    ) -> None:
        self._rounded_card(
            canvas=canvas,
            x=x,
            y=y,
            width=width,
            height=height,
            fill=CARD,
            stroke=BORDER,
        )

        canvas.setFillColor(
            WHITE
        )

        canvas.setFont(
            "Helvetica-Bold",
            9,
        )

        canvas.drawString(
            x + 5 * mm,
            y
            + height
            - 8 * mm,
            "Scores by Category",
        )

        cards = [
            (
                "Technical",
                self.report.technical_score,
                GREEN,
            ),
            (
                "Communication",
                self.report.communication_score,
                LIGHT_BLUE,
            ),
            (
                "Confidence",
                self.report.confidence_score,
                AMBER,
            ),
            (
                "Fluency",
                self.report.fluency_score,
                PURPLE,
            ),
            (
                "Overall",
                self.report.overall_score,
                GREEN,
            ),
        ]

        content_x = (
            x + 5 * mm
        )

        content_width = (
            width - 10 * mm
        )

        gap = (
            3 * mm
        )

        card_width = (
            content_width
            - gap * 4
        ) / 5

        card_y = (
            y + 5 * mm
        )

        card_height = (
            height - 16 * mm
        )

        for index, (
            label,
            score,
            accent,
        ) in enumerate(
            cards
        ):
            card_x = (
                content_x
                + index
                * (
                    card_width
                    + gap
                )
            )

            self._draw_score_card(
                canvas=canvas,
                x=card_x,
                y=card_y,
                width=card_width,
                height=card_height,
                label=label,
                score=score,
                accent=accent,
            )

    def _draw_score_card(
        self,
        canvas: Canvas,
        x: float,
        y: float,
        width: float,
        height: float,
        label: str,
        score: float,
        accent: Any,
    ) -> None:
        self._rounded_card(
            canvas=canvas,
            x=x,
            y=y,
            width=width,
            height=height,
            fill=CARD_DARK,
            stroke=BORDER,
            radius=2.5 * mm,
        )

        canvas.setFillColor(
            MUTED
        )

        canvas.setFont(
            "Helvetica",
            5.7,
        )

        canvas.drawString(
            x + 3 * mm,
            y + height - 5 * mm,
            label,
        )

        score_text = (
            f"{score:.1f}"
        )

        score_x = (
            x + 3 * mm
        )

        score_y = (
            y + height - 14 * mm
        )

        canvas.setFillColor(
            accent
        )

        canvas.setFont(
            "Helvetica-Bold",
            12,
        )

        canvas.drawString(
            score_x,
            score_y,
            score_text,
        )

        score_width = (
            canvas.stringWidth(
                score_text,
                "Helvetica-Bold",
                12,
            )
        )

        canvas.setFillColor(
            MUTED
        )

        canvas.setFont(
            "Helvetica",
            6,
        )

        canvas.drawString(
            score_x
            + score_width
            + 1.5 * mm,
            score_y,
            "/100",
        )

        bar_x = (
            x + 3 * mm
        )

        bar_y = (
            y + 7 * mm
        )

        bar_width = (
            width - 6 * mm
        )

        bar_height = (
            2.2 * mm
        )

        canvas.setFillColor(
            TRACK
        )

        canvas.roundRect(
            bar_x,
            bar_y,
            bar_width,
            bar_height,
            bar_height / 2,
            stroke=0,
            fill=1,
        )

        progress_width = (
            bar_width
            * max(
                0,
                min(
                    score,
                    100,
                ),
            )
            / 100
        )

        canvas.setFillColor(
            accent
        )

        if progress_width > 0:
            canvas.roundRect(
                bar_x,
                bar_y,
                progress_width,
                bar_height,
                bar_height / 2,
                stroke=0,
                fill=1,
            )

        canvas.setFillColor(
            accent
        )

        canvas.setFont(
            "Helvetica",
            5.7,
        )

        canvas.drawString(
            x + 3 * mm,
            y + 2.5 * mm,
            ReportGenerator._score_label(
                score
            ),
        )

    # --------------------------------------------------------
    # Feedback cards
    # --------------------------------------------------------

    def _draw_feedback_card(
        self,
        canvas: Canvas,
        x: float,
        y: float,
        width: float,
        height: float,
        title: str,
        items: list[str],
        accent: Any,
        background: Any,
    ) -> None:
        self._rounded_card(
            canvas=canvas,
            x=x,
            y=y,
            width=width,
            height=height,
            fill=background,
            stroke=accent,
        )

        canvas.setFillColor(
            accent
        )

        canvas.setFont(
            "Helvetica-Bold",
            9,
        )

        canvas.drawString(
            x + 5 * mm,
            y
            + height
            - 8 * mm,
            title,
        )

        current_y = (
            y
            + height
            - 15 * mm
        )

        for item in items[:4]:
            canvas.setFillColor(
                accent
            )

            canvas.circle(
                x + 6 * mm,
                current_y + 1,
                1.1,
                stroke=0,
                fill=1,
            )

            used_height = (
                self._draw_paragraph(
                    canvas=canvas,
                    text=(
                        ReportGenerator
                        ._escape(
                            item
                        )
                    ),
                    style=self.styles["body"],
                    x=x + 10 * mm,
                    y_top=current_y + 3,
                    width=(
                        width
                        - 15 * mm
                    ),
                )
            )

            current_y -= (
                max(
                    used_height,
                    5 * mm,
                )
                + 1 * mm
            )

    # --------------------------------------------------------
    # Recommendations
    # --------------------------------------------------------

    def _draw_recommendation_card(
        self,
        canvas: Canvas,
        x: float,
        y: float,
        width: float,
        height: float,
    ) -> None:
        self._rounded_card(
            canvas=canvas,
            x=x,
            y=y,
            width=width,
            height=height,
            fill=PURPLE_DARK,
            stroke=PURPLE,
        )

        canvas.setFillColor(
            PURPLE
        )

        canvas.setFont(
            "Helvetica-Bold",
            9,
        )

        canvas.drawString(
            x + 5 * mm,
            y
            + height
            - 8 * mm,
            "AI Recommendations",
        )

        current_y = (
            y
            + height
            - 14 * mm
        )

        for suggestion in (
            self.report.suggestions[
                :3
            ]
        ):
            canvas.setFillColor(
                PURPLE
            )

            canvas.circle(
                x + 6 * mm,
                current_y + 1,
                1.1,
                stroke=0,
                fill=1,
            )

            used_height = (
                self._draw_paragraph(
                    canvas=canvas,
                    text=(
                        ReportGenerator
                        ._escape(
                            suggestion
                        )
                    ),
                    style=self.styles["body"],
                    x=x + 10 * mm,
                    y_top=current_y + 3,
                    width=(
                        width
                        - 15 * mm
                    ),
                )
            )

            current_y -= (
                max(
                    used_height,
                    5 * mm,
                )
                + 1 * mm
            )

    # --------------------------------------------------------
    # Generic helpers
    # --------------------------------------------------------

    @staticmethod
    def _rounded_card(
        canvas: Canvas,
        x: float,
        y: float,
        width: float,
        height: float,
        fill: Any,
        stroke: Any,
        radius: float = 3 * mm,
    ) -> None:
        canvas.setFillColor(
            fill
        )

        canvas.setStrokeColor(
            stroke
        )

        canvas.setLineWidth(
            0.6
        )

        canvas.roundRect(
            x,
            y,
            width,
            height,
            radius,
            stroke=1,
            fill=1,
        )

    @staticmethod
    def _draw_paragraph(
        canvas: Canvas,
        text: str,
        style: ParagraphStyle,
        x: float,
        y_top: float,
        width: float,
    ) -> float:
        paragraph = Paragraph(
            text,
            style,
        )

        _, height = paragraph.wrap(
            width,
            100 * mm,
        )

        paragraph.drawOn(
            canvas,
            x,
            y_top - height,
        )

        return height


# ============================================================
# Report Generator
# ============================================================


class ReportGenerator:
    """Generate InterviewIQ interview reports."""

    @staticmethod
    def generate_pdf(
        interview: Any,
        report: ReportResponse,
        profile: dict[str, object],
        questions: list[
            dict[str, Any]
        ],
        responses: list[
            dict[str, Any]
        ],
    ) -> bytes:
        buffer = BytesIO()

        document = (
            SimpleDocTemplate(
                buffer,
                pagesize=A4,
                leftMargin=11 * mm,
                rightMargin=11 * mm,
                topMargin=8 * mm,
                bottomMargin=14 * mm,
                title=(
                    "InterviewIQ "
                    "Interview Report"
                ),
                author="InterviewIQ",
            )
        )

        styles = (
            ReportGenerator
            ._build_styles()
        )

        available_width = (
            A4[0]
            - document.leftMargin
            - document.rightMargin
        )

        story: list[Any] = [
            DashboardSummary(
                interview=interview,
                report=report,
                profile=profile,
                styles=styles,
                width=available_width,
                height=270 * mm,
            ),
            PageBreak(),
        ]

        story.extend(
            ReportGenerator
            ._build_question_review(
                questions=questions,
                responses=responses,
                styles=styles,
            )
        )

        document.build(
            story,
            onFirstPage=(
                ReportGenerator
                ._draw_first_page
            ),
            onLaterPages=(
                ReportGenerator
                ._draw_later_page
            ),
        )

        pdf_bytes = (
            buffer.getvalue()
        )

        buffer.close()

        return pdf_bytes

    # ========================================================
    # Styles
    # ========================================================

    @staticmethod
    def _build_styles() -> dict[
        str,
        ParagraphStyle,
    ]:
        base = (
            getSampleStyleSheet()
        )

        return {
            "page_title": ParagraphStyle(
                "InterviewIQPageTitle",
                parent=base["Title"],
                fontName="Helvetica-Bold",
                fontSize=18,
                leading=22,
                textColor=WHITE,
                alignment=TA_LEFT,
            ),
            "body": ParagraphStyle(
                "InterviewIQBody",
                parent=base["BodyText"],
                fontName="Helvetica",
                fontSize=7.7,
                leading=10.5,
                textColor=TEXT,
            ),
            "small": ParagraphStyle(
                "InterviewIQSmall",
                parent=base["BodyText"],
                fontName="Helvetica",
                fontSize=6.5,
                leading=9,
                textColor=MUTED,
            ),
            "question": ParagraphStyle(
                "InterviewIQQuestion",
                parent=base["Heading3"],
                fontName="Helvetica-Bold",
                fontSize=8.5,
                leading=11.5,
                textColor=WHITE,
            ),
            "right": ParagraphStyle(
                "InterviewIQRight",
                parent=base["BodyText"],
                fontName="Helvetica",
                fontSize=6.5,
                leading=9,
                textColor=MUTED,
                alignment=TA_RIGHT,
            ),
        }

    # ========================================================
    # Page backgrounds
    # ========================================================

    @staticmethod
    def _draw_first_page(
        canvas: Canvas,
        document: Any,
    ) -> None:
        ReportGenerator._draw_base_page(
            canvas=canvas,
            page_number=document.page,
        )

    @staticmethod
    def _draw_later_page(
        canvas: Canvas,
        document: Any,
    ) -> None:
        ReportGenerator._draw_base_page(
            canvas=canvas,
            page_number=document.page,
        )

        page_width, page_height = A4

        canvas.setStrokeColor(
            BORDER
        )

        canvas.setLineWidth(
            0.4
        )

        canvas.line(
            11 * mm,
            page_height - 17 * mm,
            page_width - 11 * mm,
            page_height - 17 * mm,
        )

    @staticmethod
    def _draw_base_page(
        canvas: Canvas,
        page_number: int,
    ) -> None:
        page_width, page_height = A4

        canvas.saveState()

        canvas.setFillColor(
            NAVY
        )

        canvas.rect(
            0,
            0,
            page_width,
            page_height,
            stroke=0,
            fill=1,
        )

        canvas.setStrokeColor(
            BORDER
        )

        canvas.setLineWidth(
            0.5
        )

        canvas.roundRect(
            6 * mm,
            6 * mm,
            page_width - 12 * mm,
            page_height - 12 * mm,
            5 * mm,
            stroke=1,
            fill=0,
        )

        canvas.setFillColor(
            MUTED
        )

        canvas.setFont(
            "Helvetica",
            5.7,
        )

        canvas.drawString(
            11 * mm,
            8.5 * mm,
            (
                "InterviewIQ | "
                "AI Mock Interview Report"
            ),
        )

        canvas.drawRightString(
            page_width - 11 * mm,
            8.5 * mm,
            f"Page {page_number}",
        )

        canvas.restoreState()

    # ========================================================
    # Question pages
    # ========================================================

    @staticmethod
    def _build_question_review(
        questions: list[
            dict[str, Any]
        ],
        responses: list[
            dict[str, Any]
        ],
        styles: dict[
            str,
            ParagraphStyle,
        ],
    ) -> list[Any]:
        story: list[Any] = [
            Paragraph(
                "Question-by-Question Review",
                styles["page_title"],
            ),
            Spacer(
                1,
                2 * mm,
            ),
            Paragraph(
                (
                    "Detailed response scores, "
                    "transcripts and AI feedback."
                ),
                styles["small"],
            ),
            Spacer(
                1,
                5 * mm,
            ),
        ]

        response_map = {
            int(
                response[
                    "question_number"
                ]
            ): response
            for response in responses
            if isinstance(
                response.get(
                    "question_number"
                ),
                int,
            )
        }

        sorted_questions = sorted(
            questions,
            key=lambda question: int(
                question[
                    "question_number"
                ]
            ),
        )

        for question in (
            sorted_questions
        ):
            question_number = int(
                question[
                    "question_number"
                ]
            )

            response = (
                response_map.get(
                    question_number
                )
            )

            overall_score = (
                ReportGenerator
                ._numeric_score(
                    (
                        response.get(
                            "overall_score"
                        )
                        if response
                        else None
                    )
                )
            )

            score_text = (
                f"{overall_score:.1f}%"
                if overall_score
                is not None
                else "--"
            )

            question_elements: list[Any] = []

            header_table = Table(
                [
                    [
                        Paragraph(
                            (
                                "<font "
                                "color='#60A5FA'>"
                                "<b>"
                                f"QUESTION "
                                f"{question_number}"
                                "</b>"
                                "</font>"
                            ),
                            styles["small"],
                        ),
                        Paragraph(
                            (
                                "<font "
                                "color='#60A5FA'>"
                                "<b>"
                                f"{score_text}"
                                "</b>"
                                "</font>"
                            ),
                            styles["right"],
                        ),
                    ]
                ],
                colWidths=[
                    158 * mm,
                    20 * mm,
                ],
            )

            header_table.setStyle(
                ReportGenerator
                ._transparent_table_style()
            )

            question_elements.append(
                Table(
                    [
                        [
                            header_table
                        ]
                    ],
                    colWidths=[
                        182 * mm
                    ],
                    style=TableStyle(
                        [
                            (
                                "BACKGROUND",
                                (0, 0),
                                (-1, -1),
                                CARD,
                            ),
                            (
                                "BOX",
                                (0, 0),
                                (-1, -1),
                                0.4,
                                BORDER,
                            ),
                            (
                                "LEFTPADDING",
                                (0, 0),
                                (-1, -1),
                                5,
                            ),
                            (
                                "RIGHTPADDING",
                                (0, 0),
                                (-1, -1),
                                5,
                            ),
                            (
                                "TOPPADDING",
                                (0, 0),
                                (-1, -1),
                                4,
                            ),
                            (
                                "BOTTOMPADDING",
                                (0, 0),
                                (-1, -1),
                                4,
                            ),
                        ]
                    ),
                )
            )

            question_elements.append(
                Spacer(
                    1,
                    2 * mm,
                )
            )

            question_elements.append(
                Paragraph(
                    ReportGenerator._escape(
                        str(
                            question.get(
                                "question",
                                "",
                            )
                        )
                    ),
                    styles["question"],
                )
            )

            question_elements.append(
                Spacer(
                    1,
                    2 * mm,
                )
            )

            if response:
                question_elements.append(
                    ReportGenerator
                    ._question_score_table(
                        response=response,
                        styles=styles,
                    )
                )

                transcript = (
                    response.get(
                        "transcript"
                    )
                )

                if (
                    isinstance(
                        transcript,
                        str,
                    )
                    and transcript.strip()
                ):
                    question_elements.append(
                        Spacer(
                            1,
                            2 * mm,
                        )
                    )

                    question_elements.append(
                        Paragraph(
                            (
                                "<font "
                                "color='#94A3B8'>"
                                "<b>"
                                "Your Answer"
                                "</b>"
                                "</font>"
                            ),
                            styles["small"],
                        )
                    )

                    question_elements.append(
                        Spacer(
                            1,
                            1 * mm,
                        )
                    )

                    question_elements.append(
                        Paragraph(
                            ReportGenerator._escape(
                                transcript
                            ),
                            styles["body"],
                        )
                    )

                feedback = (
                    response.get(
                        "question_feedback"
                    )
                )

                if (
                    isinstance(
                        feedback,
                        str,
                    )
                    and feedback.strip()
                ):
                    question_elements.append(
                        Spacer(
                            1,
                            2 * mm,
                        )
                    )

                    question_elements.append(
                        Paragraph(
                            (
                                "<font "
                                "color='#60A5FA'>"
                                "<b>"
                                "AI Feedback"
                                "</b>"
                                "</font>"
                            ),
                            styles["small"],
                        )
                    )

                    question_elements.append(
                        Spacer(
                            1,
                            1 * mm,
                        )
                    )

                    question_elements.append(
                        Paragraph(
                            ReportGenerator._escape(
                                feedback
                            ),
                            styles["body"],
                        )
                    )

            question_elements.append(
                Spacer(
                    1,
                    2 * mm,
                )
            )

            question_elements.append(
                HRFlowable(
                    width="100%",
                    thickness=0.4,
                    color=BORDER,
                )
            )

            story.append(
                KeepTogether(
                    question_elements
                )
            )

            story.append(
                Spacer(
                    1,
                    3 * mm,
                )
            )

        return story

    @staticmethod
    def _question_score_table(
        response: dict[str, Any],
        styles: dict[str, ParagraphStyle],
    ) -> Table:
        """Build compact score cells for a single interview response."""

        values = [
            (
                "Technical",
                response.get(
                    "technical_score"
                ),
            ),
            (
                "Communication",
                response.get(
                    "communication_score"
                ),
            ),
            (
                "Confidence",
                response.get(
                    "confidence_score"
                ),
            ),
            (
                "Fluency",
                response.get(
                    "fluency_score"
                ),
            ),
            (
                "Overall",
                response.get(
                    "overall_score"
                ),
            ),
        ]

        cells: list[Any] = []

        for (
            label,
            value,
        ) in values:
            numeric_score = (
                ReportGenerator
                ._numeric_score(
                    value
                )
            )

            score_text = (
                f"{numeric_score:.1f}%"
                if numeric_score is not None
                else "--"
            )

            cells.append(
                [
                    Paragraph(
                        label,
                        styles["small"],
                    ),
                    Spacer(
                        1,
                        0.8 * mm,
                    ),
                    Paragraph(
                        (
                            "<b>"
                            f"{score_text}"
                            "</b>"
                        ),
                        styles["body"],
                    ),
                ]
            )

        table = Table(
            [
                cells
            ],
            colWidths=[
                35.5 * mm,
                35.5 * mm,
                35.5 * mm,
                35.5 * mm,
                35.5 * mm,
            ],
        )

        table.setStyle(
            TableStyle(
                [
                    (
                        "BACKGROUND",
                        (0, 0),
                        (-1, -1),
                        CARD_DARK,
                    ),
                    (
                        "BOX",
                        (0, 0),
                        (-1, -1),
                        0.4,
                        BORDER,
                    ),
                    (
                        "INNERGRID",
                        (0, 0),
                        (-1, -1),
                        0.3,
                        BORDER,
                    ),
                    (
                        "VALIGN",
                        (0, 0),
                        (-1, -1),
                        "TOP",
                    ),
                    (
                        "LEFTPADDING",
                        (0, 0),
                        (-1, -1),
                        4,
                    ),
                    (
                        "RIGHTPADDING",
                        (0, 0),
                        (-1, -1),
                        4,
                    ),
                    (
                        "TOPPADDING",
                        (0, 0),
                        (-1, -1),
                        4,
                    ),
                    (
                        "BOTTOMPADDING",
                        (0, 0),
                        (-1, -1),
                        4,
                    ),
                ]
            )
        )

        return table

    # ========================================================
    # Shared helpers
    # ========================================================

    @staticmethod
    def _transparent_table_style() -> TableStyle:
        return TableStyle(
            [
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "TOP",
                ),
                (
                    "LEFTPADDING",
                    (0, 0),
                    (-1, -1),
                    0,
                ),
                (
                    "RIGHTPADDING",
                    (0, 0),
                    (-1, -1),
                    0,
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    0,
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    0,
                ),
            ]
        )

    @staticmethod
    def _format_duration(
        duration_seconds: int | None,
    ) -> str:
        if duration_seconds is None:
            return "--"

        hours = (
            duration_seconds
            // 3600
        )

        minutes = (
            (
                duration_seconds
                % 3600
            )
            // 60
        )

        seconds = (
            duration_seconds
            % 60
        )

        if hours > 0:
            return (
                f"{hours}h "
                f"{minutes}m "
                f"{seconds}s"
            )

        if minutes > 0:
            return (
                f"{minutes}m "
                f"{seconds}s"
            )

        return (
            f"{seconds}s"
        )

    @staticmethod
    def _enum_value(
        value: Any,
    ) -> str:
        return str(
            getattr(
                value,
                "value",
                value,
            )
        )

    @staticmethod
    def _format_label(
        value: str,
    ) -> str:
        return (
            value.replace(
                "_",
                " ",
            )
            .title()
        )

    @staticmethod
    def _performance_label(
        score: float,
    ) -> str:
        if score >= 90:
            return (
                "Excellent Performance"
            )

        if score >= 80:
            return (
                "Great Performance"
            )

        if score >= 70:
            return (
                "Good Performance"
            )

        if score >= 60:
            return (
                "Fair Performance"
            )

        return (
            "Keep Practicing"
        )

    @staticmethod
    def _performance_message(
        score: float,
    ) -> str:
        if score >= 90:
            return (
                "Outstanding performance across "
                "the interview. Continue challenging "
                "yourself with advanced scenarios."
            )

        if score >= 80:
            return (
                "You performed very well. Keep "
                "strengthening the areas identified "
                "in this report."
            )

        if score >= 70:
            return (
                "You demonstrated solid interview "
                "performance. Focus on the areas "
                "below to improve consistency."
            )

        if score >= 60:
            return (
                "You have a good foundation. "
                "Focused practice will strengthen "
                "your weaker interview skills."
            )

        return (
            "Use the detailed feedback in this "
            "report to strengthen weak areas and "
            "build better interview habits."
        )

    @staticmethod
    def _score_label(
        score: float,
    ) -> str:
        if score >= 90:
            return "Excellent"

        if score >= 80:
            return "Great"

        if score >= 70:
            return "Good"

        if score >= 60:
            return "Fair"

        return (
            "Needs Improvement"
        )

    @staticmethod
    def _score_color(
        score: float,
    ) -> Any:
        if score >= 85:
            return GREEN

        if score >= 70:
            return LIGHT_BLUE

        if score >= 60:
            return AMBER

        return RED

    @staticmethod
    def _numeric_score(
        value: object,
    ) -> float | None:
        if isinstance(
            value,
            (int, float),
        ):
            return float(
                value
            )

        return None

    @staticmethod
    def _escape(
        value: str,
    ) -> str:
        return (
            value.replace(
                "&",
                "&amp;",
            )
            .replace(
                "<",
                "&lt;",
            )
            .replace(
                ">",
                "&gt;",
            )
        )