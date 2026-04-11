from datetime import datetime

from pydantic import Field

from .common import BaseSchema
from .enums import CrawlTaskStatus


class CrawlTaskBase(BaseSchema):
    source_id: str
    task_type: str
    status: CrawlTaskStatus = CrawlTaskStatus.PENDING
    started_at: datetime | None = None
    completed_at: datetime | None = None
    records_count: int = 0
    error_message: str | None = None


class CrawlTaskCreate(BaseSchema):
    source_id: str
    task_type: str = "manual"


class CrawlTaskResponse(CrawlTaskBase):
    id: str
    created_at: datetime
    updated_at: datetime


class CrawlTaskListResponse(BaseSchema):
    items: list[CrawlTaskResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class CrawlTaskFilter(BaseSchema):
    status: CrawlTaskStatus | None = None
    source_id: str | None = None
    task_type: str | None = None
    started_after: datetime | None = None
    started_before: datetime | None = None


class CrawlTaskStats(BaseSchema):
    total: int
    pending: int
    running: int
    completed: int
    failed: int
    cancelled: int
    total_records: int


class CrawlTaskStatusUpdate(BaseSchema):
    status: CrawlTaskStatus
    records_count: int | None = None
    error_message: str | None = None
