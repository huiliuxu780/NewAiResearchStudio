# AI 研究平台 - 工作日志

---

## 2026-04-12 - BG-102 侧边栏导航分组重构

### 本轮目标
将当前扁平侧边栏重构为分组导航，并同步修复侧边栏折叠状态与布局主内容区之间的联动问题。

### 已完成内容

#### 1. 导航信息架构升级
- 将 `apps/web/types/labels.ts` 中的单层 `navItems` 重构为 `navGroups`
- 将导航重组为四个分区：
  - 工作台
  - 情报数据
  - 知识资产
  - 配置中心

#### 2. 共享导航渲染组件
- 新增 `apps/web/components/layout/navigation-menu.tsx`
- 统一桌面侧边栏和移动端抽屉的导航渲染逻辑
- 保留当前激活态判断逻辑
- 为桌面折叠态补了图标提示和组间节奏

#### 3. 布局状态收口
- 更新 `apps/web/components/layout/app-layout.tsx`
- 将 `sidebarCollapsed` 状态上提到布局层
- 同步 `Sidebar`、`Header` 和主内容区偏移
- 修复了之前侧边栏和主内容区不同步的问题

#### 4. 移动端导航补齐
- 更新 `apps/web/components/layout/header.tsx`
- 新增移动端菜单按钮
- 使用 `Sheet` 作为左侧抽屉导航
- 复用与桌面端相同的分组结构

#### 5. 验证结果
- `apps/web` `npm.cmd run lint`：通过，0 warning，0 error
- `apps/web` `npm.cmd run build`：通过

### 修改文件
- apps/web/types/labels.ts（更新）
- apps/web/components/layout/navigation-menu.tsx（新增）
- apps/web/components/layout/sidebar.tsx（更新）
- apps/web/components/layout/header.tsx（更新）
- apps/web/components/layout/app-layout.tsx（更新）
- docs/backlog-v1.md（更新）
- docs/worklog.md（更新）

### 当前状态
侧边栏已经从单层导航收口为分组导航，桌面与移动端共享同一套信息架构，布局联动问题已修复，当前前端基线继续保持 `lint/build` 通过。

### 下一步计划
1. 转入下一个 P1 项
2. 或补一轮手工回归，重点看桌面折叠态与移动端抽屉体验

---

## 2026-04-12 - BG-003 API / 数据契约校对

### 本轮目标
把历史设计态的数据契约文档拉回到真实后端实现附近，减少后续协作时“文档看起来对、代码其实不是这样”的偏差。

### 已完成内容

#### 1. 真实后端域盘点
- 盘点 `apps/api/routers/` 的实际路由前缀与能力范围
- 盘点 `apps/api/models/`、`apps/api/schemas/` 的真实实体与响应模型
- 确认当前 `/api/v1` 已覆盖 `dashboard`、`sources`、`raw-records`、`facts`、`insights`、`logs`、`ai-models`、`prompt-templates`、`crawl-tasks`、`settings`、`reports`、`push`

#### 2. 关键枚举校准
- 修正文档中的 `Company` 标识，将 `bytedance` 校准为后端实际使用的 `byte_dance`
- 将历史 `CrawlType` 收口为当前真实使用的 `CrawlStrategy`
- 补充 `Priority`、`SocialPlatform`
- 修正 `ReviewStatus` 的真实状态值，加入 `insight_generated`

#### 3. 关键字段校准
- 更新 `Source` 字段，补充 `crawl_strategy`、`crawl_config`、`social_platform`、`social_account_id`
- 更新 `WeeklyReport` 字段，使其与当前 `weekly_report.py` schema 对齐
- 更新 TypeScript 类型示例，避免继续引用过期值

#### 4. 扩展 API 域入口补齐
- 在 `docs/data-contract.md` 中新增“当前已实现 API 域总览”
- 明确日志、模型、Prompt、任务、设置、报告、推送这些扩展域已经有真实后端实现
- 标记这些扩展域当前仍需后续逐字段展开

#### 5. 当前状态文档同步
- 更新 `docs/current-state.md`
- 同步前端 `lint` 零 warning、`build` 通过、`BG-001` / `BG-002` 完成情况
- 标明 `/products`、`/topics` 当前有前端路由，但还没有对应后端 API 域

### 修改文件
- docs/data-contract.md（更新）
- docs/current-state.md（更新）
- docs/backlog-v1.md（更新）
- docs/worklog.md（更新）

### 当前状态
`BG-003` 已完成：`docs/data-contract.md` 已从核心链路设计稿升级为覆盖主要扩展域的现实契约入口，当前主要 API 域都能在文档中找到字段级说明或 schema 映射。

### 下一步计划
1. 如有需要，可继续为高频域补请求 / 响应示例
2. 转入下一个 backlog 项，优先做 P1 的真实收口工作

---

## 2026-04-12 - BG-001 前端 Warning 收口

### 本轮目标
将前端基线从“build 可用但仍有 warning”收口到真正的零 warning 状态，降低后续协作噪音。

### 已完成内容

#### 1. 页面与组件清理
- 清理多个页面和组件中的未使用导入、未使用变量
- 保持现有页面行为不变，避免把 warning 清理演变成行为改造

#### 2. a11y 规则误判修正
- 在公司设置页中将 `lucide-react` 的 `Image` 图标改为别名 `ImageIcon`
- 避免 ESLint 将图标组件误判为原生图片元素并触发 `alt-text` warning

#### 3. 原始记录页无用依赖移除
- 移除 `apps/web/app/raw-records/page.tsx` 中未使用的 `useSources` 与 `sourcesData`
- 保持原始记录列表逻辑不变

#### 4. 验证结果
- `apps/web` `npm.cmd run lint`：通过，0 warning，0 error
- `apps/web` `npm.cmd run build`：通过

### 修改文件
- apps/web/app/logs/page.tsx（更新）
- apps/web/app/page.tsx（更新）
- apps/web/app/prompts/page.tsx（更新）
- apps/web/app/raw-records/page.tsx（更新）
- apps/web/components/crawl-tasks/crawl-task-card.tsx（更新）
- apps/web/components/crawl-tasks/crawl-task-detail-sheet.tsx（更新）
- apps/web/components/dashboard/fact-list.tsx（更新）
- apps/web/components/layout/app-layout.tsx（更新）
- apps/web/components/layout/header.tsx（更新）
- apps/web/components/logs/log-detail-sheet.tsx（更新）
- apps/web/components/raw-records/record-table.tsx（更新）
- apps/web/components/settings/company-settings.tsx（更新）
- apps/web/components/settings/system-settings.tsx（更新）
- apps/web/types/labels.ts（更新）
- docs/backlog-v1.md（更新）
- docs/worklog.md（更新）

### 当前状态
前端基线已达到 `lint` 零 warning、`build` 持续通过的状态，后续前端开发可以在更低噪音环境下推进。

### 下一步计划
1. 转入 `BG-003`，校对 API / 数据契约文档
2. 或继续推进下一个 P1 项

---

## 2026-04-12 - BG-002 模型管理页接真实 API

### 本轮目标
将模型管理页从本地硬编码演示态切换到真实 API 驱动，并完成本轮约定范围：列表、启停、设默认、测试。

### 已完成内容

#### 1. 前端 API / Hook 接线
- 新增 `apps/web/lib/api/ai-models.ts`
- 新增 `apps/web/hooks/use-ai-models.ts`
- 更新 API 和 hooks 导出入口

#### 2. 前端类型补齐
- 在 `apps/web/types/entities.ts` 中新增 `AIModel` 类型

#### 3. 模型管理页真实化
- 更新 `apps/web/app/models/page.tsx`
- 移除硬编码模型列表
- 接入真实模型列表查询
- 接入启用/停用、设为默认、测试模型操作
- 保留现有卡片风格，去掉本轮范围外的误导性 CRUD 行为

#### 4. 验证结果
- `apps/web` `npm.cmd run lint`：通过，31 条 warning，0 error
- `apps/web` `npm.cmd run build`：通过

### 修改文件
- apps/web/app/models/page.tsx（更新）
- apps/web/lib/api/ai-models.ts（新增）
- apps/web/lib/api/index.ts（更新）
- apps/web/hooks/use-ai-models.ts（新增）
- apps/web/hooks/index.ts（更新）
- apps/web/types/entities.ts（更新）
- docs/backlog-v1.md（更新）
- docs/worklog.md（更新）

### 当前状态
模型管理页已经从演示态切换为真实 API 驱动，但本轮仅覆盖列表、启停、设默认、测试。新增、编辑、删除留待后续批次。

### 下一步计划
1. 继续处理 `BG-001`，收口前端 warning
2. 或转入 `BG-003`，校对 API / 数据契约文档

---

## 2026-04-12 - 统一 Backlog V1

### 本轮目标
把接手阶段形成的分诊结果收束成一份统一 backlog，作为后续开发的主执行面。

### 已完成内容

#### 1. 统一 backlog 建立
- 创建 `docs/backlog-v1.md`
- 明确其角色为“当前仓库主 backlog”
- 规定 `requirements-pool.md` 作为原始输入、`requirements-triage.md` 作为证据分诊、`backlog-v1.md` 作为执行面

#### 2. 主清单重排
- 将下一阶段工作重排为 P0 / P1 / P2 / 暂缓区
- 明确当前优先级应先收口已有域，而不是继续扩散新功能面
- 把模型管理页真实 API 接入、契约校对、需求池去陈旧化列入当前批次

#### 3. 入口文档同步
- 更新 `README.md`
- 更新 `docs/current-state.md`
- 让后续接手者能够直接定位到统一 backlog

### 修改文件
- docs/backlog-v1.md（新增）
- docs/superpowers/plans/2026-04-12-unified-backlog-v1.md（新增）
- README.md（更新）
- docs/current-state.md（更新）
- docs/worklog.md（更新）

### 当前状态
项目现在已经有统一 backlog，后续开发不必再直接从原始需求池起步，可以围绕当前主清单顺序推进。

### 下一步计划
1. 从 `BG-001` 到 `BG-004` 中选一个直接开工
2. 优先处理“已有域收口”而非“新增大功能”
3. 保持 backlog-v1 作为唯一主执行面滚动维护

---

## 2026-04-12 - 需求池分诊（对照当前代码现状）

### 本轮目标
评估另一支 team 提供的 `docs/requirements-pool.md`，将其从“原始需求池”转化为可执行的现状分诊结果。

### 已完成内容

#### 1. 原始需求池审阅
- 完整审阅 `docs/requirements-pool.md`
- 明确该文档当前更适合作为候选池，而不是直接执行的主 backlog

#### 2. 代码现状对照
- 核对 Source 模型、信息源表单和 crawler worker，确认采集策略扩展已不再是纯需求
- 核对日志、提示词、抓取任务、系统设置、推送模块，确认这些域多数已存在实现基础
- 核对侧边栏导航，确认“导航分组重构”仍未实施
- 核对导出能力，确认 Excel / PDF / CSV 导出当前没有落地

#### 3. 需求池分诊文档落库
- 创建 `docs/requirements-triage.md`
- 将需求池条目标记为：已实现 / 部分实现 / 未实现 / 文档过期 / 待核对
- 补充下一阶段推荐优先级

### 修改文件
- docs/requirements-triage.md（新增）
- docs/worklog.md（更新）

### 当前状态
需求池已经完成第一轮分诊，项目后续可以避免把“已存在域”误当作“从零开发项”，更适合按完成度收口和真实缺口继续推进。

### 下一步计划
1. 将 `requirements-triage.md` 中的 P0/P1 条目整理成正式 backlog
2. 优先收口前端残留 mock/local state 页
3. 再进入真正未实现的新功能开发

---

## 2026-04-12 - 接手基线建立（文档真相源 + 稳定化启动）

### 本轮目标
正式接手项目，建立当前状态文档、运行手册和接手清单，并开始处理前端与运行基线问题。

### 已完成内容

#### 1. 接手分支建立
- 从 `main` 切出 `codex/takeover-baseline`
- 明确本轮目标为“稳定基线优先”，不是继续扩散功能面

#### 2. 接手计划落库
- 创建 `docs/superpowers/plans/2026-04-12-takeover-baseline.md`
- 明确接手执行顺序：文档真相源 -> 前端阻塞项 -> 后端与 workers 验证

#### 3. 文档真相源建立
- 创建 `docs/current-state.md`
- 创建 `docs/runbook.md`
- 创建 `docs/takeover-checklist.md`
- 更新 `README.md` 增加接手入口链接

#### 4. 已确认的基线事实
- 后端 Python 环境可用
- `fastapi`、`sqlalchemy`、`pydantic` 可正常导入
- 前端 `lint` 已恢复通过（剩余 warning）
- 前端 `build` 已恢复通过
- 历史文档与真实实现存在漂移，需继续校准

#### 5. Python 侧接手验证完成
- `apps/api/venv` 中补齐 API 依赖，`structlog` 等缺失包已安装
- 系统 Python 中补齐 AI worker 依赖，`tenacity` 等缺失包已安装
- FastAPI 入口导入验证通过
- `/health` 验证通过，期间顺手修复了 SQLAlchemy 2.x 下 `SELECT 1` 需要 `text(...)` 的健康检查缺陷
- `workers/crawler` / `workers/fact_extractor` / `workers/insight_generator` 的 CLI 帮助命令均已验证通过
- 当前仍存在一条 `requests` 依赖兼容性 warning，暂不阻塞接手开发，但建议后续单独收口

### 修改文件
- docs/superpowers/plans/2026-04-12-takeover-baseline.md（新增）
- docs/current-state.md（新增）
- docs/runbook.md（新增）
- docs/takeover-checklist.md（新增）
- README.md（更新）

### 当前状态
接手第一阶段已经基本完成：仓库已建立第一批权威文档，前端基线恢复，后端与 workers 的最小运行验证通过，项目已回到可持续推进状态。

### 下一步计划
1. 收口前端剩余 warning，降低后续协作噪音
2. 继续校正文档与真实 API/数据契约之间的漂移
3. 在有可用密钥的前提下验证 AI 真链路

---

## 2026-04-10 - Phase 3 完成（AI Workers + Qwen API 集成）

### 本轮目标
完成 Phase 3 核心功能：AI 驱动的事实抽取和结论生成。

### 已完成内容

#### 1. Phase 3 规划文档
- 创建 docs/phase-3-plan.md
- 定义 Phase 3 目标和任务分解
- 设计 AI 服务架构

#### 2. 事实抽取 Worker（fact_extractor）
- 创建项目结构（config、extractor、prompts、main）
- 实现 Qwen API 集成（dashscope）
- 创建事实抽取 Prompt 模板
- 实现 CLI 命令（单记录/批量/定时）
- 与后端 API 集成

#### 3. 结论生成 Worker（insight_generator）
- 创建项目结构（config、generator、prompts、main）
- 实现 Qwen API 集成（dashscope）
- 创建结论生成 Prompt 模板
- 实现 CLI 命令（指定事实/公司/定时）
- 与后端 API 集成

#### 4. 后端 API 更新
- 添加 POST /raw-records/ 端点
- 添加 POST /facts/ 端点
- 添加 POST /insights/ 端点
- 添加 PUT /raw-records/{id}/status 端点
- 添加 PUT /facts/{id}/review 端点

#### 5. 完整链路测试
- 创建测试原始记录
- 测试事实抽取：成功抽取 2 条事实
- 测试结论生成：成功生成 2 条结论
- 验证数据存储到数据库

### 修改文件
- docs/phase-3-plan.md（新增）
- workers/fact_extractor/（7 个文件）
- workers/insight_generator/（7 个文件）
- apps/api/routers/（更新端点）
- apps/api/schemas/（更新 schema）

### 当前状态
- 前端运行在 http://localhost:3001
- 后端 API 运行在 http://localhost:8000
- 事实抽取 Worker 测试通过
- 结论生成 Worker 测试通过
- 完整链路验证成功
- 代码已推送到 GitHub

### 下一步计划
1. 完善前端数据展示
2. 创建 Docker 配置文件
3. 完善人工复核工作台

---

## 2026-04-10 - Phase 2 完成（后端 API + 采集服务 + CRUD）

### 本轮目标
完成 Phase 2 核心功能：后端 API、采集服务、前端 CRUD。

### 已完成内容

#### 1. FastAPI 后端初始化
- 创建后端项目结构（config、models、schemas、routers、services）
- 实现 SQLAlchemy 数据库模型（Source、RawRecord、Fact、Insight）
- 实现 Pydantic Schema
- 实现 API 路由（sources、raw-records、facts、insights）
- 配置 SQLite 数据库（预留 PostgreSQL 切换）
- 添加健康检查接口

#### 2. 前端对接真实 API
- 创建 API 客户端（ky + SWR）
- 创建各模块 API 文件（sources、raw-records、facts、insights、dashboard）
- 创建 React Hooks（useSources、useRawRecords、useFacts、useInsights、useDashboard）
- 更新页面使用真实 API（支持 Mock 切换）
- 添加环境变量配置
- 添加 API 代理配置

#### 3. Crawl4AI 采集服务
- 创建采集 Worker 项目结构
- 实现 Crawl4AI 封装（单页/多页采集）
- 实现采集任务（与后端 API 集成）
- 实现解析器（官方文档、博客、新闻）
- 实现定时调度（APScheduler）
- 提供 CLI 命令（单源/全量/定时采集）
- 安装依赖并初始化 Crawl4AI

#### 4. 信息源 CRUD 功能
- 创建信息源表单组件（source-form.tsx）
- 创建新增/编辑弹窗组件（source-form-dialog.tsx）
- 添加 Switch、Label、Textarea、ConfirmDialog UI 组件
- 更新信息源管理页面，支持新增、编辑、删除操作
- 添加表单验证

#### 5. 需求池创建
- 创建 docs/requirements-pool.md
- 记录采集源类型扩展需求（搜索关键词、整页读取、子页面遍历、官方号观测）

### 修改文件
- apps/api/（30 个文件，完整后端项目）
- apps/web/lib/api/（6 个 API 文件）
- apps/web/hooks/（6 个 Hooks 文件）
- apps/web/app/（5 个页面更新）
- apps/web/components/sources/（表单组件）
- apps/web/components/ui/（UI 组件）
- workers/crawler/（12 个文件，完整采集服务）
- docs/requirements-pool.md（新增）
- docs/phase-2-plan.md（新增）

### 当前状态
- 前端构建成功（npm run build）
- 后端 API 运行在 http://localhost:8000
- 前端运行在 http://localhost:3001
- Crawl4AI 初始化成功
- 代码已推送到 GitHub

### 下一步计划
1. Phase 3：接入 Qwen API 进行事实抽取
2. Phase 3：创建结论生成 Worker
3. Phase 3：完善人工复核工作台

---

## 2026-04-10 - 前端骨架开发（智能体并行）

### 本轮目标
使用 frontend-architect 和 ui-designer 智能体并行开发前端骨架，完成 5 个核心页面。

### 已完成内容

#### 1. 项目初始化与配置
- 初始化 Next.js 14 项目（TypeScript + Tailwind CSS + App Router）
- 配置 shadcn/ui 组件库（button、card、table、input、select、badge、dialog、sheet 等）
- 安装 recharts 图表库
- 配置深色主题（背景接近纯黑，蓝紫色高亮）

#### 2. 布局组件开发
- components/layout/sidebar.tsx - 左侧导航栏（240px 固定宽度，可折叠，10 个导航链接）
- components/layout/header.tsx - 顶部 Header（Logo + 产品名称"AI 研究平台"）
- components/layout/app-layout.tsx - 应用布局容器
- app/layout.tsx - 根布局，集成 AppLayout

#### 3. 类型定义与 Mock 数据
- types/enums.ts - 枚举类型定义（Company、SourceType、EventType 等）
- types/entities.ts - 实体类型定义（Source、RawRecord、Fact、Insight 等）
- types/labels.ts - 中文标签映射和导航项配置
- mock/sources.ts - 信息源 mock（11 条数据）
- mock/raw-records.ts - 原始记录 mock（23 条数据）
- mock/facts.ts - 标准化事实 mock（18 条，含 4 条待复核）
- mock/insights.ts - 研究结论 mock（12 条）
- mock/dashboard.ts - Dashboard 统计数据 mock

#### 4. 基础 UI 组件
- components/ui/stats-card.tsx - 统计卡片组件
- components/ui/data-table.tsx - 数据表格组件
- components/ui/filter-bar.tsx - 筛选栏组件

#### 5. Dashboard 页面
- app/page.tsx - Dashboard 主页面
- components/dashboard/trend-chart.tsx - 近 7 日情报趋势折线图
- components/dashboard/fact-list.tsx - 最新标准化事实列表
- components/dashboard/insight-list.tsx - 最新研究结论列表
- 功能：4 个统计卡片、趋势图、最新列表、公司筛选

#### 6. 信息源管理页面
- app/sources/page.tsx - 信息源管理页面
- components/sources/source-table.tsx - 信息源表格
- components/sources/source-filter.tsx - 筛选栏
- components/sources/source-detail-sheet.tsx - 详情抽屉

#### 7. 原始记录页面
- app/raw-records/page.tsx - 原始记录页面
- components/raw-records/record-table.tsx - 记录表格
- components/raw-records/record-filter.tsx - 筛选栏
- components/raw-records/record-preview-sheet.tsx - 原文预览抽屉

#### 8. 标准化事实页面
- app/facts/page.tsx - 标准化事实页面
- components/facts/fact-table.tsx - 事实表格
- components/facts/fact-filter.tsx - 筛选栏
- components/facts/fact-detail-sheet.tsx - 详情抽屉
- components/facts/review-actions.tsx - 复核操作组件

#### 9. 研究结论页面
- app/insights/page.tsx - 研究结论页面
- components/insights/insight-list.tsx - 结论卡片列表
- components/insights/insight-filter.tsx - 筛选栏
- components/insights/insight-detail-sheet.tsx - 详情抽屉

### 修改文件
- apps/web/app/page.tsx（Dashboard）
- apps/web/app/sources/page.tsx（信息源管理）
- apps/web/app/raw-records/page.tsx（原始记录）
- apps/web/app/facts/page.tsx（标准化事实）
- apps/web/app/insights/page.tsx（研究结论）
- apps/web/components/layout/*（布局组件）
- apps/web/components/ui/*（UI 组件）
- apps/web/components/dashboard/*（Dashboard 模块）
- apps/web/components/sources/*（信息源模块）
- apps/web/components/raw-records/*（原始记录模块）
- apps/web/components/facts/*（事实模块）
- apps/web/components/insights/*（结论模块）
- apps/web/types/*（类型定义）
- apps/web/mock/*（Mock 数据）

### 当前状态
- 项目构建成功（npm run build）
- 开发服务器运行在 http://localhost:3001
- 5 个核心页面已完成：Dashboard、信息源管理、原始记录、标准化事实、研究结论
- 深色主题生效，UI 风格统一

### 下一步计划
1. 开发模型档案页面（app/models/page.tsx）
2. 开发产品档案页面（app/products/page.tsx）
3. 开发研究主题页面（app/topics/page.tsx）
4. 开发周报中心页面（app/reports/page.tsx）
5. 开发系统设置页面（app/settings/page.tsx）

---

## 2026-04-10 - 文档基线与目录结构

### 本轮目标
完成项目文档基线与目录结构设计，为后续前端开发奠定基础。

### 已完成内容
1. 创建项目目录结构
   - apps/web（前端应用）
   - apps/api（后端 API）
   - workers/crawler（采集服务）
   - workers/fact_extractor（事实抽取服务）
   - workers/insight_generator（结论生成服务）
   - packages/shared-types（共享类型）
   - packages/ui（共享组件）
   - docs（文档目录）
   - mock（Mock 数据目录）

2. 编写 docs/product-scope.md
   - 定义产品定位（情报中台，非资讯站）
   - 明确研究对象（阿里、字节、腾讯）
   - 定义核心链路（信息源 → 原始记录 → 标准化事实 → 研究结论 → 报告输出）
   - 明确功能边界（Phase 1 做什么/不做什么）
   - 定义技术方向

3. 编写 docs/information-architecture.md
   - 定义 10 个一级页面
   - 详细设计各页面模块与字段
   - 定义页面关系与导航结构
   - 定义交互模式（表格+筛选、抽屉、弹窗等）

4. 编写 docs/data-contract.md
   - 定义 8 个核心实体模型
   - 定义 12 个枚举类型（公司、来源类型、事件类型等）
   - 详细定义各实体字段（含中文展示名）
   - 提供完整的 TypeScript 类型定义
   - 提供中文字段映射表

5. 编写 docs/engineering-rules.md
   - 定义开发原则（先定义再开发、先静态再真实等）
   - 定义分支管理规范
   - 定义任务反馈格式
   - 定义 Worklog 规范
   - 定义前端/后端开发规范
   - 定义 Mock 数据规范

6. 编写 docs/phase-1-plan.md
   - 明确 Phase 1 目标与范围
   - 定义验收标准
   - 分解 10 个具体任务
   - 定义任务依赖关系
   - 规划开发顺序

### 修改文件
- docs/product-scope.md（新增）
- docs/information-architecture.md（新增）
- docs/data-contract.md（新增）
- docs/engineering-rules.md（新增）
- docs/phase-1-plan.md（新增）
- docs/worklog.md（新增）

### 当前状态
文档基线已完成，所有文档逻辑一致，目录结构清晰。准备进入前端开发阶段。

### 下一步计划
1. 初始化 Next.js 14 项目（feat/web-init）
2. 配置 shadcn/ui 与 Tailwind 深色主题（feat/ui-setup）
3. 创建布局组件（侧边栏 + Header）（feat/layout-shell）
4. 创建 Mock 数据（feat/mock-data）
5. 开发 Dashboard 页面（feat/dashboard-page）

---

## 待办事项

| 序号 | 任务 | 分支 | 状态 |
|------|------|------|------|
| 1 | 初始化 Next.js 项目 | feat/web-init | ✅ 已完成 |
| 2 | 配置 shadcn/ui | feat/ui-setup | ✅ 已完成 |
| 3 | 创建布局组件 | feat/layout-shell | ✅ 已完成 |
| 4 | 创建 Mock 数据 | feat/mock-data | ✅ 已完成 |
| 5 | Dashboard 页面 | feat/dashboard-page | ✅ 已完成 |
| 6 | 信息源管理页面 | feat/sources-page | ✅ 已完成 |
| 7 | 原始记录页面 | feat/raw-records-page | ✅ 已完成 |
| 8 | 标准化事实页面 | feat/facts-page | ✅ 已完成 |
| 9 | 研究结论页面 | feat/insights-page | ✅ 已完成 |
| 10 | 模型档案页面 | feat/models-page | ✅ 已完成 |
| 11 | 产品档案页面 | feat/products-page | ✅ 已完成 |
| 12 | 研究主题页面 | feat/topics-page | ✅ 已完成 |
| 13 | 周报中心页面 | feat/reports-page | ✅ 已完成 |
| 14 | 系统设置页面 | feat/settings-page | ✅ 已完成 |
| 15 | FastAPI 后端 | feat/api-init | ✅ 已完成 |
| 16 | 前端对接 API | feat/api-integration | ✅ 已完成 |
| 17 | Crawl4AI 采集服务 | feat/crawler-service | ✅ 已完成 |
| 18 | 信息源 CRUD | feat/source-crud | ✅ 已完成 |
| 19 | Phase 3：Qwen API 接入 | feat/qwen-integration | 待开始 |
| 20 | Phase 3：事实抽取 Worker | feat/fact-extractor | 待开始 |
| 21 | Phase 3：结论生成 Worker | feat/insight-generator | 待开始 |
