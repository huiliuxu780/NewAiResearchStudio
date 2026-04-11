from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from middleware import log_operation
from models.insight import Insight
from schemas import PaginatedResponse, InsightResponse, InsightFilter, InsightCreate, SuccessResponse
from services import get_session
from services.transaction import transaction
from utils.helpers import get_paginated

router = APIRouter(prefix="/insights", tags=["insights"])


@router.get("/", response_model=PaginatedResponse[InsightResponse])
async def list_insights(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    company: str | None = Query(None),
    fact_id: str | None = Query(None),
    insight_type: str | None = Query(None),
    impact_level: str | None = Query(None),
    confidence: str | None = Query(None),
    session: AsyncSession = Depends(get_session),
):
    filters = InsightFilter(
        company=company,
        fact_id=fact_id,
        insight_type=insight_type,
        impact_level=impact_level,
        confidence=confidence,
    )
    filter_conditions = []
    if filters.company:
        filter_conditions.append(Insight.company == filters.company)
    if filters.fact_id:
        filter_conditions.append(Insight.fact_id == filters.fact_id)
    if filters.insight_type:
        filter_conditions.append(Insight.insight_type == filters.insight_type)
    if filters.impact_level:
        filter_conditions.append(Insight.impact_level == filters.impact_level)
    if filters.confidence:
        filter_conditions.append(Insight.confidence == filters.confidence)

    items, total, total_pages = await get_paginated(
        session,
        Insight,
        page=page,
        page_size=page_size,
        filters=filter_conditions,
        order_by=[Insight.created_at.desc()],
    )
    return PaginatedResponse(
        items=[InsightResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post("/", response_model=InsightResponse, status_code=201)
@log_operation(action="create", entity_type="insight")
async def create_insight(
    data: InsightCreate,
    session: AsyncSession = Depends(get_session),
):
    async with transaction(session) as txn:
        insight = Insight(**data.model_dump())
        txn.add(insight)
        await txn.flush()
        await txn.refresh(insight)
    return InsightResponse.model_validate(insight)


@router.get("/{insight_id}", response_model=InsightResponse)
async def get_insight(
    insight_id: str,
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(Insight).where(Insight.id == insight_id)
    )
    insight = result.scalar_one_or_none()
    if not insight:
        raise HTTPException(status_code=404, detail="Insight not found")
    return InsightResponse.model_validate(insight)