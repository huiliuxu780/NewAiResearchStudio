from datetime import datetime

from .common import BaseSchema
from .enums import Company, CrawlStatus, DedupeStatus


class RawRecordBase(BaseSchema):
    source_id: str
    company: Company
    title: str
    url: str
    published_at: datetime | None = None
    raw_content: str | None = None
    raw_html_snapshot: str | None = None
    content_hash: str | None = None
    language: str | None = None


class RawRecordCreate(RawRecordBase):
    crawl_status: CrawlStatus = CrawlStatus.SUCCESS
    dedupe_status: DedupeStatus = DedupeStatus.NEW


class RawRecordResponse(RawRecordBase):
    id: str
    crawled_at: datetime
    crawl_status: CrawlStatus
    dedupe_status: DedupeStatus
    error_message: str | None = None


class RawRecordFilter(BaseSchema):
    source_id: str | None = None
    company: Company | None = None
    crawl_status: CrawlStatus | None = None
    dedupe_status: DedupeStatus | None = None
    language: str | None = None


class RawRecordStatusUpdate(BaseSchema):
    crawl_status: CrawlStatus | None = None
    dedupe_status: DedupeStatus | None = None
    error_message: str | None = None