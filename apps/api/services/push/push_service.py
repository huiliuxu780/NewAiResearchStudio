"""Push notification service with retry logic and scheduling."""

import asyncio
import math
from datetime import datetime, timedelta, timezone
from typing import Any

from sqlalchemy import func, select, update, case
from sqlalchemy.ext.asyncio import AsyncSession

from models import PushChannel, PushRecord, PushTask, PushTemplate
from services.push.base_channel import SendResult
from services.push.channel_factory import ChannelFactory
from services.push.template_engine import TemplateEngine, TemplateRenderError
from utils.logging import get_logger

logger = get_logger(__name__)


class PushService:
    """推送服务核心类。

    负责:
    - 创建和执行推送任务
    - 模板渲染
    - 渠道发送
    - 重试机制 (指数退避)
    - 状态追踪
    """

    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.template_engine = TemplateEngine()

    # ============================================================
    # Push Channel CRUD
    # ============================================================

    async def create_channel(self, data: dict[str, Any]) -> PushChannel:
        """创建推送渠道。"""
        channel = PushChannel(**data)
        self.session.add(channel)
        await self.session.commit()
        await self.session.refresh(channel)
        logger.info("Push channel created", channel_id=channel.id, name=channel.name)
        return channel

    async def get_channel(self, channel_id: str) -> PushChannel | None:
        """获取推送渠道。"""
        result = await self.session.execute(
            select(PushChannel).where(PushChannel.id == channel_id)
        )
        return result.scalar_one_or_none()

    async def list_channels(
        self,
        channel_type: str | None = None,
        is_enabled: bool | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[PushChannel], int]:
        """分页查询推送渠道。"""
        query = select(PushChannel)
        if channel_type:
            query = query.where(PushChannel.channel_type == channel_type)
        if is_enabled is not None:
            query = query.where(PushChannel.is_enabled == is_enabled)

        count_query = select(func.count()).select_from(query.subquery())
        total = (await self.session.execute(count_query)).scalar() or 0

        query = query.order_by(PushChannel.created_at.desc())
        query = query.offset((page - 1) * page_size).limit(page_size)
        result = await self.session.execute(query)
        items = list(result.scalars().all())
        return items, total

    async def update_channel(self, channel_id: str, data: dict[str, Any]) -> PushChannel | None:
        """更新推送渠道。"""
        channel = await self.get_channel(channel_id)
        if not channel:
            return None
        for key, value in data.items():
            if hasattr(channel, key) and value is not None:
                setattr(channel, key, value)
        await self.session.commit()
        await self.session.refresh(channel)
        logger.info("Push channel updated", channel_id=channel_id)
        return channel

    async def delete_channel(self, channel_id: str) -> bool:
        """删除推送渠道。"""
        channel = await self.get_channel(channel_id)
        if not channel:
            return False
        await self.session.delete(channel)
        await self.session.commit()
        logger.info("Push channel deleted", channel_id=channel_id)
        return True

    # ============================================================
    # Push Task CRUD
    # ============================================================

    async def create_task(self, data: dict[str, Any]) -> PushTask:
        """创建推送任务。"""
        task = PushTask(**data)
        self.session.add(task)
        await self.session.commit()
        await self.session.refresh(task)
        logger.info("Push task created", task_id=task.id, name=task.name)
        return task

    async def get_task(self, task_id: str) -> PushTask | None:
        """获取推送任务。"""
        result = await self.session.execute(
            select(PushTask).where(PushTask.id == task_id)
        )
        return result.scalar_one_or_none()

    async def list_tasks(
        self,
        trigger_type: str | None = None,
        status: str | None = None,
        is_enabled: bool | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[PushTask], int]:
        """分页查询推送任务。"""
        query = select(PushTask)
        if trigger_type:
            query = query.where(PushTask.trigger_type == trigger_type)
        if status:
            query = query.where(PushTask.status == status)
        if is_enabled is not None:
            query = query.where(PushTask.is_enabled == is_enabled)

        count_query = select(func.count()).select_from(query.subquery())
        total = (await self.session.execute(count_query)).scalar() or 0

        query = query.order_by(PushTask.created_at.desc())
        query = query.offset((page - 1) * page_size).limit(page_size)
        result = await self.session.execute(query)
        items = list(result.scalars().all())
        return items, total

    async def update_task(self, task_id: str, data: dict[str, Any]) -> PushTask | None:
        """更新推送任务。"""
        task = await self.get_task(task_id)
        if not task:
            return None
        for key, value in data.items():
            if hasattr(task, key) and value is not None:
                setattr(task, key, value)
        await self.session.commit()
        await self.session.refresh(task)
        logger.info("Push task updated", task_id=task_id)
        return task

    async def toggle_task(self, task_id: str, is_enabled: bool) -> PushTask | None:
        """启用/禁用推送任务。"""
        task = await self.get_task(task_id)
        if not task:
            return None
        task.is_enabled = is_enabled
        task.status = "disabled" if not is_enabled else "pending"
        await self.session.commit()
        await self.session.refresh(task)
        logger.info("Push task toggled", task_id=task_id, is_enabled=is_enabled)
        return task

    async def delete_task(self, task_id: str) -> bool:
        """删除推送任务。"""
        task = await self.get_task(task_id)
        if not task:
            return False
        await self.session.delete(task)
        await self.session.commit()
        logger.info("Push task deleted", task_id=task_id)
        return True

    # ============================================================
    # Push Template CRUD
    # ============================================================

    async def create_template(self, data: dict[str, Any]) -> PushTemplate:
        """创建推送模板。"""
        template = PushTemplate(**data)
        self.session.add(template)
        await self.session.commit()
        await self.session.refresh(template)
        logger.info("Push template created", template_id=template.id, name=template.name)
        return template

    async def get_template(self, template_id: str) -> PushTemplate | None:
        """获取推送模板。"""
        result = await self.session.execute(
            select(PushTemplate).where(PushTemplate.id == template_id)
        )
        return result.scalar_one_or_none()

    async def list_templates(
        self,
        is_enabled: bool | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[PushTemplate], int]:
        """分页查询推送模板。"""
        query = select(PushTemplate)
        if is_enabled is not None:
            query = query.where(PushTemplate.is_enabled == is_enabled)

        count_query = select(func.count()).select_from(query.subquery())
        total = (await self.session.execute(count_query)).scalar() or 0

        query = query.order_by(PushTemplate.created_at.desc())
        query = query.offset((page - 1) * page_size).limit(page_size)
        result = await self.session.execute(query)
        items = list(result.scalars().all())
        return items, total

    async def update_template(self, template_id: str, data: dict[str, Any]) -> PushTemplate | None:
        """更新推送模板。"""
        template = await self.get_template(template_id)
        if not template:
            return None
        for key, value in data.items():
            if hasattr(template, key) and value is not None:
                setattr(template, key, value)
        await self.session.commit()
        await self.session.refresh(template)
        logger.info("Push template updated", template_id=template_id)
        return template

    async def delete_template(self, template_id: str) -> bool:
        """删除推送模板。"""
        template = await self.get_template(template_id)
        if not template:
            return False
        if template.is_system:
            raise ValueError("Cannot delete system templates")
        await self.session.delete(template)
        await self.session.commit()
        logger.info("Push template deleted", template_id=template_id)
        return True

    def preview_template(self, template: PushTemplate, variables: dict[str, Any]) -> tuple[str, str]:
        """预览模板渲染结果。"""
        return self.template_engine.render_title_and_content(
            template.title_template,
            template.content_template,
            {**template.default_values, **variables},
        )

    # ============================================================
    # Push Record Query
    # ============================================================

    async def get_record(self, record_id: str) -> PushRecord | None:
        """获取推送记录。"""
        result = await self.session.execute(
            select(PushRecord).where(PushRecord.id == record_id)
        )
        return result.scalar_one_or_none()

    async def list_records(
        self,
        task_id: str | None = None,
        channel_id: str | None = None,
        status: str | None = None,
        channel_type: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[PushRecord], int]:
        """分页查询推送记录。"""
        query = select(PushRecord)
        if task_id:
            query = query.where(PushRecord.task_id == task_id)
        if channel_id:
            query = query.where(PushRecord.channel_id == channel_id)
        if status:
            query = query.where(PushRecord.status == status)
        if channel_type:
            query = query.where(PushRecord.channel_type == channel_type)

        count_query = select(func.count()).select_from(query.subquery())
        total = (await self.session.execute(count_query)).scalar() or 0

        query = query.order_by(PushRecord.created_at.desc())
        query = query.offset((page - 1) * page_size).limit(page_size)
        result = await self.session.execute(query)
        items = list(result.scalars().all())
        return items, total

    # ============================================================
    # Push Execution
    # ============================================================

    async def execute_task(
        self,
        task_id: str,
        template_variables: dict[str, Any] | None = None,
        override_channel_ids: list[str] | None = None,
    ) -> list[PushRecord]:
        """执行推送任务。

        Args:
            task_id: 任务 ID
            template_variables: 模板变量 (覆盖默认值)
            override_channel_ids: 覆盖渠道列表

        Returns:
            list[PushRecord]: 推送记录列表
        """
        task = await self.get_task(task_id)
        if not task:
            raise ValueError(f"Push task not found: {task_id}")

        if not task.is_enabled:
            raise ValueError(f"Push task is disabled: {task_id}")

        channel_ids = override_channel_ids or task.channel_ids
        records = []

        for channel_id in channel_ids:
            record = await self._execute_single_push(task, channel_id, template_variables or {})
            records.append(record)

        # 更新任务统计
        await self._update_task_stats(task)

        return records

    async def _execute_single_push(
        self,
        task: PushTask,
        channel_id: str,
        template_variables: dict[str, Any],
    ) -> PushRecord:
        """执行单次推送。"""
        channel = await self.get_channel(channel_id)
        if not channel:
            raise ValueError(f"Push channel not found: {channel_id}")

        if not channel.is_enabled:
            raise ValueError(f"Push channel is disabled: {channel_id}")

        # 创建推送记录
        record = PushRecord(
            task_id=task.id,
            channel_id=channel_id,
            channel_type=channel.channel_type,
            status="pending",
            max_retries=task.max_retries,
            title="",
            content="",
            content_format="text",
            recipients=[],
        )
        self.session.add(record)
        await self.session.commit()
        await self.session.refresh(record)

        # 渲染模板
        title, content = await self._render_content(task, channel, template_variables)
        record.title = title
        record.content = content
        record.content_format = self._get_content_format(channel.channel_type)
        record.recipients = self._get_recipients(channel, task.content_config)

        # 发送推送
        await self._send_with_retry(record, channel, task)

        await self.session.commit()
        await self.session.refresh(record)
        return record

    async def _render_content(
        self,
        task: PushTask,
        channel: PushChannel,
        template_variables: dict[str, Any],
    ) -> tuple[str, str]:
        """渲染推送内容。"""
        # 优先使用任务关联的模板
        if task.template_id:
            template = await self.get_template(task.template_id)
            if template:
                variables = {**template.default_values, **template_variables}
                return self.template_engine.render_title_and_content(
                    template.title_template,
                    template.content_template,
                    variables,
                )

        # 降级: 使用 content_config 中的直接内容
        title = task.content_config.get("title", "AI Research Platform Notification")
        content = task.content_config.get("content", "")

        # 尝试渲染 content 中的模板变量
        if template_variables:
            try:
                title = self.template_engine.render(title, template_variables)
                content = self.template_engine.render(content, template_variables)
            except TemplateRenderError as e:
                logger.warning("Failed to render content config template", error=str(e))

        return title, content

    def _get_content_format(self, channel_type: str) -> str:
        """根据渠道类型获取内容格式。"""
        format_map = {
            "feishu": "rich_text",
            "email": "html",
            "dingtalk": "markdown",
            "wechat_work": "markdown",
            "slack": "markdown",
        }
        return format_map.get(channel_type, "text")

    def _get_recipients(self, channel: PushChannel, content_config: dict) -> list[str]:
        """获取接收方列表。"""
        # 从渠道配置或任务配置中获取接收方
        recipients = content_config.get("recipients", [])
        if not recipients:
            recipients = channel.config.get("recipients", [])
        return recipients if isinstance(recipients, list) else [recipients]

    async def _send_with_retry(
        self,
        record: PushRecord,
        channel: PushChannel,
        task: PushTask,
    ) -> None:
        """带重试的推送发送 (指数退避策略)。"""
        channel_instance = ChannelFactory.create(channel.channel_type, channel.config)

        if not channel_instance.validate_config():
            record.status = "failed"
            record.error_message = "Invalid channel configuration"
            record.error_code = "INVALID_CONFIG"
            return

        record.status = "sending"
        record.started_at = datetime.now(timezone.utc)
        await self.session.commit()

        max_retries = task.max_retries
        retry_interval = task.retry_interval

        for attempt in range(max_retries + 1):
            record.retry_count = attempt
            if attempt > 0:
                record.status = "retrying"
                await self.session.commit()

            result = await channel_instance.send(
                title=record.title,
                content=record.content,
                recipients=record.recipients,
                content_format=record.content_format,
            )

            completed_at = datetime.now(timezone.utc)
            record.completed_at = completed_at
            if record.started_at:
                record.duration_ms = (completed_at - record.started_at).total_seconds() * 1000

            if result.success:
                record.status = "success"
                record.response_data = result.response_data
                record.error_message = None
                record.error_code = None
                logger.info(
                    "Push sent successfully",
                    record_id=record.id,
                    channel=channel.channel_type,
                    attempt=attempt,
                )
                return
            else:
                record.error_message = result.error_message
                record.error_code = result.error_code
                record.response_data = result.response_data
                logger.warning(
                    "Push send failed",
                    record_id=record.id,
                    channel=channel.channel_type,
                    attempt=attempt,
                    error=result.error_message,
                )

                if attempt < max_retries:
                    # 指数退避: retry_interval * 2^attempt
                    wait_seconds = retry_interval * (2 ** attempt)
                    record.next_retry_at = datetime.now(timezone.utc) + timedelta(seconds=wait_seconds)
                    await self.session.commit()
                    await asyncio.sleep(wait_seconds)

        # 所有重试失败
        record.status = "failed"
        logger.error(
            "Push failed after all retries",
            record_id=record.id,
            channel=channel.channel_type,
            max_retries=max_retries,
        )

    async def retry_record(self, record_id: str, max_retries: int | None = None) -> PushRecord | None:
        """重试单条推送记录。"""
        record = await self.get_record(record_id)
        if not record or record.status != "failed":
            return None

        channel = await self.get_channel(record.channel_id)
        task = await self.get_task(record.task_id)
        if not channel or not task:
            return None

        if max_retries is not None:
            record.max_retries = max_retries

        record.status = "pending"
        record.error_message = None
        record.error_code = None
        record.retry_count = 0
        await self.session.commit()

        await self._send_with_retry(record, channel, task)
        await self.session.commit()
        await self.session.refresh(record)
        return record

    async def _update_task_stats(self, task: PushTask) -> None:
        """更新任务执行统计。"""
        result = await self.session.execute(
            select(
                func.count(PushRecord.id).label("total"),
                func.sum(case((PushRecord.status == "success", 1), else_=0)).label("success"),
                func.sum(case((PushRecord.status == "failed", 1), else_=0)).label("failed"),
            ).where(PushRecord.task_id == task.id)
        )
        row = result.one()
        task.total_executions = row.total or 0
        task.success_count = row.success or 0
        task.failure_count = row.failed or 0
        task.last_executed_at = datetime.now(timezone.utc)
        await self.session.commit()

    # ============================================================
    # Statistics
    # ============================================================

    async def get_statistics(self, days: int = 30) -> dict:
        """获取推送统计数据。"""
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)

        # 总体统计
        summary_result = await self.session.execute(
            select(
                func.count(PushRecord.id).label("total"),
                func.sum(case((PushRecord.status == "success", 1), else_=0)).label("success"),
                func.sum(case((PushRecord.status == "failed", 1), else_=0)).label("failed"),
                func.sum(case((PushRecord.status == "pending", 1), else_=0)).label("pending"),
                func.sum(case((PushRecord.status == "retrying", 1), else_=0)).label("retrying"),
                func.avg(PushRecord.duration_ms).label("avg_duration"),
            ).where(PushRecord.created_at >= cutoff)
        )
        summary_row = summary_result.one()

        total = summary_row.total or 0
        success = summary_row.success or 0
        failed = summary_row.failed or 0

        # 任务统计
        task_count_result = await self.session.execute(
            select(func.count(PushTask.id))
        )
        total_tasks = task_count_result.scalar() or 0

        enabled_tasks_result = await self.session.execute(
            select(func.count(PushTask.id)).where(PushTask.is_enabled == True)
        )
        enabled_tasks = enabled_tasks_result.scalar() or 0

        # 按渠道统计
        channel_result = await self.session.execute(
            select(
                PushRecord.channel_type,
                func.count(PushRecord.id).label("total"),
                func.sum(case((PushRecord.status == "success", 1), else_=0)).label("success"),
                func.sum(case((PushRecord.status == "failed", 1), else_=0)).label("failed"),
            )
            .where(PushRecord.created_at >= cutoff)
            .group_by(PushRecord.channel_type)
        )
        by_channel = []
        for row in channel_result.all():
            ch_total = row.total or 0
            ch_success = row.success or 0
            by_channel.append({
                "channel_type": row.channel_type,
                "channel_name": row.channel_type,
                "total_count": ch_total,
                "success_count": ch_success,
                "failed_count": row.failed or 0,
                "success_rate": round((ch_success / ch_total * 100), 2) if ch_total > 0 else 0.0,
            })

        # 按任务统计
        task_result = await self.session.execute(
            select(
                PushRecord.task_id,
                PushTask.name.label("task_name"),
                func.count(PushRecord.id).label("total"),
                func.sum(case((PushRecord.status == "success", 1), else_=0)).label("success"),
                func.sum(case((PushRecord.status == "failed", 1), else_=0)).label("failed"),
                func.max(PushRecord.created_at).label("last_executed"),
            )
            .join(PushTask, PushRecord.task_id == PushTask.id, isouter=True)
            .where(PushRecord.created_at >= cutoff)
            .group_by(PushRecord.task_id, PushTask.name)
            .order_by(func.count(PushRecord.id).desc())
            .limit(10)
        )
        by_task = []
        for row in task_result.all():
            t_total = row.total or 0
            t_success = row.success or 0
            by_task.append({
                "task_id": row.task_id,
                "task_name": row.task_name or "Unknown",
                "total_count": t_total,
                "success_count": t_success,
                "failed_count": row.failed or 0,
                "success_rate": round((t_success / t_total * 100), 2) if t_total > 0 else 0.0,
                "last_executed_at": row.last_executed,
            })

        # 错误分布
        error_result = await self.session.execute(
            select(
                PushRecord.error_code,
                PushRecord.error_message,
                func.count(PushRecord.id).label("count"),
            )
            .where(
                PushRecord.status == "failed",
                PushRecord.created_at >= cutoff,
            )
            .group_by(PushRecord.error_code, PushRecord.error_message)
            .order_by(func.count(PushRecord.id).desc())
            .limit(10)
        )
        error_distribution = []
        for row in error_result.all():
            error_distribution.append({
                "error_code": row.error_code,
                "error_message": row.error_message[:100] if row.error_message else None,
                "count": row.count,
                "percentage": round((row.count / failed * 100), 2) if failed > 0 else 0.0,
            })

        # 趋势数据 (按天)
        trend_result = await self.session.execute(
            select(
                func.date(PushRecord.created_at).label("date"),
                func.count(PushRecord.id).label("total"),
                func.sum(case((PushRecord.status == "success", 1), else_=0)).label("success"),
                func.sum(case((PushRecord.status == "failed", 1), else_=0)).label("failed"),
            )
            .where(PushRecord.created_at >= cutoff)
            .group_by(func.date(PushRecord.created_at))
            .order_by(func.date(PushRecord.created_at))
        )
        trend = []
        for row in trend_result.all():
            t_total = row.total or 0
            t_success = row.success or 0
            trend.append({
                "date": str(row.date),
                "total_count": t_total,
                "success_count": t_success,
                "failed_count": row.failed or 0,
                "success_rate": round((t_success / t_total * 100), 2) if t_total > 0 else 0.0,
            })

        return {
            "summary": {
                "total_tasks": total_tasks,
                "enabled_tasks": enabled_tasks,
                "total_records": total,
                "success_count": success,
                "failed_count": failed,
                "pending_count": summary_row.pending or 0,
                "retrying_count": summary_row.retrying or 0,
                "success_rate": round((success / total * 100), 2) if total > 0 else 0.0,
                "avg_duration_ms": round(float(summary_row.avg_duration), 2) if summary_row.avg_duration else None,
            },
            "by_channel": by_channel,
            "by_task": by_task,
            "error_distribution": error_distribution,
            "trend": trend,
        }

    # ============================================================
    # Event Trigger
    # ============================================================

    async def trigger_by_event(self, event_type: str, event_data: dict[str, Any]) -> list[PushRecord]:
        """事件触发推送。

        查找所有匹配事件类型的已启用任务并执行。

        Args:
            event_type: 事件类型 (如 "weekly_report_generated")
            event_data: 事件数据 (作为模板变量)

        Returns:
            list[PushRecord]: 推送记录列表
        """
        result = await self.session.execute(
            select(PushTask).where(
                PushTask.trigger_type == "event_triggered",
                PushTask.event_type == event_type,
                PushTask.is_enabled == True,
            )
        )
        tasks = list(result.scalars().all())

        all_records = []
        for task in tasks:
            try:
                records = await self.execute_task(task.id, template_variables=event_data)
                all_records.extend(records)
            except Exception as e:
                logger.error(
                    "Event-triggered push failed",
                    task_id=task.id,
                    event_type=event_type,
                    error=str(e),
                )

        return all_records
