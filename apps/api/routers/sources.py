from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from middleware import log_operation
from schemas import (
    PaginatedResponse,
    SourceCreate,
    SourceResponse,
    SourceUpdate,
    SourceFilter,
    SuccessResponse,
)
from services import SourceService, get_session

router = APIRouter(prefix="/sources", tags=["sources"])


@router.get("/", response_model=PaginatedResponse[SourceResponse], summary="列出信息源", description="分页查询信息源列表，支持按公司、类型、启用状态和优先级筛选")
async def list_sources(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    company: str | None = Query(None),
    source_type: str | None = Query(None),
    enabled: bool | None = Query(None),
    priority: str | None = Query(None),
    session: AsyncSession = Depends(get_session),
):
    service = SourceService(session)
    filters = SourceFilter(
        company=company,
        source_type=source_type,
        enabled=enabled,
        priority=priority,
    )
    items, total, total_pages = await service.get_list(
        page=page, page_size=page_size, filters=filters
    )
    return PaginatedResponse(
        items=[SourceResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/{source_id}", response_model=SourceResponse, summary="获取信息源详情", description="根据 ID 获取单个信息源的详细信息")
async def get_source(
    source_id: str,
    session: AsyncSession = Depends(get_session),
):
    service = SourceService(session)
    source = await service.get_by_id(source_id)
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    return SourceResponse.model_validate(source)


@router.post("/", response_model=SourceResponse, status_code=201, summary="创建信息源", description="创建新的信息源，用于爬虫数据采集")
@log_operation(action="create", entity_type="source")
async def create_source(
    data: SourceCreate,
    session: AsyncSession = Depends(get_session),
):
    service = SourceService(session)
    source = await service.create(data)
    return SourceResponse.model_validate(source)


@router.put("/{source_id}", response_model=SourceResponse, summary="更新信息源", description="更新指定信息源的配置信息")
@log_operation(action="update", entity_type="source", entity_id_param="source_id")
async def update_source(
    source_id: str,
    data: SourceUpdate,
    session: AsyncSession = Depends(get_session),
):
    service = SourceService(session)
    source = await service.update(source_id, data)
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    return SourceResponse.model_validate(source)


@router.delete("/{source_id}", response_model=SuccessResponse, summary="删除信息源", description="删除指定的信息源及其关联数据")
@log_operation(action="delete", entity_type="source", entity_id_param="source_id")
async def delete_source(
    source_id: str,
    session: AsyncSession = Depends(get_session),
):
    service = SourceService(session)
    deleted = await service.delete(source_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Source not found")
    return SuccessResponse(message="Source deleted successfully")