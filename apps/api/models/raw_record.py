from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Index, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, generate_uuid

if TYPE_CHECKING:
    from .source import Source


class RawRecord(Base):
    __tablename__ = "raw_records"
    __table_args__ = (
        Index("ix_raw_records_company", "company"),
        Index("ix_raw_records_crawl_status", "crawl_status"),
        Index("ix_raw_records_source_id", "source_id"),
        Index("ix_raw_records_content_hash", "content_hash"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    source_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("sources.id", ondelete="CASCADE"), nullable=False
    )
    company: Mapped[str] = mapped_column(String(50), nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    url: Mapped[str] = mapped_column(String(1000), nullable=False)
    published_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    crawled_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), nullable=False
    )
    raw_content: Mapped[str | None] = mapped_column(Text, nullable=True)
    raw_html_snapshot: Mapped[str | None] = mapped_column(Text, nullable=True)
    content_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)
    language: Mapped[str | None] = mapped_column(String(10), nullable=True)
    crawl_status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)
    dedupe_status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    source: Mapped["Source"] = relationship("Source", back_populates="raw_records")
    facts = relationship("Fact", back_populates="raw_record", lazy="dynamic")