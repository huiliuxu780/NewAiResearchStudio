from datetime import datetime
from typing import Any

from .common import BaseSchema, PaginatedResponse, PaginationParams


class AIModelBase(BaseSchema):
    name: str
    provider: str
    model_name: str
    api_key: str
    api_base_url: str | None = None
    temperature: float = 0.1
    max_tokens: int = 2000
    enabled: bool = True
    is_default: bool = False
    task_types: list[str] = ["fact_extraction", "insight_generation"]
    notes: str | None = None


class AIModelCreate(AIModelBase):
    pass


class AIModelUpdate(BaseSchema):
    name: str | None = None
    provider: str | None = None
    model_name: str | None = None
    api_key: str | None = None
    api_base_url: str | None = None
    temperature: float | None = None
    max_tokens: int | None = None
    enabled: bool | None = None
    is_default: bool | None = None
    task_types: list[str] | None = None
    notes: str | None = None


class AIModelResponse(BaseSchema):
    id: str
    name: str
    provider: str
    model_name: str
    api_base_url: str | None = None
    temperature: float
    max_tokens: int
    enabled: bool
    is_default: bool
    task_types: list[str]
    notes: str | None = None
    created_at: datetime
    updated_at: datetime


class AIModelListResponse(PaginatedResponse[AIModelResponse]):
    pass
