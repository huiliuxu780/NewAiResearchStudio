from datetime import datetime

from .common import BaseSchema
from .enums import Company, CrawlStrategy, Priority, SocialPlatform, SourceType

# CrawlConfig 类型定义
CrawlConfig = dict


class SourceBase(BaseSchema):
    name: str
    company: Company
    source_type: SourceType
    url: str
    enabled: bool = True
    schedule: str | None = None
    parser_type: str | None = None
    priority: Priority = Priority.MEDIUM
    notes: str | None = None
    # 采集策略相关字段
    crawl_strategy: CrawlStrategy = CrawlStrategy.SINGLE_PAGE
    crawl_config: CrawlConfig = {}
    social_platform: SocialPlatform | None = None
    social_account_id: str | None = None


class SourceCreate(SourceBase):
    pass


class SourceUpdate(BaseSchema):
    name: str | None = None
    company: Company | None = None
    source_type: SourceType | None = None
    url: str | None = None
    enabled: bool | None = None
    schedule: str | None = None
    parser_type: str | None = None
    priority: Priority | None = None
    notes: str | None = None
    # 采集策略相关字段
    crawl_strategy: CrawlStrategy | None = None
    crawl_config: CrawlConfig | None = None
    social_platform: SocialPlatform | None = None
    social_account_id: str | None = None


class SourceResponse(SourceBase):
    id: str
    created_at: datetime
    updated_at: datetime


class SourceFilter(BaseSchema):
    company: Company | None = None
    source_type: SourceType | None = None
    enabled: bool | None = None
    priority: Priority | None = None
    crawl_strategy: CrawlStrategy | None = None
    social_platform: SocialPlatform | None = None