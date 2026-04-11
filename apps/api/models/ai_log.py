from sqlalchemy import BigInteger, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base, TimestampMixin, generate_uuid


class AILog(Base, TimestampMixin):
    __tablename__ = "ai_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    task_type: Mapped[str] = mapped_column(String(50), nullable=False)
    model_name: Mapped[str] = mapped_column(String(100), nullable=False)
    input_prompt: Mapped[str | None] = mapped_column(Text, nullable=True)
    output_result: Mapped[str | None] = mapped_column(Text, nullable=True)
    input_tokens: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    output_tokens: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    cost_ms: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="success", nullable=False)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_entity_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
