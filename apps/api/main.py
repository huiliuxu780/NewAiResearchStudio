import os
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError
from sqlalchemy.exc import SQLAlchemyError

from config import settings
from middleware.exception_handler import (
    generic_exception_handler,
    http_exception_handler,
    pydantic_validation_exception_handler,
    sqlalchemy_exception_handler,
    validation_exception_handler,
)
from routers import api_router
from schemas import HealthResponse
from services import init_db, async_session, SystemSettingsService
from utils.logging import setup_logging, get_logger

setup_logging(env=settings.app_env)
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting AI Research Platform API", version="0.1.0", env=settings.app_env)
    
    os.makedirs("data", exist_ok=True)
    logger.info("Data directory ensured", path="data")
    
    await init_db()
    logger.info("Database initialized", url=settings.database_url.split("///")[-1] if "///" in settings.database_url else "unknown")

    async with async_session() as session:
        settings_service = SystemSettingsService(session)
        await settings_service.init_default_settings()
    logger.info("Default system settings initialized")

    # Initialize push scheduler and register existing cron tasks
    await init_push_scheduler()

    logger.info("API startup complete", port=8000)
    yield
    
    logger.info("Shutting down AI Research Platform API...")
    await cleanup_resources()
    logger.info("API shutdown complete")


async def cleanup_resources() -> None:
    """Gracefully close database connections and other resources."""
    try:
        await async_session.dispose()
        logger.info("Database connection pool closed")
    except Exception as e:
        logger.error("Error closing database connection pool", error=str(e))

    # Stop push scheduler
    try:
        from services.push.scheduler import push_scheduler
        await push_scheduler.stop()
        logger.info("Push scheduler stopped")
    except Exception as e:
        logger.error("Error stopping push scheduler", error=str(e))


async def init_push_scheduler() -> None:
    """Initialize push scheduler and register existing cron tasks."""
    from sqlalchemy import select
    from models import PushTask
    from services.push.scheduler import push_scheduler

    push_scheduler.initialize()

    # Register existing enabled scheduled tasks
    async with async_session() as session:
        result = await session.execute(
            select(PushTask).where(
                PushTask.trigger_type == "scheduled",
                PushTask.is_enabled == True,
                PushTask.cron_expression.isnot(None),
            )
        )
        tasks = list(result.scalars().all())

    for task in tasks:
        if task.cron_expression:
            try:
                push_scheduler.add_cron_job(
                    job_id=task.id,
                    func=_execute_push_task_wrapper,
                    cron_expression=task.cron_expression,
                    task_id=task.id,
                )
                logger.info("Registered push task on startup", task_id=task.id, cron=task.cron_expression)
            except ValueError as e:
                logger.warning("Failed to register push task", task_id=task.id, error=str(e))

    await push_scheduler.start()
    logger.info("Push scheduler started", registered_tasks=len(tasks))


async def _execute_push_task_wrapper(task_id: str) -> None:
    """Wrapper for scheduler callback with its own DB session."""
    from services.push.push_service import PushService
    from utils.logging import get_logger

    logger = get_logger(__name__)
    logger.info("Scheduled push task executing", task_id=task_id)

    async with async_session() as session:
        service = PushService(session)
        try:
            await service.execute_task(task_id)
            logger.info("Scheduled push task completed", task_id=task_id)
        except Exception as e:
            logger.error("Scheduled push task failed", task_id=task_id, error=str(e))
            raise


app = FastAPI(
    title="AI Research Platform API",
    description="""
## 概述

AI 研究平台后端 API，用于管理信息源、原始记录、标准化事实和研究结论。

## 数据流

1. **信息源(Source)** → 爬虫采集 → **原始记录(RawRecord)**
2. **原始记录** → AI 抽取 → **标准化事实(Fact)**
3. **标准化事实** → AI 分析 → **研究结论(Insight)**

## 认证

所有 API 端点需要 `X-API-Key` 请求头进行认证。

- 开发环境 (`APP_ENV=development`): 认证被绕过
- 生产环境: 必须提供有效的 API Key

## 错误响应

所有错误响应遵循统一格式:

```json
{
  "success": false,
  "error": "错误描述",
  "detail": "详细错误信息（仅开发环境）"
}
```
    """,
    version="0.1.0",
    lifespan=lifespan,
    openapi_tags=[
        {"name": "dashboard", "description": "仪表盘统计数据和趋势"},
        {"name": "sources", "description": "信息源管理 - 创建、查询、更新、删除信息源"},
        {"name": "raw_records", "description": "原始记录管理 - 爬虫采集的原始数据"},
        {"name": "facts", "description": "标准化事实管理 - AI 抽取的结构化事实"},
        {"name": "insights", "description": "研究结论管理 - AI 生成的研究洞察"},
        {"name": "logs", "description": "操作日志和 AI 日志查询"},
        {"name": "ai_models", "description": "AI 模型配置管理"},
        {"name": "prompt_templates", "description": "Prompt 模板管理和测试"},
        {"name": "crawl_tasks", "description": "爬取任务管理和监控"},
        {"name": "system_settings", "description": "系统设置管理"},
        {"name": "reports", "description": "周报生成和管理"},
        {"name": "push", "description": "推送通知管理 - 渠道配置、任务调度、模板管理、推送记录"},
    ],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register exception handlers
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(ValidationError, pydantic_validation_exception_handler)
app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

app.include_router(api_router)


@app.get("/health", response_model=HealthResponse)
async def health_check():
    db_status = "disconnected"
    try:
        async with async_session() as session:
            await session.execute("SELECT 1")
            db_status = "connected"
    except Exception as e:
        logger.error("Health check database connection failed", error=str(e))
        db_status = "error"
    
    status = "healthy" if db_status == "connected" else "unhealthy"
    
    return HealthResponse(
        status=status,
        timestamp=datetime.now(),
        database=db_status,
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)