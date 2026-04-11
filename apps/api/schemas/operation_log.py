from datetime import datetime
from typing import Any

from pydantic import Field

from .common import BaseSchema, PaginatedResponse, PaginationParams


class OperationLogBase(BaseSchema):
    user_id: str = "admin"
    action: str
    entity_type: str
    entity_id: str
    old_value: dict[str, Any] | None = None
    new_value: dict[str, Any] | None = None
    ip_address: str | None = None
    user_agent: str | None = None
    status: str = "success"
    error_message: str | None = None


class OperationLogCreate(OperationLogBase):
    pass


class OperationLogResponse(OperationLogBase):
    id: str
    created_at: datetime


class OperationLogFilter(PaginationParams):
    action: str | None = None
    entity_type: str | None = None
    status: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    keyword: str | None = None


class OperationLogListResponse(PaginatedResponse[OperationLogResponse]):
    pass
