import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin, generate_uuid


class CrawlTaskStatus(str, enum.Enum):
    pending = "pending"
    running = "running"
    completed = "completed"
    failed = "failed"
    cancelled = "cancelled"


class CrawlTask(Base, TimestampMixin):
    __tablename__ = "crawl_tasks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    source_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("sources.id"), nullable=False
    )
    task_type: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(
        Enum(CrawlTaskStatus), default=CrawlTaskStatus.pending, nullable=False
    )
    started_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    records_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    source = relationship("Source", back_populates="crawl_tasks", lazy="joined")
