# AI 研究平台 - 工作日志

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