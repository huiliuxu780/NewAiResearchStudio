# AI 研究平台 - 数据契约

## 1. 核心实体模型

### 1.1 实体关系图

```
Source (信息源)
    │
    ├── 1:N ──→ RawRecord (原始记录)
    │                │
    │                └── 1:N ──→ Fact (标准化事实)
    │                                │
    │                                └── 1:N ──→ Insight (研究结论)
    │
    └── 关联 ──→ ModelProfile (模型档案)
    └── 关联 ──→ ProductProfile (产品档案)

ResearchTopic (研究主题)
    ├── M:N ──→ Fact
    └── M:N ──→ Insight

WeeklyReport (周报)
    ├── M:N ──→ Fact
    └── M:N ──→ Insight
```

---

## 2. 枚举定义

### 2.1 公司枚举 (Company)

| 枚举值 | 英文标识 | 中文名称 | 说明 |
|--------|----------|----------|------|
| 阿里 | alibaba | 阿里巴巴 | 含阿里云、通义千问等 |
| 字节 | bytedance | 字节跳动 | 含火山引擎、豆包等 |
| 腾讯 | tencent | 腾讯 | 含腾讯云、混元等 |

### 2.2 来源类型 (SourceType)

| 枚举值 | 英文标识 | 说明 |
|--------|----------|------|
| 官方文档 | official_doc | 官方技术文档 |
| 官方博客 | official_blog | 官方博客文章 |
| 产品官网 | product_site | 产品官方网站 |
| 更新日志 | changelog | 产品更新日志 |
| GitHub | github | GitHub 仓库 |
| 媒体资讯 | media | 媒体新闻报道 |
| 应用页面 | app_page | 应用商店页面 |
| 开放平台 | open_platform | 开放平台文档 |

### 2.3 采集类型 (CrawlType)

| 枚举值 | 英文标识 | 说明 |
|--------|----------|------|
| 模型情报 | model_intel | AI 模型相关信息 |
| 产品情报 | product_intel | 产品相关信息 |
| 新闻情报 | news_intel | 新闻媒体报道 |
| 战略情报 | strategy_intel | 战略动态信息 |

### 2.4 事件类型 (EventType)

| 枚举值 | 英文标识 | 说明 |
|--------|----------|------|
| 发布 | release | 新产品/模型发布 |
| 更新 | update | 功能/能力更新 |
| 升级 | upgrade | 版本升级 |
| 降价 | price_cut | 价格调整 |
| 开源 | open_source | 开源发布 |
| 接入 | integration | 新接入/集成 |
| 合作 | partnership | 合作伙伴关系 |
| 战略动作 | strategic | 战略决策 |
| 组织动作 | organizational | 组织架构变化 |
| 国际化动作 | international | 海外市场动作 |
| 文档更新 | doc_update | 文档内容更新 |

### 2.5 实体类型 (EntityType)

| 枚举值 | 英文标识 | 说明 |
|--------|----------|------|
| 模型 | model | AI 模型 |
| 产品 | product | AI 产品 |
| 平台 | platform | 开放平台 |
| API | api | API 接口 |
| SDK | sdk | SDK 工具包 |
| Agent | agent | Agent 应用 |
| 组织 | organization | 组织架构 |
| 战略 | strategy | 战略决策 |
| 价格体系 | pricing | 价格体系 |

### 2.6 重要性层级 (ImportanceLevel)

| 枚举值 | 英文标识 | 说明 |
|--------|----------|------|
| P0 | p0 | 最高优先级，重大事件 |
| P1 | p1 | 高优先级，重要事件 |
| P2 | p2 | 中优先级，一般事件 |
| P3 | p3 | 低优先级，次要事件 |

### 2.7 置信度 (Confidence)

| 枚举值 | 英文标识 | 说明 |
|--------|----------|------|
| 高 | high | 高置信度，信息可靠 |
| 中 | medium | 中置信度，需验证 |
| 低 | low | 低置信度，存疑 |

### 2.8 结论类型 (InsightType)

| 枚举值 | 英文标识 | 说明 |
|--------|----------|------|
| 趋势判断 | trend | 行业趋势分析 |
| 竞品分析 | competitor | 竞品对比分析 |
| 机会提示 | opportunity | 潜在机会识别 |
| 风险预警 | risk | 风险提示 |
| 跟进建议 | suggestion | 行动建议 |

### 2.9 能力层级 (CapabilityLevel)

| 枚举值 | 英文标识 | 说明 |
|--------|----------|------|
| L1 | l1 | 战略层 |
| L2 | l2 | 架构层 |
| L3 | l3 | 能力层 |
| L4 | l4 | 功能层 |
| L5 | l5 | 集成层 |
| L6 | l6 | 执行层 |

### 2.10 复核状态 (ReviewStatus)

| 枚举值 | 英文标识 | 说明 |
|--------|----------|------|
| 待复核 | pending | 等待人工复核 |
| 已确认 | confirmed | 已确认无误 |
| 已修改 | modified | 已修改内容 |
| 已驳回 | rejected | 已驳回 |

### 2.11 采集状态 (CrawlStatus)

| 枚举值 | 英文标识 | 说明 |
|--------|----------|------|
| 待采集 | pending | 等待采集 |
| 采集中 | crawling | 正在采集 |
| 成功 | success | 采集成功 |
| 失败 | failed | 采集失败 |
| 解析失败 | parse_error | 解析失败 |

### 2.12 去重状态 (DedupeStatus)

| 枚举值 | 英文标识 | 说明 |
|--------|----------|------|
| 新增 | new | 新记录 |
| 重复 | duplicate | 重复记录 |
| 待处理 | pending | 待去重处理 |

---

## 3. 实体字段定义

### 3.1 Source（信息源）

| 字段名 | 字段标识 | 类型 | 必填 | 说明 | 中文展示名 |
|--------|----------|------|------|------|------------|
| id | id | string | 是 | 主键 UUID | ID |
| name | name | string | 是 | 信息源名称 | 来源名称 |
| company | company | enum | 是 | 所属公司 | 所属公司 |
| source_type | source_type | enum | 是 | 来源类型 | 来源类型 |
| url | url | string | 是 | 来源 URL | 来源地址 |
| enabled | enabled | boolean | 是 | 是否启用 | 状态 |
| schedule | schedule | string | 否 | 采集频率 cron | 采集频率 |
| parser_type | parser_type | string | 否 | 解析器类型 | 解析器 |
| priority | priority | enum | 是 | 优先级 | 优先级 |
| notes | notes | string | 否 | 备注 | 备注 |
| created_at | created_at | datetime | 是 | 创建时间 | 创建时间 |
| updated_at | updated_at | datetime | 是 | 更新时间 | 更新时间 |

### 3.2 RawRecord（原始记录）

| 字段名 | 字段标识 | 类型 | 必填 | 说明 | 中文展示名 |
|--------|----------|------|------|------|------------|
| id | id | string | 是 | 主键 UUID | ID |
| source_id | source_id | string | 是 | 关联信息源 ID | 来源 ID |
| company | company | enum | 是 | 所属公司 | 所属公司 |
| title | title | string | 是 | 标题 | 标题 |
| url | url | string | 是 | 原文 URL | 原文地址 |
| published_at | published_at | datetime | 否 | 发布时间 | 发布时间 |
| crawled_at | crawled_at | datetime | 是 | 采集时间 | 采集时间 |
| raw_content | raw_content | text | 否 | 原始内容 | 原始内容 |
| raw_html_snapshot | raw_html_snapshot | text | 否 | HTML 快照 | HTML 快照 |
| content_hash | content_hash | string | 否 | 内容哈希 | 内容哈希 |
| language | language | string | 否 | 语言 | 语言 |
| crawl_status | crawl_status | enum | 是 | 采集状态 | 采集状态 |
| dedupe_status | dedupe_status | enum | 是 | 去重状态 | 去重状态 |
| error_message | error_message | text | 否 | 错误信息 | 错误信息 |

### 3.3 Fact（标准化事实）

| 字段名 | 字段标识 | 类型 | 必填 | 说明 | 中文展示名 |
|--------|----------|------|------|------|------------|
| id | id | string | 是 | 主键 UUID | ID |
| raw_record_id | raw_record_id | string | 是 | 关联原始记录 ID | 原始记录 ID |
| company | company | enum | 是 | 所属公司 | 所属公司 |
| fact_summary | fact_summary | text | 是 | 事实摘要 | 事实摘要 |
| topic_level_1 | topic_level_1 | string | 是 | 一级主题 | 一级主题 |
| topic_level_2 | topic_level_2 | string | 否 | 二级主题 | 二级主题 |
| event_type | event_type | enum | 是 | 事件类型 | 事件类型 |
| entity_type | entity_type | enum | 是 | 实体类型 | 实体类型 |
| entity_name | entity_name | string | 是 | 实体名称 | 实体名称 |
| importance_level | importance_level | enum | 是 | 重要性层级 | 重要性 |
| capability_level | capability_level | enum | 否 | 能力层级 | 能力层级 |
| confidence | confidence | enum | 是 | 置信度 | 置信度 |
| published_at | published_at | datetime | 否 | 发布时间 | 发布时间 |
| source_url | source_url | string | 是 | 来源 URL | 来源地址 |
| needs_review | needs_review | boolean | 是 | 是否需复核 | 需复核 |
| review_status | review_status | enum | 是 | 复核状态 | 复核状态 |
| created_at | created_at | datetime | 是 | 创建时间 | 创建时间 |
| updated_at | updated_at | datetime | 是 | 更新时间 | 更新时间 |

### 3.4 Insight（研究结论）

| 字段名 | 字段标识 | 类型 | 必填 | 说明 | 中文展示名 |
|--------|----------|------|------|------|------------|
| id | id | string | 是 | 主键 UUID | ID |
| fact_id | fact_id | string | 是 | 关联事实 ID | 事实 ID |
| company | company | enum | 是 | 所属公司 | 所属公司 |
| insight_content | insight_content | text | 是 | 结论内容 | 结论内容 |
| insight_type | insight_type | enum | 是 | 结论类型 | 结论类型 |
| impact_level | impact_level | enum | 是 | 影响层级 | 影响层级 |
| confidence | confidence | enum | 是 | 置信度 | 置信度 |
| reasoning_brief | reasoning_brief | text | 否 | 推理简述 | 推理简述 |
| action_suggestion | action_suggestion | text | 否 | 行动建议 | 行动建议 |
| created_at | created_at | datetime | 是 | 创建时间 | 创建时间 |
| updated_at | updated_at | datetime | 是 | 更新时间 | 更新时间 |

### 3.5 ModelProfile（模型档案）

| 字段名 | 字段标识 | 类型 | 必填 | 说明 | 中文展示名 |
|--------|----------|------|------|------|------------|
| id | id | string | 是 | 主键 UUID | ID |
| model_name | model_name | string | 是 | 模型名称 | 模型名称 |
| company | company | enum | 是 | 所属公司 | 所属公司 |
| model_type | model_type | string | 是 | 模型类型 | 模型类型 |
| released_at | released_at | datetime | 否 | 发布时间 | 发布时间 |
| pricing | pricing | json | 否 | 定价信息 | 定价信息 |
| core_capabilities | core_capabilities | array | 否 | 核心能力 | 核心能力 |
| context_length | context_length | integer | 否 | 上下文长度 | 上下文长度 |
| api_capabilities | api_capabilities | array | 否 | API 能力 | API 能力 |
| update_history | update_history | array | 否 | 更新历史 | 更新历史 |
| created_at | created_at | datetime | 是 | 创建时间 | 创建时间 |
| updated_at | updated_at | datetime | 是 | 更新时间 | 更新时间 |

### 3.6 ProductProfile（产品档案）

| 字段名 | 字段标识 | 类型 | 必填 | 说明 | 中文展示名 |
|--------|----------|------|------|------|------------|
| id | id | string | 是 | 主键 UUID | ID |
| product_name | product_name | string | 是 | 产品名称 | 产品名称 |
| company | company | enum | 是 | 所属公司 | 所属公司 |
| product_type | product_type | string | 是 | 产品类型 | 产品类型 |
| positioning | positioning | text | 否 | 产品定位 | 产品定位 |
| core_features | core_features | array | 否 | 核心能力 | 核心能力 |
| update_frequency | update_frequency | string | 否 | 更新节奏 | 更新节奏 |
| related_models | related_models | array | 否 | 关联模型 | 关联模型 |
| related_insights | related_insights | array | 否 | 关联结论 | 关联结论 |
| created_at | created_at | datetime | 是 | 创建时间 | 创建时间 |
| updated_at | updated_at | datetime | 是 | 更新时间 | 更新时间 |

### 3.7 ResearchTopic（研究主题）

| 字段名 | 字段标识 | 类型 | 必填 | 说明 | 中文展示名 |
|--------|----------|------|------|------|------------|
| id | id | string | 是 | 主键 UUID | ID |
| topic_name | topic_name | string | 是 | 主题名称 | 主题名称 |
| status | status | enum | 是 | 主题状态 | 状态 |
| companies | companies | array | 是 | 关注公司 | 关注公司 |
| description | description | text | 否 | 主题描述 | 描述 |
| facts_count | facts_count | integer | 否 | 关联事实数 | 关联事实数 |
| insights_count | insights_count | integer | 否 | 关联结论数 | 关联结论数 |
| created_at | created_at | datetime | 是 | 创建时间 | 创建时间 |
| updated_at | updated_at | datetime | 是 | 更新时间 | 更新时间 |

### 3.8 WeeklyReport（周报）

| 字段名 | 字段标识 | 类型 | 必填 | 说明 | 中文展示名 |
|--------|----------|------|------|------|------------|
| id | id | string | 是 | 主键 UUID | ID |
| report_name | report_name | string | 是 | 报告名称 | 报告名称 |
| report_type | report_type | enum | 是 | 报告类型 | 报告类型 |
| generated_at | generated_at | datetime | 是 | 生成时间 | 生成时间 |
| status | status | enum | 是 | 报告状态 | 状态 |
| content | content | text | 是 | 报告内容 | 报告内容 |
| facts_count | facts_count | integer | 否 | 关联事实数 | 关联事实数 |
| insights_count | insights_count | integer | 否 | 关联结论数 | 关联结论数 |
| created_at | created_at | datetime | 是 | 创建时间 | 创建时间 |
| updated_at | updated_at | datetime | 是 | 更新时间 | 更新时间 |

---

## 4. 中文字段映射表

### 4.1 通用字段映射

| 英文字段 | 中文展示名 |
|----------|------------|
| id | ID |
| name | 名称 |
| company | 所属公司 |
| created_at | 创建时间 |
| updated_at | 更新时间 |
| status | 状态 |
| enabled | 启用状态 |

### 4.2 枚举值中文映射

**公司枚举：**
```typescript
const COMPANY_LABELS = {
  alibaba: '阿里',
  bytedance: '字节',
  tencent: '腾讯'
}
```

**来源类型：**
```typescript
const SOURCE_TYPE_LABELS = {
  official_doc: '官方文档',
  official_blog: '官方博客',
  product_site: '产品官网',
  changelog: '更新日志',
  github: 'GitHub',
  media: '媒体资讯',
  app_page: '应用页面',
  open_platform: '开放平台'
}
```

**事件类型：**
```typescript
const EVENT_TYPE_LABELS = {
  release: '发布',
  update: '更新',
  upgrade: '升级',
  price_cut: '降价',
  open_source: '开源',
  integration: '接入',
  partnership: '合作',
  strategic: '战略动作',
  organizational: '组织动作',
  international: '国际化动作',
  doc_update: '文档更新'
}
```

**重要性层级：**
```typescript
const IMPORTANCE_LEVEL_LABELS = {
  p0: 'P0',
  p1: 'P1',
  p2: 'P2',
  p3: 'P3'
}
```

**置信度：**
```typescript
const CONFIDENCE_LABELS = {
  high: '高',
  medium: '中',
  low: '低'
}
```

**结论类型：**
```typescript
const INSIGHT_TYPE_LABELS = {
  trend: '趋势判断',
  competitor: '竞品分析',
  opportunity: '机会提示',
  risk: '风险预警',
  suggestion: '跟进建议'
}
```

**能力层级：**
```typescript
const CAPABILITY_LEVEL_LABELS = {
  l1: 'L1-战略层',
  l2: 'L2-架构层',
  l3: 'L3-能力层',
  l4: 'L4-功能层',
  l5: 'L5-集成层',
  l6: 'L6-执行层'
}
```

**复核状态：**
```typescript
const REVIEW_STATUS_LABELS = {
  pending: '待复核',
  confirmed: '已确认',
  modified: '已修改',
  rejected: '已驳回'
}
```

**采集状态：**
```typescript
const CRAWL_STATUS_LABELS = {
  pending: '待采集',
  crawling: '采集中',
  success: '成功',
  failed: '失败',
  parse_error: '解析失败'
}
```

**去重状态：**
```typescript
const DEDUPE_STATUS_LABELS = {
  new: '新增',
  duplicate: '重复',
  pending: '待处理'
}
```

---

## 5. TypeScript 类型定义

### 5.1 枚举类型

```typescript
export type Company = 'alibaba' | 'bytedance' | 'tencent'

export type SourceType = 'official_doc' | 'official_blog' | 'product_site' | 
  'changelog' | 'github' | 'media' | 'app_page' | 'open_platform'

export type CrawlType = 'model_intel' | 'product_intel' | 'news_intel' | 'strategy_intel'

export type EventType = 'release' | 'update' | 'upgrade' | 'price_cut' | 
  'open_source' | 'integration' | 'partnership' | 'strategic' | 
  'organizational' | 'international' | 'doc_update'

export type EntityType = 'model' | 'product' | 'platform' | 'api' | 
  'sdk' | 'agent' | 'organization' | 'strategy' | 'pricing'

export type ImportanceLevel = 'p0' | 'p1' | 'p2' | 'p3'

export type Confidence = 'high' | 'medium' | 'low'

export type InsightType = 'trend' | 'competitor' | 'opportunity' | 'risk' | 'suggestion'

export type CapabilityLevel = 'l1' | 'l2' | 'l3' | 'l4' | 'l5' | 'l6'

export type ReviewStatus = 'pending' | 'confirmed' | 'modified' | 'rejected'

export type CrawlStatus = 'pending' | 'crawling' | 'success' | 'failed' | 'parse_error'

export type DedupeStatus = 'new' | 'duplicate' | 'pending'
```

### 5.2 实体接口

```typescript
export interface Source {
  id: string
  name: string
  company: Company
  source_type: SourceType
  url: string
  enabled: boolean
  schedule?: string
  parser_type?: string
  priority: ImportanceLevel
  notes?: string
  created_at: string
  updated_at: string
}

export interface RawRecord {
  id: string
  source_id: string
  company: Company
  title: string
  url: string
  published_at?: string
  crawled_at: string
  raw_content?: string
  raw_html_snapshot?: string
  content_hash?: string
  language?: string
  crawl_status: CrawlStatus
  dedupe_status: DedupeStatus
  error_message?: string
}

export interface Fact {
  id: string
  raw_record_id: string
  company: Company
  fact_summary: string
  topic_level_1: string
  topic_level_2?: string
  event_type: EventType
  entity_type: EntityType
  entity_name: string
  importance_level: ImportanceLevel
  capability_level?: CapabilityLevel
  confidence: Confidence
  published_at?: string
  source_url: string
  needs_review: boolean
  review_status: ReviewStatus
  created_at: string
  updated_at: string
}

export interface Insight {
  id: string
  fact_id: string
  company: Company
  insight_content: string
  insight_type: InsightType
  impact_level: ImportanceLevel
  confidence: Confidence
  reasoning_brief?: string
  action_suggestion?: string
  created_at: string
  updated_at: string
}

export interface ModelProfile {
  id: string
  model_name: string
  company: Company
  model_type: string
  released_at?: string
  pricing?: Record<string, unknown>
  core_capabilities?: string[]
  context_length?: number
  api_capabilities?: string[]
  update_history?: Array<Record<string, unknown>>
  created_at: string
  updated_at: string
}

export interface ProductProfile {
  id: string
  product_name: string
  company: Company
  product_type: string
  positioning?: string
  core_features?: string[]
  update_frequency?: string
  related_models?: string[]
  related_insights?: string[]
  created_at: string
  updated_at: string
}

export interface ResearchTopic {
  id: string
  topic_name: string
  status: 'active' | 'completed' | 'paused'
  companies: Company[]
  description?: string
  facts_count?: number
  insights_count?: number
  created_at: string
  updated_at: string
}

export interface WeeklyReport {
  id: string
  report_name: string
  report_type: 'daily' | 'weekly' | 'special'
  generated_at: string
  status: 'draft' | 'published'
  content: string
  facts_count?: number
  insights_count?: number
  created_at: string
  updated_at: string
}
```

---

## 6. API 契约

### 6.1 通用响应格式

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
  meta?: {
    total?: number
    page?: number
    page_size?: number
  }
}
```

### 6.2 分页请求参数

```typescript
interface PaginationParams {
  page?: number
  page_size?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}
```

### 6.3 筛选参数

**Source 筛选：**
```typescript
interface SourceFilter {
  company?: Company
  source_type?: SourceType
  enabled?: boolean
}
```

**RawRecord 筛选：**
```typescript
interface RawRecordFilter {
  source_id?: string
  company?: Company
  crawl_status?: CrawlStatus
  dedupe_status?: DedupeStatus
  start_date?: string
  end_date?: string
}
```

**Fact 筛选：**
```typescript
interface FactFilter {
  company?: Company
  topic_level_1?: string
  topic_level_2?: string
  event_type?: EventType
  importance_level?: ImportanceLevel
  needs_review?: boolean
  review_status?: ReviewStatus
  start_date?: string
  end_date?: string
}
```

**Insight 筛选：**
```typescript
interface InsightFilter {
  company?: Company
  insight_type?: InsightType
  impact_level?: ImportanceLevel
  confidence?: Confidence
  start_date?: string
  end_date?: string
}
```

---

## 7. 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2026-04-10 | 初始版本，定义数据契约 |