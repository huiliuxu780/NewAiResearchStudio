"""数据库索引迁移脚本

为已有数据库添加高频查询字段索引。
新数据库通过 SQLAlchemy create_all 自动创建索引，无需执行此脚本。

用法:
    python migrations/add_indexes.py
"""

import asyncio
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text

from services.database import engine


INDEX_DDL = [
    # sources 表索引
    "CREATE INDEX IF NOT EXISTS ix_sources_company ON sources(company)",
    "CREATE INDEX IF NOT EXISTS ix_sources_enabled ON sources(enabled)",
    "CREATE INDEX IF NOT EXISTS ix_sources_source_type ON sources(source_type)",

    # facts 表索引
    "CREATE INDEX IF NOT EXISTS ix_facts_company ON facts(company)",
    "CREATE INDEX IF NOT EXISTS ix_facts_review_status ON facts(review_status)",
    "CREATE INDEX IF NOT EXISTS ix_facts_created_at ON facts(created_at)",
    "CREATE INDEX IF NOT EXISTS ix_facts_raw_record_id ON facts(raw_record_id)",

    # raw_records 表索引
    "CREATE INDEX IF NOT EXISTS ix_raw_records_company ON raw_records(company)",
    "CREATE INDEX IF NOT EXISTS ix_raw_records_crawl_status ON raw_records(crawl_status)",
    "CREATE INDEX IF NOT EXISTS ix_raw_records_source_id ON raw_records(source_id)",
    "CREATE INDEX IF NOT EXISTS ix_raw_records_content_hash ON raw_records(content_hash)",
]


async def add_indexes() -> None:
    """执行索引创建"""
    async with engine.begin() as conn:
        for ddl in INDEX_DDL:
            try:
                await conn.execute(text(ddl))
                index_name = ddl.split("ix_")[1].split(" ")[0]
                print(f"  [OK] ix_{index_name}")
            except Exception as e:
                # 索引已存在或其他错误
                if "already exists" in str(e).lower():
                    index_name = ddl.split("ix_")[1].split(" ")[0]
                    print(f"  [SKIP] ix_{index_name} (already exists)")
                else:
                    print(f"  [WARN] {ddl.split('ix_')[1].split(' ')[0]}: {e}")


async def main() -> None:
    print("Starting index migration...")
    await add_indexes()
    print("Index migration completed.")
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
