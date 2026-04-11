"""Push task model."""

from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base, TimestampMixin, generate_uuid


class PushTask(Base, TimestampMixin):
    """推送任务表 - 定义推送规则（定时/事件触发/手动）。"""

    __tablename__ = "push_tasks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(200), nullable=False, comment="任务名称")
    description: Mapped[str | None] = mapped_column(Text, nullable=True, comment="任务描述")

    # 触发方式: scheduled, event_triggered, manual
    trigger_type: Mapped[str] = mapped_column(
        String(30), nullable=False, index=True, comment="触发方式"
    )

    # 定时任务配置 (cron 表达式或 interval)
    cron_expression: Mapped[str | None] = mapped_column(
        String(100), nullable=True, comment="Cron 表达式"
    )
    schedule_config: Mapped[dict | None] = mapped_column(
        JSON, nullable=True, comment="调度配置(JSON)"
    )

    # 关联的渠道 ID 列表
    channel_ids: Mapped[list] = mapped_column(JSON, nullable=False, comment="目标渠道ID列表")

    # 关联的模板 ID
    template_id: Mapped[str | None] = mapped_column(
        String(36), nullable=True, comment="推送模板ID"
    )

    # 任务状态
    is_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, comment="是否启用")
    status: Mapped[str] = mapped_column(
        String(20), default="pending", nullable=False, index=True,
        comment="任务状态: pending, running, completed, failed, disabled"
    )

    # 重试配置
    max_retries: Mapped[int] = mapped_column(Integer, default=3, nullable=False, comment="最大重试次数")
    retry_interval: Mapped[int] = mapped_column(
        Integer, default=60, nullable=False, comment="重试间隔(秒)"
    )

    # 事件触发配置
    event_type: Mapped[str | None] = mapped_column(
        String(50), nullable=True, comment="触发事件类型"
    )
    event_filters: Mapped[dict | None] = mapped_column(
        JSON, nullable=True, comment="事件过滤条件"
    )

    # 推送内容配置
    content_config: Mapped[dict] = mapped_column(
        JSON, nullable=False, default=dict, comment="推送内容配置"
    )

    # 执行统计
    total_executions: Mapped[int] = mapped_column(Integer, default=0, nullable=False, comment="总执行次数")
    success_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False, comment="成功次数")
    failure_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False, comment="失败次数")
    last_executed_at: Mapped[datetime | None] = mapped_column(
        DateTime, nullable=True, comment="最后执行时间"
    )
    next_scheduled_at: Mapped[datetime | None] = mapped_column(
        DateTime, nullable=True, comment="下次计划执行时间"
    )

    # 失败告警配置
    alert_on_failure: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, comment="失败时告警")
    alert_channel_id: Mapped[str | None] = mapped_column(
        String(36), nullable=True, comment="告警渠道ID"
    )

    def __repr__(self) -> str:
        return f"<PushTask(id={self.id}, name={self.name}, trigger={self.trigger_type})>"
