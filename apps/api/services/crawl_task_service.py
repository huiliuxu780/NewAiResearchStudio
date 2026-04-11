import logging
from datetime import datetime

from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.crawl_task import CrawlTask, CrawlTaskStatus
from schemas.crawl_task import CrawlTaskCreate, CrawlTaskFilter, CrawlTaskStats
from services.transaction import transaction
from utils.helpers import get_paginated

logger = logging.getLogger(__name__)


class CrawlTaskService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_task(self, data: CrawlTaskCreate) -> CrawlTask:
        """创建抓取任务并返回任务对象"""
        async with transaction(self.session) as txn:
            task = CrawlTask(
                source_id=data.source_id,
                task_type=data.task_type,
                status=CrawlTaskStatus.pending,
            )
            txn.add(task)
            await txn.flush()
            await txn.refresh(task)
        logger.info(f"Created crawl task {task.id} for source {data.source_id}")
        return task

    async def get_task(self, task_id: str) -> CrawlTask | None:
        """获取单个任务详情"""
        result = await self.session.execute(
            select(CrawlTask).where(CrawlTask.id == task_id)
        )
        return result.scalar_one_or_none()

    async def get_list(
        self,
        page: int = 1,
        page_size: int = 20,
        filters: CrawlTaskFilter | None = None,
    ) -> tuple[list[CrawlTask], int, int]:
        """获取任务列表（支持分页和筛选）"""
        filter_conditions = []
        if filters:
            if filters.status:
                filter_conditions.append(CrawlTask.status == filters.status)
            if filters.source_id:
                filter_conditions.append(CrawlTask.source_id == filters.source_id)
            if filters.task_type:
                filter_conditions.append(CrawlTask.task_type == filters.task_type)
            if filters.started_after:
                filter_conditions.append(CrawlTask.started_at >= filters.started_after)
            if filters.started_before:
                filter_conditions.append(CrawlTask.started_at <= filters.started_before)

        return await get_paginated(
            self.session,
            CrawlTask,
            page=page,
            page_size=page_size,
            filters=filter_conditions,
            order_by=[CrawlTask.created_at.desc()],
        )

    async def update_task_status(
        self,
        task_id: str,
        status: CrawlTaskStatus,
        records_count: int | None = None,
        error_message: str | None = None,
    ) -> CrawlTask | None:
        """更新任务状态"""
        task = await self.get_task(task_id)
        if not task:
            return None

        task.status = status
        if status == CrawlTaskStatus.running and not task.started_at:
            task.started_at = datetime.now()
        if status in (CrawlTaskStatus.completed, CrawlTaskStatus.failed, CrawlTaskStatus.cancelled):
            task.completed_at = datetime.now()
        if records_count is not None:
            task.records_count = records_count
        if error_message is not None:
            task.error_message = error_message

        async with transaction(self.session) as txn:
            txn.add(task)
            await txn.flush()
            await txn.refresh(task)
        return task

    async def cancel_task(self, task_id: str) -> CrawlTask | None:
        """取消任务（仅允许取消 pending 或 running 状态的任务）"""
        task = await self.get_task(task_id)
        if not task:
            return None

        if task.status not in (CrawlTaskStatus.pending, CrawlTaskStatus.running):
            raise ValueError(f"Cannot cancel task with status '{task.status}'")

        return await self.update_task_status(
            task_id, CrawlTaskStatus.cancelled
        )

    async def get_stats(self) -> CrawlTaskStats:
        """获取任务统计数据"""
        result = await self.session.execute(
            select(
                func.count(CrawlTask.id).label("total"),
                func.sum(
                    case(
                        (CrawlTask.status == CrawlTaskStatus.pending, 1),
                        else_=0,
                    )
                ).label("pending"),
                func.sum(
                    case(
                        (CrawlTask.status == CrawlTaskStatus.running, 1),
                        else_=0,
                    )
                ).label("running"),
                func.sum(
                    case(
                        (CrawlTask.status == CrawlTaskStatus.completed, 1),
                        else_=0,
                    )
                ).label("completed"),
                func.sum(
                    case(
                        (CrawlTask.status == CrawlTaskStatus.failed, 1),
                        else_=0,
                    )
                ).label("failed"),
                func.sum(
                    case(
                        (CrawlTask.status == CrawlTaskStatus.cancelled, 1),
                        else_=0,
                    )
                ).label("cancelled"),
                func.coalesce(func.sum(CrawlTask.records_count), 0).label("total_records"),
            )
        )
        row = result.one()
        return CrawlTaskStats(
            total=row.total or 0,
            pending=row.pending or 0,
            running=row.running or 0,
            completed=row.completed or 0,
            failed=row.failed or 0,
            cancelled=row.cancelled or 0,
            total_records=row.total_records or 0,
        )
