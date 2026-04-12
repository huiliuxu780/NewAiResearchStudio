# AI 研究平台 - 工程规则

## 1. 开发原则

### 1.1 核心原则

| 原则 | 说明 |
|------|------|
| 先定义，再开发 | 必须先完成文档定义，再进入编码 |
| 先文档，再页面 | 必须先定义信息架构和数据契约，再开发页面 |
| 先静态骨架，再接真链路 | Phase 1 先用 mock 数据，不接真实采集和模型 |
| 先 mock，再接真实 | 保证最小闭环后再接入真实数据源 |
| 先保证最小闭环，再做平台扩展 | 每轮只做一个相对完整的小模块 |
| 每次任务都必须给出进度和下一步计划 | 任务反馈格式固定 |
| 每次开发都使用独立分支 | 分支命名规范 |
| 每次任务都记录 worklog | 更新 docs/worklog.md |

### 1.2 禁止事项

| 禁止项 | 说明 |
|--------|------|
| 不要擅自扩大范围 | 严格按照 Phase 定义的范围执行 |
| 不要在 Phase 1 中提前实现复杂 agent 编排 | Phase 1 只做静态骨架 |
| 不要在未定义数据契约前直接开始开发 | 必须先完成文档基线 |
| 不要一轮同时大面积改动多个系统模块 | 每轮只做一个模块 |
| 不要在页面结构、数据模型、字段定义未明确时编码 | 必须先定义清楚 |

---

## 2. 分支管理（⚠️ 全局强制规则）

### 2.0 开发流程铁律

| 序号 | 规则 | 说明 |
|------|------|------|
| 1 | **禁止在 main 上开发** | main 分支只接受合并，不允许直接提交 |
| 2 | **开发前必须起新分支** | 每个任务/功能必须从 main 创建独立分支 |
| 3 | **开发完必须回归测试** | 完成后运行 `npm run build` 验证构建 |
| 4 | **测试完毕推送并合并** | 测试通过后推送分支，合并到 main |
| 5 | **记录分支开发 Notes** | 在 docs/branch-notes/ 记录开发详情 |

### 2.1 分支命名规范

| 分支类型 | 命名格式 | 示例 |
|----------|----------|------|
| 功能分支 | feat/{模块名} | feat/dashboard-shell |
| 页面分支 | feat/{页面名}-page | feat/source-management-page |
| 修复分支 | fix/{问题描述} | fix/fact-filter-error |
| 文档分支 | docs/{文档名} | docs/data-contract-update |
| 重构分支 | refactor/{模块名} | refactor/shared-types |

### 2.2 分支工作流程

```
main (主分支，受保护)
    │
    │  ① git checkout -b feat/xxx
    │
    ├── feat/dashboard-shell
    │       │
    │       │  ② 开发、提交
    │       │
    │       │  ③ npm run build 测试
    │       │
    │       │  ④ git push origin feat/xxx
    │       │
    │       │  ⑤ 记录 branch-notes
    │       │
    │       └── ⑥ 合并回 main，删除分支
    │
    └── ...
```

### 2.3 分支操作规范

- 每个新任务必须从 main 创建独立分支
- 开发过程中定期提交，提交信息清晰
- 完成后必须运行构建测试：`npm run build`
- 测试通过后推送分支，记录 branch-notes
- 合并回 main 后删除功能分支
- **严禁直接在 main 上开发**

### 2.4 分支开发记录规范

每个分支开发完成后，必须在 `docs/branch-notes/` 目录下创建记录文件。

**文件命名：** `{日期}-{分支名}.md`

**记录格式：**

```markdown
# 分支开发记录

## 基本信息
- 分支名称：feat/xxx
- 分支 ID：abc123def
- 开发日期：2026-04-10
- 开发者：xxx

## 开发内容
本次开发了 xxx 功能

## 修改文件
- apps/web/app/page.tsx（修改）
- apps/web/components/xxx.tsx（新增）

## 测试结果
- 构建测试：✅ 通过
- 功能测试：✅ 正常

## 合并信息
- 合并到：main
- 合并时间：2026-04-10
- Commit ID：xxx
```

**获取分支 ID：**
```bash
git rev-parse HEAD
```

---

## 3. 任务反馈格式

### 3.1 每轮任务必须输出

```
1. 本轮目标：本轮任务要完成什么
2. 已完成内容：具体完成了哪些工作
3. 修改文件：列出所有修改/新增的文件
4. 当前状态：当前进度状态
5. 下一步计划：下一轮要做什么
```

### 3.2 示例

```
1. 本轮目标：完成 Dashboard 页面静态骨架开发
2. 已完成内容：
   - 创建 Dashboard 页面组件
   - 实现统计卡片模块
   - 实现最新事实列表模块
   - 实现最新结论列表模块
   - 添加 mock 数据
3. 修改文件：
   - apps/web/app/page.tsx
   - apps/web/components/dashboard/stats-card.tsx
   - apps/web/components/dashboard/fact-list.tsx
   - apps/web/components/dashboard/insight-list.tsx
   - mock/dashboard.ts
4. 当前状态：Dashboard 页面骨架完成，待接入真实数据
5. 下一步计划：开发信息源管理页面
```

---

## 4. Worklog 规范

### 4.1 Worklog 文件位置

`docs/worklog.md`

### 4.2 Worklog 格式

```markdown
# AI 研究平台 - 工作日志

## 2026-04-10 - 文档基线与目录结构

### 本轮目标
完成项目文档基线与目录结构设计

### 已完成内容
1. 创建项目目录结构
2. 编写 docs/product-scope.md
3. 编写 docs/information-architecture.md
4. 编写 docs/data-contract.md
5. 编写 docs/engineering-rules.md
6. 编写 docs/phase-1-plan.md

### 修改文件
- docs/product-scope.md (新增)
- docs/information-architecture.md (新增)
- docs/data-contract.md (新增)
- docs/engineering-rules.md (新增)
- docs/phase-1-plan.md (新增)
- docs/worklog.md (新增)

### 当前状态
文档基线完成，准备进入前端开发

### 下一步计划
初始化 Next.js 项目，开发 Dashboard 页面骨架
```

---

## 5. 前端开发规范

### 5.1 技术栈

| 技术 | 版本要求 | 说明 |
|------|----------|------|
| Next.js | 16.x | App Router |
| TypeScript | 5.x | 严格模式 |
| Tailwind CSS | 4.x | 样式系统 |
| shadcn/ui | 最新 | UI 组件库 |
| Lucide React | 最新 | 图标库 |

### 5.1.1 当前接手期补充规则

| 规则 | 说明 |
|------|------|
| 历史文档不默认等于当前实现 | 规划文档与 worklog 仅代表历史过程，当前实现以 `docs/current-state.md` 为准 |
| 接手期先稳基线再扩功能 | 先恢复 lint/build/运行手册，再继续功能扩展 |
| 运行方式统一记录到 runbook | 本地启动和验证方式统一维护在 `docs/runbook.md` |

### 5.2 组件策略

| 规则 | 说明 |
|------|------|
| 优先使用 shadcn/ui | 不重复造轮子 |
| 缺失组件先封装 | 封装到 packages/ui |
| 组件命名规范 | PascalCase，语义清晰 |
| 组件文件结构 | 每个组件独立文件 |

### 5.3 目录结构

```
apps/web/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # Dashboard
│   ├── sources/            # 信息源管理
│   ├── raw-records/        # 原始记录
│   ├── facts/              # 标准化事实
│   ├── insights/           # 研究结论
│   ├── models/             # 模型档案
│   ├── products/           # 产品档案
│   ├── topics/             # 研究主题
│   ├── reports/            # 周报中心
│   └── settings/           # 系统设置
├── components/
│   ├── ui/                 # shadcn/ui 组件
│   ├── layout/             # 布局组件
│   ├── dashboard/          # Dashboard 模块组件
│   ├── sources/            # 信息源模块组件
│   ├── facts/              # 事实模块组件
│   └── ...
├── lib/                    # 工具函数
├── hooks/                  # 自定义 Hooks
├── types/                  # 类型定义
└── mock/                   # Mock 数据
```

### 5.4 中文展示规范

| 规则 | 说明 |
|------|------|
| 页面展示字段名使用中文 | 所有 UI label 使用中文 |
| 管理后台文案优先中文 | 按钮、提示、标题等 |
| 内部代码字段允许英文 | 变量名、函数名用英文 |
| UI label_map 统一维护 | 在 types/labels.ts 中统一管理 |

---

## 6. 后端开发规范

### 6.1 技术栈

| 技术 | 版本要求 | 说明 |
|------|----------|------|
| Python | 3.10+ | 主语言 |
| FastAPI | 0.100+ | Web 框架 |
| Pydantic | 2.x | 数据验证 |
| SQLAlchemy | 2.x | ORM |
| APScheduler | 3.x | 任务调度 |

### 6.2 目录结构

```
apps/api/
├── main.py                 # FastAPI 入口
├── routers/
│   ├── sources.py          # 信息源路由
│   ├── raw_records.py      # 原始记录路由
│   ├── facts.py            # 事实路由
│   ├── insights.py         # 结论路由
│   └── ...
├── models/
│   ├── source.py           # Source 模型
│   ├── raw_record.py       # RawRecord 模型
│   ├── fact.py             # Fact 模型
│   └── ...
├── schemas/
│   ├── source.py           # Source Schema
│   ├── raw_record.py       # RawRecord Schema
│   └── ...
├── services/
│   ├── source_service.py   # 信息源服务
│   ├── crawl_service.py    # 采集服务
│   └── ...
├── config/
│   └── settings.py         # 配置管理
└── utils/
    └── helpers.py          # 工具函数
```

### 6.3 API 规范

| 规则 | 说明 |
|------|------|
| RESTful 设计 | 遵循 REST 规范 |
| 版本控制 | URL 中包含版本号 /api/v1/ |
| 响应格式统一 | 使用 ApiResponse 包装 |
| 错误处理统一 | 统一错误码和错误信息 |
| 分页参数统一 | page, page_size, sort_by |

---

## 7. Mock 数据规范

### 7.1 Mock 文件位置

```
mock/
├── sources.ts              # 信息源 mock
├── raw-records.ts          # 原始记录 mock
├── facts.ts                # 事实 mock
├── insights.ts             # 结论 mock
├── models.ts               # 模型档案 mock
├── products.ts             # 产品档案 mock
├── topics.ts               # 研究主题 mock
├── reports.ts              # 周报 mock
└── dashboard.ts            # Dashboard 统计 mock
```

### 7.2 Mock 数据要求

| 要求 | 说明 |
|------|------|
| 三家公司数据 | 阿里、字节、腾讯各有一定数量 |
| 多种 source_type | 覆盖所有来源类型 |
| 多种 event_type | 覆盖所有事件类型 |
| 多种 confidence | 高、中、低都有 |
| 多种 capability_level | L1-L6 都有 |
| 存在待复核数据 | needs_review = true |
| 存在高价值结论 | importance_level = P0/P1 |
| 不同时间分布 | 近 7 日都有数据 |

---

## 8. 代码风格

### 8.1 TypeScript/JavaScript

| 规则 | 说明 |
|------|------|
| 不添加注释 | 除非用户明确要求 |
| 使用 const 优先 | 除非需要重新赋值 |
| 类型定义完整 | 不使用 any |
| 函数命名清晰 | 语义化命名 |

### 8.2 Python

| 规则 | 说明 |
|------|------|
| 不添加注释 | 除非用户明确要求 |
| 类型注解完整 | 使用 typing |
| 函数命名 snake_case | 遵循 Python 规范 |
| 类命名 PascalCase | 遵循 Python 规范 |

---

## 9. 安全规范

### 9.1 安全原则

| 原则 | 说明 |
|------|------|
| 不暴露密钥 | API Key 等敏感信息不暴露 |
| 不记录密钥 | 不在日志中记录敏感信息 |
| 不提交密钥 | 不将密钥提交到代码仓库 |
| 配置分离 | 敏感配置使用环境变量 |

### 9.2 环境变量管理

```
.env.local                # 本地开发环境变量（不提交）
.env.example              # 环境变量示例（提交）
```

---

## 10. 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.1 | 2026-04-10 | 添加开发流程铁律、分支记录规范 |
| v1.0 | 2026-04-10 | 初始版本，定义工程规则 |
