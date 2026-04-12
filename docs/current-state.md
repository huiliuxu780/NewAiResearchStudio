# AI 研究平台 - 当前状态

## 更新时间

- 日期：2026-04-12
- 当前接手分支：`codex/takeover-baseline`
- 当前主接手目标：围绕 `docs/backlog-v1.md` 持续收口 P0 项，保持仓库可持续推进

## 项目定位

这是一个面向 AI 研究工作的情报中台，核心链路为：

`信息源 -> 原始记录 -> 标准化事实 -> 研究结论 -> 日报/周报/推送输出`

## 当前真实技术栈

### 前端

- Next.js 16.2.3
- React 19.2.4
- TypeScript 5
- Tailwind CSS 4
- SWR
- shadcn/ui + 自定义业务组件

### 后端

- Python 3.12
- FastAPI
- SQLAlchemy 2.x
- Pydantic 2.x
- APScheduler
- SQLite（默认开发数据库）

### Workers

- `workers/crawler`：采集服务
- `workers/fact_extractor`：事实抽取服务
- `workers/insight_generator`：结论生成服务

## 当前已实现模块

### Web 页面

已存在路由：

- `/` Dashboard
- `/sources`
- `/raw-records`
- `/facts`
- `/insights`
- `/logs`
- `/models`
- `/products`
- `/prompts`
- `/reports`
- `/reports/generate`
- `/reports/[id]`
- `/settings`
- `/tasks`
- `/topics`

说明：

- `/products`、`/topics` 当前已有前端路由入口
- 当前 `/api/v1` 尚无对应的 `products`、`topics` 后端域，它们更接近前端占位 / 后续收口项

### API 路由

当前 `/api/v1` 已注册的路由域：

- `dashboard`
- `sources`
- `raw_records`
- `facts`
- `insights`
- `logs`
- `ai_models`
- `prompt_templates`
- `crawl_tasks`
- `system_settings`
- `reports`
- `push`

### Python Workers

- `crawler` 支持单源采集、全量采集、定时采集、Crawl4AI 初始化
- `fact_extractor` 支持单记录抽取、批量待处理抽取、定时抽取
- `insight_generator` 支持按事实 ID、按公司、按全部确认事实生成、定时生成

## 2026-04-12 接手时已确认事实

- 仓库是有效 git 仓库
- 接手前存在用户未提交改动：`docs/requirements-pool.md`
- 后端 Python 环境可用，`fastapi`、`sqlalchemy`、`pydantic` 可正常导入
- 前端依赖已安装，但基线未收口

## 2026-04-12 基线验证结果

### 前端

- `apps/web` `npm.cmd run lint`：通过，0 warning，0 error
- `apps/web` `npm.cmd run build`：通过
- `BG-001 前端 Warning 收口` 已完成
- `BG-002 模型管理页接真实 API` 已完成当前批次范围（列表、启停、设默认、测试）
- 当前前端已经恢复到可继续开发和验收的低噪音状态

### 后端

- `apps/api` FastAPI 入口导入：通过
- `/health`：可响应，状态为 `healthy`
- API 运行依赖已补齐

### Workers

- `workers/crawler` `python main.py --help`：可运行
- `workers/fact_extractor` `python main.py --help`：可运行
- `workers/insight_generator` `python main.py --help`：可运行
- AI worker 运行依赖已补齐

## 当前已知阻塞项

### 前端

- `lint/build` 已恢复
- 当前无前端基线级阻塞项
- 后续前端工作应优先围绕 backlog 的功能收口项推进，而不是继续处理历史 warning

### 文档

- 历史文档与真实代码有漂移
- `docs/engineering-rules.md` 中的部分前端版本信息已过期
- `docs/phase-3-plan.md` 中的完成状态与 `docs/worklog.md` 不完全一致
- `docs/data-contract.md` 已完成 BG-003 校准，当前主要 API 扩展域已有字段级契约或 schema 映射

### Python 环境

- worker 命令使用的是系统 Python，不是独立虚拟环境
- 当前 Python 侧最小运行验证已经通过
- `requests` 仍输出一条依赖兼容性 warning，需要后续单独收口

## 当前风险判断

项目不是空壳，也不是不可维护状态。当前问题主要集中在：

1. 契约文档仍在追赶当前扩展后的 API 面
2. 功能面比原始规划扩张更快，导致历史 phase 文档落后
3. `products` / `topics` 等前端路由与后端域之间仍存在完成度差
4. worker 所在系统 Python 环境存在 `requests` 兼容性 warning

## 当前阶段的接手策略

当前阶段不优先继续扩散新功能面，而是先做四件事：

1. 补齐“当前状态 + 运行手册 + 接手清单”
2. 保持前端 lint/build 基线稳定
3. 验证后端和 workers 的最小可运行性
4. 把 API / 数据契约文档继续向真实实现收口

## 文档权威性说明

### 当前最接近真实状态的文档

- `docs/current-state.md`
- `docs/runbook.md`
- `docs/takeover-checklist.md`
- `docs/backlog-v1.md`
- `docs/data-contract.md`

### 偏历史记录/规划用途的文档

- `docs/worklog.md`
- `docs/phase-1-plan.md`
- `docs/phase-2-plan.md`
- `docs/phase-3-plan.md`

这些历史文档仍然重要，但不能默认等同于“现在一定如此”。
