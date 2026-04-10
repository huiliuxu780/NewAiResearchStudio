from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin, generate_uuid

if TYPE_CHECKING:
    from .fact import Fact


class Insight(Base, TimestampMixin):
    __tablename__ = "insights"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    fact_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("facts.id", ondelete="CASCADE"), nullable=False
    )
    company: Mapped[str] = mapped_column(String(50), nullable=False)
    insight_content: Mapped[str] = mapped_column(Text, nullable=False)
    insight_type: Mapped[str] = mapped_column(String(50), nullable=False)
    impact_level: Mapped[str] = mapped_column(String(20), nullable=False)
    confidence: Mapped[str] = mapped_column(String(20), nullable=False)
    reasoning_brief: Mapped[str | None] = mapped_column(Text, nullable=True)
    action_suggestion: Mapped[str | None] = mapped_column(Text, nullable=True)

    fact: Mapped["Fact"] = relationship("Fact", back_populates="insights")