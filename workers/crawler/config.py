from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    api_base_url: str = "http://localhost:8000"
    crawl_timeout: int = 60
    max_concurrent: int = 5
    user_agent: str = (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    )
    schedule_interval: int = 3600
    retry_count: int = 3
    retry_delay: int = 5

    # 搜索引擎 API 配置
    google_api_key: str = ""
    google_cx: str = ""  # Google Custom Search Engine ID
    bing_api_key: str = ""
    default_search_engine: str = "google"  # google 或 bing
    default_max_search_results: int = 20

    # 社交媒体抓取配置
    social_max_posts: int = 20  # 默认每个账号抓取的最大帖子数
    social_crawl_timeout: int = 90  # 社交媒体抓取超时时间（秒），通常更长
    social_retry_count: int = 3  # 社交媒体抓取重试次数
    social_request_delay: float = 2.0  # 请求间隔延迟（秒），避免被封禁

    # API Key 认证
    api_key: str = ""

    @property
    def api_headers(self) -> dict[str, str]:
        """获取 API 请求头，包含认证信息"""
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["X-API-Key"] = self.api_key
        return headers

    @property
    def sources_url(self) -> str:
        return f"{self.api_base_url}/api/v1/sources/"

    @property
    def raw_records_url(self) -> str:
        return f"{self.api_base_url}/api/v1/raw-records/"

    @property
    def crawl_tasks_url(self) -> str:
        return f"{self.api_base_url}/api/v1/crawl-tasks/"


settings = Settings()