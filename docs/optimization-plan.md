# AI 研究平台 - 技术优化计划

## 文档概述

本文档基于代码审查结果，整理了17个技术优化点，按优先级分类并制定实施方案。

---

## 一、高优先级优化项（P0 - 必须修复）

### 1.1 API路径统一化

**问题描述**：前端、后端、Workers之间的API路径定义不一致，导致系统组件无法正常通信。

**当前状态**：
| 位置 | 当前路径 | 问题 |
|------|----------|------|
| 前端 lib/api/sources.ts | `api/sources` | 缺少 `/api/v1` 前缀 |
| 后端 routers/__init__.py | `/api/v1` | 正确 |
| crawler config.py | `/sources/` | 缺少 `/api/v1` 前缀 |
| fact_extractor config.py | `/api/v1/raw-records/` | 正确 |
| insight_generator config.py | `/api/v1/facts/` | 正确 |

**实施方案**：

1. **前端修复** - 修改 `lib/api.ts` 和所有API文件：
```typescript
// lib/api.ts
export const createApiUrl = (path: string) => `${API_BASE_URL}/api/v1/${path}`;

// lib/api/sources.ts
export async function getSources(params?: SourcesFilter): Promise<PaginatedResponse<Source>> {
  return api.get(createApiUrl('sources'), { searchParams }).json<PaginatedResponse<Source>>();
}
```

2. **crawler修复** - 修改 `workers/crawler/config.py`：
```python
@property
def sources_url(self) -> str:
    return f"{self.api_base_url}/api/v1/sources/"

@property
def raw_records_url(self) -> str:
    return f"{self.api_base_url}/api/v1/raw-records/"
```

**影响范围**：全系统
**预计工作量**：0.5小时
**风险等级**：低

---

### 1.2 前后端数据字段映射统一

**问题描述**：前端TypeScript类型定义与后端Pydantic Schema字段名不一致。

**字段对照表**：
| 前端字段 | 后端字段 | 实体 |
|------------------------|------------------------|------|
| `isActive` | `enabled` | Source |
| `type` | `source_type` | Source |
| `description` | `notes` | Source |
| `lastFetchedAt` | 无此字段 | Source |
| `status` | `review_status` | Fact |
| `eventType` | `event_type` | Fact |
| `summary` | `fact_summary` | Fact |

**实施方案**：

方案A（推荐）：修改前端类型定义匹配后端

```typescript
// types/entities.ts
export interface Source {
  id: string;
  name: string;
  company: Company;
  source_type: SourceType;  // 改名
  url: string;
  notes: string | null;     // 改名
  enabled: boolean;         // 改名
  schedule: string | null;
  parser_type: string | null;
  priority: string;
  created_at: string;       // 改名
  updated_at: string;       // 改名
}

export interface Fact {
  id: string;
  raw_record_id: string;
  company: Company;
  fact_summary: string;     // 改名
  topic_level_1: string;
  topic_level_2: string | null;
  event_type: EventType;    // 改名
  entity_type: string;
  entity_name: string;
  importance_level: string;
  capability_level: string | null;
  confidence: string;
  published_at: string | null;
  source_url: string;
  needs_review: boolean;
  review_status: FactStatus; // 改名
  created_at: string;
  updated_at: string;
}
```

方案B：后端Schema添加别名（不推荐，增加维护成本）

**影响范围**：前端所有页面组件
**预计工作量**：2小时
**风险等级**：中

---

### 1.3 认证/授权机制实现

**问题描述**：所有API端点无认证保护，存在安全风险。

**实施方案**：

1. **添加API Key认证**（Phase 1）：
```python
# apps/api/middleware/auth.py
from fastapi import Depends, HTTPException, Header
from config import settings

async def verify_api_key(x_api_key: str = Header(None)):
    if settings.app_env == "development":
        return True
    if x_api_key != settings.api_key:
        raise HTTPException(status_code=401, detail="Invalid API Key")
    return True

# apps/api/main.py
from middleware.auth import verify_api_key

app.dependency_overrides[verify_api_key] = verify_api_key
```

2. **添加JWT认证**（Phase 2）：
- 用户登录接口
- JWT token生成和验证
- 基于角色的访问控制（RBAC）

3. **请求速率限制**：
```python
# apps/api/middleware/rate_limit.py
from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    # 实现速率限制逻辑
```

**影响范围**：后端API、Workers、前端
**预计工作量**：4小时（Phase 1）+ 8小时（Phase 2）
**风险等级**：中

---

### 1.4 数据库事务管理

**问题描述**：服务层数据库操作缺少事务上下文管理。

**实施方案**：

```python
# apps/api/services/base.py
from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import AsyncSession

@asynccontextmanager
async def transaction(session: AsyncSession):
    try:
        yield session
        await session.commit()
    except Exception:
        await session.rollback()
        raise

# apps/api/services/source_service.py
async def create(self, data: SourceCreate) -> Source:
    async with transaction(self.session) as session:
        source = Source(**data.model_dump())
        session.add(source)
        await session.flush()
        await session.refresh(source)
    return source
```

**影响范围**：所有服务层
**预计工作量**：1小时
**风险等级**：低

---

### 1.5 全局异常处理

**问题描述**：缺少统一的异常处理机制，错误可能泄露敏感信息。

**实施方案**：

```python
# apps/api/middleware/exception_handler.py
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from schemas import ErrorResponse
import logging

logger = logging.getLogger(__name__)

async def exception_handler_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except HTTPException as e:
        return JSONResponse(
            status_code=e.status_code,
            content=ErrorResponse(
                success=False,
                error=e.detail,
                detail=None
            ).model_dump()
        )
    except Exception as e:
        logger.exception(f"Unhandled exception: {e}")
        return JSONResponse(
            status_code=500,
            content=ErrorResponse(
                success=False,
                error="Internal server error",
                detail=None if settings.is_production else str(e)
            ).model_dump()
        )

# apps/api/main.py
app.middleware("http")(exception_handler_middleware)
```

**影响范围**：后端API
**预计工作量**：0.5小时
**风险等级**：低

---

## 二、中优先级优化项（P1 - 建议修复）

### 2.1 Dashboard API性能优化

**问题描述**：Dashboard端点执行4个独立数据库查询，无缓存机制。

**实施方案**：

1. **合并查询**：
```python
# apps/api/routers/dashboard.py
from sqlalchemy import select, func

@router.get("/stats")
async def get_dashboard_stats(session: AsyncSession = Depends(get_session)):
    stats_query = select(
        func.count(Fact.id).label("total_facts"),
        func.count(Fact.id).filter(Fact.review_status == "pending").label("pending_review"),
        func.count(Insight.id).label("total_insights"),
        func.count(Source.id).filter(Source.enabled == True).label("active_sources"),
    )
    result = await session.execute(stats_query)
    row = result.one()
    return {
        "today_fact_count": row.total_facts,
        "pending_review_count": row.pending_review,
        "insight_count": row.total_insights,
        "active_source_count": row.active_sources,
    }
```

2. **添加Redis缓存**（可选）：
```python
# apps/api/services/cache.py
import redis.asyncio as redis
from config import settings

redis_client = redis.from_url(settings.redis_url)

async def get_cached_stats():
    cached = await redis_client.get("dashboard:stats")
    if cached:
        return json.loads(cached)
    # 计算并缓存
    stats = await compute_stats()
    await redis_client.setex("dashboard:stats", 60, json.dumps(stats))
    return stats
```

**影响范围**：Dashboard页面
**预计工作量**：1小时
**风险等级**：低

---

### 2.2 数据库索引添加

**问题描述**：高频查询字段缺少索引，影响查询性能。

**实施方案**：

```python
# apps/api/models/source.py
class Source(Base, TimestampMixin):
    __tablename__ = "sources"
    __table_args__ = (
        Index("ix_sources_company", "company"),
        Index("ix_sources_enabled", "enabled"),
        Index("ix_sources_source_type", "source_type"),
    )

# apps/api/models/fact.py
class Fact(Base, TimestampMixin):
    __tablename__ = "facts"
    __table_args__ = (
        Index("ix_facts_company", "company"),
        Index("ix_facts_review_status", "review_status"),
        Index("ix_facts_created_at", "created_at"),
        Index("ix_facts_raw_record_id", "raw_record_id"),
    )

# apps/api/models/raw_record.py
class RawRecord(Base):
    __tablename__ = "raw_records"
    __table_args__ = (
        Index("ix_raw_records_company", "company"),
        Index("ix_raw_records_crawl_status", "crawl_status"),
        Index("ix_raw_records_source_id", "source_id"),
        Index("ix_raw_records_content_hash", "content_hash"),
    )
```

**影响范围**：数据库性能
**预计工作量**：0.5小时
**风险等级**：低

---

### 2.3 AI Workers重试与速率限制

**问题描述**：Qwen API调用缺少重试机制和速率限制。

**实施方案**：

```python
# workers/common/qwen_client.py
import asyncio
from tenacity import retry, stop_after_attempt, wait_exponential
from functools import wraps

class QwenClient:
    def __init__(self, api_key: str, model: str):
        self.api_key = api_key
        self.model = model
        self._semaphore = asyncio.Semaphore(5)  # 并发限制
        self._request_count = 0
        self._last_request_time = 0

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
    )
    async def call(self, prompt: str) -> dict:
        async with self._semaphore:
            await self._rate_limit()
            return await self._actual_call(prompt)

    async def _rate_limit(self):
        min_interval = 0.5  # 最小请求间隔
        elapsed = time.time() - self._last_request_time
        if elapsed < min_interval:
            await asyncio.sleep(min_interval - elapsed)
        self._last_request_time = time.time()

    async def _actual_call(self, prompt: str) -> dict:
        # 实际API调用逻辑
        pass
```

**影响范围**：fact_extractor, insight_generator
**预计工作量**：2小时
**风险等级**：低

---

### 2.4 前端Mock逻辑重构

**问题描述**：每个页面组件重复Mock判断逻辑。

**实施方案**：

```typescript
// lib/data-provider.tsx
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

// hooks/use-sources.ts
export function useSources(filter?: SourcesFilter) {
  const { isMock } = useDataSource();
  
  if (isMock) {
    return useMockSources(filter);
  }
  
  return useSWR<PaginatedResponse<Source>>(['sources', filter], () => getSources(filter));
}
```

**影响范围**：前端所有页面
**预计工作量**：2小时
**风险等级**：低

---

### 2.5 前端分页实现

**问题描述**：DataTable组件缺少分页功能。

**实施方案**：

```typescript
// components/ui/pagination.tsx
interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function Pagination({ page, pageSize, total, totalPages, onPageChange, onPageSizeChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="text-sm text-muted-foreground">
        显示 {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} 条，共 {total} 条
      </div>
      <div className="flex items-center gap-2">
        <Button disabled={page <= 1} onClick={() => onPageChange(page - 1)}>上一页</Button>
        <span>第 {page} / {totalPages} 页</span>
        <Button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>下一页</Button>
      </div>
    </div>
  );
}

// components/ui/data-table.tsx
interface DataTableProps<T> {
  // ... 现有属性
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
}
```

**影响范围**：所有表格页面
**预计工作量**：1.5小时
**风险等级**：低

---

### 2.6 Docker配置优化

**问题描述**：docker-compose.yml缺少健康检查、资源限制、网络配置不完整。

**实施方案**：

```yaml
# docker-compose.yml
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
    deploy:
      resources:
        limits:
          memory: 512M

  backend:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=sqlite:///./data/research.db
      - APP_ENV=production
    volumes:
      - backend-data:/app/data
    networks:
      - ai-research-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          memory: 256M

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    networks:
      - ai-research-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  backend-data:

networks:
  ai-research-network:
    driver: bridge
```

**影响范围**：部署环境
**预计工作量**：1小时
**风险等级**：低

---

### 2.7 Schema枚举验证

**问题描述**：Schema字段使用普通字符串，缺少值验证。

**实施方案**：

```python
# apps/api/schemas/enums.py
from enum import Enum

class Company(str, Enum):
    ALIBABA = "alibaba"
    BYTE_DANCE = "byte_dance"
    TENCENT = "tencent"

class TopicLevel1(str, Enum):
    PRODUCT_TECH = "产品技术"
    BUSINESS_MODEL = "商业模式"
    MARKET_COMPETITION = "市场竞争"
    ORG_MANAGEMENT = "组织管理"
    FINANCE = "财务表现"
    LEGAL = "法律合规"
    OTHER = "其他"

class ImportanceLevel(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class Confidence(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class ReviewStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    REJECTED = "rejected"
    INSIGHT_GENERATED = "insight_generated"

# apps/api/schemas/fact.py
from .enums import Company, TopicLevel1, ImportanceLevel, Confidence, ReviewStatus

class FactBase(BaseSchema):
    company: Company
    fact_summary: str
    topic_level_1: TopicLevel1
    event_type: EventType
    importance_level: ImportanceLevel
    confidence: Confidence
```

**影响范围**：所有Schema
**预计工作量**：1小时
**风险等级**：低

---

## 三、低优先级优化项（P2 - 可选优化）

### 3.1 结构化日志记录

**实施方案**：
```python
# apps/api/utils/logging.py
import structlog

def setup_logging():
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.JSONRenderer(),
        ],
    )
```

**预计工作量**：1小时

---

### 3.2 API文档增强

**实施方案**：
```python
# apps/api/main.py
app = FastAPI(
    title="AI Research Platform API",
    description="""
    ## 概述
    AI研究平台后端API，用于管理信息源、原始记录、标准化事实和研究结论。
    
    ## 认证
    所有API需要X-API-Key头进行认证。
    
    ## 数据流
    1. 信息源(Source) → 爬虫采集 → 原始记录(RawRecord)
    2. 原始记录 → AI抽取 → 标准化事实(Fact)
    3. 标准化事实 → AI分析 → 研究结论(Insight)
    """,
    version="0.1.0",
)
```

**预计工作量**：0.5小时

---

### 3.3 国际化支持

**实施方案**：
```typescript
// lib/i18n.ts
import { createI18n } from 'next-intl';

export const i18n = createI18n({
  locales: ['zh', 'en'],
  defaultLocale: 'zh',
  messages: {
    zh: { /* 中文翻译 */ },
    en: { /* 英文翻译 */ },
  },
});
```

**预计工作量**：4小时

---

### 3.4 Workers健康检查

**实施方案**：
```python
# workers/common/health.py
from fastapi import FastAPI
import asyncio

health_app = FastAPI()

@health_app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

async def start_health_server():
    from uvicorn import Config, Server
    config = Config(health_app, host="0.0.0.0", port=8080)
    server = Server(config)
    await server.serve()
```

**预计工作量**：1小时

---

## 四、实施计划

### Phase 1：基础修复（预计2天）

| 任务 | 优先级 | 工作量 | 负责模块 |
|------|--------|--------|----------|
| API路径统一化 | P0 | 0.5h | 全系统 |
| 全局异常处理 | P0 | 0.5h | 后端 |
| 数据库事务管理 | P0 | 1h | 后端 |
| 数据库索引添加 | P1 | 0.5h | 后端 |
| Docker配置优化 | P1 | 1h | DevOps |

### Phase 2：数据层修复（预计1天）

| 任务 | 优先级 | 工作量 | 负责模块 |
|------|--------|--------|----------|
| 前后端字段映射 | P0 | 2h | 前端 |
| Schema枚举验证 | P1 | 1h | 后端 |
| Dashboard性能优化 | P1 | 1h | 后端 |

### Phase 3：功能增强（预计2天）

| 任务 | 优先级 | 工作量 | 负责模块 |
|------|--------|--------|----------|
| 认证机制(Phase 1) | P0 | 4h | 后端 |
| AI Workers重试机制 | P1 | 2h | Workers |
| 前端Mock重构 | P1 | 2h | 前端 |
| 前端分页实现 | P1 | 1.5h | 前端 |

### Phase 4：可选优化（预计1天）

| 任务 | 优先级 | 工作量 | 负责模块 |
|------|--------|--------|----------|
| 结构化日志 | P2 | 1h | 后端 |
| API文档增强 | P2 | 0.5h | 后端 |
| Workers健康检查 | P2 | 1h | Workers |

---

## 五、验收标准

### P0优化项验收标准

1. **API路径统一化**
   - 所有API调用返回正确响应
   - Workers能正常与后端通信
   - 前端能正常获取数据

2. **前后端字段映射**
   - 所有页面数据正确渲染
   - CRUD操作正常执行
   - 无字段名相关错误

3. **认证机制**
   - 未认证请求返回401
   - 认证请求正常处理
   - 速率限制生效

4. **事务管理**
   - 异常时数据正确回滚
   - 无数据不一致情况

5. **异常处理**
   - 错误返回统一格式
   - 生产环境不泄露敏感信息

---

## 六、版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2026-04-10 | 初始版本，基于代码审查结果整理 |