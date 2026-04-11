from datetime import date, datetime

from .common import BaseSchema, PaginatedResponse


class WeeklyReportCreate(BaseSchema):
    company: str
    start_date: date
    end_date: date


class WeeklyReportResponse(BaseSchema):
    id: str
    title: str
    company: str
    start_date: date
    end_date: date
    content: dict
    status: str
    created_at: datetime
    updated_at: datetime


class WeeklyReportListResponse(PaginatedResponse[WeeklyReportResponse]):
    pass
