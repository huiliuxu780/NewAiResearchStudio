"""Shared health check server for workers.

Provides a lightweight FastAPI health endpoint on port 8080
for Docker health checks and monitoring.
"""

import asyncio
import logging
from datetime import datetime

from fastapi import FastAPI
from pydantic import BaseModel

logger = logging.getLogger(__name__)

health_app = FastAPI(title="Worker Health Check", docs_url=None, redoc_url=None)


class HealthResponse(BaseModel):
    status: str
    worker: str
    timestamp: str
    uptime_seconds: float


_start_time: float = 0
_worker_name: str = "unknown"


def init_health_server(worker_name: str) -> None:
    """Initialize the health server with the worker name."""
    global _start_time, _worker_name
    import time
    _start_time = time.time()
    _worker_name = worker_name


@health_app.get("/health", response_model=HealthResponse)
async def health_check():
    import time
    return HealthResponse(
        status="healthy",
        worker=_worker_name,
        timestamp=datetime.now().isoformat(),
        uptime_seconds=round(time.time() - _start_time, 1),
    )


async def start_health_server(host: str = "0.0.0.0", port: int = 8080) -> asyncio.Task:
    """Start the health check server in the background.

    Returns:
        An asyncio.Task running the uvicorn server.
    """
    import uvicorn

    config = uvicorn.Config(
        health_app,
        host=host,
        port=port,
        log_level="warning",
        access_log=False,
    )
    server = uvicorn.Server(config)
    task = asyncio.create_task(server.serve())
    logger.info(f"Health check server started on {host}:{port}")
    return task
