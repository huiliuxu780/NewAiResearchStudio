import logging
from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models import WeeklyReport
from schemas import WeeklyReportCreate, WeeklyReportResponse
from services.transaction import transaction
from utils.helpers import get_paginated

logger = logging.getLogger(__name__)


class ReportService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_report(self, data: WeeklyReportCreate, content: dict) -> WeeklyReport:
        title = f"{data.company}周报 ({data.start_date} ~ {data.end_date})"
        async with transaction(self.session) as txn:
            report = WeeklyReport(
                title=title,
                company=data.company,
                start_date=data.start_date,
                end_date=data.end_date,
                content=content,
                status="generated",
            )
            txn.add(report)
            await txn.flush()
            await txn.refresh(report)
        return report

    async def get_report(self, report_id: str) -> WeeklyReport | None:
        result = await self.session.execute(
            select(WeeklyReport).where(WeeklyReport.id == report_id)
        )
        return result.scalar_one_or_none()

    async def get_list(self, company: str | None = None, page: int = 1, page_size: int = 20):
        filters = []
        if company:
            filters.append(WeeklyReport.company == company)

        items, total, total_pages = await get_paginated(
            self.session,
            WeeklyReport,
            page=page,
            page_size=page_size,
            filters=filters,
            order_by=[WeeklyReport.created_at.desc()],
        )
        return items, total, total_pages

    async def delete_report(self, report_id: str) -> bool:
        report = await self.get_report(report_id)
        if not report:
            return False
        async with transaction(self.session) as txn:
            await txn.delete(report)
        return True
