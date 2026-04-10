from datetime import datetime

from .common import BaseSchema


class SourceBase(BaseSchema):
    name: str
    company: str
    source_type: str
    url: str
    enabled: bool = True
    schedule: str | None = None
    parser_type: str | None = None
    priority: str = "medium"
    notes: str | None = None


class SourceCreate(SourceBase):
    pass


class SourceUpdate(BaseSchema):
    name: str | None = None
    company: str | None = None
    source_type: str | None = None
    url: str | None = None
    enabled: bool | None = None
    schedule: str | None = None
    parser_type: str | None = None
    priority: str | None = None
    notes: str | None = None


class SourceResponse(SourceBase):
    id: str
    created_at: datetime
    updated_at: datetime


class SourceFilter(BaseSchema):
    company: str | None = None
    source_type: str | None = None
    enabled: bool | None = None
    priority: str | None = None