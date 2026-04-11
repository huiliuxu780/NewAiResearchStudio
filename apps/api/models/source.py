from sqlalchemy import Boolean, Index, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin, generate_uuid


class Source(Base, TimestampMixin):
    __tablename__ = "sources"
    __table_args__ = (
        Index("ix_sources_company", "company"),
        Index("ix_sources_enabled", "enabled"),
        Index("ix_sources_source_type", "source_type"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    company: Mapped[str] = mapped_column(String(50), nullable=False)
    source_type: Mapped[str] = mapped_column(String(50), nullable=False)
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    schedule: Mapped[str | None] = mapped_column(String(100), nullable=True)
    parser_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    priority: Mapped[str] = mapped_column(String(20), default="medium", nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # 采集策略相关字段
    crawl_strategy: Mapped[str] = mapped_column(
        String(50), default="single_page", nullable=False
    )
    crawl_config: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    social_platform: Mapped[str | None] = mapped_column(String(50), nullable=True)
    social_account_id: Mapped[str | None] = mapped_column(String(200), nullable=True)

    raw_records = relationship("RawRecord", back_populates="source", lazy="dynamic")
    crawl_tasks = relationship("CrawlTask", back_populates="source", lazy="dynamic")