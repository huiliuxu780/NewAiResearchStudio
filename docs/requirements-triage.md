# AI 研究平台 - 需求池分诊

## 目的

本文件用于对 [requirements-pool.md](E:\my-projects\ai-research-platform\docs\requirements-pool.md) 做“现状对照”，把另一支 team 的需求池转换成当前仓库可执行的 backlog 参考。

原则：

- 不修改原始需求池
- 以当前代码和已验证运行结果为准
- 区分“已存在域”和“真正未实现需求”

## 状态说明

| 状态 | 含义 |
|------|------|
| 已实现 | 代码中已有较完整实现，可直接继续验收或收口 |
| 部分实现 | 已有模型/API/UI 之一或几项，但未形成完整闭环 |
| 未实现 | 当前仓库中无明确实现证据 |
| 文档过期 | 原需求描述与当前仓库真实状态明显不一致 |
| 待核对 | 有迹象但证据不足，需专项核查 |

## 总体结论

这份需求池不能再当作“从零开发清单”直接执行，原因有三：

1. 多个域已经落地，只是完成度不一
2. 技术债、产品需求、UI 重构被混写在同一文档中
3. 部分“待实施”条目已经被当前仓库实现或部分实现

更适合的处理方式是：

1. 把它作为候选池保留
2. 以本文件为准做二次分层
3. 后续拆成“技术债 backlog / 产品功能 backlog / UI 优化 backlog”

---

## 一、采集源类型扩展需求

### 结论

整体状态：`部分实现，且基础已明显超出文档描述`

### 证据

- Source 模型已包含 `crawl_strategy`、`crawl_config`、`social_platform`、`social_account_id`
  - [source.py](E:\my-projects\ai-research-platform\apps\api\models\source.py)
- 前端信息源表单已支持四种策略配置：
  - `single_page`
  - `multi_page`
  - `search_keyword`
  - `social_media`
  - [source-form.tsx](E:\my-projects\ai-research-platform\apps\web\components\sources\source-form.tsx)
- crawler worker 已存在对应执行逻辑：
  - `crawl_single_page`
  - `crawl_multi_page`
  - `crawl_search_keyword`
  - `crawl_social_media`
  - [crawler.py](E:\my-projects\ai-research-platform\workers\crawler\crawler.py)

### 分项判断

| 需求项 | 状态 | 备注 |
|------|------|------|
| 整页读取 | 已实现 | 模型、UI、crawler 都已有 |
| 子页面遍历 | 已实现 | 支持列表页分页、链接提取、详情页抓取 |
| 搜索关键词 | 部分实现 | 代码已接入搜索策略，但真实外部依赖和联调未验证 |
| 官方号观测 | 部分实现 | 代码已接入社交媒体策略，但真实平台能力未验证 |
| Source 模型扩展 | 已实现 | 已落到数据库模型和前端表单 |

### 建议

这一块不应再作为“新功能从零开发”，而应改为：

1. 补策略级联调清单
2. 标注哪些策略依赖外部服务
3. 做真实抓取验证与异常回退

---

## 二、技术优化需求

### 结论

整体状态：`原表中至少一半条目已经过期或需要改写`

### 分项分诊

| ID | 原需求 | 当前判断 | 备注 |
|----|------|------|------|
| OPT-001 | API路径不一致 | 文档过期 | 前端 `build` 已通过，当前 API 对接链路可工作 |
| OPT-002 | 前后端字段名不匹配 | 部分实现 | 本轮已修掉一批类型与字段问题，但仍建议专项核对 |
| OPT-003 | 缺少认证机制 | 部分实现 | 仍缺完整权限体系；当前更接近开发态/单 admin 模式 |
| OPT-004 | 缺少数据库事务管理 | 文档过期 | 已有事务上下文管理器，见 [transaction.py](E:\my-projects\ai-research-platform\apps\api\services\transaction.py) |
| OPT-005 | 缺少全局异常处理 | 文档过期 | 已有全局异常处理，见 [exception_handler.py](E:\my-projects\ai-research-platform\apps\api\middleware\exception_handler.py) |
| OPT-006 | Dashboard API性能问题 | 待核对 | 需要真实数据量下 profiling，不宜仅凭文档判断 |
| OPT-007 | 缺少数据库索引 | 部分实现 | Source 已有索引，其他表需专项审计 |
| OPT-008 | AI Workers缺少重试机制 | 文档过期 | worker 中已使用 `tenacity` 重试 |
| OPT-009 | 前端Mock逻辑混杂 | 部分实现 | 仍有页面残留本地 mock / 本地 state，需继续收口 |
| OPT-010 | 缺少前端分页实现 | 部分实现 | 多个 API 已支持分页，但前端覆盖不统一 |
| OPT-011 | Docker配置问题 | 待核对 | `docker-compose.yml` 已存在，但需单独做部署验证 |
| OPT-012 | 缺少Schema枚举验证 | 待核对 | 需要 schema 层专项核查 |
| OPT-013 | 缺少结构化日志 | 文档过期 | 已接入 `structlog` |
| OPT-014 | 缺少API文档增强 | 部分实现 | OpenAPI tags 已有，但仍可继续增强 |
| OPT-015 | 缺少国际化支持 | 未实现 | 当前仍为单语系管理台 |
| OPT-016 | 缺少优雅关闭 | 文档过期 | API 已有资源清理与 scheduler stop |
| OPT-017 | Workers缺少健康检查 | 未实现 | 当前仅有 CLI 级 smoke check |

### 建议

技术优化这部分下一步应拆成三类：

1. 已完成，直接从需求池移出
2. 待核对，转成专项审计任务
3. 仍未完成，进入真实技术债 backlog

---

## 三、Phase 5 核心功能补充需求

### 结论

整体状态：`不是整体未实施，而是“多个域已存在，但完成度差异很大”`

### 5.1 操作日志系统

状态：`部分实现`

证据：

- 已有操作日志与 AI 日志模型
  - [__init__.py](E:\my-projects\ai-research-platform\apps\api\models\__init__.py)
- 已有日志 API
  - [logs.py](E:\my-projects\ai-research-platform\apps\api\routers\logs.py)
- 已有日志页面与表格组件
  - [page.tsx](E:\my-projects\ai-research-platform\apps\web\app\logs\page.tsx)
  - [operation-log-table.tsx](E:\my-projects\ai-research-platform\apps\web\components\logs\operation-log-table.tsx)
  - [ai-log-table.tsx](E:\my-projects\ai-research-platform\apps\web\components\logs\ai-log-table.tsx)

分项建议：

| 需求项 | 状态 | 备注 |
|------|------|------|
| LOG-001 操作日志记录 | 部分实现 | 已有模型/中间件基础，需核对覆盖率 |
| LOG-002 系统日志查看页 | 已实现 | 页面与查询接口已存在 |
| LOG-003 日志导出 | 未实现 | 未发现导出实现 |
| LOG-004 AI处理日志 | 已实现 | 已有 AILog 域与页面 |
| LOG-005 错误日志告警 | 未实现 | 未发现告警机制 |

### 5.2 数据导出功能

状态：`未实现`

证据：

- 在 `apps/api`、`apps/web`、`workers` 的业务代码中未发现 `xlsx/openpyxl/pdf/reportlab/csv` 相关实现

判断：

| 需求项 | 状态 |
|------|------|
| EXP-001 列表导出 | 未实现 |
| EXP-002 Excel导出 | 未实现 |
| EXP-003 PDF导出 | 未实现 |
| EXP-004 CSV导出 | 未实现 |
| EXP-005 字段选择 | 未实现 |

### 5.3 筛选项优化

状态：`部分实现`

判断：

| 需求项 | 状态 | 备注 |
|------|------|------|
| FLT-001 筛选项说明 | 未实现 | 未见统一 tooltip 说明层 |
| FLT-002 时间范围筛选 | 部分实现 | 部分页面已有日期筛选 |
| FLT-003 全文搜索 | 部分实现 | 日志等域已有 keyword 过滤，但并非所有列表页都有 |
| FLT-004 筛选默认值 | 部分实现 | 各页策略不一致，需统一 |

### 5.4 AI模型管理

状态：`部分实现`

证据：

- 已有 AIModel 模型与 API 路由
  - [__init__.py](E:\my-projects\ai-research-platform\apps\api\models\__init__.py)
  - [ai_models.py](E:\my-projects\ai-research-platform\apps\api\routers\ai_models.py)
- 前端已有模型管理页，但当前主要是本地 state，不是完整 API 闭环
  - [page.tsx](E:\my-projects\ai-research-platform\apps\web\app\models\page.tsx)

判断：

| 需求项 | 状态 | 备注 |
|------|------|------|
| AI-001 模型配置管理 | 部分实现 | 后端域在，前端未完全接真实 API |
| AI-002 API Key管理 | 待核对 | 需要核对实际存储与加密策略 |
| AI-003 模型参数配置 | 部分实现 | 前端展示了参数，但闭环不足 |
| AI-004 模型切换 | 部分实现 | 有默认模型概念，但需核对任务级切换 |
| AI-005 Token消耗统计 | 部分实现 | AI 日志域存在，但统计能力需核对 |

### 5.5 提示词管理

状态：`大体已实现，剩余增强项未完成`

证据：

- 已有 PromptTemplate 模型与 API 路由
- 前端页面已接真实 hooks
  - [page.tsx](E:\my-projects\ai-research-platform\apps\web\app\prompts\page.tsx)

判断：

| 需求项 | 状态 | 备注 |
|------|------|------|
| PRM-001 提示词列表 | 已实现 | |
| PRM-002 提示词编辑 | 已实现 | |
| PRM-003 提示词测试 | 已实现 | |
| PRM-004 提示词版本 | 未实现 | 未见版本/回滚能力 |

### 5.6 抓取任务管理

状态：`大体已实现，仍需功能收口`

证据：

- 已有 crawl_tasks API 和 service
- 前端任务页已接真实 hooks
  - [tasks.py](E:\my-projects\ai-research-platform\workers\crawler\tasks.py)
  - [crawl_tasks.py](E:\my-projects\ai-research-platform\apps\api\routers\crawl_tasks.py)
  - [page.tsx](E:\my-projects\ai-research-platform\apps\web\app\tasks\page.tsx)

判断：

| 需求项 | 状态 | 备注 |
|------|------|------|
| TSK-001 任务列表 | 已实现 | |
| TSK-002 任务状态 | 已实现 | |
| TSK-003 手动触发 | 部分实现 | 需核对 UI/接口是否完整闭环 |
| TSK-004 任务日志 | 部分实现 | 需核对是否独立日志域 |
| TSK-005 重试机制 | 部分实现 | worker 侧有重试基础，任务级重试需核对 |

### 5.7 系统设置完善

状态：`部分实现`

证据：

- 已有系统设置 API 域
  - [system_settings.py](E:\my-projects\ai-research-platform\apps\api\routers\system_settings.py)
- 前端已有设置页
  - [page.tsx](E:\my-projects\ai-research-platform\apps\web\app\settings\page.tsx)

判断：

| 需求项 | 状态 | 备注 |
|------|------|------|
| SET-001 AI模型配置页 | 部分实现 | 有相关页，但不等于完整配置闭环 |
| SET-002 提示词管理页 | 已实现 | 独立提示词页已存在 |
| SET-003 采集配置页 | 部分实现 | 有系统设置域，但需核对具体项 |
| SET-004 操作日志页 | 已实现 | 独立日志页已存在 |

---

## 四、前端体验优化需求

### 6.1 侧边栏导航分组重构

状态：`未实现`

证据：

- 当前仍是扁平 `navItems`
  - [labels.ts](E:\my-projects\ai-research-platform\apps\web\types\labels.ts)
- 当前 sidebar 直接循环平铺导航项，没有 `NavGroup` / `NavItem` 分组结构
  - [sidebar.tsx](E:\my-projects\ai-research-platform\apps\web\components\layout\sidebar.tsx)

判断：

这块需求是有效的，而且与当前 UI 现状匹配，适合进入下一轮前端优化 backlog。

---

## 五、推送模块需求

### 结论

整体状态：`后端大体已实现，前端管理台明显缺位`

### 证据

- 已有推送模型：
  - `PushChannel`
  - `PushTask`
  - `PushRecord`
  - `PushTemplate`
  - [__init__.py](E:\my-projects\ai-research-platform\apps\api\models\__init__.py)
- 已有推送 API 路由
  - [push.py](E:\my-projects\ai-research-platform\apps\api\routers\push.py)
- 已有推送服务与渠道实现
  - [push_service.py](E:\my-projects\ai-research-platform\apps\api\services\push\push_service.py)
  - [scheduler.py](E:\my-projects\ai-research-platform\apps\api\services\push\scheduler.py)
  - [template_engine.py](E:\my-projects\ai-research-platform\apps\api\services\push\template_engine.py)

### 分项判断

| 需求块 | 状态 | 备注 |
|------|------|------|
| 推送渠道管理 | 已实现（后端）/ 未实现（前端） | 后端接口齐全，前端入口未见 |
| 推送任务管理 | 已实现（后端）/ 未实现（前端） | |
| 推送内容模板 | 已实现（后端）/ 未实现（前端） | |
| 推送记录与统计 | 已实现（后端）/ 未实现（前端） | |
| 事件触发推送 | 已实现（后端） | `/push/events/trigger` 已存在 |

### 建议

推送模块不应该继续写成“待从零实施”，而应该拆成：

1. 后端验收与补漏
2. 前端管理台建设
3. 真实渠道联调

---

## 六、建议转成下一阶段 backlog 的条目

### P0

1. 把需求池里的过期条目清出主 backlog
2. 为已存在域补“完成度定义”和缺口清单
3. 收口前端残留 mock/local state 页，优先 `models`

### P1

1. 侧边栏导航分组重构
2. 数据导出功能设计与落地
3. worker 健康检查与运行告警

### P2

1. 搜索关键词与官方号观测的真实联调
2. AI 模型管理页接真实 API
3. 推送模块前端管理台

---

## 七、接手建议

如果后续继续推进，推荐顺序是：

1. 先做“需求池瘦身”
2. 再做“已存在域的收口”
3. 最后再做真正未实现的新功能

否则会出现一种很典型的失控状态：

文档里以为很多功能“还没开始”，但代码里其实已经有一半，结果团队会重复开发、重复建模，最后越做越乱。
