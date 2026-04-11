"""Pydantic schemas for push module."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

from .common import BaseSchema, PaginatedResponse


# ============================================================
# Push Channel Schemas
# ============================================================

class PushChannelCreate(BaseSchema):
    name: str = Field(..., min_length=1, max_length=100, description="渠道名称")
    channel_type: str = Field(
        ..., description="渠道类型: feishu, email, dingtalk, wechat_work, slack"
    )
    config: dict[str, Any] = Field(..., description="渠道配置(JSON)")
    description: str | None = Field(None, description="渠道描述")


class PushChannelUpdate(BaseSchema):
    name: str | None = Field(None, min_length=1, max_length=100, description="渠道名称")
    is_enabled: bool | None = Field(None, description="是否启用")
    config: dict[str, Any] | None = Field(None, description="渠道配置(JSON)")
    description: str | None = Field(None, description="渠道描述")


class PushChannelResponse(BaseSchema):
    id: str
    name: str
    channel_type: str
    is_enabled: bool
    config: dict[str, Any]
    description: str | None
    created_at: datetime
    updated_at: datetime


class PushChannelListResponse(PaginatedResponse[PushChannelResponse]):
    pass


# ============================================================
# Push Task Schemas
# ============================================================

class PushTaskCreate(BaseSchema):
    name: str = Field(..., min_length=1, max_length=200, description="任务名称")
    description: str | None = Field(None, description="任务描述")
    trigger_type: str = Field(
        ..., description="触发方式: scheduled, event_triggered, manual"
    )
    cron_expression: str | None = Field(None, max_length=100, description="Cron 表达式")
    schedule_config: dict[str, Any] | None = Field(None, description="调度配置")
    channel_ids: list[str] = Field(..., min_length=1, description="目标渠道ID列表")
    template_id: str | None = Field(None, description="推送模板ID")
    max_retries: int = Field(3, ge=0, le=10, description="最大重试次数")
    retry_interval: int = Field(60, ge=10, description="重试间隔(秒)")
    event_type: str | None = Field(None, max_length=50, description="触发事件类型")
    event_filters: dict[str, Any] | None = Field(None, description="事件过滤条件")
    content_config: dict[str, Any] = Field(default_factory=dict, description="推送内容配置")
    alert_on_failure: bool = Field(True, description="失败时告警")
    alert_channel_id: str | None = Field(None, description="告警渠道ID")


class PushTaskUpdate(BaseSchema):
    name: str | None = Field(None, min_length=1, max_length=200, description="任务名称")
    description: str | None = Field(None, description="任务描述")
    cron_expression: str | None = Field(None, max_length=100, description="Cron 表达式")
    schedule_config: dict[str, Any] | None = Field(None, description="调度配置")
    channel_ids: list[str] | None = Field(None, description="目标渠道ID列表")
    template_id: str | None = Field(None, description="推送模板ID")
    max_retries: int | None = Field(None, ge=0, le=10, description="最大重试次数")
    retry_interval: int | None = Field(None, ge=10, description="重试间隔(秒)")
    event_filters: dict[str, Any] | None = Field(None, description="事件过滤条件")
    content_config: dict[str, Any] | None = Field(None, description="推送内容配置")
    alert_on_failure: bool | None = Field(None, description="失败时告警")
    alert_channel_id: str | None = Field(None, description="告警渠道ID")


class PushTaskResponse(BaseSchema):
    id: str
    name: str
    description: str | None
    trigger_type: str
    cron_expression: str | None
    schedule_config: dict[str, Any] | None
    channel_ids: list[str]
    template_id: str | None
    is_enabled: bool
    status: str
    max_retries: int
    retry_interval: int
    event_type: str | None
    event_filters: dict[str, Any] | None
    content_config: dict[str, Any]
    total_executions: int
    success_count: int
    failure_count: int
    last_executed_at: datetime | None
    next_scheduled_at: datetime | None
    alert_on_failure: bool
    alert_channel_id: str | None
    created_at: datetime
    updated_at: datetime


class PushTaskListResponse(PaginatedResponse[PushTaskResponse]):
    pass


class PushTaskTriggerRequest(BaseSchema):
    """手动触发推送任务的请求体。"""
    channel_ids: list[str] | None = Field(None, description="指定渠道ID列表(为空则使用任务配置)")
    template_variables: dict[str, Any] = Field(
        default_factory=dict, description="模板变量"
    )


# ============================================================
# Push Record Schemas
# ============================================================

class PushRecordResponse(BaseSchema):
    id: str
    task_id: str
    channel_id: str
    channel_type: str
    status: str
    retry_count: int
    max_retries: int
    next_retry_at: datetime | None
    title: str
    content: str
    content_format: str
    recipients: list[str]
    response_data: dict[str, Any] | None
    error_message: str | None
    error_code: str | None
    started_at: datetime | None
    completed_at: datetime | None
    duration_ms: float | None
    created_at: datetime
    updated_at: datetime


class PushRecordListResponse(PaginatedResponse[PushRecordResponse]):
    pass


class PushRecordRetryRequest(BaseSchema):
    """重试推送请求。"""
    max_retries: int | None = Field(None, ge=0, le=10, description="最大重试次数")


# ============================================================
# Push Template Schemas
# ============================================================

class PushTemplateCreate(BaseSchema):
    name: str = Field(..., min_length=1, max_length=200, description="模板名称")
    description: str | None = Field(None, description="模板描述")
    channel_types: list[str] = Field(..., min_length=1, description="适用的渠道类型列表")
    title_template: str = Field(..., min_length=1, max_length=500, description="标题模板")
    content_template: str = Field(..., min_length=1, description="内容模板")
    content_format: str = Field("text", description="内容格式: text, html, markdown, rich_text")
    variables: dict[str, Any] = Field(default_factory=dict, description="模板变量定义")
    default_values: dict[str, Any] = Field(default_factory=dict, description="变量默认值")


class PushTemplateUpdate(BaseSchema):
    name: str | None = Field(None, min_length=1, max_length=200, description="模板名称")
    description: str | None = Field(None, description="模板描述")
    channel_types: list[str] | None = Field(None, description="适用的渠道类型列表")
    title_template: str | None = Field(None, min_length=1, max_length=500, description="标题模板")
    content_template: str | None = Field(None, min_length=1, description="内容模板")
    content_format: str | None = Field(None, description="内容格式")
    variables: dict[str, Any] | None = Field(None, description="模板变量定义")
    default_values: dict[str, Any] | None = Field(None, description="变量默认值")
    is_enabled: bool | None = Field(None, description="是否启用")


class PushTemplateResponse(BaseSchema):
    id: str
    name: str
    description: str | None
    channel_types: list[str]
    title_template: str
    content_template: str
    content_format: str
    variables: dict[str, Any]
    default_values: dict[str, Any]
    is_enabled: bool
    is_system: bool
    created_at: datetime
    updated_at: datetime


class PushTemplateListResponse(PaginatedResponse[PushTemplateResponse]):
    pass


class PushTemplatePreviewRequest(BaseSchema):
    """模板预览请求。"""
    variables: dict[str, Any] = Field(..., description="模板变量值")


class PushTemplatePreviewResponse(BaseSchema):
    """模板预览响应。"""
    rendered_title: str
    rendered_content: str
    content_format: str


# ============================================================
# Push Statistics Schemas
# ============================================================

class PushStatsSummary(BaseSchema):
    """推送统计摘要。"""
    total_tasks: int
    enabled_tasks: int
    total_records: int
    success_count: int
    failed_count: int
    pending_count: int
    retrying_count: int
    success_rate: float  # percentage
    avg_duration_ms: float | None


class PushStatsByChannel(BaseSchema):
    """按渠道统计。"""
    channel_type: str
    channel_name: str
    total_count: int
    success_count: int
    failed_count: int
    success_rate: float


class PushStatsByTask(BaseSchema):
    """按任务统计。"""
    task_id: str
    task_name: str
    total_count: int
    success_count: int
    failed_count: int
    success_rate: float
    last_executed_at: datetime | None


class PushErrorDistribution(BaseSchema):
    """错误分布统计。"""
    error_code: str | None
    error_message: str | None
    count: int
    percentage: float


class PushTrendPoint(BaseSchema):
    """趋势数据点。"""
    date: str  # YYYY-MM-DD
    total_count: int
    success_count: int
    failed_count: int
    success_rate: float


class PushStatsResponse(BaseSchema):
    """完整推送统计响应。"""
    summary: PushStatsSummary
    by_channel: list[PushStatsByChannel]
    by_task: list[PushStatsByTask]
    error_distribution: list[PushErrorDistribution]
    trend: list[PushTrendPoint]
