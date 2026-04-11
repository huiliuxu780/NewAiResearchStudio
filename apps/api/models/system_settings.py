import enum

from sqlalchemy import Enum, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base, TimestampMixin


class SettingCategory(str, enum.Enum):
    company = "company"
    ai_defaults = "ai_defaults"
    notifications = "notifications"
    system = "system"


class SystemSettings(Base, TimestampMixin):
    __tablename__ = "system_settings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    key: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    value: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[SettingCategory] = mapped_column(
        Enum(SettingCategory), nullable=False, index=True
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
