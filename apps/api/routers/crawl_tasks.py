from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from middleware import log_operation
from models.crawl_task import CrawlTaskStatus
from schemas import (
    CrawlTaskCreate,
    CrawlTaskFilter,
    CrawlTaskListResponse,
    CrawlTaskResponse,
    CrawlTaskStats,
    CrawlTaskStatusUpdate,
    PaginatedResponse,
    SuccessResponse,
)
from services import CrawlTaskService, get_session

router = APIRouter(prefix="/crawl-tasks", tags=["crawl-tasks"])


@router.get("/", response_model=PaginatedResponse[CrawlTaskResponse])
async def list_crawl_tasks(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: str | None = Query(None),
    source_id: str | None = Query(None),
    task_type: str | None = Query(None),
    started_after: str | None = Query(None),
    started_before: str | None = Query(None),
    session: AsyncSession = Depends(get_session),
):
    service = CrawlTaskService(session)
    filters = CrawlTaskFilter(
        status=status,
        source_id=source_id,
        task_type=task_type,
        started_after=started_after,
        started_before=started_before,
    )
    items, total, total_pages = await service.get_list(
        page=page, page_size=page_size, filters=filters
    )
    return PaginatedResponse(
        items=[CrawlTaskResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/stats", response_model=CrawlTaskStats)
async def get_crawl_task_stats(
    session: AsyncSession = Depends(get_session),
):
    service = CrawlTaskService(session)
    return await service.get_stats()


@router.get("/{task_id}", response_model=CrawlTaskResponse)
async def get_crawl_task(
    task_id: str,
    session: AsyncSession = Depends(get_session),
):
    service = CrawlTaskService(session)
    task = await service.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Crawl task not found")
    return CrawlTaskResponse.model_validate(task)


@router.post("/", response_model=CrawlTaskResponse, status_code=201)
@log_operation(action="create", entity_type="crawl_task")
async def create_crawl_task(
    data: CrawlTaskCreate,
    session: AsyncSession = Depends(get_session),
):
    service = CrawlTaskService(session)
    task = await service.create_task(data)
    return CrawlTaskResponse.model_validate(task)


@router.post("/{task_id}/cancel", response_model=CrawlTaskResponse)
@log_operation(action="cancel", entity_type="crawl_task", entity_id_param="task_id")
async def cancel_crawl_task(
    task_id: str,
    session: AsyncSession = Depends(get_session),
):
    service = CrawlTaskService(session)
    try:
        task = await service.cancel_task(task_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not task:
        raise HTTPException(status_code=404, detail="Crawl task not found")
    return CrawlTaskResponse.model_validate(task)


@router.patch("/{task_id}/status", response_model=CrawlTaskResponse)
async def update_crawl_task_status(
    task_id: str,
    data: CrawlTaskStatusUpdate,
    session: AsyncSession = Depends(get_session),
):
    """Worker 用于更新任务状态的内部端点"""
    service = CrawlTaskService(session)
    try:
        status = CrawlTaskStatus(data.status)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status '{data.status}'. Must be one of: {[s.value for s in CrawlTaskStatus]}",
        )

    task = await service.update_task_status(
        task_id,
        status,
        records_count=data.records_count,
        error_message=data.error_message,
    )
    if not task:
        raise HTTPException(status_code=404, detail="Crawl task not found")
    return CrawlTaskResponse.model_validate(task)
