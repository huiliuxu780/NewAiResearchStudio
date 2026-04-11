from sqlalchemy import Boolean, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base, TimestampMixin, generate_uuid


class PromptTemplate(Base, TimestampMixin):
    __tablename__ = "prompt_templates"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    task_type: Mapped[str] = mapped_column(String(50), nullable=False)
    template: Mapped[str] = mapped_column(Text, nullable=False)
    variables: Mapped[list] = mapped_column(JSON, default=lambda: [], nullable=False)
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
