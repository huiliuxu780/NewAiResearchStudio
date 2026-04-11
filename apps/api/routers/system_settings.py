from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from models.system_settings import SettingCategory
from schemas import (
    SuccessResponse,
    SystemSettingsByCategory,
    SystemSettingsResponse,
    SystemSettingsUpdate,
)
from services import SystemSettingsService, get_session

router = APIRouter(prefix="/settings", tags=["system-settings"])


@router.get("/", response_model=list[SystemSettingsByCategory])
async def get_all_settings(
    session: AsyncSession = Depends(get_session),
):
    service = SystemSettingsService(session)
    grouped = await service.get_all_settings_grouped()

    result = []
    for category, settings in grouped.items():
        result.append(
            SystemSettingsByCategory(
                category=category,
                settings=[
                    SystemSettingsResponse.model_validate(s) for s in settings
                ],
            )
        )

    return result


@router.get("/{category}", response_model=list[SystemSettingsResponse])
async def get_settings_by_category(
    category: str,
    session: AsyncSession = Depends(get_session),
):
    try:
        category_enum = SettingCategory(category)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid category: {category}. Valid categories: {[c.value for c in SettingCategory]}",
        )

    service = SystemSettingsService(session)
    settings = await service.get_settings_by_category(category_enum)

    if not settings:
        raise HTTPException(
            status_code=404,
            detail=f"No settings found for category: {category}",
        )

    return [SystemSettingsResponse.model_validate(s) for s in settings]


@router.put("/{category}", response_model=list[SystemSettingsResponse])
async def update_settings_by_category(
    category: str,
    updates: dict[str, str],
    session: AsyncSession = Depends(get_session),
):
    try:
        category_enum = SettingCategory(category)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid category: {category}. Valid categories: {[c.value for c in SettingCategory]}",
        )

    service = SystemSettingsService(session)
    updated = await service.update_settings(category_enum, updates)

    if not updated:
        raise HTTPException(
            status_code=404,
            detail=f"No settings found to update for category: {category}",
        )

    return [SystemSettingsResponse.model_validate(s) for s in updated]


@router.get("/{category}/{key}", response_model=SystemSettingsResponse)
async def get_setting(
    category: str,
    key: str,
    session: AsyncSession = Depends(get_session),
):
    try:
        category_enum = SettingCategory(category)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid category: {category}. Valid categories: {[c.value for c in SettingCategory]}",
        )

    service = SystemSettingsService(session)
    setting = await service.get_setting(category_enum, key)

    if not setting:
        raise HTTPException(
            status_code=404,
            detail=f"Setting not found: {category}/{key}",
        )

    return SystemSettingsResponse.model_validate(setting)


@router.put("/{category}/{key}", response_model=SystemSettingsResponse)
async def update_setting(
    category: str,
    key: str,
    data: SystemSettingsUpdate,
    session: AsyncSession = Depends(get_session),
):
    try:
        category_enum = SettingCategory(category)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid category: {category}. Valid categories: {[c.value for c in SettingCategory]}",
        )

    service = SystemSettingsService(session)
    updated = await service.update_setting(category_enum, key, data)

    if not updated:
        raise HTTPException(
            status_code=404,
            detail=f"Setting not found: {category}/{key}",
        )

    return SystemSettingsResponse.model_validate(updated)
