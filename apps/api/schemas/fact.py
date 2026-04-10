from datetime import datetime

from .common import BaseSchema


class FactBase(BaseSchema):
    raw_record_id: str
    company: str
    fact_summary: str
    topic_level_1: str
    topic_level_2: str | None = None
    event_type: str
    entity_type: str
    entity_name: str
    importance_level: str
    capability_level: str | None = None
    confidence: str
    published_at: datetime | None = None
    source_url: str
    needs_review: bool = False


class FactCreate(FactBase):
    pass


class FactUpdate(BaseSchema):
    fact_summary: str | None = None
    topic_level_1: str | None = None
    topic_level_2: str | None = None
    event_type: str | None = None
    entity_type: str | None = None
    entity_name: str | None = None
    importance_level: str | None = None
    capability_level: str | None = None
    confidence: str | None = None
    needs_review: bool | None = None


class ReviewUpdate(BaseSchema):
    review_status: str
    needs_review: bool | None = None


class FactResponse(FactBase):
    id: str
    review_status: str
    created_at: datetime
    updated_at: datetime


class FactFilter(BaseSchema):
    company: str | None = None
    topic_level_1: str | None = None
    event_type: str | None = None
    entity_type: str | None = None
    importance_level: str | None = None
    confidence: str | None = None
    needs_review: bool | None = None
    review_status: str | None = None