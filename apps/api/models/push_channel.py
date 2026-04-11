"""Push channel configuration model."""

from sqlalchemy import Boolean, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base, TimestampMixin, generate_uuid


class PushChannel(Base, TimestampMixin):
    """推送渠道配置表 - 存储飞书、邮箱等渠道的配置信息。"""

    __tablename__ = "push_channels"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(100), nullable=False, comment="渠道名称")
    channel_type: Mapped[str] = mapped_column(
        String(30), nullable=False, index=True,
        comment="渠道类型: feishu, email, dingtalk, wechat_work, slack"
    )
    is_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, comment="是否启用")
    config: Mapped[dict] = mapped_column(JSON, nullable=False, comment="渠道配置(JSON)")
    description: Mapped[str | None] = mapped_column(Text, nullable=True, comment="渠道描述")

    def __repr__(self) -> str:
        return f"<PushChannel(id={self.id}, name={self.name}, type={self.channel_type})>"
