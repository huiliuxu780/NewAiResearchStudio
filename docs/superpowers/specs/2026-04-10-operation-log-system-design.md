# 操作日志系统设计文档

## 概述

为AI研究平台添加操作日志系统，记录所有CRUD操作和AI处理日志，提供前端查看和筛选功能。

## 范围

### 包含功能
- LOG-001: 操作日志记录（CRUD操作审计）
- LOG-002: 系统日志查看页（前端列表+筛选）
- LOG-004: AI处理日志（记录AI调用）

### 不包含功能（后续迭代）
- LOG-003: 日志导出（在Phase 5.2统一实现）
- LOG-005: 错误日志告警（后续迭代）

## 数据模型

### OperationLog 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | str (UUID) | 主键 |
| user_id | str | 操作人（暂时固定为"admin"） |
| action | str | 操作类型：create/update/delete/read |
| entity_type | str | 实体类型：source/fact/insight/raw_record/task |
| entity_id | str | 实体ID |
| old_value | JSON | 更新前的数据（create时为空） |
| new_value | JSON | 更新后的数据（delete时为空） |
| ip_address | str | 客户端IP |
| user_agent | str | 客户端User-Agent |
| status | str | 状态：success/failed |
| error_message | str | 失败时的错误信息 |
| created_at | datetime | 创建时间 |

### AILog 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | str (UUID) | 主键 |
| task_type | str | 任务类型：fact_extraction/insight_generation |
| model_name | str | 模型名称：qwen-turbo等 |
| input_prompt | str | 输入提示词（截断至1000字符） |
| output_result | str | 输出结果（截断至1000字符） |
| input_tokens | int | 输入token数 |
| output_tokens | int | 输出token数 |
| cost_ms | int | 耗时（毫秒） |
| status | str | 状态：success/failed |
| error_message | str | 失败时的错误信息 |
| source_entity_id | str | 关联的原始记录ID |
| created_at | datetime | 创建时间 |

## 架构设计

### 后端组件

```
apps/api/
├── models/
│   ├── operation_log.py      # SQLAlchemy模型
│   └── ai_log.py             # SQLAlchemy模型
├── schemas/
│   ├── operation_log.py      # Pydantic schema
│   └── ai_log.py             # Pydantic schema
├── services/
│   └── log_service.py        # 日志服务核心逻辑
├── middleware/
│   └── operation_log.py      # 装饰器实现
├── routers/
│   └── logs.py               # 日志查询API
└── utils/
    └── request_context.py    # 请求上下文（IP、UA等）
```

### 前端组件

```
apps/web/
├── app/
│   └── logs/
│       └── page.tsx          # 日志列表页
├── components/
│   └── logs/
│       ├── log-table.tsx     # 日志表格
│       ├── log-filter.tsx    # 筛选器
│       ├── log-detail-sheet.tsx  # 详情侧边栏
│       └── ai-log-tab.tsx    # AI日志Tab
├── hooks/
│   └── use-logs.ts           # 日志数据获取
└── types/
    └── logs.ts               # TypeScript类型定义
```

## 核心实现

### 1. 装饰器自动记录

```python
@log_operation(action="create", entity_type="source")
@router.post("/sources")
async def create_source(source: SourceCreate):
    ...
```

装饰器职责：
- 捕获请求的IP、User-Agent
- 在操作前后获取数据快照（old_value/new_value）
- 自动记录操作结果（success/failed）
- 异常时记录错误信息

### 2. 手动调用记录

```python
await log_service.create_manual_log(
    action="test",
    entity_type="source",
    entity_id=source_id,
    new_value={"result": result},
    status="success"
)
```

用于复杂场景：
- 非CRUD操作（如测试连接、手动触发任务）
- 需要记录额外上下文信息
- 跨多个实体的操作

### 3. AI日志记录

在AI Workers中调用：

```python
await log_service.create_ai_log(
    task_type="fact_extraction",
    model_name="qwen-turbo",
    input_prompt=prompt[:1000],
    output_result=str(response)[:1000],
    input_tokens=response.usage.prompt_tokens,
    output_tokens=response.usage.completion_tokens,
    cost_ms=int((time.time() - start_time) * 1000),
    status="success",
    source_entity_id=raw_record_id
)
```

### 4. 日志查询API

```
GET /api/v1/logs/operations
  ?action=create|update|delete|read
  &entity_type=source|fact|insight
  &status=success|failed
  &start_date=2026-04-01
  &end_date=2026-04-10
  &keyword=搜索词
  &page=1
  &page_size=20

GET /api/v1/logs/ai
  ?task_type=fact_extraction|insight_generation
  &model_name=qwen-turbo
  &status=success|failed
  &start_date=2026-04-01
  &end_date=2026-04-10
  &page=1
  &page_size=20

GET /api/v1/logs/operations/{log_id}
GET /api/v1/logs/ai/{log_id}
```

## 前端设计

### 页面布局

- Tab切换：操作日志 / AI日志
- 顶部：筛选器（操作类型、实体类型、状态、时间范围、关键词）
- 中部：数据表格
- 右侧：详情侧边栏（点击详情按钮展开）

### 筛选器

**操作日志筛选**:
- 操作类型：创建/更新/删除/查询
- 实体类型：数据源/事实/结论/原始记录
- 状态：成功/失败
- 时间范围：日期选择器
- 关键词搜索：实体ID或错误信息

**AI日志筛选**:
- 任务类型：事实抽取/结论生成
- 模型名称：下拉选择
- 状态：成功/失败
- 时间范围：日期选择器

### 表格列

**操作日志**:
时间 | 操作人 | 操作类型 | 实体类型 | 实体ID | 状态 | 详情

**AI日志**:
时间 | 任务类型 | 模型 | 耗时 | Token消耗 | 状态 | 详情

### 详情侧边栏

**操作日志详情**:
- 基本信息：时间、操作人、操作类型、实体
- old_value: JSON展示（create时显示"无"）
- new_value: JSON展示（delete时显示"无"）
- 错误信息（如果有）

**AI日志详情**:
- 基本信息：时间、任务类型、模型、状态
- 输入提示词（完整内容）
- 输出结果（完整内容）
- Token统计：input/output/total
- 耗时：XX ms
- 错误信息（如果有）

## 错误处理

- 日志记录失败不应影响主业务流程
- 使用 try-except 包裹日志记录逻辑
- 日志记录失败时输出警告日志到控制台

## 性能考虑

- 日志表数据量大时，添加索引：created_at, entity_type, action
- 前端分页加载，默认每页20条
- input_prompt 和 output_result 截断存储，避免过大

## 测试策略

- 单元测试：log_service 核心逻辑
- 集成测试：装饰器是否正确记录
- 前端测试：筛选器功能、表格渲染、详情展示
