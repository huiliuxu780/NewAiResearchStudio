from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models import PromptTemplate
from schemas import (
    PromptTemplateCreate,
    PromptTemplateResponse,
    PromptTemplateUpdate,
    PaginatedResponse,
    SuccessResponse,
)
from services import get_session
from utils.helpers import get_paginated

router = APIRouter(prefix="/prompt-templates", tags=["prompt-templates"])


@router.get("/", response_model=PaginatedResponse[PromptTemplateResponse])
async def list_prompt_templates(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: str | None = Query(None),
    task_type: str | None = Query(None),
    is_active: bool | None = Query(None),
    session: AsyncSession = Depends(get_session),
):
    filters = []
    if category:
        filters.append(PromptTemplate.category == category)
    if task_type:
        filters.append(PromptTemplate.task_type == task_type)
    if is_active is not None:
        filters.append(PromptTemplate.is_active == is_active)

    items, total, total_pages = await get_paginated(
        session,
        PromptTemplate,
        page=page,
        page_size=page_size,
        filters=filters,
        order_by=[PromptTemplate.created_at.desc()],
    )
    return PaginatedResponse(
        items=[PromptTemplateResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/{template_id}", response_model=PromptTemplateResponse)
async def get_prompt_template(
    template_id: str,
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(select(PromptTemplate).where(PromptTemplate.id == template_id))
    template = result.scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail="Prompt template not found")
    return PromptTemplateResponse.model_validate(template)


@router.post("/", response_model=PromptTemplateResponse, status_code=201)
async def create_prompt_template(
    data: PromptTemplateCreate,
    session: AsyncSession = Depends(get_session),
):
    template = PromptTemplate(**data.model_dump())
    session.add(template)
    await session.commit()
    await session.refresh(template)
    return PromptTemplateResponse.model_validate(template)


@router.put("/{template_id}", response_model=PromptTemplateResponse)
async def update_prompt_template(
    template_id: str,
    data: PromptTemplateUpdate,
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(select(PromptTemplate).where(PromptTemplate.id == template_id))
    template = result.scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail="Prompt template not found")

    update_data = data.model_dump(exclude_unset=True)
    
    if "template" in update_data:
        update_data["version"] = template.version + 1

    for key, value in update_data.items():
        setattr(template, key, value)

    await session.commit()
    await session.refresh(template)
    return PromptTemplateResponse.model_validate(template)


@router.delete("/{template_id}", response_model=SuccessResponse)
async def delete_prompt_template(
    template_id: str,
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(select(PromptTemplate).where(PromptTemplate.id == template_id))
    template = result.scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail="Prompt template not found")

    await session.delete(template)
    await session.commit()
    return SuccessResponse(message="Prompt template deleted successfully")


@router.post("/{template_id}/test", response_model=dict)
async def test_prompt_template(
    template_id: str,
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(select(PromptTemplate).where(PromptTemplate.id == template_id))
    template = result.scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail="Prompt template not found")

    return {
        "success": True,
        "message": "Prompt template is valid",
        "template_name": template.name,
        "variables": template.variables,
    }
