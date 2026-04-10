from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.fact import Fact
from schemas import (
    PaginatedResponse,
    FactResponse,
    FactCreate,
    FactFilter,
    ReviewUpdate,
    SuccessResponse,
)
from services import get_session
from utils.helpers import get_paginated

router = APIRouter(prefix="/facts", tags=["facts"])


@router.get("/", response_model=PaginatedResponse[FactResponse])
async def list_facts(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    company: str | None = Query(None),
    topic_level_1: str | None = Query(None),
    event_type: str | None = Query(None),
    entity_type: str | None = Query(None),
    importance_level: str | None = Query(None),
    confidence: str | None = Query(None),
    needs_review: bool | None = Query(None),
    review_status: str | None = Query(None),
    session: AsyncSession = Depends(get_session),
):
    filters = FactFilter(
        company=company,
        topic_level_1=topic_level_1,
        event_type=event_type,
        entity_type=entity_type,
        importance_level=importance_level,
        confidence=confidence,
        needs_review=needs_review,
        review_status=review_status,
    )
    filter_conditions = []
    if filters.company:
        filter_conditions.append(Fact.company == filters.company)
    if filters.topic_level_1:
        filter_conditions.append(Fact.topic_level_1 == filters.topic_level_1)
    if filters.event_type:
        filter_conditions.append(Fact.event_type == filters.event_type)
    if filters.entity_type:
        filter_conditions.append(Fact.entity_type == filters.entity_type)
    if filters.importance_level:
        filter_conditions.append(Fact.importance_level == filters.importance_level)
    if filters.confidence:
        filter_conditions.append(Fact.confidence == filters.confidence)
    if filters.needs_review is not None:
        filter_conditions.append(Fact.needs_review == filters.needs_review)
    if filters.review_status:
        filter_conditions.append(Fact.review_status == filters.review_status)

    items, total, total_pages = await get_paginated(
        session,
        Fact,
        page=page,
        page_size=page_size,
        filters=filter_conditions,
        order_by=[Fact.created_at.desc()],
    )
    return PaginatedResponse(
        items=[FactResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post("/", response_model=FactResponse, status_code=201)
async def create_fact(
    data: FactCreate,
    session: AsyncSession = Depends(get_session),
):
    fact = Fact(**data.model_dump())
    session.add(fact)
    await session.commit()
    await session.refresh(fact)
    return FactResponse.model_validate(fact)


@router.get("/{fact_id}", response_model=FactResponse)
async def get_fact(
    fact_id: str,
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(select(Fact).where(Fact.id == fact_id))
    fact = result.scalar_one_or_none()
    if not fact:
        raise HTTPException(status_code=404, detail="Fact not found")
    return FactResponse.model_validate(fact)


@router.put("/{fact_id}/review", response_model=SuccessResponse)
async def update_review_status(
    fact_id: str,
    data: ReviewUpdate,
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(select(Fact).where(Fact.id == fact_id))
    fact = result.scalar_one_or_none()
    if not fact:
        raise HTTPException(status_code=404, detail="Fact not found")

    fact.review_status = data.review_status
    if data.needs_review is not None:
        fact.needs_review = data.needs_review

    await session.commit()
    return SuccessResponse(message="Review status updated successfully")