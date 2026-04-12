# AI 研究平台 - 数据契约

> 2026-04-12 BG-003 校准说明：本文档最初按 Phase 1 设计稿编写，当前已按真实后端 schema / router 做第一轮校准。若历史字段定义与 `apps/api/schemas/`、`apps/api/routers/` 冲突，以后端实现为准。

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
| 字节 | byte_dance | 字节跳动 | 含火山引擎、豆包等 |
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

### 2.3 采集策略 (CrawlStrategy)

| 枚举值 | 英文标识 | 说明 |
|--------|----------|------|
| 单页采集 | single_page | 只抓取当前页面 |
| 多页遍历 | multi_page | 递归抓取子页面 |
| 关键词搜索 | search_keyword | 通过搜索结果抓取 |
| 官方号观测 | social_media | 观测社交媒体/官方账号 |

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
| 已驳回 | rejected | 已驳回 |
| 已产出结论 | insight_generated | 已生成结论并进入下游流程 |

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

### 2.13 优先级 (Priority)

| 枚举值 | 英文标识 | 说明 |
|--------|----------|------|
| 高 | high | 高优先级 |
| 中 | medium | 默认优先级 |
| 低 | low | 低优先级 |

### 2.14 社交平台 (SocialPlatform)

| 枚举值 | 英文标识 | 说明 |
|--------|----------|------|
| X / Twitter | twitter | 海外社交平台 |
| 微博 | weibo | 微博官方号 |
| 微信 | wechat | 微信公众号/视频号等 |
| 其他 | other | 其他平台 |

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
| priority | priority | enum | 是 | 优先级（`high/medium/low`） | 优先级 |
| notes | notes | string | 否 | 备注 | 备注 |
| crawl_strategy | crawl_strategy | enum | 是 | 采集策略 | 采集策略 |
| crawl_config | crawl_config | json | 否 | 采集策略附加配置 | 采集配置 |
| social_platform | social_platform | enum | 否 | 社交平台类型 | 社交平台 |
| social_account_id | social_account_id | string | 否 | 官方号 / 账号标识 | 官方号标识 |
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
| importance_level | importance_level | enum | 是 | 重要性层级（`high/medium/low`） | 重要性 |
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
| title | title | string | 是 | 报告标题 | 报告标题 |
| company | company | string | 是 | 所属公司 | 所属公司 |
| start_date | start_date | date | 是 | 统计开始日期 | 开始日期 |
| end_date | end_date | date | 是 | 统计结束日期 | 结束日期 |
| content | content | json | 是 | 结构化报告内容 | 报告内容 |
| status | status | string | 是 | 报告状态 | 状态 |
| created_at | created_at | datetime | 是 | 创建时间 | 创建时间 |
| updated_at | updated_at | datetime | 是 | 更新时间 | 更新时间 |

### 3.9 AIModel（AI 模型配置）

| 字段名 | 字段标识 | 类型 | 必填 | 说明 | 中文展示名 |
|--------|----------|------|------|------|------------|
| id | id | string | 是 | 主键 UUID | ID |
| name | name | string | 是 | 模型配置名称 | 模型名称 |
| provider | provider | string | 是 | 模型提供方，如 `qwen`、`openai` | 提供方 |
| model_name | model_name | string | 是 | 真实模型标识 | 模型标识 |
| api_base_url | api_base_url | string | 否 | 自定义 API Base URL | API 地址 |
| temperature | temperature | float | 是 | 温度参数 | 温度 |
| max_tokens | max_tokens | integer | 是 | 最大输出 token 数 | 最大 Token |
| enabled | enabled | boolean | 是 | 是否启用 | 启用状态 |
| is_default | is_default | boolean | 是 | 是否默认模型 | 默认模型 |
| task_types | task_types | array[string] | 是 | 适用任务类型列表 | 任务类型 |
| notes | notes | string | 否 | 备注 | 备注 |
| created_at | created_at | datetime | 是 | 创建时间 | 创建时间 |
| updated_at | updated_at | datetime | 是 | 更新时间 | 更新时间 |

说明：

- `AIModelResponse` 不返回 `api_key`
- `AIModelCreate` / `AIModelUpdate` 请求体中包含 `api_key`

### 3.10 PromptTemplate（Prompt 模板）

| 字段名 | 字段标识 | 类型 | 必填 | 说明 | 中文展示名 |
|--------|----------|------|------|------|------------|
| id | id | string | 是 | 主键 UUID | ID |
| name | name | string | 是 | 模板名称 | 模板名称 |
| category | category | string | 是 | 模板分类 | 分类 |
| task_type | task_type | string | 是 | 关联任务类型 | 任务类型 |
| template | template | text | 是 | Prompt 模板正文 | 模板内容 |
| variables | variables | array[string] | 是 | 模板变量名列表 | 变量列表 |
| version | version | integer | 是 | 模板版本号 | 版本 |
| is_active | is_active | boolean | 是 | 是否启用 | 启用状态 |
| description | description | string | 否 | 模板描述 | 描述 |
| notes | notes | string | 否 | 备注 | 备注 |
| created_at | created_at | datetime | 是 | 创建时间 | 创建时间 |
| updated_at | updated_at | datetime | 是 | 更新时间 | 更新时间 |

### 3.11 CrawlTask（采集任务）

| 字段名 | 字段标识 | 类型 | 必填 | 说明 | 中文展示名 |
|--------|----------|------|------|------|------------|
| id | id | string | 是 | 主键 UUID | ID |
| source_id | source_id | string | 是 | 关联信息源 ID | 信息源 ID |
| task_type | task_type | string | 是 | 任务触发类型，如 `manual` | 任务类型 |
| status | status | enum | 是 | 任务状态（`pending/running/completed/failed/cancelled`） | 任务状态 |
| started_at | started_at | datetime | 否 | 开始时间 | 开始时间 |
| completed_at | completed_at | datetime | 否 | 结束时间 | 结束时间 |
| records_count | records_count | integer | 是 | 本次采集记录数 | 记录数 |
| error_message | error_message | string | 否 | 错误信息 | 错误信息 |
| created_at | created_at | datetime | 是 | 创建时间 | 创建时间 |
| updated_at | updated_at | datetime | 是 | 更新时间 | 更新时间 |

补充统计模型 `CrawlTaskStats`：

| 字段名 | 字段标识 | 类型 | 必填 | 说明 | 中文展示名 |
|--------|----------|------|------|------|------------|
| total | total | integer | 是 | 总任务数 | 总数 |
| pending | pending | integer | 是 | 待执行任务数 | 待执行 |
| running | running | integer | 是 | 执行中任务数 | 执行中 |
| completed | completed | integer | 是 | 已完成任务数 | 已完成 |
| failed | failed | integer | 是 | 失败任务数 | 失败 |
| cancelled | cancelled | integer | 是 | 已取消任务数 | 已取消 |
| total_records | total_records | integer | 是 | 累计采集记录数 | 累计记录 |

### 3.12 OperationLog（操作日志）

| 字段名 | 字段标识 | 类型 | 必填 | 说明 | 中文展示名 |
|--------|----------|------|------|------|------------|
| id | id | string | 是 | 主键 UUID | ID |
| user_id | user_id | string | 是 | 操作用户标识，默认 `admin` | 用户 ID |
| action | action | string | 是 | 操作动作 | 操作动作 |
| entity_type | entity_type | string | 是 | 实体类型 | 实体类型 |
| entity_id | entity_id | string | 是 | 实体 ID | 实体 ID |
| old_value | old_value | json | 否 | 变更前值 | 旧值 |
| new_value | new_value | json | 否 | 变更后值 | 新值 |
| ip_address | ip_address | string | 否 | 来源 IP | IP 地址 |
| user_agent | user_agent | string | 否 | 客户端 User-Agent | User Agent |
| status | status | string | 是 | 操作结果状态，默认 `success` | 状态 |
| error_message | error_message | string | 否 | 错误信息 | 错误信息 |
| created_at | created_at | datetime | 是 | 创建时间 | 创建时间 |

### 3.13 AILog（AI 调用日志）

| 字段名 | 字段标识 | 类型 | 必填 | 说明 | 中文展示名 |
|--------|----------|------|------|------|------------|
| id | id | string | 是 | 主键 UUID | ID |
| task_type | task_type | string | 是 | AI 调用任务类型 | 任务类型 |
| model_name | model_name | string | 是 | 使用的模型名 | 模型名称 |
| input_prompt | input_prompt | text | 否 | 输入 Prompt | 输入 Prompt |
| output_result | output_result | text | 否 | 输出结果 | 输出结果 |
| input_tokens | input_tokens | integer | 是 | 输入 token 数 | 输入 Token |
| output_tokens | output_tokens | integer | 是 | 输出 token 数 | 输出 Token |
| cost_ms | cost_ms | integer | 是 | 调用耗时（毫秒） | 耗时 |
| status | status | string | 是 | 调用状态，默认 `success` | 状态 |
| error_message | error_message | string | 否 | 失败原因 | 错误信息 |
| source_entity_id | source_entity_id | string | 否 | 关联源实体 ID | 源实体 ID |
| created_at | created_at | datetime | 是 | 创建时间 | 创建时间 |

### 3.14 SystemSettings（系统设置）

`SystemSettingsResponse` 当前是扁平键值结构：

| 字段名 | 字段标识 | 类型 | 必填 | 说明 | 中文展示名 |
|--------|----------|------|------|------|------------|
| id | id | string | 是 | 主键 UUID | ID |
| key | key | string | 是 | 设置键名 | 键名 |
| value | value | string | 是 | 设置值 | 设置值 |
| category | category | string | 是 | 设置分类 | 分类 |
| description | description | string | 否 | 设置说明 | 描述 |
| updated_at | updated_at | datetime | 是 | 更新时间 | 更新时间 |

`SystemSettingsByCategory` 分组返回结构：

| 字段名 | 字段标识 | 类型 | 必填 | 说明 | 中文展示名 |
|--------|----------|------|------|------|------------|
| category | category | string | 是 | 分类名 | 分类 |
| settings | settings | array[SystemSettingsResponse] | 是 | 当前分类下的设置项 | 设置项 |

### 3.15 PushChannel（推送渠道）

| 字段名 | 字段标识 | 类型 | 必填 | 说明 | 中文展示名 |
|--------|----------|------|------|------|------------|
| id | id | string | 是 | 主键 UUID | ID |
| name | name | string | 是 | 渠道名称 | 渠道名称 |
| channel_type | channel_type | string | 是 | 渠道类型，如 `feishu/email/slack` | 渠道类型 |
| is_enabled | is_enabled | boolean | 是 | 是否启用 | 启用状态 |
| config | config | json | 是 | 渠道配置 | 渠道配置 |
| description | description | string | 否 | 渠道描述 | 描述 |
| created_at | created_at | datetime | 是 | 创建时间 | 创建时间 |
| updated_at | updated_at | datetime | 是 | 更新时间 | 更新时间 |

### 3.16 PushTask（推送任务）

| 字段名 | 字段标识 | 类型 | 必填 | 说明 | 中文展示名 |
|--------|----------|------|------|------|------------|
| id | id | string | 是 | 主键 UUID | ID |
| name | name | string | 是 | 任务名称 | 任务名称 |
| description | description | string | 否 | 任务描述 | 描述 |
| trigger_type | trigger_type | string | 是 | 触发方式，如 `scheduled/event_triggered/manual` | 触发方式 |
| cron_expression | cron_expression | string | 否 | Cron 表达式 | Cron |
| schedule_config | schedule_config | json | 否 | 调度配置 | 调度配置 |
| channel_ids | channel_ids | array[string] | 是 | 目标渠道 ID 列表 | 渠道 ID 列表 |
| template_id | template_id | string | 否 | 模板 ID | 模板 ID |
| is_enabled | is_enabled | boolean | 是 | 是否启用 | 启用状态 |
| status | status | string | 是 | 当前任务状态 | 状态 |
| max_retries | max_retries | integer | 是 | 最大重试次数 | 最大重试 |
| retry_interval | retry_interval | integer | 是 | 重试间隔（秒） | 重试间隔 |
| event_type | event_type | string | 否 | 事件类型 | 事件类型 |
| event_filters | event_filters | json | 否 | 事件过滤条件 | 事件过滤 |
| content_config | content_config | json | 是 | 推送内容配置 | 内容配置 |
| total_executions | total_executions | integer | 是 | 总执行次数 | 总执行次数 |
| success_count | success_count | integer | 是 | 成功次数 | 成功次数 |
| failure_count | failure_count | integer | 是 | 失败次数 | 失败次数 |
| last_executed_at | last_executed_at | datetime | 否 | 最近执行时间 | 最近执行时间 |
| next_scheduled_at | next_scheduled_at | datetime | 否 | 下次计划执行时间 | 下次执行时间 |
| alert_on_failure | alert_on_failure | boolean | 是 | 是否失败告警 | 失败告警 |
| alert_channel_id | alert_channel_id | string | 否 | 告警渠道 ID | 告警渠道 ID |
| created_at | created_at | datetime | 是 | 创建时间 | 创建时间 |
| updated_at | updated_at | datetime | 是 | 更新时间 | 更新时间 |

### 3.17 PushRecord（推送记录）

| 字段名 | 字段标识 | 类型 | 必填 | 说明 | 中文展示名 |
|--------|----------|------|------|------|------------|
| id | id | string | 是 | 主键 UUID | ID |
| task_id | task_id | string | 是 | 关联任务 ID | 任务 ID |
| channel_id | channel_id | string | 是 | 渠道 ID | 渠道 ID |
| channel_type | channel_type | string | 是 | 渠道类型 | 渠道类型 |
| status | status | string | 是 | 推送状态 | 状态 |
| retry_count | retry_count | integer | 是 | 已重试次数 | 重试次数 |
| max_retries | max_retries | integer | 是 | 最大重试次数 | 最大重试 |
| next_retry_at | next_retry_at | datetime | 否 | 下次重试时间 | 下次重试时间 |
| title | title | string | 是 | 推送标题 | 标题 |
| content | content | text | 是 | 推送内容 | 内容 |
| content_format | content_format | string | 是 | 内容格式 | 内容格式 |
| recipients | recipients | array[string] | 是 | 接收者列表 | 接收者 |
| response_data | response_data | json | 否 | 渠道响应原文 | 响应数据 |
| error_message | error_message | string | 否 | 错误信息 | 错误信息 |
| error_code | error_code | string | 否 | 错误码 | 错误码 |
| started_at | started_at | datetime | 否 | 开始推送时间 | 开始时间 |
| completed_at | completed_at | datetime | 否 | 完成推送时间 | 完成时间 |
| duration_ms | duration_ms | float | 否 | 推送耗时（毫秒） | 耗时 |
| created_at | created_at | datetime | 是 | 创建时间 | 创建时间 |
| updated_at | updated_at | datetime | 是 | 更新时间 | 更新时间 |

### 3.18 PushTemplate（推送模板）

| 字段名 | 字段标识 | 类型 | 必填 | 说明 | 中文展示名 |
|--------|----------|------|------|------|------------|
| id | id | string | 是 | 主键 UUID | ID |
| name | name | string | 是 | 模板名称 | 模板名称 |
| description | description | string | 否 | 模板描述 | 描述 |
| channel_types | channel_types | array[string] | 是 | 适用渠道类型列表 | 渠道类型 |
| title_template | title_template | string | 是 | 标题模板 | 标题模板 |
| content_template | content_template | text | 是 | 内容模板 | 内容模板 |
| content_format | content_format | string | 是 | 内容格式，如 `text/html/markdown/rich_text` | 内容格式 |
| variables | variables | json | 是 | 模板变量定义 | 变量定义 |
| default_values | default_values | json | 是 | 默认变量值 | 默认值 |
| is_enabled | is_enabled | boolean | 是 | 是否启用 | 启用状态 |
| is_system | is_system | boolean | 是 | 是否系统模板 | 系统模板 |
| created_at | created_at | datetime | 是 | 创建时间 | 创建时间 |
| updated_at | updated_at | datetime | 是 | 更新时间 | 更新时间 |

模板预览响应 `PushTemplatePreviewResponse`：

| 字段名 | 字段标识 | 类型 | 必填 | 说明 | 中文展示名 |
|--------|----------|------|------|------|------------|
| rendered_title | rendered_title | string | 是 | 渲染后的标题 | 预览标题 |
| rendered_content | rendered_content | text | 是 | 渲染后的内容 | 预览内容 |
| content_format | content_format | string | 是 | 渲染后内容格式 | 内容格式 |

### 3.19 PushStats（推送统计）

顶层响应 `PushStatsResponse`：

| 字段名 | 字段标识 | 类型 | 必填 | 说明 | 中文展示名 |
|--------|----------|------|------|------|------------|
| summary | summary | PushStatsSummary | 是 | 汇总统计 | 汇总统计 |
| by_channel | by_channel | array[PushStatsByChannel] | 是 | 按渠道统计 | 按渠道统计 |
| by_task | by_task | array[PushStatsByTask] | 是 | 按任务统计 | 按任务统计 |
| error_distribution | error_distribution | array[PushErrorDistribution] | 是 | 错误分布 | 错误分布 |
| trend | trend | array[PushTrendPoint] | 是 | 趋势数据 | 趋势数据 |

`PushStatsSummary`：

| 字段名 | 字段标识 | 类型 | 必填 | 说明 | 中文展示名 |
|--------|----------|------|------|------|------------|
| total_tasks | total_tasks | integer | 是 | 总任务数 | 总任务数 |
| enabled_tasks | enabled_tasks | integer | 是 | 启用任务数 | 启用任务数 |
| total_records | total_records | integer | 是 | 总推送记录数 | 总记录数 |
| success_count | success_count | integer | 是 | 成功次数 | 成功次数 |
| failed_count | failed_count | integer | 是 | 失败次数 | 失败次数 |
| pending_count | pending_count | integer | 是 | 待处理次数 | 待处理次数 |
| retrying_count | retrying_count | integer | 是 | 重试中次数 | 重试中次数 |
| success_rate | success_rate | float | 是 | 成功率（百分比） | 成功率 |
| avg_duration_ms | avg_duration_ms | float | 否 | 平均耗时 | 平均耗时 |

`PushStatsByChannel`：

| 字段名 | 字段标识 | 类型 | 必填 | 说明 | 中文展示名 |
|--------|----------|------|------|------|------------|
| channel_type | channel_type | string | 是 | 渠道类型 | 渠道类型 |
| channel_name | channel_name | string | 是 | 渠道名称 | 渠道名称 |
| total_count | total_count | integer | 是 | 总推送数 | 总数 |
| success_count | success_count | integer | 是 | 成功数 | 成功数 |
| failed_count | failed_count | integer | 是 | 失败数 | 失败数 |
| success_rate | success_rate | float | 是 | 成功率 | 成功率 |

`PushStatsByTask`：

| 字段名 | 字段标识 | 类型 | 必填 | 说明 | 中文展示名 |
|--------|----------|------|------|------|------------|
| task_id | task_id | string | 是 | 任务 ID | 任务 ID |
| task_name | task_name | string | 是 | 任务名称 | 任务名称 |
| total_count | total_count | integer | 是 | 总推送数 | 总数 |
| success_count | success_count | integer | 是 | 成功数 | 成功数 |
| failed_count | failed_count | integer | 是 | 失败数 | 失败数 |
| success_rate | success_rate | float | 是 | 成功率 | 成功率 |
| last_executed_at | last_executed_at | datetime | 否 | 最近执行时间 | 最近执行时间 |

`PushErrorDistribution`：

| 字段名 | 字段标识 | 类型 | 必填 | 说明 | 中文展示名 |
|--------|----------|------|------|------|------------|
| error_code | error_code | string | 否 | 错误码 | 错误码 |
| error_message | error_message | string | 否 | 错误信息 | 错误信息 |
| count | count | integer | 是 | 出现次数 | 次数 |
| percentage | percentage | float | 是 | 占比 | 占比 |

`PushTrendPoint`：

| 字段名 | 字段标识 | 类型 | 必填 | 说明 | 中文展示名 |
|--------|----------|------|------|------|------------|
| date | date | string | 是 | 日期，格式 `YYYY-MM-DD` | 日期 |
| total_count | total_count | integer | 是 | 总推送数 | 总数 |
| success_count | success_count | integer | 是 | 成功数 | 成功数 |
| failed_count | failed_count | integer | 是 | 失败数 | 失败数 |
| success_rate | success_rate | float | 是 | 成功率 | 成功率 |

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
  byte_dance: '字节',
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
```

实际后端 schema 当前使用：

```typescript
export type Company = 'alibaba' | 'byte_dance' | 'tencent'

export type SourceType = 'official_doc' | 'official_blog' | 'product_site' | 
  'changelog' | 'github' | 'media' | 'app_page' | 'open_platform'

export type CrawlStrategy = 'single_page' | 'multi_page' | 'search_keyword' | 'social_media'

export type SocialPlatform = 'twitter' | 'weibo' | 'wechat' | 'other'

export type EventType = 'release' | 'update' | 'upgrade' | 'price_cut' | 
  'open_source' | 'integration' | 'partnership' | 'strategic' | 
  'organizational' | 'international' | 'doc_update'

export type EntityType = 'model' | 'product' | 'platform' | 'api' | 
  'sdk' | 'agent' | 'organization' | 'strategy' | 'pricing'

export type ImportanceLevel = 'high' | 'medium' | 'low'

export type Confidence = 'high' | 'medium' | 'low'

export type InsightType = 'trend' | 'competitor' | 'opportunity' | 'risk' | 'suggestion'

export type CapabilityLevel = 'l1' | 'l2' | 'l3' | 'l4' | 'l5' | 'l6'

export type ReviewStatus = 'pending' | 'confirmed' | 'rejected' | 'insight_generated'

export type CrawlStatus = 'pending' | 'crawling' | 'success' | 'failed' | 'parse_error'

export type DedupeStatus = 'new' | 'duplicate' | 'pending'

export type Priority = 'high' | 'medium' | 'low'
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
  priority: Priority
  notes?: string
  crawl_strategy: CrawlStrategy
  crawl_config?: Record<string, unknown>
  social_platform?: SocialPlatform
  social_account_id?: string
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
  topic_level_1: '产品技术' | '商业模式' | '市场竞争' | '组织管理' | '财务表现' | '法律合规' | '其他'
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
  title: string
  company: string
  start_date: string
  end_date: string
  status: string
  content: Record<string, unknown>
  created_at: string
  updated_at: string
}
```

---

## 6. API 契约

> 2026-04-12 校准说明：本契约文档最初覆盖的是核心链路实体。当前代码中的实际 API 域已经扩展到 `dashboard`、`logs`、`ai_models`、`prompt_templates`、`crawl_tasks`、`system_settings`、`reports`、`push` 等模块，这些模块的详细契约应逐步补齐；在补齐前，请同时参考 `docs/current-state.md` 和后端路由实现。

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

### 6.4 当前已实现 API 域总览（2026-04-12）

以下域已经在 `/api/v1` 下有真实后端实现：

| 域 | 路由前缀 | 当前能力概览 |
|----|----------|--------------|
| dashboard | `/dashboard` | 仪表盘统计、公司统计、趋势数据 |
| sources | `/sources` | 信息源分页查询、详情、创建、更新、删除 |
| raw_records | `/raw-records` | 原始记录分页查询、详情、创建、状态更新 |
| facts | `/facts` | 事实分页查询、创建、详情、复核 |
| insights | `/insights` | 洞察分页查询、创建、详情 |
| logs | `/logs` | 操作日志、AI 调用日志查询 |
| ai_models | `/ai-models` | 模型分页查询、详情、创建、更新、删除、测试 |
| prompt_templates | `/prompt-templates` | Prompt 模板分页查询、详情、创建、更新、删除、测试 |
| crawl_tasks | `/crawl-tasks` | 任务分页查询、统计、详情、创建、取消 |
| system_settings | `/settings` | 设置分类读取、分类更新、单项读取、单项更新 |
| reports | `/reports` | 报告列表、生成、详情、删除 |
| push | `/push` | 渠道、任务、记录、模板、统计、事件触发 |

### 6.5 扩展域请求 / 返回模型映射

| 域 | 创建 / 更新请求 | 主要返回模型 |
|----|-----------------|--------------|
| ai_models | `AIModelCreate` / `AIModelUpdate` | `AIModelResponse` |
| prompt_templates | `PromptTemplateCreate` / `PromptTemplateUpdate` | `PromptTemplateResponse` |
| crawl_tasks | `CrawlTaskCreate` | `CrawlTaskResponse` / `CrawlTaskStats` |
| logs.operations | `OperationLogCreate` | `OperationLogResponse` |
| logs.ai | `AILogCreate` | `AILogResponse` |
| system_settings | `SystemSettingsUpdate` | `SystemSettingsResponse` / `SystemSettingsByCategory` |
| reports | `WeeklyReportCreate` | `WeeklyReportResponse` |
| push.channels | `PushChannelCreate` / `PushChannelUpdate` | `PushChannelResponse` |
| push.tasks | `PushTaskCreate` / `PushTaskUpdate` / `PushTaskTriggerRequest` | `PushTaskResponse` / `PushRecordResponse` |
| push.records | `PushRecordRetryRequest` | `PushRecordResponse` |
| push.templates | `PushTemplateCreate` / `PushTemplateUpdate` / `PushTemplatePreviewRequest` | `PushTemplateResponse` / `PushTemplatePreviewResponse` |
| push.stats | 无 | `PushStatsResponse` |

详细 schema 位置：

- `apps/api/schemas/ai_model.py`
- `apps/api/schemas/ai_log.py`
- `apps/api/schemas/operation_log.py`
- `apps/api/schemas/prompt_template.py`
- `apps/api/schemas/crawl_task.py`
- `apps/api/schemas/system_settings.py`
- `apps/api/schemas/weekly_report.py`
- `apps/api/schemas/push.py`

---

## 7. 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2026-04-10 | 初始版本，定义数据契约 |
| v1.1 | 2026-04-12 | 按真实 schema / router 完成第一轮 BG-003 校准 |
