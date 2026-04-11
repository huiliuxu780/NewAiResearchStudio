from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from schemas import (
    AILogFilter,
    AILogListResponse,
    AILogResponse,
    OperationLogFilter,
    OperationLogListResponse,
    OperationLogResponse,
    PaginatedResponse,
)
from services import get_session, log_service

router = APIRouter(prefix="/logs", tags=["logs"])


@router.get("/operations", response_model=OperationLogListResponse)
async def list_operation_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    action: str | None = Query(None),
    entity_type: str | None = Query(None),
    status: str | None = Query(None),
    start_date: datetime | None = Query(None),
    end_date: datetime | None = Query(None),
    keyword: str | None = Query(None),
    session: AsyncSession = Depends(get_session),
):
    filter_params = OperationLogFilter(
        page=page,
        page_size=page_size,
        action=action,
        entity_type=entity_type,
        status=status,
        start_date=start_date,
        end_date=end_date,
        keyword=keyword,
    )
    result = await log_service.get_operation_logs(session, filter_params)
    return OperationLogListResponse(
        items=[OperationLogResponse.model_validate(item) for item in result["items"]],
        total=result["total"],
        page=result["page"],
        page_size=result["page_size"],
        total_pages=result["total_pages"],
    )


@router.get("/operations/{log_id}", response_model=OperationLogResponse)
async def get_operation_log(
    log_id: str,
    session: AsyncSession = Depends(get_session),
):
    log = await log_service.get_operation_log_by_id(session, log_id)
    if not log:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Operation log not found")
    return OperationLogResponse.model_validate(log)


@router.get("/ai", response_model=AILogListResponse)
async def list_ai_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    task_type: str | None = Query(None),
    model_name: str | None = Query(None),
    status: str | None = Query(None),
    start_date: datetime | None = Query(None),
    end_date: datetime | None = Query(None),
    session: AsyncSession = Depends(get_session),
):
    filter_params = AILogFilter(
        page=page,
        page_size=page_size,
        task_type=task_type,
        model_name=model_name,
        status=status,
        start_date=start_date,
        end_date=end_date,
    )
    result = await log_service.get_ai_logs(session, filter_params)
    return AILogListResponse(
        items=[AILogResponse.model_validate(item) for item in result["items"]],
        total=result["total"],
        page=result["page"],
        page_size=result["page_size"],
        total_pages=result["total_pages"],
    )


@router.get("/ai/{log_id}", response_model=AILogResponse)
async def get_ai_log(
    log_id: str,
    session: AsyncSession = Depends(get_session),
):
    log = await log_service.get_ai_log_by_id(session, log_id)
    if not log:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="AI log not found")
    return AILogResponse.model_validate(log)
