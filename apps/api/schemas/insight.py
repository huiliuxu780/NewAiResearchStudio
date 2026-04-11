from datetime import datetime

from .common import BaseSchema
from .enums import Company, Confidence, InsightType


class InsightBase(BaseSchema):
    fact_id: str
    company: Company
    insight_content: str
    insight_type: InsightType
    impact_level: str
    confidence: Confidence
    reasoning_brief: str | None = None
    action_suggestion: str | None = None


class InsightCreate(InsightBase):
    pass


class InsightUpdate(BaseSchema):
    insight_content: str | None = None
    insight_type: InsightType | None = None
    impact_level: str | None = None
    confidence: Confidence | None = None
    reasoning_brief: str | None = None
    action_suggestion: str | None = None


class InsightResponse(InsightBase):
    id: str
    created_at: datetime
    updated_at: datetime


class InsightFilter(BaseSchema):
    company: Company | None = None
    fact_id: str | None = None
    insight_type: InsightType | None = None
    impact_level: str | None = None
    confidence: Confidence | None = None