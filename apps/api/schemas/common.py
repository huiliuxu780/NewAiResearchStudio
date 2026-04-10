from datetime import datetime
from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class PaginationParams(BaseModel):
    page: int = 1
    page_size: int = 20

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size


class PaginatedResponse(BaseSchema, Generic[T]):
    items: list[T]
    total: int
    page: int
    page_size: int
    total_pages: int


class SuccessResponse(BaseSchema):
    success: bool = True
    message: str = "Operation completed successfully"


class ErrorResponse(BaseSchema):
    success: bool = False
    error: str
    detail: str | None = None


class HealthResponse(BaseSchema):
    status: str
    timestamp: datetime
    database: str