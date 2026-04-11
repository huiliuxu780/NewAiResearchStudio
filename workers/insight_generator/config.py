from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    qwen_api_key: str = ""
    qwen_model: str = "qwen-plus"
    api_base_url: str = "http://localhost:8000"
    temperature: float = 0.7
    max_tokens: int = 1000
    schedule_interval: int = 3600
    batch_size: int = 10

    # API Key 认证
    api_key: str = ""

    # Qwen API 重试配置
    qwen_max_retries: int = 3
    qwen_rate_limit_rps: float = 2.0

    @property
    def api_headers(self) -> dict[str, str]:
        """获取 API 请求头，包含认证信息"""
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["X-API-Key"] = self.api_key
        return headers

    @property
    def facts_url(self) -> str:
        return f"{self.api_base_url}/api/v1/facts/"

    @property
    def insights_url(self) -> str:
        return f"{self.api_base_url}/api/v1/insights/"


settings = Settings()