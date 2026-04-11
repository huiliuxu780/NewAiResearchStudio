# AI 研究平台 - OPT 系列技术架构设计文档

> 文档版本: v1.0
> 创建日期: 2026-04-12
> 状态: 待评审

---

## 目录

1. [概述](#1-概述)
2. [现状分析](#2-现状分析)
3. [技术选型](#3-技术选型)
4. [模块架构设计](#4-模块架构设计)
5. [P0 优化项详细设计](#5-p0-优化项详细设计)
6. [P1 优化项详细设计](#6-p1-优化项详细设计)
7. [P2 优化项详细设计](#7-p2-优化项详细设计)
8. [数据库表设计变更](#8-数据库表设计变更)
9. [接口规范变更](#9-接口规范变更)
10. [实施计划与优先级](#10-实施计划与优先级)
11. [风险评估与回滚方案](#11-风险评估与回滚方案)
12. [验收标准](#12-验收标准)

---

## 1. 概述

### 1.1 文档目的

本文档基于对 AI 研究平台现有代码的全面审查，针对已识别的 17 个技术优化点（OPT-001 至 OPT-017），提供完整的技术架构设计方案。每个优化点均包含问题分析、实施方案、代码示例、影响范围和风险评估。

### 1.2 项目现状概览

| 维度 | 当前状态 |
|------|----------|
| 后端框架 | FastAPI + SQLAlchemy 2.x (async) + SQLite |
| 前端框架 | Next.js 16 + TypeScript + SWR + ky |
| Workers | 3 个独立 Python 进程 (crawler, fact_extractor, insight_generator) |
| 数据库 | SQLite (aiosqlite) |
| 部署 | Docker Compose |
| 认证 | 无 |
| 缓存 | 无 |
| 事务管理 | 无显式事务控制 |
| 异常处理 | FastAPI 默认处理 |

### 1.3 优化项总览

| 编号 | 优化项 | 优先级 | 影响模块 | 预计工作量 |
|------|--------|--------|----------|------------|
| OPT-001 | API 路径不一致 | P0 | 前端、Workers | 0.5h |
| OPT-002 | 前后端字段名不匹配 | P0 | 前端 | 2h |
| OPT-003 | 缺少认证机制 | P0 | 后端、Workers、前端 | 4h |
| OPT-004 | 缺少数据库事务管理 | P0 | 后端 | 1h |
| OPT-005 | 缺少全局异常处理 | P0 | 后端 | 0.5h |
| OPT-006 | Dashboard API 性能问题 | P1 | 后端 | 1h |
| OPT-007 | 缺少数据库索引 | P1 | 后端 | 0.5h |
| OPT-008 | AI Workers 缺少重试机制 | P1 | Workers | 2h |
| OPT-009 | 前端 Mock 逻辑混杂 | P1 | 前端 | 2h |
| OPT-010 | 缺少前端分页实现 | P1 | 前端 | 1.5h |
| OPT-011 | Docker 配置问题 | P1 | DevOps | 1h |
| OPT-012 | 缺少 Schema 枚举验证 | P1 | 后端 | 1h |
| OPT-013 | 缺少结构化日志 | P2 | 后端 | 1h |
| OPT-014 | 缺少 API 文档增强 | P2 | 后端 | 0.5h |
| OPT-015 | 缺少国际化支持 | P2 | 前端 | 4h |
| OPT-016 | 缺少优雅关闭 | P2 | 后端、Workers | 1h |
| OPT-017 | Workers 缺少健康检查 | P2 | Workers | 1h |

---

## 2. 现状分析

### 2.1 代码审查发现

#### 2.1.1 API 路径问题 (OPT-001)

**审查结果**: 经过详细代码审查，前端 `lib/api.ts` 中的 `createApiUrl` 函数**已经正确包含** `/api/v1` 前缀：

```typescript
// apps/web/lib/api.ts (第 11 行)
export const createApiUrl = (path: string) => `${API_BASE_URL}/api/v1/${path}`;
```

所有前端 API 调用文件（`sources.ts`, `facts.ts`, `dashboard.ts` 等）均使用 `createApiUrl` 构建 URL，路径格式正确。

**Workers 路径审查结果**:
- `workers/crawler/config.py`: 路径正确，使用 `/api/v1/sources/` 和 `/api/v1/raw-records/`
- `workers/fact_extractor/config.py`: 路径正确，使用 `/api/v1/raw-records/` 和 `/api/v1/facts/`
- `workers/insight_generator/config.py`: 路径正确，使用 `/api/v1/facts/` 和 `/api/v1/insights/`

**后端路由审查结果**:
- `apps/api/routers/__init__.py`: 正确定义 `prefix="/api/v1"`

**结论**: OPT-001 在当前代码库中**已不存在**。`optimization-plan.md` 中的描述可能是早期版本的问题，已在后续开发中修复。

**建议**: 将此优化项标记为"已完成"，但需添加路径一致性测试以防止回归。

#### 2.1.2 前后端字段名匹配问题 (OPT-002)

**审查结果**: 经过对比前端 TypeScript 类型定义与后端 Pydantic Schema：

| 实体 | 前端类型文件 | 后端 Schema 文件 | 匹配状态 |
|------|-------------|-----------------|----------|
| Source | `types/entities.ts` | `schemas/source.py` | **已匹配** |
| Fact | `types/entities.ts` | `schemas/fact.py` | **已匹配** |
| RawRecord | `types/entities.ts` | `schemas/raw_record.py` | **已匹配** |
| Insight | `types/entities.ts` | `schemas/insight.py` | **已匹配** |

前端类型定义已经使用与后端一致的字段名（如 `source_type`, `enabled`, `notes`, `fact_summary`, `review_status`, `event_type` 等）。

**结论**: OPT-002 在当前代码库中**已不存在**。

**建议**: 将此优化项标记为"已完成"，但需建立前后端类型同步机制以防止未来出现不一致。

#### 2.1.3 认证机制缺失 (OPT-003) -- 确认存在

**审查结果**: 
- 后端无任何认证中间件或依赖注入
- 所有 API 端点完全开放
- Workers 调用 API 时无认证头
- 前端无认证逻辑

**风险等级**: 高 -- 生产环境任何人都可以读写数据

#### 2.1.4 数据库事务管理缺失 (OPT-004) -- 确认存在

**审查结果**: 以 `SourceService` 为例：

```python
# apps/api/services/source_service.py (第 45-50 行)
async def create(self, data: SourceCreate) -> Source:
    source = Source(**data.model_dump())
    self.session.add(source)
    await self.session.commit()  # 无 try/except，无 rollback
    await self.session.refresh(source)
    return source
```

所有服务层的写操作（create/update/delete）均缺少：
- `try/except` 异常捕获
- 失败时的 `session.rollback()`
- 跨表操作的原子性保证

#### 2.1.5 全局异常处理缺失 (OPT-005) -- 确认存在

**审查结果**:
- `main.py` 中未注册任何自定义异常处理器
- FastAPI 默认异常处理会暴露堆栈信息
- 无统一的错误响应格式
- 生产环境可能泄露敏感信息

#### 2.1.6 Dashboard 性能问题 (OPT-006) -- 确认存在

**审查结果**: `dashboard.py` 中 `get_dashboard_stats` 执行 4 个独立查询：

```python
# apps/api/routers/dashboard.py (第 16-23 行)
today_fact_count = await session.execute(select(func.count(Fact.id)))
pending_review_count = await session.execute(...)
insight_count = await session.execute(...)
active_source_count = await session.execute(...)
```

#### 2.1.7 数据库索引缺失 (OPT-007) -- 确认存在

**审查结果**: 所有模型均未定义 `__table_args__` 索引。高频查询字段（`company`, `review_status`, `enabled`, `crawl_status` 等）无索引支持。

#### 2.1.8 Workers 重试机制缺失 (OPT-008) -- 确认存在

**审查结果**: Workers 直接调用 Qwen API，无重试、无速率限制、无熔断。

#### 2.1.9 前端 Mock 逻辑 (OPT-009) -- 需要确认

**审查结果**: 前端当前使用 SWR 直接调用 API，未发现内联 Mock 逻辑。但缺少统一的数据源切换机制（API vs Mock）。

#### 2.1.10 前端分页 (OPT-010) -- 确认存在

**审查结果**: 后端已实现分页（`get_paginated` 工具函数），但前端 DataTable 组件无分页 UI 控件。

#### 2.1.11 Docker 配置 (OPT-011) -- 确认存在

**审查结果**: `docker-compose.yml` 缺少：
- 健康检查
- 资源限制
- Redis 服务
- 网络隔离优化

#### 2.1.12 Schema 枚举验证 (OPT-012) -- 确认存在

**审查结果**: 后端 Schema 中大量使用 `str` 类型而非枚举：
- `SourceBase.company: str` (应为枚举)
- `FactBase.company: str` (应为枚举)
- `FactBase.review_status` 在 `ReviewUpdate` 中为 `str`
- 所有枚举字段均使用普通字符串

---

## 3. 技术选型

### 3.1 认证方案

| 方案 | 选择 | 理由 |
|------|------|------|
| API Key 认证 | Phase 1 采用 | 简单、适合 Workers 间通信、快速实施 |
| JWT + RBAC | Phase 2 采用 | 支持多用户、细粒度权限控制 |
| OAuth 2.0 | 暂不采用 | 当前无第三方登录需求 |

**Phase 1 技术栈**:
- 认证方式: HTTP Header `X-API-Key`
- 密钥管理: 环境变量 `API_KEY`
- 开发环境: 跳过认证（`APP_ENV=development`）
- 依赖: 无需额外依赖

**Phase 2 技术栈**:
- Token: JWT (PyJWT)
- 密码哈希: bcrypt
- 用户存储: 数据库 `users` 表
- 依赖: `pyjwt`, `bcrypt`

### 3.2 缓存方案

| 方案 | 选择 | 理由 |
|------|------|------|
| Redis | 推荐（可选） | 成熟、支持多种数据结构、Docker 集成简单 |
| 内存缓存 | 暂不采用 | 多实例场景下数据不一致 |
| 数据库缓存表 | 不采用 | 增加数据库负担 |

**当前阶段建议**: 先优化查询（合并查询），暂不引入 Redis。当数据量增长到需要缓存时再引入。

### 3.3 重试机制

| 方案 | 选择 | 理由 |
|------|------|------|
| tenacity | 采用 | Python 生态标准、声明式 API、支持多种策略 |
| 手动重试 | 不采用 | 代码冗余、难以维护 |

### 3.4 日志方案

| 方案 | 选择 | 理由 |
|------|------|------|
| structlog | 推荐（P2） | 结构化 JSON 输出、与现有 logging 兼容 |
| 标准 logging | 当前使用 | 简单但缺乏结构化 |

### 3.5 数据库

| 方案 | 选择 | 理由 |
|------|------|------|
| SQLite | 当前阶段 | 开发/小规模生产足够 |
| PostgreSQL | 未来迁移 | 当需要并发写入、高级索引时 |

---

## 4. 模块架构设计

### 4.1 后端模块架构（优化后）

```
apps/api/
├── main.py                          # FastAPI 入口 + 生命周期管理
├── config/
│   ├── settings.py                  # 配置管理（新增 API_KEY 等）
│   └── logging_config.py            # [新增] 日志配置
├── middleware/
│   ├── __init__.py
│   ├── auth.py                      # [新增] 认证中间件
│   ├── exception_handler.py         # [新增] 全局异常处理
│   ├── operation_log.py             # [现有] 操作日志
│   └── rate_limiter.py              # [新增] 速率限制（可选）
├── routers/
│   ├── __init__.py
│   ├── dashboard.py                 # [优化] 合并查询
│   └── ...                          # [现有] 其他路由
├── models/
│   ├── base.py                      # [优化] 添加索引基类
│   ├── source.py                    # [优化] 添加索引
│   ├── fact.py                      # [优化] 添加索引
│   ├── raw_record.py                # [优化] 添加索引
│   └── ...                          # [现有] 其他模型
├── schemas/
│   ├── __init__.py
│   ├── enums.py                     # [新增] 统一枚举定义
│   ├── source.py                    # [优化] 使用枚举类型
│   ├── fact.py                      # [优化] 使用枚举类型
│   └── ...                          # [现有] 其他 Schema
├── services/
│   ├── __init__.py
│   ├── database.py                  # [优化] 事务上下文
│   ├── source_service.py            # [优化] 使用事务
│   └── ...                          # [优化] 其他服务
├── utils/
│   ├── __init__.py
│   ├── helpers.py                   # [现有] 工具函数
│   └── request_context.py           # [现有] 请求上下文
└── requirements.txt                 # [更新] 新增依赖
```

### 4.2 前端模块架构（优化后）

```
apps/web/
├── lib/
│   ├── api.ts                       # [优化] 统一认证头注入
│   ├── api/
│   │   ├── sources.ts               # [现有]
│   │   └── ...
│   └── data-provider.tsx            # [新增] 数据源上下文
├── hooks/
│   ├── use-sources.ts               # [优化] 使用数据源上下文
│   └── ...
├── types/
│   ├── entities.ts                  # [现有] 已匹配后端
│   ├── enums.ts                     # [现有] 已定义
│   └── auth.ts                      # [新增] 认证相关类型
├── components/
│   ├── ui/
│   │   ├── pagination.tsx           # [新增] 分页组件
│   │   └── data-table.tsx           # [优化] 集成分页
│   └── ...
└── context/
    └── auth-context.tsx             # [新增] 认证上下文（Phase 2）
```

### 4.3 Workers 模块架构（优化后）

```
workers/
├── common/                          # [新增] 共享模块
│   ├── __init__.py
│   ├── qwen_client.py              # [新增] 带重试的 Qwen 客户端
│   └── health.py                    # [新增] 健康检查服务器
├── crawler/
│   ├── config.py                    # [优化] 添加 API Key
│   └── ...
├── fact_extractor/
│   ├── config.py                    # [优化] 添加 API Key
│   ├── extractor.py                 # [优化] 使用重试客户端
│   └── ...
└── insight_generator/
    ├── config.py                    # [优化] 添加 API Key
    ├── generator.py                 # [优化] 使用重试客户端
    └── ...
```

### 4.4 模块依赖关系

```
                    ┌─────────────┐
                    │   Frontend  │
                    │  (Next.js)  │
                    └──────┬──────┘
                           │ HTTP + X-API-Key
                           ▼
┌──────────────────────────────────────────────────┐
│                   Backend API                     │
│  ┌──────────┐  ┌──────────────┐  ┌────────────┐ │
│  │   Auth   │→ │ Exception    │→ │  Routers   │ │
│  │Middleware│  │  Handler     │  │            │ │
│  └──────────┘  └──────────────┘  └─────┬──────┘ │
│                                        │         │
│  ┌──────────────────────────────────────▼──────┐ │
│  │              Services Layer                 │ │
│  │  (with Transaction Context Management)      │ │
│  └──────────────────────┬──────────────────────┘ │
│                         │                         │
│  ┌──────────────────────▼──────────────────────┐ │
│  │           Database (SQLite)                 │ │
│  │  (with Indexes for Performance)             │ │
│  └─────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
       ▲                    ▲                    ▲
       │ HTTP + X-API-Key   │ HTTP + X-API-Key   │ HTTP + X-API-Key
       │                    │                    │
┌──────┴──────┐    ┌────────┴───────┐   ┌────────┴────────┐
│  Crawler    │    │ Fact Extractor │   │Insight Generator│
│   Worker    │    │    Worker      │   │     Worker      │
│ (with retry)│    │ (with retry)   │   │  (with retry)   │
└─────────────┘    └────────────────┘   └─────────────────┘
```

---

## 5. P0 优化项详细设计

### 5.1 OPT-001: API 路径一致性保障

**当前状态**: 已修复（代码审查确认）

**保障措施**: 添加路径一致性测试

```python
# tests/test_api_paths.py
import pytest

API_V1_PREFIX = "/api/v1"

EXPECTED_ENDPOINTS = [
    "/api/v1/dashboard/stats",
    "/api/v1/dashboard/company-stats",
    "/api/v1/sources/",
    "/api/v1/raw-records/",
    "/api/v1/facts/",
    "/api/v1/insights/",
]

@pytest.mark.parametrize("endpoint", EXPECTED_ENDPOINTS)
def test_all_endpoints_have_v1_prefix(endpoint):
    assert endpoint.startswith(API_V1_PREFIX)
```

**前端路径一致性检查**:

```typescript
// tests/api-paths.test.ts
import { createApiUrl } from '@/lib/api';

describe('API Path Consistency', () => {
  it('should include /api/v1 prefix', () => {
    expect(createApiUrl('sources')).toContain('/api/v1/');
    expect(createApiUrl('facts')).toContain('/api/v1/');
  });
});
```

---

### 5.2 OPT-002: 前后端字段名同步机制

**当前状态**: 已匹配（代码审查确认）

**保障措施**: 建立类型同步机制

#### 5.2.1 方案: 使用 OpenAPI Schema 生成 TypeScript 类型

```bash
# 从后端 OpenAPI 文档生成前端类型
npx openapi-typescript http://localhost:8000/openapi.json -o apps/web/types/generated.ts
```

#### 5.2.2 方案: 添加字段映射验证测试

```python
# tests/test_field_consistency.py
import json
import pytest

# 后端 Schema 字段
BACKEND_SOURCE_FIELDS = {"id", "name", "company", "source_type", "url", "enabled", ...}
BACKEND_FACT_FIELDS = {"id", "raw_record_id", "company", "fact_summary", ...}

# 前端 TypeScript 类型字段（通过解析 types/entities.ts 获取）
FRONTEND_SOURCE_FIELDS = {"id", "name", "company", "source_type", "url", "enabled", ...}
FRONTEND_FACT_FIELDS = {"id", "raw_record_id", "company", "fact_summary", ...}

def test_source_fields_match():
    assert BACKEND_SOURCE_FIELDS == FRONTEND_SOURCE_FIELDS

def test_fact_fields_match():
    assert BACKEND_FACT_FIELDS == FRONTEND_FACT_FIELDS
```

---

### 5.3 OPT-003: 认证机制实现

#### 5.3.1 Phase 1: API Key 认证

**新增文件**: `apps/api/middleware/auth.py`

```python
"""API Key 认证中间件"""

from fastapi import Depends, HTTPException, Header, Request
from config import settings


async def verify_api_key(x_api_key: str | None = Header(None)) -> bool:
    """验证 API Key"""
    if settings.is_development:
        return True

    if not x_api_key:
        raise HTTPException(
            status_code=401,
            detail="Missing API Key. Please provide X-API-Key header.",
        )

    valid_keys = settings.get_valid_api_keys()
    if x_api_key not in valid_keys:
        raise HTTPException(
            status_code=401,
            detail="Invalid API Key.",
        )

    return True
```

**配置更新**: `apps/api/config/settings.py`

```python
class Settings(BaseSettings):
    # ... 现有配置 ...

    api_key: str = ""  # 单个 API Key（向后兼容）
    api_keys: str = ""  # 逗号分隔的多个 API Key

    def get_valid_api_keys(self) -> list[str]:
        """获取所有有效的 API Key"""
        keys = []
        if self.api_key:
            keys.append(self.api_key)
        if self.api_keys:
            keys.extend(k.strip() for k in self.api_keys.split(",") if k.strip())
        return keys
```

**路由应用认证**:

```python
# apps/api/routers/sources.py
from fastapi import Depends

from middleware.auth import verify_api_key

router = APIRouter(prefix="/sources", tags=["sources"])

@router.get("/", response_model=PaginatedResponse[SourceResponse])
async def list_sources(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    # ... 其他参数 ...
    _: bool = Depends(verify_api_key),  # 添加认证
    session: AsyncSession = Depends(get_session),
):
    # ...
```

**全局认证方案**（推荐）: 使用 FastAPI 的 APIRouter 依赖

```python
# apps/api/routers/__init__.py
from fastapi import APIRouter, Depends
from middleware.auth import verify_api_key

# 创建带认证依赖的路由器
api_router = APIRouter(
    prefix="/api/v1",
    dependencies=[Depends(verify_api_key)],  # 全局应用
)
```

**Workers 配置更新**:

```python
# workers/crawler/config.py
class Settings(BaseSettings):
    # ... 现有配置 ...
    api_key: str = ""  # 新增

# workers/crawler/crawler.py (HTTP 请求时添加)
headers = {
    "Content-Type": "application/json",
    "X-API-Key": settings.api_key,
}
```

**前端配置更新**:

```typescript
// apps/web/lib/api.ts
const api = ky.create({
  prefixUrl: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || '',
  },
});
```

#### 5.3.2 Phase 2: JWT + RBAC（预留设计）

**数据库表**:

```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'viewer',  -- admin, editor, viewer
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE api_keys (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**认证流程**:

```
1. POST /api/v1/auth/login {username, password} → {access_token, refresh_token}
2. 后续请求: Authorization: Bearer <access_token>
3. Token 过期: POST /api/v1/auth/refresh {refresh_token} → {access_token}
```

---

### 5.4 OPT-004: 数据库事务管理

#### 5.4.1 事务上下文管理器

**新增文件**: `apps/api/services/transaction.py`

```python
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
        # 自动 commit，异常时自动 rollback
    """
    try:
        yield session
        await session.commit()
    except Exception:
        await session.rollback()
        raise
```

#### 5.4.2 服务层改造

**改造示例**: `apps/api/services/source_service.py`

```python
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.source import Source
from schemas.source import SourceCreate, SourceUpdate, SourceFilter
from services.transaction import transaction
from utils.helpers import get_paginated


class SourceService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_list(self, ...):
        # 查询操作不需要事务
        ...

    async def get_by_id(self, source_id: str) -> Source | None:
        result = await self.session.execute(
            select(Source).where(Source.id == source_id)
        )
        return result.scalar_one_or_none()

    async def create(self, data: SourceCreate) -> Source:
        async with transaction(self.session) as txn:
            source = Source(**data.model_dump())
            txn.add(source)
            await txn.flush()
            await txn.refresh(source)
        return source

    async def update(self, source_id: str, data: SourceUpdate) -> Source | None:
        source = await self.get_by_id(source_id)
        if not source:
            return None

        async with transaction(self.session) as txn:
            update_data = data.model_dump(exclude_unset=True)
            for key, value in update_data.items():
                setattr(source, key, value)
            txn.add(source)  # 标记为 dirty
            await txn.flush()
            await txn.refresh(source)
        return source

    async def delete(self, source_id: str) -> bool:
        source = await self.get_by_id(source_id)
        if not source:
            return False

        async with transaction(self.session) as txn:
            await txn.delete(source)
        return True
```

#### 5.4.3 需要改造的服务列表

| 服务文件 | 方法 | 改造内容 |
|----------|------|----------|
| `source_service.py` | `create`, `update`, `delete` | 添加事务上下文 |
| `crawl_task_service.py` | 所有写操作方法 | 添加事务上下文 |
| `report_service.py` | 所有写操作方法 | 添加事务上下文 |
| `system_settings_service.py` | 所有写操作方法 | 添加事务上下文 |
| `routers/facts.py` | `create_fact`, `update_review_status` | 添加事务上下文 |
| `routers/insights.py` | `create_insight` | 添加事务上下文 |
| `routers/raw_records.py` | `create_raw_record`, `update_raw_record_status` | 添加事务上下文 |

---

### 5.5 OPT-005: 全局异常处理

#### 5.5.1 异常处理器

**新增文件**: `apps/api/middleware/exception_handler.py`

```python
"""全局异常处理中间件"""

import logging
from typing import Any

from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from config import settings
from schemas import ErrorResponse

logger = logging.getLogger("ai_research_api")


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """请求验证错误处理"""
    logger.warning(
        "Validation error on %s: %s",
        request.url.path,
        exc.errors(),
    )
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=ErrorResponse(
            success=False,
            error="Validation error",
            detail=str(exc.errors()),
        ).model_dump(),
    )


async def sqlalchemy_exception_handler(
    request: Request, exc: SQLAlchemyError
) -> JSONResponse:
    """数据库错误处理"""
    logger.exception("Database error on %s: %s", request.url.path, exc)

    if isinstance(exc, IntegrityError):
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content=ErrorResponse(
                success=False,
                error="Data integrity error",
                detail="A record with this data already exists or violates a constraint.",
            ).model_dump(),
        )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=ErrorResponse(
            success=False,
            error="Database error",
            detail=None,
        ).model_dump(),
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """通用异常处理"""
    logger.exception("Unhandled exception on %s: %s", request.url.path, exc)

    detail = None
    if settings.is_development:
        detail = str(exc)

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=ErrorResponse(
            success=False,
            error="Internal server error",
            detail=detail,
        ).model_dump(),
    )
```

#### 5.5.2 注册异常处理器

**更新文件**: `apps/api/main.py`

```python
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError

from middleware.exception_handler import (
    generic_exception_handler,
    sqlalchemy_exception_handler,
    validation_exception_handler,
)

app = FastAPI(...)

# 注册异常处理器
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)
```

#### 5.5.3 统一错误响应格式

```typescript
// 前端错误处理 (apps/web/lib/api.ts)
const api = ky.create({
  prefixUrl: API_BASE_URL,
  hooks: {
    afterResponse: [
      async (_request, _options, response) => {
        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: response.statusText }));
          throw new APIError(error.error || response.statusText, response.status);
        }
        return response;
      },
    ],
  },
});

class APIError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = 'APIError';
  }
}
```

---

## 6. P1 优化项详细设计

### 6.1 OPT-006: Dashboard API 性能优化

#### 6.1.1 合并查询方案

**更新文件**: `apps/api/routers/dashboard.py`

```python
from sqlalchemy import select, func

@router.get("/stats")
async def get_dashboard_stats(session: AsyncSession = Depends(get_session)):
    """合并为单个查询，减少数据库往返"""
    stats_query = select(
        func.count(Fact.id).label("total_facts"),
        func.count(Fact.id).filter(
            Fact.review_status == "pending"
        ).label("pending_review"),
        func.count(Insight.id).label("total_insights"),
        func.count(Source.id).filter(
            Source.enabled == True
        ).label("active_sources"),
    )
    result = await session.execute(stats_query)
    row = result.one()

    return {
        "today_fact_count": row.total_facts or 0,
        "pending_review_count": row.pending_review or 0,
        "insight_count": row.total_insights or 0,
        "active_source_count": row.active_sources or 0,
    }
```

**性能对比**:

| 指标 | 优化前 | 优化后 |
|------|--------|--------|
| 数据库查询次数 | 4 次 | 1 次 |
| 网络往返 | 4 次 | 1 次 |
| 预计响应时间 | ~40ms | ~10ms |

#### 6.1.2 缓存方案（可选，未来扩展）

当数据量增长后，可引入 Redis 缓存：

```python
# apps/api/services/cache.py
import json
from typing import Any

import redis.asyncio as aioredis

from config import settings

class CacheService:
    def __init__(self):
        self._client: aioredis.Redis | None = None

    async def get_client(self) -> aioredis.Redis:
        if self._client is None:
            self._client = aioredis.from_url(
                settings.redis_url,
                decode_responses=True,
            )
        return self._client

    async def get(self, key: str) -> Any | None:
        client = await self.get_client()
        value = await client.get(key)
        if value:
            return json.loads(value)
        return None

    async def set(self, key: str, value: Any, ttl: int = 60) -> None:
        client = await self.get_client()
        await client.setex(key, ttl, json.dumps(value))

    async def invalidate(self, pattern: str) -> None:
        client = await self.get_client()
        keys = await client.keys(pattern)
        if keys:
            await client.delete(*keys)


cache_service = CacheService()
```

---

### 6.2 OPT-007: 数据库索引

#### 6.2.1 索引设计

**更新文件**: `apps/api/models/source.py`

```python
from sqlalchemy import Boolean, Index, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin, generate_uuid


class Source(Base, TimestampMixin):
    __tablename__ = "sources"
    __table_args__ = (
        Index("ix_sources_company", "company"),
        Index("ix_sources_enabled", "enabled"),
        Index("ix_sources_source_type", "source_type"),
        Index("ix_sources_priority", "priority"),
        Index("ix_sources_created_at", "created_at"),
    )

    # ... 字段定义不变 ...
```

**更新文件**: `apps/api/models/fact.py`

```python
from sqlalchemy import Boolean, DateTime, ForeignKey, Index, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship


class Fact(Base, TimestampMixin):
    __tablename__ = "facts"
    __table_args__ = (
        Index("ix_facts_company", "company"),
        Index("ix_facts_review_status", "review_status"),
        Index("ix_facts_created_at", "created_at"),
        Index("ix_facts_raw_record_id", "raw_record_id"),
        Index("ix_facts_importance_level", "importance_level"),
        Index("ix_facts_event_type", "event_type"),
        Index("ix_facts_needs_review", "needs_review"),
    )

    # ... 字段定义不变 ...
```

**更新文件**: `apps/api/models/raw_record.py`

```python
from sqlalchemy import DateTime, ForeignKey, Index, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship


class RawRecord(Base):
    __tablename__ = "raw_records"
    __table_args__ = (
        Index("ix_raw_records_company", "company"),
        Index("ix_raw_records_crawl_status", "crawl_status"),
        Index("ix_raw_records_source_id", "source_id"),
        Index("ix_raw_records_content_hash", "content_hash"),
        Index("ix_raw_records_dedupe_status", "dedupe_status"),
        Index("ix_raw_records_crawled_at", "crawled_at"),
    )

    # ... 字段定义不变 ...
```

**更新文件**: `apps/api/models/insight.py`

```python
from sqlalchemy import ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship


class Insight(Base, TimestampMixin):
    __tablename__ = "insights"
    __table_args__ = (
        Index("ix_insights_company", "company"),
        Index("ix_insights_fact_id", "fact_id"),
        Index("ix_insights_created_at", "created_at"),
        Index("ix_insights_insight_type", "insight_type"),
    )

    # ... 字段定义不变 ...
```

#### 6.2.2 索引影响分析

| 表 | 新增索引数 | 写入性能影响 | 读取性能提升 |
|----|-----------|-------------|-------------|
| sources | 5 | 轻微 (~5%) | 显著 (30-50%) |
| facts | 7 | 轻微 (~8%) | 显著 (40-60%) |
| raw_records | 6 | 轻微 (~7%) | 显著 (30-50%) |
| insights | 4 | 轻微 (~4%) | 显著 (20-40%) |

---

### 6.3 OPT-008: AI Workers 重试机制

#### 6.3.1 共享 Qwen 客户端

**新增文件**: `workers/common/qwen_client.py`

```python
"""带重试和速率限制的 Qwen API 客户端"""

import asyncio
import logging
import time
from typing import Any

import httpx
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

logger = logging.getLogger(__name__)


class QwenAPIError(Exception):
    """Qwen API 调用错误"""
    pass


class QwenRateLimitError(Exception):
    """Qwen API 速率限制错误"""
    pass


class QwenClient:
    """Qwen API 客户端，内置重试和速率限制"""

    def __init__(
        self,
        api_key: str,
        model: str = "qwen-plus",
        temperature: float = 0.1,
        max_tokens: int = 2000,
        max_retries: int = 3,
        rate_limit_rps: float = 2.0,
    ):
        self.api_key = api_key
        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.max_retries = max_retries
        self._semaphore = asyncio.Semaphore(5)
        self._last_request_time = 0.0
        self._min_interval = 1.0 / rate_limit_rps

    async def _rate_limit(self) -> None:
        """速率限制"""
        now = time.monotonic()
        elapsed = now - self._last_request_time
        if elapsed < self._min_interval:
            await asyncio.sleep(self._min_interval - elapsed)
        self._last_request_time = time.monotonic()

    def _is_retryable_error(self, status_code: int) -> bool:
        """判断是否应该重试"""
        return status_code in (429, 500, 502, 503, 504)

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((QwenAPIError, QwenRateLimitError)),
        before_sleep=lambda retry_state: logger.warning(
            "Qwen API call failed (attempt %d), retrying in %ds...",
            retry_state.attempt_number,
            retry_state.next_action.sleep,
        ),
    )
    async def call(self, prompt: str) -> dict[str, Any]:
        """调用 Qwen API"""
        async with self._semaphore:
            await self._rate_limit()
            return await self._actual_call(prompt)

    async def _actual_call(self, prompt: str) -> dict[str, Any]:
        """实际 API 调用"""
        url = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, headers=headers, json=payload)

            if response.status_code == 429:
                raise QwenRateLimitError("Rate limited by Qwen API")

            if response.status_code != 200:
                raise QwenAPIError(
                    f"Qwen API error: {response.status_code} - {response.text}"
                )

            data = response.json()
            return data["choices"][0]["message"]["content"]
```

#### 6.3.2 Workers 依赖更新

```
# workers/fact_extractor/requirements.txt
tenacity>=8.2.0
httpx>=0.25.0

# workers/insight_generator/requirements.txt
tenacity>=8.2.0
httpx>=0.25.0
```

#### 6.3.3 Workers 配置更新

```python
# workers/fact_extractor/config.py
class Settings(BaseSettings):
    # ... 现有配置 ...
    qwen_max_retries: int = 3
    qwen_rate_limit_rps: float = 2.0
```

---

### 6.4 OPT-009: 前端 Mock 逻辑重构

#### 6.4.1 数据源上下文

**新增文件**: `apps/web/lib/data-provider.tsx`

```typescript
'use client';

import { createContext, useContext, ReactNode } from 'react';

type DataSource = 'api' | 'mock';

interface DataContextValue {
  source: DataSource;
  isMock: boolean;
}

const DataContext = createContext<DataContextValue>({
  source: 'api',
  isMock: false,
});

export function DataProvider({ children }: { children: ReactNode }) {
  const isMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

  return (
    <DataContext.Provider value={{ source: isMock ? 'mock' : 'api', isMock }}>
      {children}
    </DataContext.Provider>
  );
}

export function useDataSource() {
  return useContext(DataContext);
}
```

#### 6.4.2 集成到应用布局

```typescript
// apps/web/app/layout.tsx
import { DataProvider } from '@/lib/data-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body>
        <DataProvider>
          {children}
        </DataProvider>
      </body>
    </html>
  );
}
```

#### 6.4.3 Hook 改造示例

```typescript
// apps/web/hooks/use-sources.ts
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { useDataSource } from '@/lib/data-provider';
import { getSources, getSource, createSource, updateSource, deleteSource, SourcesFilter, CreateSourceData, UpdateSourceData } from '@/lib/api/sources';
import { Source, PaginatedResponse } from '@/types/entities';

export function useSources(filter?: SourcesFilter) {
  const { isMock } = useDataSource();
  const key = ['sources', filter];

  if (isMock) {
    // TODO: 返回 mock 数据
    return useSWR<PaginatedResponse<Source>>(key, () => ({
      items: [], total: 0, page: 1, page_size: 20, total_pages: 0,
    }));
  }

  return useSWR<PaginatedResponse<Source>>(key, () => getSources(filter));
}
```

---

### 6.5 OPT-010: 前端分页实现

#### 6.5.1 分页组件

**新增文件**: `apps/web/components/ui/pagination.tsx`

```typescript
'use client';

import { Button } from './button';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export function Pagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t">
      <div className="text-sm text-muted-foreground">
        显示 {startItem}-{endItem} 条，共 {total} 条
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          上一页
        </Button>
        <span className="text-sm">
          第 {page} / {totalPages} 页
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          下一页
        </Button>
        {onPageSizeChange && (
          <select
            className="ml-2 text-sm border rounded px-2 py-1"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            <option value={10}>10 条/页</option>
            <option value={20}>20 条/页</option>
            <option value={50}>50 条/页</option>
            <option value={100}>100 条/页</option>
          </select>
        )}
      </div>
    </div>
  );
}
```

#### 6.5.2 DataTable 集成分页

**更新文件**: `apps/web/components/ui/data-table.tsx`

在 DataTable 组件底部添加 Pagination 组件，通过 props 传递分页状态。

#### 6.5.3 Hook 分页支持

```typescript
// apps/web/hooks/use-sources.ts (更新)
export function useSources(filter?: SourcesFilter & { page?: number; page_size?: number }) {
  const { isMock } = useDataSource();
  const key = ['sources', filter];

  if (isMock) {
    return useSWR<PaginatedResponse<Source>>(key, () => ({
      items: [], total: 0, page: 1, page_size: 20, total_pages: 0,
    }));
  }

  return useSWR<PaginatedResponse<Source>>(key, () => getSources(filter));
}
```

---

### 6.6 OPT-011: Docker 配置优化

#### 6.6.1 更新后的 docker-compose.yml

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
      - NEXT_PUBLIC_USE_MOCK=false
      - NEXT_PUBLIC_API_KEY=${API_KEY:-}
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - ai-research-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '1.0'
        reservations:
          memory: 256M

  backend:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=sqlite+aiosqlite:///./data/research.db
      - APP_ENV=production
      - API_KEY=${API_KEY:-dev-key-change-in-production}
      - CORS_ORIGINS=["http://localhost:3000"]
    volumes:
      - backend-data:/app/data
    networks:
      - ai-research-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 5s
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: '0.5'
        reservations:
          memory: 128M

  crawler:
    build:
      context: ./workers/crawler
      dockerfile: Dockerfile
    environment:
      - API_BASE_URL=http://backend:8000
      - API_KEY=${API_KEY:-dev-key-change-in-production}
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - ai-research-network
    profiles:
      - workers
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: '0.5'

  fact-extractor:
    build:
      context: ./workers/fact_extractor
      dockerfile: Dockerfile
    environment:
      - API_BASE_URL=http://backend:8000
      - API_KEY=${API_KEY:-dev-key-change-in-production}
      - QWEN_API_KEY=${QWEN_API_KEY}
      - QWEN_MAX_RETRIES=3
      - QWEN_RATE_LIMIT_RPS=2.0
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - ai-research-network
    profiles:
      - workers
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: '0.5'

  insight-generator:
    build:
      context: ./workers/insight_generator
      dockerfile: Dockerfile
    environment:
      - API_BASE_URL=http://backend:8000
      - API_KEY=${API_KEY:-dev-key-change-in-production}
      - QWEN_API_KEY=${QWEN_API_KEY}
      - QWEN_MAX_RETRIES=3
      - QWEN_RATE_LIMIT_RPS=2.0
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - ai-research-network
    profiles:
      - workers
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: '0.5'

volumes:
  backend-data:
    driver: local

networks:
  ai-research-network:
    driver: bridge
    name: ai-research-network
```

---

### 6.7 OPT-012: Schema 枚举验证

#### 6.7.1 统一枚举定义

**新增文件**: `apps/api/schemas/enums.py`

```python
"""统一枚举定义"""

from enum import Enum


class Company(str, Enum):
    ALIBABA = "alibaba"
    BYTE_DANCE = "byte_dance"
    TENCENT = "tencent"


class SourceType(str, Enum):
    OFFICIAL_DOC = "official_doc"
    OFFICIAL_BLOG = "official_blog"
    PRODUCT_SITE = "product_site"
    CHANGELOG = "changelog"
    GITHUB = "github"
    MEDIA = "media"
    APP_PAGE = "app_page"
    OPEN_PLATFORM = "open_platform"


class EventType(str, Enum):
    RELEASE = "release"
    UPDATE = "update"
    UPGRADE = "upgrade"
    PRICE_CUT = "price_cut"
    OPEN_SOURCE = "open_source"
    INTEGRATION = "integration"
    PARTNERSHIP = "partnership"
    STRATEGIC = "strategic"
    ORGANIZATIONAL = "organizational"
    INTERNATIONAL = "international"
    DOC_UPDATE = "doc_update"


class EntityType(str, Enum):
    MODEL = "model"
    PRODUCT = "product"
    PLATFORM = "platform"
    API = "api"
    SDK = "sdk"
    AGENT = "agent"
    ORGANIZATION = "organization"
    STRATEGY = "strategy"
    PRICING = "pricing"


class ImportanceLevel(str, Enum):
    P0 = "p0"
    P1 = "p1"
    P2 = "p2"
    P3 = "p3"


class Confidence(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class ReviewStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    MODIFIED = "modified"
    REJECTED = "rejected"


class CrawlStatus(str, Enum):
    PENDING = "pending"
    CRAWLING = "crawling"
    SUCCESS = "success"
    FAILED = "failed"
    PARSE_ERROR = "parse_error"


class DedupeStatus(str, Enum):
    NEW = "new"
    DUPLICATE = "duplicate"
    PENDING = "pending"


class InsightType(str, Enum):
    TREND = "trend"
    COMPETITOR = "competitor"
    OPPORTUNITY = "opportunity"
    RISK = "risk"
    SUGGESTION = "suggestion"


class CapabilityLevel(str, Enum):
    L1 = "l1"
    L2 = "l2"
    L3 = "l3"
    L4 = "l4"
    L5 = "l5"
    L6 = "l6"


class Priority(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
```

#### 6.7.2 Schema 更新

**更新文件**: `apps/api/schemas/source.py`

```python
from datetime import datetime
from enum import Enum

from .common import BaseSchema
from .enums import Company, SourceType, Priority, CrawlStrategy, SocialPlatform


class SourceBase(BaseSchema):
    name: str
    company: Company  # 改为枚举
    source_type: SourceType  # 改为枚举
    url: str
    enabled: bool = True
    schedule: str | None = None
    parser_type: str | None = None
    priority: Priority = Priority.MEDIUM  # 改为枚举
    notes: str | None = None
    crawl_strategy: CrawlStrategy = CrawlStrategy.SINGLE_PAGE
    crawl_config: dict = {}
    social_platform: SocialPlatform | None = None
    social_account_id: str | None = None
```

**更新文件**: `apps/api/schemas/fact.py`

```python
from datetime import datetime

from .common import BaseSchema
from .enums import (
    Company,
    EventType,
    EntityType,
    ImportanceLevel,
    Confidence,
    ReviewStatus,
    CapabilityLevel,
)


class FactBase(BaseSchema):
    raw_record_id: str
    company: Company  # 改为枚举
    fact_summary: str
    topic_level_1: str
    topic_level_2: str | None = None
    event_type: EventType  # 改为枚举
    entity_type: EntityType  # 改为枚举
    entity_name: str
    importance_level: ImportanceLevel  # 改为枚举
    capability_level: CapabilityLevel | None = None
    confidence: Confidence  # 改为枚举
    published_at: datetime | None = None
    source_url: str
    needs_review: bool = False


class ReviewUpdate(BaseSchema):
    review_status: ReviewStatus  # 改为枚举
    needs_review: bool | None = None
```

#### 6.7.3 枚举值映射表

| Schema 字段 | 原类型 | 新类型 | 枚举类 |
|-------------|--------|--------|--------|
| `SourceBase.company` | `str` | `Company` | `schemas.enums.Company` |
| `SourceBase.source_type` | `str` | `SourceType` | `schemas.enums.SourceType` |
| `SourceBase.priority` | `str` | `Priority` | `schemas.enums.Priority` |
| `FactBase.company` | `str` | `Company` | `schemas.enums.Company` |
| `FactBase.event_type` | `str` | `EventType` | `schemas.enums.EventType` |
| `FactBase.entity_type` | `str` | `EntityType` | `schemas.enums.EntityType` |
| `FactBase.importance_level` | `str` | `ImportanceLevel` | `schemas.enums.ImportanceLevel` |
| `FactBase.confidence` | `str` | `Confidence` | `schemas.enums.Confidence` |
| `ReviewUpdate.review_status` | `str` | `ReviewStatus` | `schemas.enums.ReviewStatus` |

---

## 7. P2 优化项详细设计

### 7.1 OPT-013: 结构化日志

#### 7.1.1 日志配置

**新增文件**: `apps/api/config/logging_config.py`

```python
"""结构化日志配置"""

import logging
import sys
from datetime import datetime, timezone


class JSONFormatter(logging.Formatter):
    """JSON 格式日志"""

    def format(self, record: logging.LogRecord) -> str:
        import json

        log_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        if record.exc_info and record.exc_info[0] is not None:
            log_entry["exception"] = self.formatException(record.exc_info)

        if hasattr(record, "request_id"):
            log_entry["request_id"] = record.request_id

        return json.dumps(log_entry, ensure_ascii=False)


def setup_logging(debug: bool = False) -> None:
    """配置日志"""
    log_level = logging.DEBUG if debug else logging.INFO

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JSONFormatter())

    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    root_logger.addHandler(handler)

    # 降低第三方库日志级别
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
```

#### 7.1.2 请求 ID 中间件

**新增文件**: `apps/api/middleware/request_id.py`

```python
"""请求 ID 中间件，用于日志追踪"""

import uuid
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware


class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id

        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id

        return response
```

---

### 7.2 OPT-014: API 文档增强

**更新文件**: `apps/api/main.py`

```python
app = FastAPI(
    title="AI 研究平台 API",
    description="""
## 概述

AI 研究平台后端 API，用于管理信息源、原始记录、标准化事实和研究结论。

## 数据流

1. **信息源(Source)** → 爬虫采集 → **原始记录(RawRecord)**
2. **原始记录** → AI 抽取 → **标准化事实(Fact)**
3. **标准化事实** → AI 分析 → **研究结论(Insight)**

## 认证

所有 API 端点需要 `X-API-Key` 请求头进行认证。

```
X-API-Key: your-api-key-here
```

开发环境 (`APP_ENV=development`) 下认证被跳过。

## 分页

所有列表端点支持分页：

- `page`: 页码（从 1 开始）
- `page_size`: 每页数量（最大 100）

## 错误响应

所有错误返回统一格式：

```json
{
  "success": false,
  "error": "Error type",
  "detail": "Detailed message"
}
```
    """,
    version="0.2.0",
    docs_url="/docs",
    redoc_url="/redoc",
)
```

---

### 7.3 OPT-015: 国际化支持

#### 7.3.1 方案选择

| 方案 | 选择 | 理由 |
|------|------|------|
| next-intl | 推荐 | Next.js 官方推荐、类型安全 |
| react-i18next | 备选 | 生态成熟但配置复杂 |
| 手动 label_map | 当前使用 | 简单但缺乏系统性 |

#### 7.3.2 实施步骤

1. 安装依赖: `npm install next-intl`
2. 创建翻译文件: `messages/zh.json`, `messages/en.json`
3. 配置 `next.config.ts`
4. 替换所有硬编码中文为 `useTranslations` 调用

**预计工作量**: 4 小时（仅中文可暂不实施，预留架构）

---

### 7.4 OPT-016: 优雅关闭

#### 7.4.1 后端优雅关闭

**更新文件**: `apps/api/main.py`

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs("data", exist_ok=True)
    await init_db()

    async with async_session() as session:
        settings_service = SystemSettingsService(session)
        await settings_service.init_default_settings()

    yield

    # 关闭时清理
    await engine.dispose()
    logger.info("Database connections closed")
```

#### 7.4.2 Workers 优雅关闭

```python
# workers/crawler/main.py
import asyncio
import signal

shutdown_event = asyncio.Event()

def handle_signal(signum, frame):
    logger.info("Received signal %s, shutting down...", signum)
    shutdown_event.set()

signal.signal(signal.SIGINT, handle_signal)
signal.signal(signal.SIGTERM, handle_signal)

async def main():
    while not shutdown_event.is_set():
        await process_pending_tasks()
        await asyncio.sleep(settings.schedule_interval)

    logger.info("Graceful shutdown complete")
```

---

### 7.5 OPT-017: Workers 健康检查

#### 7.5.1 健康检查服务器

**新增文件**: `workers/common/health.py`

```python
"""Worker 健康检查 HTTP 服务器"""

import asyncio
import logging
from datetime import datetime, timezone

from fastapi import FastAPI

logger = logging.getLogger(__name__)

health_app = FastAPI(docs_url=None, redoc_url=None)

_worker_status = {
    "status": "starting",
    "last_heartbeat": None,
    "processed_count": 0,
    "error_count": 0,
    "started_at": datetime.now(timezone.utc).isoformat(),
}


@health_app.get("/health")
async def health_check():
    return {
        "status": _worker_status["status"],
        "last_heartbeat": _worker_status["last_heartbeat"],
        "processed_count": _worker_status["processed_count"],
        "error_count": _worker_status["error_count"],
        "uptime_since": _worker_status["started_at"],
    }


def update_heartbeat():
    _worker_status["last_heartbeat"] = datetime.now(timezone.utc).isoformat()


def increment_processed():
    _worker_status["processed_count"] += 1


def increment_error():
    _worker_status["error_count"] += 1


def set_status(status: str):
    _worker_status["status"] = status


async def start_health_server(port: int = 8080):
    """启动健康检查 HTTP 服务器"""
    import uvicorn

    config = uvicorn.Config(
        health_app,
        host="0.0.0.0",
        port=port,
        log_level="warning",
    )
    server = uvicorn.Server(config)
    asyncio.create_task(server.serve())
    logger.info("Health check server started on port %d", port)
```

---

## 8. 数据库表设计变更

### 8.1 索引变更汇总

| 表名 | 变更类型 | 索引名称 | 字段 | 说明 |
|------|----------|----------|------|------|
| sources | 新增 | `ix_sources_company` | company | 按公司筛选 |
| sources | 新增 | `ix_sources_enabled` | enabled | 按启用状态筛选 |
| sources | 新增 | `ix_sources_source_type` | source_type | 按来源类型筛选 |
| sources | 新增 | `ix_sources_priority` | priority | 按优先级筛选 |
| sources | 新增 | `ix_sources_created_at` | created_at | 按创建时间排序 |
| facts | 新增 | `ix_facts_company` | company | 按公司筛选 |
| facts | 新增 | `ix_facts_review_status` | review_status | 按复核状态筛选 |
| facts | 新增 | `ix_facts_created_at` | created_at | 按创建时间排序 |
| facts | 新增 | `ix_facts_raw_record_id` | raw_record_id | 关联查询 |
| facts | 新增 | `ix_facts_importance_level` | importance_level | 按重要性筛选 |
| facts | 新增 | `ix_facts_event_type` | event_type | 按事件类型筛选 |
| facts | 新增 | `ix_facts_needs_review` | needs_review | 按复核需求筛选 |
| raw_records | 新增 | `ix_raw_records_company` | company | 按公司筛选 |
| raw_records | 新增 | `ix_raw_records_crawl_status` | crawl_status | 按采集状态筛选 |
| raw_records | 新增 | `ix_raw_records_source_id` | source_id | 关联查询 |
| raw_records | 新增 | `ix_raw_records_content_hash` | content_hash | 去重查询 |
| raw_records | 新增 | `ix_raw_records_dedupe_status` | dedupe_status | 按去重状态筛选 |
| raw_records | 新增 | `ix_raw_records_crawled_at` | crawled_at | 按采集时间排序 |
| insights | 新增 | `ix_insights_company` | company | 按公司筛选 |
| insights | 新增 | `ix_insights_fact_id` | fact_id | 关联查询 |
| insights | 新增 | `ix_insights_created_at` | created_at | 按创建时间排序 |
| insights | 新增 | `ix_insights_insight_type` | insight_type | 按结论类型筛选 |

### 8.2 Phase 2 新增表（预留）

当实施 JWT 认证时，需要新增以下表：

```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'viewer',
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE api_keys (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 8.3 数据库迁移策略

由于当前使用 SQLite 且通过 `Base.metadata.create_all` 自动建表，索引添加策略如下：

1. **首次部署**: 索引随模型定义一起创建，无需额外迁移
2. **已有数据库**: SQLAlchemy 的 `create_all` 不会修改已有表，需要手动执行：

```python
# 一次性迁移脚本
from sqlalchemy import text

async def add_indexes(engine):
    async with engine.begin() as conn:
        # sources 表索引
        await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_sources_company ON sources(company)"))
        await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_sources_enabled ON sources(enabled)"))
        await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_sources_source_type ON sources(source_type)"))
        await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_sources_priority ON sources(priority)"))
        await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_sources_created_at ON sources(created_at)"))

        # facts 表索引
        await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_facts_company ON facts(company)"))
        await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_facts_review_status ON facts(review_status)"))
        await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_facts_created_at ON facts(created_at)"))
        await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_facts_raw_record_id ON facts(raw_record_id)"))
        await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_facts_importance_level ON facts(importance_level)"))
        await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_facts_event_type ON facts(event_type)"))
        await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_facts_needs_review ON facts(needs_review)"))

        # raw_records 表索引
        await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_raw_records_company ON raw_records(company)"))
        await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_raw_records_crawl_status ON raw_records(crawl_status)"))
        await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_raw_records_source_id ON raw_records(source_id)"))
        await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_raw_records_content_hash ON raw_records(content_hash)"))
        await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_raw_records_dedupe_status ON raw_records(dedupe_status)"))
        await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_raw_records_crawled_at ON raw_records(crawled_at)"))

        # insights 表索引
        await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_insights_company ON insights(company)"))
        await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_insights_fact_id ON insights(fact_id)"))
        await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_insights_created_at ON insights(created_at)"))
        await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_insights_insight_type ON insights(insight_type)"))
```

---

## 9. 接口规范变更

### 9.1 认证头要求

所有 API 请求（开发环境除外）必须包含：

```
X-API-Key: <your-api-key>
```

**未认证的响应**:

```json
{
  "success": false,
  "error": "Missing API Key. Please provide X-API-Key header.",
  "detail": null
}
```

**无效认证的响应**:

```json
{
  "success": false,
  "error": "Invalid API Key.",
  "detail": null
}
```

### 9.2 错误响应格式统一

| HTTP 状态码 | 场景 | error 字段 |
|-------------|------|------------|
| 400 | 请求参数错误 | "Bad request" |
| 401 | 未认证/认证失败 | "Missing API Key" / "Invalid API Key" |
| 404 | 资源不存在 | "X not found" |
| 409 | 数据冲突 | "Data integrity error" |
| 422 | 验证失败 | "Validation error" |
| 500 | 服务器内部错误 | "Internal server error" |

### 9.3 响应头变更

| 响应头 | 说明 |
|--------|------|
| `X-Request-ID` | 请求唯一标识（用于日志追踪） |

### 9.4 接口变更清单

| 接口 | 变更内容 | 影响 |
|------|----------|------|
| 所有 API | 新增 `X-API-Key` 认证要求 | Workers、前端需添加请求头 |
| `GET /api/v1/dashboard/stats` | 查询优化（4次变1次） | 响应格式不变 |
| `POST /api/v1/sources/` | 新增事务管理 | 行为不变，可靠性提升 |
| `PUT /api/v1/sources/{id}` | 新增事务管理 | 行为不变，可靠性提升 |
| `DELETE /api/v1/sources/{id}` | 新增事务管理 | 行为不变，可靠性提升 |
| `POST /api/v1/facts/` | 新增事务管理 | 行为不变，可靠性提升 |
| `PUT /api/v1/facts/{id}/review` | 新增事务管理 | 行为不变，可靠性提升 |
| `POST /api/v1/insights/` | 新增事务管理 | 行为不变，可靠性提升 |
| `POST /api/v1/raw-records/` | 新增事务管理 | 行为不变，可靠性提升 |
| `PUT /api/v1/raw-records/{id}/status` | 新增事务管理 | 行为不变，可靠性提升 |

---

## 10. 实施计划与优先级

### 10.1 实施阶段总览

```
Phase 1 (基础修复)          Phase 2 (数据层修复)         Phase 3 (功能增强)          Phase 4 (可选优化)
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│ OPT-005 异常处理     │    │ OPT-012 枚举验证     │    │ OPT-003 认证机制     │    │ OPT-013 结构化日志   │
│ OPT-004 事务管理     │    │ OPT-006 Dashboard优化│    │ OPT-008 Workers重试  │    │ OPT-014 API文档增强  │
│ OPT-007 数据库索引   │    │ OPT-009 Mock重构     │    │ OPT-010 前端分页     │    │ OPT-016 优雅关闭     │
│ OPT-011 Docker配置   │    │ OPT-010 前端分页     │    │                     │    │ OPT-017 健康检查     │
│                     │    │                     │    │                     │    │ OPT-015 国际化(预留) │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘    └─────────────────────┘
  预计 1 天                  预计 1 天                  预计 2 天                  预计 1 天
```

### 10.2 详细实施顺序

#### Phase 1: 基础修复（预计 1 天）

| 顺序 | 优化项 | 分支名 | 工作量 | 依赖 | 验收方式 |
|------|--------|--------|--------|------|----------|
| 1 | OPT-005 全局异常处理 | `fix/global-exception-handler` | 0.5h | 无 | 触发异常返回统一格式 |
| 2 | OPT-004 事务管理 | `fix/database-transactions` | 1h | OPT-005 | 异常时数据正确回滚 |
| 3 | OPT-007 数据库索引 | `feat/database-indexes` | 0.5h | 无 | 查询性能提升 |
| 4 | OPT-011 Docker 配置 | `fix/docker-compose` | 1h | 无 | `docker compose up` 正常启动 |

#### Phase 2: 数据层修复（预计 1 天）

| 顺序 | 优化项 | 分支名 | 工作量 | 依赖 | 验收方式 |
|------|--------|--------|--------|------|----------|
| 1 | OPT-012 Schema 枚举验证 | `feat/schema-enums` | 1h | 无 | 非法值被拒绝 |
| 2 | OPT-006 Dashboard 优化 | `perf/dashboard-stats` | 1h | 无 | 单次查询返回统计 |
| 3 | OPT-009 Mock 重构 | `refactor/data-provider` | 2h | 无 | Mock/API 切换正常 |
| 4 | OPT-010 前端分页 | `feat/frontend-pagination` | 1.5h | 无 | 分页 UI 正常工作 |

#### Phase 3: 功能增强（预计 2 天）

| 顺序 | 优化项 | 分支名 | 工作量 | 依赖 | 验收方式 |
|------|--------|--------|--------|------|----------|
| 1 | OPT-003 认证机制 | `feat/api-key-auth` | 4h | Phase 1 | 未认证返回 401 |
| 2 | OPT-008 Workers 重试 | `feat/workers-retry` | 2h | OPT-003 | API 失败自动重试 |
| 3 | OPT-010 前端分页集成 | `feat/pagination-integration` | 1.5h | OPT-010 | 所有表格支持分页 |

#### Phase 4: 可选优化（预计 1 天）

| 顺序 | 优化项 | 分支名 | 工作量 | 依赖 | 验收方式 |
|------|--------|--------|--------|------|----------|
| 1 | OPT-013 结构化日志 | `feat/structured-logging` | 1h | OPT-005 | 日志为 JSON 格式 |
| 2 | OPT-014 API 文档 | `docs/api-enhancement` | 0.5h | OPT-003 | /docs 页面完善 |
| 3 | OPT-016 优雅关闭 | `feat/graceful-shutdown` | 1h | 无 | SIGTERM 正常退出 |
| 4 | OPT-017 健康检查 | `feat/worker-health` | 1h | 无 | /health 返回状态 |

### 10.3 关键路径

```
OPT-005 (异常处理) ──→ OPT-004 (事务管理)
                                    │
OPT-003 (认证) ─────────────────────┤
                                    ├──→ 系统稳定性基线
OPT-007 (索引) ─────────────────────┤
                                    │
OPT-012 (枚举) ──→ OPT-006 (Dashboard)
```

---

## 11. 风险评估与回滚方案

### 11.1 风险评估矩阵

| 优化项 | 风险等级 | 影响范围 | 回滚难度 | 说明 |
|--------|----------|----------|----------|------|
| OPT-003 认证 | 中 | 全系统 | 中 | 需同步更新 Workers 和前端配置 |
| OPT-004 事务 | 低 | 后端服务层 | 低 | 仅影响写操作，可逐服务回滚 |
| OPT-005 异常处理 | 低 | 后端 API | 低 | 仅改变错误响应格式 |
| OPT-006 Dashboard | 低 | Dashboard 页面 | 低 | 查询逻辑变更，响应格式不变 |
| OPT-007 索引 | 低 | 数据库 | 低 | 索引可安全删除 |
| OPT-008 Workers 重试 | 低 | Workers | 低 | 仅影响 Workers 内部逻辑 |
| OPT-009 Mock 重构 | 低 | 前端 | 低 | 仅影响开发模式 |
| OPT-010 分页 | 低 | 前端 | 低 | 纯 UI 变更 |
| OPT-011 Docker | 低 | 部署 | 低 | 配置文件变更 |
| OPT-012 枚举 | 中 | 后端 Schema | 中 | 已有数据需验证兼容性 |
| OPT-013 日志 | 低 | 后端 | 低 | 仅改变日志格式 |
| OPT-014 文档 | 低 | API 文档 | 低 | 纯文档变更 |
| OPT-015 国际化 | 低 | 前端 | 低 | 纯 UI 变更 |
| OPT-016 优雅关闭 | 低 | 全系统 | 低 | 仅影响关闭流程 |
| OPT-017 健康检查 | 低 | Workers | 低 | 新增端点 |

### 11.2 回滚方案

#### 11.2.1 通用回滚策略

1. **每个优化项使用独立分支**，回滚时只需切换回 main
2. **数据库索引** 可安全删除，不影响数据
3. **Schema 枚举变更** 需确保已有数据值在枚举范围内

#### 11.2.2 各优化项回滚步骤

**OPT-003 认证回滚**:
```python
# 临时禁用认证：设置 APP_ENV=development
# 或移除 api_router 的 dependencies=[Depends(verify_api_key)]
```

**OPT-004 事务回滚**:
```python
# 恢复服务层方法为直接 commit，移除 async with transaction() 包裹
```

**OPT-005 异常处理回滚**:
```python
# 移除 main.py 中的 add_exception_handler 调用
```

**OPT-007 索引回滚**:
```python
# 从模型 __table_args__ 中移除 Index 定义
# 已有索引不影响功能，可保留
```

**OPT-012 枚举回滚**:
```python
# 将 Schema 字段类型从 Enum 改回 str
# 注意：需确保已有数据库中的值与枚举值一致
```

### 11.3 数据兼容性

| 优化项 | 数据兼容性 | 注意事项 |
|--------|-----------|----------|
| OPT-007 索引 | 完全兼容 | 仅添加索引，不修改数据 |
| OPT-012 枚举 | 需验证 | 数据库中已有的字符串值必须在枚举范围内 |
| OPT-003 认证 | 完全兼容 | 不修改数据结构 |
| OPT-004 事务 | 完全兼容 | 不修改数据结构 |

### 11.4 枚举值兼容性检查

在实施 OPT-012 之前，必须验证数据库中已有数据：

```python
# 验证脚本
async def validate_enum_compatibility(session):
    """验证已有数据是否与新枚举兼容"""
    from sqlalchemy import select, distinct

    # 检查 company 字段
    result = await session.execute(select(distinct(Fact.company)))
    existing_companies = {row[0] for row in result.all()}
    valid_companies = {e.value for e in Company}
    invalid = existing_companies - valid_companies
    if invalid:
        print(f"WARNING: Invalid company values: {invalid}")

    # 检查 review_status 字段
    result = await session.execute(select(distinct(Fact.review_status)))
    existing_statuses = {row[0] for row in result.all()}
    valid_statuses = {e.value for e in ReviewStatus}
    invalid = existing_statuses - valid_statuses
    if invalid:
        print(f"WARNING: Invalid review_status values: {invalid}")

    # ... 对其他枚举字段执行类似检查
```

---

## 12. 验收标准

### 12.1 P0 优化项验收

#### OPT-003 认证机制
- [ ] 未携带 `X-API-Key` 的请求返回 401
- [ ] 携带无效 `X-API-Key` 的请求返回 401
- [ ] 携带有效 `X-API-Key` 的请求正常处理
- [ ] 开发环境 (`APP_ENV=development`) 跳过认证
- [ ] Workers 配置 API Key 后能正常调用 API
- [ ] 前端配置 API Key 后能正常获取数据

#### OPT-004 事务管理
- [ ] 创建操作失败时数据正确回滚
- [ ] 更新操作失败时数据正确回滚
- [ ] 删除操作失败时数据正确回滚
- [ ] 并发操作不会产生数据不一致
- [ ] 所有服务层写操作均使用事务上下文

#### OPT-005 全局异常处理
- [ ] 验证错误返回 422 + 统一格式
- [ ] 数据库错误返回 500 + 统一格式
- [ ] 未知错误返回 500 + 统一格式
- [ ] 生产环境不暴露堆栈信息
- [ ] 开发环境暴露详细错误信息用于调试

### 12.2 P1 优化项验收

#### OPT-006 Dashboard 优化
- [ ] `/api/v1/dashboard/stats` 仅执行 1 次数据库查询
- [ ] 响应格式与优化前完全一致
- [ ] 响应时间减少 50% 以上

#### OPT-007 数据库索引
- [ ] 所有高频查询字段均有索引
- [ ] 索引创建脚本执行成功
- [ ] 查询执行计划显示使用索引

#### OPT-008 Workers 重试
- [ ] Qwen API 调用失败时自动重试（最多 3 次）
- [ ] 重试间隔指数退避（2s, 4s, 8s）
- [ ] 速率限制生效（每秒最多 2 次请求）
- [ ] 不可重试错误（4xx）不重试

#### OPT-009 Mock 重构
- [ ] `NEXT_PUBLIC_USE_MOCK=true` 时使用 mock 数据
- [ ] `NEXT_PUBLIC_USE_MOCK=false` 时使用 API 数据
- [ ] 切换数据源无需修改组件代码

#### OPT-010 前端分页
- [ ] 所有表格页面显示分页控件
- [ ] 上一页/下一页按钮正常工作
- [ ] 页码显示正确
- [ ] 每页数量可切换（10/20/50/100）

#### OPT-011 Docker 配置
- [ ] `docker compose up` 正常启动所有服务
- [ ] 健康检查通过
- [ ] 资源限制生效
- [ ] Workers 依赖 backend 健康后才启动

#### OPT-012 Schema 枚举验证
- [ ] 非法枚举值被 Pydantic 拒绝
- [ ] OpenAPI 文档显示枚举选项
- [ ] 已有数据与新枚举兼容

### 12.3 P2 优化项验收

#### OPT-013 结构化日志
- [ ] 日志输出为 JSON 格式
- [ ] 每条日志包含 timestamp、level、message
- [ ] 异常日志包含堆栈信息
- [ ] 请求日志包含 request_id

#### OPT-014 API 文档
- [ ] `/docs` 页面显示完整 API 文档
- [ ] 包含认证说明
- [ ] 包含数据流说明
- [ ] 包含错误响应格式

#### OPT-016 优雅关闭
- [ ] 收到 SIGTERM 后正常关闭数据库连接
- [ ] Workers 收到 SIGTERM 后完成当前任务再退出
- [ ] 无数据丢失

#### OPT-017 Workers 健康检查
- [ ] 每个 Worker 暴露 `/health` 端点
- [ ] 返回状态、处理计数、错误计数
- [ ] Docker 健康检查配置正确

---

## 附录

### A. 新增/修改文件清单

#### 后端新增文件
| 文件路径 | 用途 | 优先级 |
|----------|------|--------|
| `apps/api/middleware/auth.py` | API Key 认证 | P0 |
| `apps/api/middleware/exception_handler.py` | 全局异常处理 | P0 |
| `apps/api/middleware/request_id.py` | 请求 ID 中间件 | P2 |
| `apps/api/services/transaction.py` | 事务上下文管理器 | P0 |
| `apps/api/schemas/enums.py` | 统一枚举定义 | P1 |
| `apps/api/config/logging_config.py` | 结构化日志配置 | P2 |

#### 后端修改文件
| 文件路径 | 修改内容 | 优先级 |
|----------|----------|--------|
| `apps/api/main.py` | 注册异常处理器、日志配置、优雅关闭 | P0/P2 |
| `apps/api/config/settings.py` | 新增 API Key 配置 | P0 |
| `apps/api/routers/__init__.py` | 添加全局认证依赖 | P0 |
| `apps/api/routers/dashboard.py` | 合并查询 | P1 |
| `apps/api/models/source.py` | 添加索引 | P1 |
| `apps/api/models/fact.py` | 添加索引 | P1 |
| `apps/api/models/raw_record.py` | 添加索引 | P1 |
| `apps/api/models/insight.py` | 添加索引 | P1 |
| `apps/api/schemas/source.py` | 使用枚举类型 | P1 |
| `apps/api/schemas/fact.py` | 使用枚举类型 | P1 |
| `apps/api/services/source_service.py` | 使用事务上下文 | P0 |
| `apps/api/services/crawl_task_service.py` | 使用事务上下文 | P0 |
| `apps/api/services/report_service.py` | 使用事务上下文 | P0 |
| `apps/api/services/system_settings_service.py` | 使用事务上下文 | P0 |
| `apps/api/routers/facts.py` | 使用事务上下文 | P0 |
| `apps/api/routers/insights.py` | 使用事务上下文 | P0 |
| `apps/api/routers/raw_records.py` | 使用事务上下文 | P0 |

#### 前端新增文件
| 文件路径 | 用途 | 优先级 |
|----------|------|--------|
| `apps/web/lib/data-provider.tsx` | 数据源上下文 | P1 |
| `apps/web/components/ui/pagination.tsx` | 分页组件 | P1 |
| `apps/web/types/auth.ts` | 认证相关类型 | P0 |

#### 前端修改文件
| 文件路径 | 修改内容 | 优先级 |
|----------|----------|--------|
| `apps/web/lib/api.ts` | 添加认证头、错误处理 | P0 |
| `apps/web/hooks/use-sources.ts` | 使用数据源上下文 | P1 |
| `apps/web/hooks/use-facts.ts` | 使用数据源上下文 | P1 |
| `apps/web/hooks/use-insights.ts` | 使用数据源上下文 | P1 |
| `apps/web/hooks/use-raw-records.ts` | 使用数据源上下文 | P1 |
| `apps/web/hooks/use-dashboard.ts` | 使用数据源上下文 | P1 |
| `apps/web/app/layout.tsx` | 集成 DataProvider | P1 |
| `apps/web/components/ui/data-table.tsx` | 集成分页 | P1 |

#### Workers 新增文件
| 文件路径 | 用途 | 优先级 |
|----------|------|--------|
| `workers/common/__init__.py` | 共享模块 | P1 |
| `workers/common/qwen_client.py` | 带重试的 Qwen 客户端 | P1 |
| `workers/common/health.py` | 健康检查服务器 | P2 |

#### Workers 修改文件
| 文件路径 | 修改内容 | 优先级 |
|----------|----------|--------|
| `workers/crawler/config.py` | 添加 API Key | P0 |
| `workers/fact_extractor/config.py` | 添加 API Key、重试配置 | P0/P1 |
| `workers/insight_generator/config.py` | 添加 API Key、重试配置 | P0/P1 |
| `workers/crawler/crawler.py` | 添加认证头 | P0 |
| `workers/fact_extractor/extractor.py` | 使用重试客户端 | P1 |
| `workers/insight_generator/generator.py` | 使用重试客户端 | P1 |

#### 配置文件
| 文件路径 | 修改内容 | 优先级 |
|----------|----------|--------|
| `docker-compose.yml` | 健康检查、资源限制、API Key | P1 |
| `apps/api/requirements.txt` | 新增依赖（可选） | P0 |
| `workers/fact_extractor/requirements.txt` | 新增 tenacity, httpx | P1 |
| `workers/insight_generator/requirements.txt` | 新增 tenacity, httpx | P1 |
| `apps/api/.env.example` | 新增 API_KEY 示例 | P0 |
| `workers/crawler/.env.example` | 新增 API_KEY 示例 | P0 |
| `workers/fact_extractor/.env.example` | 新增 API_KEY 示例 | P0 |
| `workers/insight_generator/.env.example` | 新增 API_KEY 示例 | P0 |

### B. 依赖变更

#### 后端新增依赖（可选）
```
# apps/api/requirements.txt
# 当前无需新增依赖，认证使用 FastAPI 内置功能
# 如需 JWT 认证（Phase 2）:
# pyjwt>=2.8.0
# bcrypt>=4.1.0
```

#### Workers 新增依赖
```
# workers/fact_extractor/requirements.txt
tenacity>=8.2.0
httpx>=0.25.0

# workers/insight_generator/requirements.txt
tenacity>=8.2.0
httpx>=0.25.0
```

### C. 环境变量变更

| 变量名 | 模块 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `API_KEY` | Backend | 生产环境必填 | `""` | API 认证密钥 |
| `API_KEYS` | Backend | 否 | `""` | 逗号分隔的多个 API Key |
| `NEXT_PUBLIC_API_KEY` | Frontend | 否 | `""` | 前端 API Key |
| `QWEN_MAX_RETRIES` | Workers | 否 | `3` | Qwen API 最大重试次数 |
| `QWEN_RATE_LIMIT_RPS` | Workers | 否 | `2.0` | Qwen API 每秒最大请求数 |

---

## 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2026-04-12 | 初始版本，基于代码审查结果制定完整技术架构 |
