from crawler import CrawlerService, CrawlResult
from search_client import (
    BaseSearchClient,
    BingSearchClient,
    GoogleCustomSearchClient,
    SearchResult,
    create_search_client,
)
from social_client import (
    BaseSocialClient,
    SocialPost,
    TwitterClient,
    WeiboClient,
    WeChatClient,
    create_social_client,
)
from tasks import CrawlTask, Source, RawRecord, APIClient
from utils import extract_links_from_html, normalize_url, deduplicate_urls

__all__ = [
    "CrawlerService",
    "CrawlResult",
    "CrawlTask",
    "Source",
    "RawRecord",
    "APIClient",
    "extract_links_from_html",
    "normalize_url",
    "deduplicate_urls",
    # Search client
    "BaseSearchClient",
    "GoogleCustomSearchClient",
    "BingSearchClient",
    "SearchResult",
    "create_search_client",
    # Social media client
    "BaseSocialClient",
    "SocialPost",
    "TwitterClient",
    "WeiboClient",
    "WeChatClient",
    "create_social_client",
]
