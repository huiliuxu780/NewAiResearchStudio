"""Push notification API routers."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from schemas import (
    PushChannelCreate,
    PushChannelListResponse,
    PushChannelResponse,
    PushChannelUpdate,
    PushErrorDistribution,
    PushRecordListResponse,
    PushRecordResponse,
    PushRecordRetryRequest,
    PushStatsByChannel,
    PushStatsByTask,
    PushStatsResponse,
    PushStatsSummary,
    PushTaskCreate,
    PushTaskListResponse,
    PushTaskResponse,
    PushTaskTriggerRequest,
    PushTaskUpdate,
    PushTemplateCreate,
    PushTemplateListResponse,
    PushTemplatePreviewRequest,
    PushTemplatePreviewResponse,
    PushTemplateResponse,
    PushTemplateUpdate,
    PushTrendPoint,
    SuccessResponse,
)
from services import get_session
from services.push.push_service import PushService
from services.push.scheduler import push_scheduler

router = APIRouter(prefix="/push", tags=["push"])


# ============================================================
# Push Channel APIs
# ============================================================

@router.post("/channels", response_model=PushChannelResponse, status_code=201)
async def create_channel(
    data: PushChannelCreate,
    session: AsyncSession = Depends(get_session),
):
    """创建推送渠道配置。"""
    service = PushService(session)
    channel_data = data.model_dump()
    channel = await service.create_channel(channel_data)
    return PushChannelResponse.model_validate(channel)


@router.get("/channels", response_model=PushChannelListResponse)
async def list_channels(
    channel_type: str | None = Query(None, description="渠道类型过滤"),
    is_enabled: bool | None = Query(None, description="启用状态过滤"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    session: AsyncSession = Depends(get_session),
):
    """分页查询推送渠道列表。"""
    service = PushService(session)
    items, total = await service.list_channels(
        channel_type=channel_type,
        is_enabled=is_enabled,
        page=page,
        page_size=page_size,
    )
    return PushChannelListResponse(
        items=[PushChannelResponse.model_validate(c) for c in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/channels/{channel_id}", response_model=PushChannelResponse)
async def get_channel(channel_id: str, session: AsyncSession = Depends(get_session)):
    """获取推送渠道详情。"""
    service = PushService(session)
    channel = await service.get_channel(channel_id)
    if not channel:
        raise HTTPException(status_code=404, detail="Push channel not found")
    return PushChannelResponse.model_validate(channel)


@router.put("/channels/{channel_id}", response_model=PushChannelResponse)
async def update_channel(
    channel_id: str,
    data: PushChannelUpdate,
    session: AsyncSession = Depends(get_session),
):
    """更新推送渠道配置。"""
    service = PushService(session)
    channel = await service.update_channel(channel_id, data.model_dump(exclude_unset=True))
    if not channel:
        raise HTTPException(status_code=404, detail="Push channel not found")
    return PushChannelResponse.model_validate(channel)


@router.delete("/channels/{channel_id}", response_model=SuccessResponse)
async def delete_channel(channel_id: str, session: AsyncSession = Depends(get_session)):
    """删除推送渠道配置。"""
    service = PushService(session)
    success = await service.delete_channel(channel_id)
    if not success:
        raise HTTPException(status_code=404, detail="Push channel not found")
    return SuccessResponse(message="Push channel deleted successfully")


# ============================================================
# Push Task APIs
# ============================================================

@router.post("/tasks", response_model=PushTaskResponse, status_code=201)
async def create_task(
    data: PushTaskCreate,
    session: AsyncSession = Depends(get_session),
):
    """创建推送任务。"""
    service = PushService(session)
    task_data = data.model_dump()
    task = await service.create_task(task_data)

    # 如果是定时任务且有 cron 表达式, 注册到调度器
    if task.trigger_type == "scheduled" and task.cron_expression and task.is_enabled:
        try:
            push_scheduler.add_cron_job(
                job_id=task.id,
                func=_execute_push_task,
                cron_expression=task.cron_expression,
                task_id=task.id,
            )
        except ValueError as e:
            raise HTTPException(status_code=400, detail=f"Invalid cron expression: {str(e)}")

    return PushTaskResponse.model_validate(task)


@router.get("/tasks", response_model=PushTaskListResponse)
async def list_tasks(
    trigger_type: str | None = Query(None, description="触发方式过滤"),
    status: str | None = Query(None, description="状态过滤"),
    is_enabled: bool | None = Query(None, description="启用状态过滤"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    session: AsyncSession = Depends(get_session),
):
    """分页查询推送任务列表。"""
    service = PushService(session)
    items, total = await service.list_tasks(
        trigger_type=trigger_type,
        status=status,
        is_enabled=is_enabled,
        page=page,
        page_size=page_size,
    )
    return PushTaskListResponse(
        items=[PushTaskResponse.model_validate(t) for t in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/tasks/{task_id}", response_model=PushTaskResponse)
async def get_task(task_id: str, session: AsyncSession = Depends(get_session)):
    """获取推送任务详情。"""
    service = PushService(session)
    task = await service.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Push task not found")
    return PushTaskResponse.model_validate(task)


@router.put("/tasks/{task_id}", response_model=PushTaskResponse)
async def update_task(
    task_id: str,
    data: PushTaskUpdate,
    session: AsyncSession = Depends(get_session),
):
    """更新推送任务配置。"""
    service = PushService(session)
    task = await service.update_task(task_id, data.model_dump(exclude_unset=True))
    if not task:
        raise HTTPException(status_code=404, detail="Push task not found")
    return PushTaskResponse.model_validate(task)


@router.post("/tasks/{task_id}/enable", response_model=PushTaskResponse)
async def enable_task(task_id: str, session: AsyncSession = Depends(get_session)):
    """启用推送任务。"""
    service = PushService(session)
    task = await service.toggle_task(task_id, is_enabled=True)
    if not task:
        raise HTTPException(status_code=404, detail="Push task not found")

    # 注册到调度器
    if task.trigger_type == "scheduled" and task.cron_expression:
        push_scheduler.add_cron_job(
            job_id=task.id,
            func=_execute_push_task,
            cron_expression=task.cron_expression,
            task_id=task.id,
        )

    return PushTaskResponse.model_validate(task)


@router.post("/tasks/{task_id}/disable", response_model=PushTaskResponse)
async def disable_task(task_id: str, session: AsyncSession = Depends(get_session)):
    """禁用推送任务。"""
    service = PushService(session)
    task = await service.toggle_task(task_id, is_enabled=False)
    if not task:
        raise HTTPException(status_code=404, detail="Push task not found")

    # 从调度器移除
    push_scheduler.remove_job(task_id)

    return PushTaskResponse.model_validate(task)


@router.post("/tasks/{task_id}/trigger", response_model=list[PushRecordResponse])
async def trigger_task(
    task_id: str,
    data: PushTaskTriggerRequest | None = None,
    session: AsyncSession = Depends(get_session),
):
    """手动触发推送任务。"""
    service = PushService(session)
    data = data or PushTaskTriggerRequest()
    try:
        records = await service.execute_task(
            task_id=task_id,
            template_variables=data.template_variables,
            override_channel_ids=data.channel_ids,
        )
        return [PushRecordResponse.model_validate(r) for r in records]
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/tasks/{task_id}", response_model=SuccessResponse)
async def delete_task(task_id: str, session: AsyncSession = Depends(get_session)):
    """删除推送任务。"""
    service = PushService(session)
    success = await service.delete_task(task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Push task not found")

    # 从调度器移除
    push_scheduler.remove_job(task_id)

    return SuccessResponse(message="Push task deleted successfully")


# ============================================================
# Push Record APIs
# ============================================================

@router.get("/records", response_model=PushRecordListResponse)
async def list_records(
    task_id: str | None = Query(None, description="任务ID过滤"),
    channel_id: str | None = Query(None, description="渠道ID过滤"),
    status: str | None = Query(None, description="状态过滤"),
    channel_type: str | None = Query(None, description="渠道类型过滤"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    session: AsyncSession = Depends(get_session),
):
    """分页查询推送记录列表。"""
    service = PushService(session)
    items, total = await service.list_records(
        task_id=task_id,
        channel_id=channel_id,
        status=status,
        channel_type=channel_type,
        page=page,
        page_size=page_size,
    )
    return PushRecordListResponse(
        items=[PushRecordResponse.model_validate(r) for r in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/records/{record_id}", response_model=PushRecordResponse)
async def get_record(record_id: str, session: AsyncSession = Depends(get_session)):
    """获取推送记录详情。"""
    service = PushService(session)
    record = await service.get_record(record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Push record not found")
    return PushRecordResponse.model_validate(record)


@router.post("/records/{record_id}/retry", response_model=PushRecordResponse)
async def retry_record(
    record_id: str,
    data: PushRecordRetryRequest | None = None,
    session: AsyncSession = Depends(get_session),
):
    """重试失败的推送记录。"""
    service = PushService(session)
    max_retries = data.max_retries if data else None
    record = await service.retry_record(record_id, max_retries=max_retries)
    if not record:
        raise HTTPException(
            status_code=400,
            detail="Record not found or not in failed status",
        )
    return PushRecordResponse.model_validate(record)


# ============================================================
# Push Template APIs
# ============================================================

@router.post("/templates", response_model=PushTemplateResponse, status_code=201)
async def create_template(
    data: PushTemplateCreate,
    session: AsyncSession = Depends(get_session),
):
    """创建推送模板。"""
    service = PushService(session)
    template_data = data.model_dump()
    template = await service.create_template(template_data)
    return PushTemplateResponse.model_validate(template)


@router.get("/templates", response_model=PushTemplateListResponse)
async def list_templates(
    is_enabled: bool | None = Query(None, description="启用状态过滤"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    session: AsyncSession = Depends(get_session),
):
    """分页查询推送模板列表。"""
    service = PushService(session)
    items, total = await service.list_templates(
        is_enabled=is_enabled,
        page=page,
        page_size=page_size,
    )
    return PushTemplateListResponse(
        items=[PushTemplateResponse.model_validate(t) for t in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/templates/{template_id}", response_model=PushTemplateResponse)
async def get_template(template_id: str, session: AsyncSession = Depends(get_session)):
    """获取推送模板详情。"""
    service = PushService(session)
    template = await service.get_template(template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Push template not found")
    return PushTemplateResponse.model_validate(template)


@router.put("/templates/{template_id}", response_model=PushTemplateResponse)
async def update_template(
    template_id: str,
    data: PushTemplateUpdate,
    session: AsyncSession = Depends(get_session),
):
    """更新推送模板。"""
    service = PushService(session)
    template = await service.update_template(template_id, data.model_dump(exclude_unset=True))
    if not template:
        raise HTTPException(status_code=404, detail="Push template not found")
    return PushTemplateResponse.model_validate(template)


@router.delete("/templates/{template_id}", response_model=SuccessResponse)
async def delete_template(template_id: str, session: AsyncSession = Depends(get_session)):
    """删除推送模板。"""
    service = PushService(session)
    try:
        success = await service.delete_template(template_id)
        if not success:
            raise HTTPException(status_code=404, detail="Push template not found")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return SuccessResponse(message="Push template deleted successfully")


@router.post("/templates/{template_id}/preview", response_model=PushTemplatePreviewResponse)
async def preview_template(
    template_id: str,
    data: PushTemplatePreviewRequest,
    session: AsyncSession = Depends(get_session),
):
    """预览模板渲染结果。"""
    service = PushService(session)
    template = await service.get_template(template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Push template not found")

    try:
        rendered_title, rendered_content = service.preview_template(template, data.variables)
        return PushTemplatePreviewResponse(
            rendered_title=rendered_title,
            rendered_content=rendered_content,
            content_format=template.content_format,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Template render error: {str(e)}")


# ============================================================
# Push Statistics APIs
# ============================================================

@router.get("/stats", response_model=PushStatsResponse)
async def get_statistics(
    days: int = Query(30, ge=1, le=365, description="统计天数"),
    session: AsyncSession = Depends(get_session),
):
    """获取推送统计数据。"""
    service = PushService(session)
    stats = await service.get_statistics(days=days)

    return PushStatsResponse(
        summary=PushStatsSummary(**stats["summary"]),
        by_channel=[PushStatsByChannel(**c) for c in stats["by_channel"]],
        by_task=[PushStatsByTask(**t) for t in stats["by_task"]],
        error_distribution=[PushErrorDistribution(**e) for e in stats["error_distribution"]],
        trend=[PushTrendPoint(**t) for t in stats["trend"]],
    )


# ============================================================
# Event Trigger API
# ============================================================

@router.post("/events/trigger", response_model=list[PushRecordResponse])
async def trigger_event(
    event_type: str,
    event_data: dict,
    session: AsyncSession = Depends(get_session),
):
    """事件触发推送。

    用于外部系统调用, 如周报生成后触发推送。
    """
    service = PushService(session)
    records = await service.trigger_by_event(event_type, event_data)
    return [PushRecordResponse.model_validate(r) for r in records]


# ============================================================
# Internal helper for scheduler
# ============================================================

async def _execute_push_task(task_id: str) -> None:
    """调度器回调函数 - 执行推送任务。

    此函数由 APScheduler 调用, 需要创建独立的数据库 session。
    """
    from services import async_session
    from utils.logging import get_logger

    logger = get_logger(__name__)
    logger.info("Scheduled push task executing", task_id=task_id)

    async with async_session() as db_session:
        service = PushService(db_session)
        try:
            await service.execute_task(task_id)
            logger.info("Scheduled push task completed", task_id=task_id)
        except Exception as e:
            logger.error("Scheduled push task failed", task_id=task_id, error=str(e))
            raise
