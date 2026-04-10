from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.raw_record import RawRecord
from models.fact import Fact
from models.insight import Insight
from models.source import Source
from services import get_session

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats")
async def get_dashboard_stats(session: AsyncSession = Depends(get_session)):
    today_fact_count = await session.execute(select(func.count(Fact.id)))
    pending_review_count = await session.execute(
        select(func.count(Fact.id)).where(Fact.review_status == "pending")
    )
    insight_count = await session.execute(select(func.count(Insight.id)))
    active_source_count = await session.execute(
        select(func.count(Source.id)).where(Source.enabled == True)
    )
    
    return {
        "today_fact_count": today_fact_count.scalar() or 0,
        "pending_review_count": pending_review_count.scalar() or 0,
        "insight_count": insight_count.scalar() or 0,
        "active_source_count": active_source_count.scalar() or 0,
    }


@router.get("/company-stats")
async def get_company_stats(session: AsyncSession = Depends(get_session)):
    result = await session.execute(
        select(Fact.company, func.count(Fact.id)).group_by(Fact.company)
    )
    return [{"company": row[0], "count": row[1]} for row in result.all()]


@router.get("/trend")
async def get_trend_data(
    company: str = Query(None),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(Fact.company, func.count(Fact.id)).group_by(Fact.company)
    )
    return [{"date": "2026-04-10", "count": row[1], "company": row[0]} for row in result.all()]