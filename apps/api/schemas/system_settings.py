from datetime import datetime

from pydantic import BaseModel

from .common import BaseSchema


class SystemSettingsResponse(BaseSchema):
    id: str
    key: str
    value: str
    category: str
    description: str | None = None
    updated_at: datetime


class SystemSettingsUpdate(BaseSchema):
    value: str
    description: str | None = None


class SystemSettingsByCategory(BaseModel):
    category: str
    settings: list[SystemSettingsResponse]
