from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.raw_record import RawRecord
from schemas import PaginatedResponse, RawRecordResponse, RawRecordFilter
from services import get_session
from utils.helpers import get_paginated

router = APIRouter(prefix="/raw-records", tags=["raw-records"])


@router.get("/", response_model=PaginatedResponse[RawRecordResponse])
async def list_raw_records(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    source_id: str | None = Query(None),
    company: str | None = Query(None),
    crawl_status: str | None = Query(None),
    dedupe_status: str | None = Query(None),
    language: str | None = Query(None),
    session: AsyncSession = Depends(get_session),
):
    filters = RawRecordFilter(
        source_id=source_id,
        company=company,
        crawl_status=crawl_status,
        dedupe_status=dedupe_status,
        language=language,
    )
    filter_conditions = []
    if filters.source_id:
        filter_conditions.append(RawRecord.source_id == filters.source_id)
    if filters.company:
        filter_conditions.append(RawRecord.company == filters.company)
    if filters.crawl_status:
        filter_conditions.append(RawRecord.crawl_status == filters.crawl_status)
    if filters.dedupe_status:
        filter_conditions.append(RawRecord.dedupe_status == filters.dedupe_status)
    if filters.language:
        filter_conditions.append(RawRecord.language == filters.language)

    items, total, total_pages = await get_paginated(
        session,
        RawRecord,
        page=page,
        page_size=page_size,
        filters=filter_conditions,
        order_by=[RawRecord.crawled_at.desc()],
    )
    return PaginatedResponse(
        items=[RawRecordResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/{record_id}", response_model=RawRecordResponse)
async def get_raw_record(
    record_id: str,
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(RawRecord).where(RawRecord.id == record_id)
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Raw record not found")
    return RawRecordResponse.model_validate(record)