from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.source import Source
from schemas.source import SourceCreate, SourceUpdate, SourceFilter
from utils.helpers import get_paginated


class SourceService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_list(
        self,
        page: int = 1,
        page_size: int = 20,
        filters: SourceFilter | None = None,
    ) -> tuple[list[Source], int, int]:
        filter_conditions = []
        if filters:
            if filters.company:
                filter_conditions.append(Source.company == filters.company)
            if filters.source_type:
                filter_conditions.append(Source.source_type == filters.source_type)
            if filters.enabled is not None:
                filter_conditions.append(Source.enabled == filters.enabled)
            if filters.priority:
                filter_conditions.append(Source.priority == filters.priority)

        return await get_paginated(
            self.session,
            Source,
            page=page,
            page_size=page_size,
            filters=filter_conditions,
            order_by=[Source.created_at.desc()],
        )

    async def get_by_id(self, source_id: str) -> Source | None:
        result = await self.session.execute(
            select(Source).where(Source.id == source_id)
        )
        return result.scalar_one_or_none()

    async def create(self, data: SourceCreate) -> Source:
        source = Source(**data.model_dump())
        self.session.add(source)
        await self.session.commit()
        await self.session.refresh(source)
        return source

    async def update(self, source_id: str, data: SourceUpdate) -> Source | None:
        source = await self.get_by_id(source_id)
        if not source:
            return None

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(source, key, value)

        await self.session.commit()
        await self.session.refresh(source)
        return source

    async def delete(self, source_id: str) -> bool:
        source = await self.get_by_id(source_id)
        if not source:
            return False

        await self.session.delete(source)
        await self.session.commit()
        return True