from datetime import datetime

from pydantic import Field

from .common import BaseSchema, PaginatedResponse, PaginationParams


class AILogBase(BaseSchema):
    task_type: str
    model_name: str
    input_prompt: str | None = None
    output_result: str | None = None
    input_tokens: int = 0
    output_tokens: int = 0
    cost_ms: int = 0
    status: str = "success"
    error_message: str | None = None
    source_entity_id: str | None = None


class AILogCreate(AILogBase):
    pass


class AILogResponse(AILogBase):
    id: str
    created_at: datetime


class AILogFilter(PaginationParams):
    task_type: str | None = None
    model_name: str | None = None
    status: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None


class AILogListResponse(PaginatedResponse[AILogResponse]):
    pass
