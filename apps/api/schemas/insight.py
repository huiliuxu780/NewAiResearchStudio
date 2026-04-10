from datetime import datetime

from .common import BaseSchema


class InsightBase(BaseSchema):
    fact_id: str
    company: str
    insight_content: str
    insight_type: str
    impact_level: str
    confidence: str
    reasoning_brief: str | None = None
    action_suggestion: str | None = None


class InsightCreate(InsightBase):
    pass


class InsightUpdate(BaseSchema):
    insight_content: str | None = None
    insight_type: str | None = None
    impact_level: str | None = None
    confidence: str | None = None
    reasoning_brief: str | None = None
    action_suggestion: str | None = None


class InsightResponse(InsightBase):
    id: str
    created_at: datetime
    updated_at: datetime


class InsightFilter(BaseSchema):
    company: str | None = None
    fact_id: str | None = None
    insight_type: str | None = None
    impact_level: str | None = None
    confidence: str | None = None