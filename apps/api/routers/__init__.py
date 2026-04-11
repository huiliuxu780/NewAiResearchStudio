from fastapi import APIRouter, Depends

from .crawl_tasks import router as crawl_tasks_router
from .dashboard import router as dashboard_router
from .facts import router as facts_router
from .insights import router as insights_router
from .raw_records import router as raw_records_router
from .sources import router as sources_router
from .logs import router as logs_router
from .ai_models import router as ai_models_router
from .prompt_templates import router as prompt_templates_router
from .system_settings import router as system_settings_router
from .reports import router as reports_router
from .push import router as push_router
from middleware.auth import verify_api_key

api_router = APIRouter(
    prefix="/api/v1",
    dependencies=[Depends(verify_api_key)],
)

api_router.include_router(dashboard_router)
api_router.include_router(sources_router)
api_router.include_router(raw_records_router)
api_router.include_router(facts_router)
api_router.include_router(insights_router)
api_router.include_router(logs_router)
api_router.include_router(ai_models_router)
api_router.include_router(prompt_templates_router)
api_router.include_router(crawl_tasks_router)
api_router.include_router(system_settings_router)
api_router.include_router(reports_router)
api_router.include_router(push_router)

__all__ = ["api_router"]