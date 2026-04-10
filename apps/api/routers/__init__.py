from fastapi import APIRouter

from .facts import router as facts_router
from .insights import router as insights_router
from .raw_records import router as raw_records_router
from .sources import router as sources_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(sources_router)
api_router.include_router(raw_records_router)
api_router.include_router(facts_router)
api_router.include_router(insights_router)

__all__ = ["api_router"]