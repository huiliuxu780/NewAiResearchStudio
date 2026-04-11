import asyncio
from sqlalchemy import text
from services import async_session


async def add_columns():
    async with async_session() as session:
        try:
            await session.execute(text('ALTER TABLE sources ADD COLUMN crawl_strategy VARCHAR(50) DEFAULT "single_page"'))
            print("Added crawl_strategy column")
        except Exception as e:
            print(f"crawl_strategy column may already exist: {e}")

        try:
            await session.execute(text('ALTER TABLE sources ADD COLUMN crawl_config JSON DEFAULT "{}"'))
            print("Added crawl_config column")
        except Exception as e:
            print(f"crawl_config column may already exist: {e}")

        try:
            await session.execute(text('ALTER TABLE sources ADD COLUMN social_platform VARCHAR(50)'))
            print("Added social_platform column")
        except Exception as e:
            print(f"social_platform column may already exist: {e}")

        try:
            await session.execute(text('ALTER TABLE sources ADD COLUMN social_account_id VARCHAR(200)'))
            print("Added social_account_id column")
        except Exception as e:
            print(f"social_account_id column may already exist: {e}")

        await session.commit()
        print("All columns added successfully!")


if __name__ == "__main__":
    asyncio.run(add_columns())
