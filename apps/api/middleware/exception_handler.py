"""全局异常处理中间件"""

from typing import Any

from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from config import settings
from utils.logging import get_logger

logger = get_logger(__name__)


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """请求验证错误处理 - 422"""
    logger.warning(
        "Validation error",
        path=request.url.path,
        errors=exc.errors(),
    )
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": "Validation error",
            "detail": str(exc.errors()),
        },
    )


async def pydantic_validation_exception_handler(
    request: Request, exc: ValidationError
) -> JSONResponse:
    """Pydantic 验证错误处理 - 422"""
    logger.warning(
        "Pydantic validation error",
        path=request.url.path,
        errors=exc.errors(),
    )
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": "Validation error",
            "detail": str(exc.errors()),
        },
    )


async def sqlalchemy_exception_handler(
    request: Request, exc: SQLAlchemyError
) -> JSONResponse:
    """数据库错误处理 - 500 或 409"""
    logger.exception(
        "Database error",
        path=request.url.path,
        error=str(exc),
    )

    if isinstance(exc, IntegrityError):
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={
                "success": False,
                "error": "Data integrity error",
                "detail": "A record with this data already exists or violates a constraint.",
            },
        )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": "Database error",
            "detail": None,
        },
    )


async def http_exception_handler(
    request: Request, exc: Exception
) -> JSONResponse:
    """HTTP 异常处理 - 保留 FastAPI HTTPException 的行为"""
    from fastapi import HTTPException

    if not isinstance(exc, HTTPException):
        raise exc

    logger.warning(
        "HTTP error",
        status_code=exc.status_code,
        path=request.url.path,
        detail=exc.detail,
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "detail": None,
        },
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """通用异常处理 - 500

    生产环境不暴露堆栈信息，开发环境暴露详细错误信息用于调试。
    """
    logger.exception(
        "Unhandled exception",
        path=request.url.path,
        error=str(exc),
    )

    detail = None
    if settings.is_development:
        detail = str(exc)

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": "Internal server error",
            "detail": detail,
        },
    )
