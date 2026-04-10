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
    temperature: float = 0.1
    max_tokens: int = 2000
    schedule_interval: int = 3600
    batch_size: int = 10

    @property
    def raw_records_url(self) -> str:
        return f"{self.api_base_url}/raw-records/"

    @property
    def facts_url(self) -> str:
        return f"{self.api_base_url}/facts/"


settings = Settings()