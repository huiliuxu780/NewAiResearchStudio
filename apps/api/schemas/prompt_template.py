from datetime import datetime

from .common import BaseSchema, PaginatedResponse, PaginationParams


class PromptTemplateBase(BaseSchema):
    name: str
    category: str
    task_type: str
    template: str
    variables: list[str] = []
    version: int = 1
    is_active: bool = True
    description: str | None = None
    notes: str | None = None


class PromptTemplateCreate(PromptTemplateBase):
    pass


class PromptTemplateUpdate(BaseSchema):
    name: str | None = None
    category: str | None = None
    task_type: str | None = None
    template: str | None = None
    variables: list[str] | None = None
    is_active: bool | None = None
    description: str | None = None
    notes: str | None = None


class PromptTemplateResponse(BaseSchema):
    id: str
    name: str
    category: str
    task_type: str
    template: str
    variables: list[str]
    version: int
    is_active: bool
    description: str | None = None
    notes: str | None = None
    created_at: datetime
    updated_at: datetime


class PromptTemplateListResponse(PaginatedResponse[PromptTemplateResponse]):
    pass
