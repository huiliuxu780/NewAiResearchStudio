# AI 研究平台 - Phase 1 计划

## 1. Phase 1 目标

### 1.1 总体目标

搭建一个可以演示完整信息链路的前端静态研究平台骨架。

### 1.2 Phase 1 做什么

| 任务 | 说明 |
|------|------|
| 定义页面信息架构 | 明确一级页面、二级页面、页面关系 |
| 定义数据契约 | 明确实体模型、字段定义、枚举体系 |
| 定义字段展示名与枚举 | 中文字段映射、枚举中文标签 |
| 生成静态前端页面 | 使用 Next.js + shadcn/ui |
| 使用 mock data 驱动页面 | 不接真实数据源 |
| 展示研究平台主流程 | 完整的信息链路演示 |

### 1.3 Phase 1 不做什么

| 禁止项 | 说明 |
|--------|------|
| 不接真实 Crawl4AI | Phase 1 只用 mock 数据 |
| 不接真实 Qwen API | Phase 1 只用 mock 数据 |
| 不接真实数据库 | Phase 1 只用 mock 数据 |
| 不做登录权限 | Phase 1 无权限系统 |
| 不做复杂工作流引擎 | Phase 1 无工作流 |
| 不做复杂定时任务管理页 | Phase 1 无任务管理 |
| 不做复杂报表导出 | Phase 1 无导出功能 |
| 不做多角色权限系统 | Phase 1 单一角色 |

---

## 2. Phase 1 验收标准

### 2.1 文档验收

| 文档 | 验收标准 |
|------|----------|
| docs/product-scope.md | 产品定位清晰，功能边界明确 |
| docs/information-architecture.md | 页面结构完整，交互模式清晰 |
| docs/data-contract.md | 实体模型完整，枚举体系完整，中文字段映射完整 |
| docs/engineering-rules.md | 开发规范清晰，分支管理规范清晰 |
| docs/phase-1-plan.md | 任务分解清晰，验收标准明确 |

### 2.2 页面验收

| 页面 | 验收标准 |
|------|----------|
| Dashboard | 统计卡片、趋势图、最新列表完整展示 |
| 信息源管理 | 表格、筛选、详情抽屉完整 |
| 原始记录 | 表格、筛选、原文预览完整 |
| 标准化事实 | 表格、筛选、复核操作完整 |
| 研究结论 | 列表、筛选、详情完整 |

### 2.3 整体验收

- [ ] 有完整的信息架构
- [ ] 有统一数据契约
- [ ] 有完整中文字段展示
- [ ] 页面风格统一、可扩展
- [ ] 可继续接入真数据

---

## 3. Phase 1 任务分解

### 3.1 任务列表

| 序号 | 任务名称 | 分支名 | 优先级 | 预估工作量 |
|------|----------|--------|--------|------------|
| 1 | 文档基线与目录结构 | docs/baseline | P0 | 1轮 |
| 2 | 初始化 Next.js 项目 | feat/web-init | P0 | 1轮 |
| 3 | 配置 shadcn/ui 与 Tailwind | feat/ui-setup | P0 | 1轮 |
| 4 | 创建布局组件（侧边栏+Header） | feat/layout-shell | P0 | 1轮 |
| 5 | 创建 Mock 数据 | feat/mock-data | P0 | 1轮 |
| 6 | Dashboard 页面开发 | feat/dashboard-page | P0 | 1轮 |
| 7 | 信息源管理页面开发 | feat/sources-page | P1 | 1轮 |
| 8 | 原始记录页面开发 | feat/raw-records-page | P1 | 1轮 |
| 9 | 标准化事实页面开发 | feat/facts-page | P1 | 1轮 |
| 10 | 研究结论页面开发 | feat/insights-page | P1 | 1轮 |

### 3.2 任务依赖关系

```
文档基线 ──→ Next.js 初始化 ──→ UI 配置 ──→ 布局组件
                                              │
                                              ↓
                                         Mock 数据
                                              │
                                              ↓
    ┌─────────────────────────────────────────┼─────────────────────────────────────────┐
    │                                         │                                         │
    ↓                                         ↓                                         ↓
Dashboard                               信息源管理                                原始记录
    │                                         │                                         │
    │                                         │                                         │
    ↓                                         ↓                                         ↓
标准化事实 ───────────────────────────────→ 研究结论
```

---

## 4. 各任务详细说明

### 4.1 任务 1：文档基线与目录结构

**分支：** `docs/baseline`

**目标：**
- 完成项目目录结构设计
- 完成文档基线输出

**产出：**
- docs/product-scope.md
- docs/information-architecture.md
- docs/data-contract.md
- docs/engineering-rules.md
- docs/phase-1-plan.md
- docs/worklog.md

**验收：**
- 所有文档逻辑一致
- 目录结构清晰

---

### 4.2 任务 2：初始化 Next.js 项目

**分支：** `feat/web-init`

**目标：**
- 初始化 Next.js 14 项目
- 配置 TypeScript
- 配置 Tailwind CSS

**产出：**
- apps/web/ 目录
- package.json
- tsconfig.json
- tailwind.config.js
- next.config.js

**验收：**
- 项目可正常启动
- TypeScript 编译无错误

---

### 4.3 任务 3：配置 shadcn/ui 与 Tailwind

**分支：** `feat/ui-setup`

**目标：**
- 安装并配置 shadcn/ui
- 配置深色主题
- 安装 Lucide React 图标

**产出：**
- apps/web/components/ui/ 目录
- 全局样式配置
- 主题配置

**验收：**
- shadcn/ui 组件可正常使用
- 深色主题生效

---

### 4.4 任务 4：创建布局组件

**分支：** `feat/layout-shell`

**目标：**
- 创建侧边栏导航组件
- 创建顶部 Header 组件
- 创建根布局

**产出：**
- apps/web/components/layout/sidebar.tsx
- apps/web/components/layout/header.tsx
- apps/web/app/layout.tsx

**验收：**
- 导航完整，包含所有一级页面
- 响应式布局正常

---

### 4.5 任务 5：创建 Mock 数据

**分支：** `feat/mock-data`

**目标：**
- 创建所有实体 mock 数据
- 数据符合数据契约定义
- 数据覆盖所有枚举值

**产出：**
- mock/sources.ts
- mock/raw-records.ts
- mock/facts.ts
- mock/insights.ts
- mock/models.ts
- mock/products.ts
- mock/topics.ts
- mock/reports.ts
- mock/dashboard.ts

**验收：**
- 三家公司数据都有
- 所有枚举值都有覆盖
- 存在待复核数据
- 存在高价值结论

---

### 4.6 任务 6：Dashboard 页面开发

**分支：** `feat/dashboard-page`

**目标：**
- 创建 Dashboard 页面
- 实现统计卡片模块
- 实现趋势图模块
- 实现最新列表模块

**产出：**
- apps/web/app/page.tsx
- apps/web/components/dashboard/stats-card.tsx
- apps/web/components/dashboard/trend-chart.tsx
- apps/web/components/dashboard/fact-list.tsx
- apps/web/components/dashboard/insight-list.tsx

**验收：**
- 统计数据正确展示
- 趋势图正确展示
- 最新列表正确展示
- 公司筛选功能正常

---

### 4.7 任务 7：信息源管理页面开发

**分支：** `feat/sources-page`

**目标：**
- 创建信息源管理页面
- 实现表格展示
- 实现筛选功能
- 实现详情抽屉

**产出：**
- apps/web/app/sources/page.tsx
- apps/web/components/sources/source-table.tsx
- apps/web/components/sources/source-filter.tsx
- apps/web/components/sources/source-detail-drawer.tsx

**验收：**
- 表格数据正确展示
- 筛选功能正常
- 详情抽屉正常展示

---

### 4.8 任务 8：原始记录页面开发

**分支：** `feat/raw-records-page`

**目标：**
- 创建原始记录页面
- 实现表格展示
- 实现筛选功能
- 实现原文预览抽屉

**产出：**
- apps/web/app/raw-records/page.tsx
- apps/web/components/raw-records/record-table.tsx
- apps/web/components/raw-records/record-filter.tsx
- apps/web/components/raw-records/record-preview-drawer.tsx

**验收：**
- 表格数据正确展示
- 筛选功能正常
- 原文预览正常展示

---

### 4.9 任务 9：标准化事实页面开发

**分支：** `feat/facts-page`

**目标：**
- 创建标准化事实页面
- 实现表格展示
- 实现筛选功能
- 实现复核操作

**产出：**
- apps/web/app/facts/page.tsx
- apps/web/components/facts/fact-table.tsx
- apps/web/components/facts/fact-filter.tsx
- apps/web/components/facts/fact-detail-drawer.tsx
- apps/web/components/facts/review-actions.tsx

**验收：**
- 表格数据正确展示
- 筛选功能正常
- 复核操作按钮正常

---

### 4.10 任务 10：研究结论页面开发

**分支：** `feat/insights-page`

**目标：**
- 创建研究结论页面
- 实现列表展示
- 实现筛选功能
- 实现详情抽屉

**产出：**
- apps/web/app/insights/page.tsx
- apps/web/components/insights/insight-list.tsx
- apps/web/components/insights/insight-filter.tsx
- apps/web/components/insights/insight-detail-drawer.tsx

**验收：**
- 列表数据正确展示
- 筛选功能正常
- 详情抽屉正常展示

---

## 5. 开发顺序

### 5.1 推荐顺序

```
第 1 轮：文档基线与目录结构（已完成）
第 2 轮：初始化 Next.js 项目 + 配置 UI
第 3 轮：创建布局组件 + Mock 数据
第 4 轮：Dashboard 页面
第 5 轮：信息源管理页面
第 6 轮：原始记录页面
第 7 轮：标准化事实页面
第 8 轮：研究结论页面
```

### 5.2 并行开发建议

以下任务可并行开发：
- Dashboard 页面 + 信息源管理页面（第 4-5 轮）
- 原始记录页面 + 标准化事实页面（第 6-7 轮）

---

## 6. Phase 1 后续规划

### 6.1 Phase 2 规划

| 功能 | 说明 |
|------|------|
| 信息源配置管理 | 真实信息源 CRUD |
| Crawl4AI 抓取执行 | 接入真实采集 |
| 原始记录落库 | 接入真实数据库 |
| 去重与失败重试 | 数据处理逻辑 |
| 抽取基础元数据 | 基础数据处理 |
| 数据状态流转 | 状态管理 |

### 6.2 Phase 3 规划

| 功能 | 说明 |
|------|------|
| Qwen 结构化抽取 | 接入真实 AI 抽取 |
| Qwen 洞察生成 | 接入真实 AI 分析 |
| Prompt 模板管理 | Prompt 配置管理 |
| 人工复核工作台 | 复核流程完善 |
| 日报 / 周报生成 | 报告自动生成 |
| 研究主题归集 | 主题管理完善 |

---

## 7. 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2026-04-10 | 初始版本，定义 Phase 1 计划 |