import json
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_env: str = "development"
    database_url: str = "sqlite+aiosqlite:///./data/research.db"
    cors_origins: str = '["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003"]'

    @property
    def cors_origins_list(self) -> list[str]:
        try:
            return json.loads(self.cors_origins)
        except json.JSONDecodeError:
            return ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003"]

    @property
    def is_development(self) -> bool:
        return self.app_env == "development"

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    # API Key 认证配置
    api_key: str = ""  # 单个 API Key（向后兼容）
    api_keys: str = ""  # 逗号分隔的多个 API Key

    def get_valid_api_keys(self) -> list[str]:
        """获取所有有效的 API Key"""
        keys: list[str] = []
        if self.api_key:
            keys.append(self.api_key)
        if self.api_keys:
            keys.extend(k.strip() for k in self.api_keys.split(",") if k.strip())
        return keys


settings = Settings()