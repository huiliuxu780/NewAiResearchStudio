import logging
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models import AILog, OperationLog
from schemas import AILogCreate, AILogFilter, OperationLogCreate, OperationLogFilter
from utils import get_paginated

logger = logging.getLogger(__name__)


class LogService:
    async def create_operation_log(
        self, session: AsyncSession, log_data: OperationLogCreate
    ) -> OperationLog:
        try:
            log = OperationLog(**log_data.model_dump())
            session.add(log)
            await session.commit()
            await session.refresh(log)
            return log
        except Exception as e:
            logger.error(f"Failed to create operation log: {e}")
            await session.rollback()
            raise

    async def create_ai_log(
        self, session: AsyncSession, log_data: AILogCreate
    ) -> AILog:
        try:
            log = AILog(**log_data.model_dump())
            session.add(log)
            await session.commit()
            await session.refresh(log)
            return log
        except Exception as e:
            logger.error(f"Failed to create AI log: {e}")
            await session.rollback()
            raise

    async def get_operation_logs(
        self, session: AsyncSession, filter_params: OperationLogFilter
    ) -> dict[str, Any]:
        filters = []
        if filter_params.action:
            filters.append(OperationLog.action == filter_params.action)
        if filter_params.entity_type:
            filters.append(OperationLog.entity_type == filter_params.entity_type)
        if filter_params.status:
            filters.append(OperationLog.status == filter_params.status)
        if filter_params.start_date:
            filters.append(OperationLog.created_at >= filter_params.start_date)
        if filter_params.end_date:
            filters.append(OperationLog.created_at <= filter_params.end_date)
        if filter_params.keyword:
            keyword = f"%{filter_params.keyword}%"
            filters.append(
                (OperationLog.entity_id.like(keyword))
                | (OperationLog.error_message.like(keyword))
            )

        items, total, total_pages = await get_paginated(
            session,
            OperationLog,
            page=filter_params.page,
            page_size=filter_params.page_size,
            filters=filters,
            order_by=[OperationLog.created_at.desc()],
        )

        return {
            "items": items,
            "total": total,
            "page": filter_params.page,
            "page_size": filter_params.page_size,
            "total_pages": total_pages,
        }

    async def get_ai_logs(
        self, session: AsyncSession, filter_params: AILogFilter
    ) -> dict[str, Any]:
        filters = []
        if filter_params.task_type:
            filters.append(AILog.task_type == filter_params.task_type)
        if filter_params.model_name:
            filters.append(AILog.model_name == filter_params.model_name)
        if filter_params.status:
            filters.append(AILog.status == filter_params.status)
        if filter_params.start_date:
            filters.append(AILog.created_at >= filter_params.start_date)
        if filter_params.end_date:
            filters.append(AILog.created_at <= filter_params.end_date)

        items, total, total_pages = await get_paginated(
            session,
            AILog,
            page=filter_params.page,
            page_size=filter_params.page_size,
            filters=filters,
            order_by=[AILog.created_at.desc()],
        )

        return {
            "items": items,
            "total": total,
            "page": filter_params.page,
            "page_size": filter_params.page_size,
            "total_pages": total_pages,
        }

    async def get_operation_log_by_id(
        self, session: AsyncSession, log_id: str
    ) -> OperationLog | None:
        result = await session.execute(
            select(OperationLog).where(OperationLog.id == log_id)
        )
        return result.scalar_one_or_none()

    async def get_ai_log_by_id(
        self, session: AsyncSession, log_id: str
    ) -> AILog | None:
        result = await session.execute(select(AILog).where(AILog.id == log_id))
        return result.scalar_one_or_none()


log_service = LogService()
