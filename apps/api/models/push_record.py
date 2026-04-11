"""Push record model."""

from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base, TimestampMixin, generate_uuid


class PushRecord(Base, TimestampMixin):
    """推送记录表 - 记录每次推送的执行结果。"""

    __tablename__ = "push_records"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)

    # 关联信息
    task_id: Mapped[str] = mapped_column(
        String(36), nullable=False, index=True, comment="关联的推送任务ID"
    )
    channel_id: Mapped[str] = mapped_column(
        String(36), nullable=False, index=True, comment="推送渠道ID"
    )
    channel_type: Mapped[str] = mapped_column(
        String(30), nullable=False, index=True, comment="渠道类型快照"
    )

    # 推送状态: pending, sending, success, failed, retrying
    status: Mapped[str] = mapped_column(
        String(20), default="pending", nullable=False, index=True,
        comment="推送状态"
    )

    # 重试信息
    retry_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False, comment="已重试次数")
    max_retries: Mapped[int] = mapped_column(Integer, default=3, nullable=False, comment="最大重试次数")
    next_retry_at: Mapped[datetime | None] = mapped_column(
        DateTime, nullable=True, comment="下次重试时间"
    )

    # 推送内容
    title: Mapped[str] = mapped_column(String(500), nullable=False, comment="推送标题")
    content: Mapped[str] = mapped_column(Text, nullable=False, comment="推送内容")
    content_format: Mapped[str] = mapped_column(
        String(20), default="text", nullable=False, comment="内容格式: text, html, markdown, rich_text"
    )

    # 接收方信息
    recipients: Mapped[list] = mapped_column(JSON, nullable=False, default=list, comment="接收方列表")

    # 执行结果
    response_data: Mapped[dict | None] = mapped_column(
        JSON, nullable=True, comment="渠道返回的响应数据"
    )
    error_message: Mapped[str | None] = mapped_column(
        Text, nullable=True, comment="错误信息"
    )
    error_code: Mapped[str | None] = mapped_column(
        String(50), nullable=True, comment="错误码"
    )

    # 性能指标
    started_at: Mapped[datetime | None] = mapped_column(
        DateTime, nullable=True, comment="开始推送时间"
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime, nullable=True, comment="完成推送时间"
    )
    duration_ms: Mapped[float | None] = mapped_column(
        Float, nullable=True, comment="推送耗时(毫秒)"
    )

    def __repr__(self) -> str:
        return f"<PushRecord(id={self.id}, task={self.task_id}, status={self.status})>"
