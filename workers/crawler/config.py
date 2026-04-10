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

    @property
    def sources_url(self) -> str:
        return f"{self.api_base_url}/sources/"

    @property
    def raw_records_url(self) -> str:
        return f"{self.api_base_url}/raw-records/"


settings = Settings()