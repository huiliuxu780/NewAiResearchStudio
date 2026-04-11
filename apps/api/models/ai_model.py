from sqlalchemy import Boolean, Float, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base, TimestampMixin, generate_uuid


class AIModel(Base, TimestampMixin):
    __tablename__ = "ai_models"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    provider: Mapped[str] = mapped_column(String(50), nullable=False)
    model_name: Mapped[str] = mapped_column(String(100), nullable=False)
    api_key: Mapped[str] = mapped_column(String(500), nullable=False)
    api_base_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    temperature: Mapped[float] = mapped_column(Float, default=0.1, nullable=False)
    max_tokens: Mapped[int] = mapped_column(Integer, default=2000, nullable=False)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    task_types: Mapped[list] = mapped_column(JSON, default=lambda: ["fact_extraction", "insight_generation"], nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
