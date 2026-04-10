import math
from typing import TypeVar

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.base import Base

ModelType = TypeVar("ModelType", bound=Base)


async def get_paginated(
    session: AsyncSession,
    model: type[ModelType],
    page: int = 1,
    page_size: int = 20,
    filters: list | None = None,
    order_by: list | None = None,
) -> tuple[list[ModelType], int, int]:
    filters = filters or []
    order_by = order_by or []

    query = select(model)
    for f in filters:
        query = query.where(f)

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await session.execute(count_query)
    total = total_result.scalar() or 0

    total_pages = math.ceil(total / page_size) if total > 0 else 1

    query = query.offset((page - 1) * page_size).limit(page_size)
    for order in order_by:
        query = query.order_by(order)

    result = await session.execute(query)
    items = list(result.scalars().all())

    return items, total, total_pages