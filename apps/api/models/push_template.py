"""Push template model."""

from sqlalchemy import Boolean, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base, TimestampMixin, generate_uuid


class PushTemplate(Base, TimestampMixin):
    """推送模板表 - 存储不同渠道的内容模板。"""

    __tablename__ = "push_templates"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(200), nullable=False, comment="模板名称")
    description: Mapped[str | None] = mapped_column(Text, nullable=True, comment="模板描述")

    # 模板适用的渠道类型列表
    channel_types: Mapped[list] = mapped_column(
        JSON, nullable=False, comment="适用的渠道类型列表"
    )

    # 模板内容 (Jinja2 模板语法)
    title_template: Mapped[str] = mapped_column(
        String(500), nullable=False, comment="标题模板"
    )
    content_template: Mapped[str] = mapped_column(Text, nullable=False, comment="内容模板")

    # 内容格式: text, html, markdown, rich_text
    content_format: Mapped[str] = mapped_column(
        String(20), default="text", nullable=False, comment="内容格式"
    )

    # 模板变量定义
    variables: Mapped[dict] = mapped_column(
        JSON, nullable=False, default=dict, comment="模板变量定义"
    )

    # 默认值配置
    default_values: Mapped[dict] = mapped_column(
        JSON, nullable=False, default=dict, comment="变量默认值"
    )

    is_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, comment="是否启用")
    is_system: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False, comment="是否系统内置模板"
    )

    def __repr__(self) -> str:
        return f"<PushTemplate(id={self.id}, name={self.name})>"
