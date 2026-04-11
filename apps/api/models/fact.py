from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin, generate_uuid

if TYPE_CHECKING:
    from .raw_record import RawRecord


class Fact(Base, TimestampMixin):
    __tablename__ = "facts"
    __table_args__ = (
        Index("ix_facts_company", "company"),
        Index("ix_facts_review_status", "review_status"),
        Index("ix_facts_created_at", "created_at"),
        Index("ix_facts_raw_record_id", "raw_record_id"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    raw_record_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("raw_records.id", ondelete="CASCADE"), nullable=False
    )
    company: Mapped[str] = mapped_column(String(50), nullable=False)
    fact_summary: Mapped[str] = mapped_column(Text, nullable=False)
    topic_level_1: Mapped[str] = mapped_column(String(100), nullable=False)
    topic_level_2: Mapped[str | None] = mapped_column(String(100), nullable=True)
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_name: Mapped[str] = mapped_column(String(255), nullable=False)
    importance_level: Mapped[str] = mapped_column(String(20), nullable=False)
    capability_level: Mapped[str | None] = mapped_column(String(20), nullable=True)
    confidence: Mapped[str] = mapped_column(String(20), nullable=False)
    published_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    source_url: Mapped[str] = mapped_column(String(1000), nullable=False)
    needs_review: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    review_status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)

    raw_record: Mapped["RawRecord"] = relationship("RawRecord", back_populates="facts")
    insights = relationship("Insight", back_populates="fact", lazy="dynamic")