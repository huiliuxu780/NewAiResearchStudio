"""APScheduler-based push scheduler."""

from datetime import datetime, timezone
from typing import Any

from apscheduler.events import EVENT_JOB_ERROR, EVENT_JOB_EXECUTED, JobEvent
from apscheduler.executors.asyncio import AsyncIOExecutor
from apscheduler.jobstores.base import JobLookupError
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from croniter import croniter

from utils.logging import get_logger

logger = get_logger(__name__)


class PushScheduler:
    """推送调度器。

    基于 APScheduler 实现:
    - 定时任务扫描 (每分钟检查待推送任务)
    - 动态添加/移除定时任务
    - 任务持久化 (内存存储, 重启后从数据库重建)
    - 并发控制 (通过数据库锁防止多实例重复执行)
    - 事件监听 (记录任务执行日志)
    """

    def __init__(self) -> None:
        self.scheduler: AsyncIOScheduler | None = None
        self._is_initialized = False

    def initialize(self) -> AsyncIOScheduler:
        """初始化调度器。"""
        if self._is_initialized:
            return self.scheduler  # type: ignore

        executor = AsyncIOExecutor()
        self.scheduler = AsyncIOScheduler(
            executors={"default": executor},
            job_defaults={
                "coalesce": True,  # 合并错过的执行
                "max_instances": 1,  # 每个任务最多 1 个实例
                "misfire_grace_time": 60,  # 错过执行的容忍时间(秒)
            },
        )

        # 注册事件监听
        self.scheduler.add_listener(self._on_job_executed, EVENT_JOB_EXECUTED)
        self.scheduler.add_listener(self._on_job_error, EVENT_JOB_ERROR)

        self._is_initialized = True
        logger.info("Push scheduler initialized")
        return self.scheduler

    async def start(self) -> None:
        """启动调度器。"""
        if not self.scheduler:
            self.initialize()
        if self.scheduler and not self.scheduler.running:
            self.scheduler.start()
            logger.info("Push scheduler started")

    async def stop(self) -> None:
        """停止调度器。"""
        if self.scheduler and self.scheduler.running:
            self.scheduler.shutdown(wait=False)
            logger.info("Push scheduler stopped")

    def add_cron_job(
        self,
        job_id: str,
        func: Any,
        cron_expression: str,
        **kwargs: Any,
    ) -> None:
        """添加 Cron 定时任务。

        Args:
            job_id: 任务 ID (通常为 PushTask.id)
            func: 异步执行函数
            cron_expression: Cron 表达式 (如 "0 9 * * 1" 表示每周一 9:00)
            **kwargs: 传递给执行函数的参数
        """
        if not self.scheduler:
            raise RuntimeError("Scheduler not initialized")

        try:
            # 验证 cron 表达式
            croniter(cron_expression)
        except (ValueError, TypeError) as e:
            raise ValueError(f"Invalid cron expression: {cron_expression}") from e

        # 解析 cron 表达式为 APScheduler 参数
        minute, hour, day, month, day_of_week = cron_expression.split()

        self.scheduler.add_job(
            func,
            trigger="cron",
            id=job_id,
            name=f"push_task_{job_id}",
            minute=minute,
            hour=hour,
            day=day,
            month=month,
            day_of_week=day_of_week,
            kwargs=kwargs,
            replace_existing=True,
            max_instances=1,
        )
        logger.info("Cron job added", job_id=job_id, cron=cron_expression)

    def add_interval_job(
        self,
        job_id: str,
        func: Any,
        seconds: int = 60,
        **kwargs: Any,
    ) -> None:
        """添加间隔定时任务。

        Args:
            job_id: 任务 ID
            func: 异步执行函数
            seconds: 间隔秒数
            **kwargs: 传递给执行函数的参数
        """
        if not self.scheduler:
            raise RuntimeError("Scheduler not initialized")

        self.scheduler.add_job(
            func,
            trigger="interval",
            id=job_id,
            name=f"push_interval_{job_id}",
            seconds=seconds,
            kwargs=kwargs,
            replace_existing=True,
            max_instances=1,
        )
        logger.info("Interval job added", job_id=job_id, seconds=seconds)

    def remove_job(self, job_id: str) -> None:
        """移除定时任务。"""
        if not self.scheduler:
            return
        try:
            self.scheduler.remove_job(job_id)
            logger.info("Job removed", job_id=job_id)
        except JobLookupError:
            logger.debug("Job not found for removal", job_id=job_id)

    def get_next_run_time(self, job_id: str) -> datetime | None:
        """获取任务下次执行时间。"""
        if not self.scheduler:
            return None
        job = self.scheduler.get_job(job_id)
        return job.next_run_time if job else None

    def is_job_running(self, job_id: str) -> bool:
        """检查任务是否在调度中。"""
        if not self.scheduler:
            return False
        job = self.scheduler.get_job(job_id)
        return job is not None

    def _on_job_executed(self, event: JobEvent) -> None:
        """任务执行完成回调。"""
        logger.info(
            "Push job executed",
            job_id=event.job_id,
            scheduled_run_time=event.scheduled_run_time,
        )

    def _on_job_error(self, event: JobEvent) -> None:
        """任务执行失败回调。"""
        logger.error(
            "Push job execution failed",
            job_id=event.job_id,
            exception=event.exception,
        )


# Global scheduler instance
push_scheduler = PushScheduler()
