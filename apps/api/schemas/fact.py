from datetime import datetime

from .common import BaseSchema
from .enums import (
    CapabilityLevel,
    Company,
    Confidence,
    EntityType,
    EventType,
    ImportanceLevel,
    ReviewStatus,
    TopicLevel1,
)


class FactBase(BaseSchema):
    raw_record_id: str
    company: Company
    fact_summary: str
    topic_level_1: TopicLevel1
    topic_level_2: str | None = None
    event_type: EventType
    entity_type: EntityType
    entity_name: str
    importance_level: ImportanceLevel
    capability_level: CapabilityLevel | None = None
    confidence: Confidence
    published_at: datetime | None = None
    source_url: str
    needs_review: bool = False


class FactCreate(FactBase):
    pass


class FactUpdate(BaseSchema):
    fact_summary: str | None = None
    topic_level_1: TopicLevel1 | None = None
    topic_level_2: str | None = None
    event_type: EventType | None = None
    entity_type: EntityType | None = None
    entity_name: str | None = None
    importance_level: ImportanceLevel | None = None
    capability_level: CapabilityLevel | None = None
    confidence: Confidence | None = None
    needs_review: bool | None = None


class ReviewUpdate(BaseSchema):
    review_status: ReviewStatus
    needs_review: bool | None = None


class FactResponse(FactBase):
    id: str
    review_status: ReviewStatus
    created_at: datetime
    updated_at: datetime


class FactFilter(BaseSchema):
    company: Company | None = None
    topic_level_1: TopicLevel1 | None = None
    event_type: EventType | None = None
    entity_type: EntityType | None = None
    importance_level: ImportanceLevel | None = None
    confidence: Confidence | None = None
    needs_review: bool | None = None
    review_status: ReviewStatus | None = None