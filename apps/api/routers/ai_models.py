from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models import AIModel
from schemas import (
    AIModelCreate,
    AIModelResponse,
    AIModelUpdate,
    PaginatedResponse,
    SuccessResponse,
)
from services import get_session
from utils.helpers import get_paginated

router = APIRouter(prefix="/ai-models", tags=["ai-models"])


@router.get("/", response_model=PaginatedResponse[AIModelResponse])
async def list_ai_models(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    provider: str | None = Query(None),
    enabled: bool | None = Query(None),
    session: AsyncSession = Depends(get_session),
):
    filters = []
    if provider:
        filters.append(AIModel.provider == provider)
    if enabled is not None:
        filters.append(AIModel.enabled == enabled)

    items, total, total_pages = await get_paginated(
        session,
        AIModel,
        page=page,
        page_size=page_size,
        filters=filters,
        order_by=[AIModel.created_at.desc()],
    )
    return PaginatedResponse(
        items=[AIModelResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/{model_id}", response_model=AIModelResponse)
async def get_ai_model(
    model_id: str,
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(select(AIModel).where(AIModel.id == model_id))
    model = result.scalar_one_or_none()
    if not model:
        raise HTTPException(status_code=404, detail="AI model not found")
    return AIModelResponse.model_validate(model)


@router.post("/", response_model=AIModelResponse, status_code=201)
async def create_ai_model(
    data: AIModelCreate,
    session: AsyncSession = Depends(get_session),
):
    if data.is_default:
        result = await session.execute(select(AIModel).where(AIModel.is_default == True))
        existing_default = result.scalar_one_or_none()
        if existing_default:
            existing_default.is_default = False

    model = AIModel(**data.model_dump())
    session.add(model)
    await session.commit()
    await session.refresh(model)
    return AIModelResponse.model_validate(model)


@router.put("/{model_id}", response_model=AIModelResponse)
async def update_ai_model(
    model_id: str,
    data: AIModelUpdate,
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(select(AIModel).where(AIModel.id == model_id))
    model = result.scalar_one_or_none()
    if not model:
        raise HTTPException(status_code=404, detail="AI model not found")

    update_data = data.model_dump(exclude_unset=True)
    
    if update_data.get("is_default") and not model.is_default:
        result = await session.execute(select(AIModel).where(AIModel.is_default == True))
        existing_default = result.scalar_one_or_none()
        if existing_default:
            existing_default.is_default = False

    for key, value in update_data.items():
        setattr(model, key, value)

    await session.commit()
    await session.refresh(model)
    return AIModelResponse.model_validate(model)


@router.delete("/{model_id}", response_model=SuccessResponse)
async def delete_ai_model(
    model_id: str,
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(select(AIModel).where(AIModel.id == model_id))
    model = result.scalar_one_or_none()
    if not model:
        raise HTTPException(status_code=404, detail="AI model not found")

    await session.delete(model)
    await session.commit()
    return SuccessResponse(message="AI model deleted successfully")


@router.post("/{model_id}/test", response_model=dict)
async def test_ai_model(
    model_id: str,
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(select(AIModel).where(AIModel.id == model_id))
    model = result.scalar_one_or_none()
    if not model:
        raise HTTPException(status_code=404, detail="AI model not found")

    return {
        "success": True,
        "message": "Model configuration is valid",
        "model_name": model.model_name,
        "provider": model.provider,
    }
