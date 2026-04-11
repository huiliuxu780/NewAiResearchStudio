"""数据库事务管理"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession


@asynccontextmanager
async def transaction(session: AsyncSession) -> AsyncGenerator[AsyncSession, None]:
    """事务上下文管理器

    用法:
        async with transaction(session) as txn:
            txn.add(model)
            await txn.flush()
            await txn.refresh(model)
        # 自动 commit，异常时自动 rollback

    注意:
        - 在上下文内使用 flush() 而非 commit()
        - 异常时自动 rollback 并重新抛出异常
        - 查询操作不需要事务
    """
    try:
        yield session
        await session.commit()
    except Exception:
        await session.rollback()
        raise
