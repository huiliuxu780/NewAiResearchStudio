"""统一枚举定义

所有 Schema 中使用的枚举类型集中定义在此模块。
每个枚举继承 str + Enum，确保序列化时输出字符串值，与现有 API 响应格式完全兼容。
"""

from enum import Enum


class Company(str, Enum):
    """公司枚举"""

    ALIBABA = "alibaba"
    BYTE_DANCE = "byte_dance"
    TENCENT = "tencent"


class TopicLevel1(str, Enum):
    """一级主题分类"""

    PRODUCT_TECH = "产品技术"
    BUSINESS_MODEL = "商业模式"
    MARKET_COMPETITION = "市场竞争"
    ORGANIZATION_MANAGEMENT = "组织管理"
    FINANCIAL_PERFORMANCE = "财务表现"
    LEGAL_COMPLIANCE = "法律合规"
    OTHER = "其他"


class ImportanceLevel(str, Enum):
    """重要性级别"""

    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class Confidence(str, Enum):
    """置信度"""

    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class ReviewStatus(str, Enum):
    """事实复核状态"""

    PENDING = "pending"
    CONFIRMED = "confirmed"
    REJECTED = "rejected"
    INSIGHT_GENERATED = "insight_generated"


class EventType(str, Enum):
    """事件类型"""

    RELEASE = "release"
    UPDATE = "update"
    UPGRADE = "upgrade"
    PRICE_CUT = "price_cut"
    OPEN_SOURCE = "open_source"
    INTEGRATION = "integration"
    PARTNERSHIP = "partnership"
    STRATEGIC = "strategic"
    ORGANIZATIONAL = "organizational"
    INTERNATIONAL = "international"
    DOC_UPDATE = "doc_update"


class EntityType(str, Enum):
    """实体类型"""

    MODEL = "model"
    PRODUCT = "product"
    PLATFORM = "platform"
    API = "api"
    SDK = "sdk"
    AGENT = "agent"
    ORGANIZATION = "organization"
    STRATEGY = "strategy"
    PRICING = "pricing"


class SourceType(str, Enum):
    """信息源类型"""

    OFFICIAL_DOC = "official_doc"
    OFFICIAL_BLOG = "official_blog"
    PRODUCT_SITE = "product_site"
    CHANGELOG = "changelog"
    GITHUB = "github"
    MEDIA = "media"
    APP_PAGE = "app_page"
    OPEN_PLATFORM = "open_platform"


class CrawlStrategy(str, Enum):
    """采集策略"""

    SINGLE_PAGE = "single_page"
    MULTI_PAGE = "multi_page"
    SEARCH_KEYWORD = "search_keyword"
    SOCIAL_MEDIA = "social_media"


class SocialPlatform(str, Enum):
    """社交平台"""

    TWITTER = "twitter"
    WEIBO = "weibo"
    WECHAT = "wechat"
    OTHER = "other"


class CrawlStatus(str, Enum):
    """采集状态"""

    PENDING = "pending"
    CRAWLING = "crawling"
    SUCCESS = "success"
    FAILED = "failed"
    PARSE_ERROR = "parse_error"


class DedupeStatus(str, Enum):
    """去重状态"""

    NEW = "new"
    DUPLICATE = "duplicate"
    PENDING = "pending"


class InsightType(str, Enum):
    """研究结论类型"""

    TREND = "trend"
    COMPETITOR = "competitor"
    OPPORTUNITY = "opportunity"
    RISK = "risk"
    SUGGESTION = "suggestion"


class CapabilityLevel(str, Enum):
    """能力等级"""

    L1 = "l1"
    L2 = "l2"
    L3 = "l3"
    L4 = "l4"
    L5 = "l5"
    L6 = "l6"


class Priority(str, Enum):
    """优先级"""

    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class CrawlTaskStatus(str, Enum):
    """采集任务状态"""

    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
