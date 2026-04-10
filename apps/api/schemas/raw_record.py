from datetime import datetime

from .common import BaseSchema


class RawRecordBase(BaseSchema):
    source_id: str
    company: str
    title: str
    url: str
    published_at: datetime | None = None
    raw_content: str | None = None
    raw_html_snapshot: str | None = None
    content_hash: str | None = None
    language: str | None = None


class RawRecordCreate(RawRecordBase):
    pass


class RawRecordResponse(RawRecordBase):
    id: str
    crawled_at: datetime
    crawl_status: str
    dedupe_status: str
    error_message: str | None = None


class RawRecordFilter(BaseSchema):
    source_id: str | None = None
    company: str | None = None
    crawl_status: str | None = None
    dedupe_status: str | None = None
    language: str | None = None


class RawRecordStatusUpdate(BaseSchema):
    crawl_status: str | None = None
    dedupe_status: str | None = None
    error_message: str | None = None