# AI 研究平台 - Phase 2 计划

## 1. Phase 2 目标

### 1.1 总体目标

接入真实采集与基础处理中台，实现前后端数据打通。

### 1.2 Phase 2 做什么

| 任务 | 说明 |
|------|------|
| 初始化 FastAPI 后端 | Python + FastAPI + Pydantic + SQLAlchemy |
| 数据库设计与实现 | SQLite（开发）+ 预留 PostgreSQL 切换 |
| 信息源管理 API | CRUD 接口 |
| 原始记录 API | 查询接口 |
| 事实 API | 查询 + 复核接口 |
| 结论 API | 查询接口 |
| 前端对接真实 API | 替换 Mock 数据 |

### 1.3 Phase 2 不做什么

| 禁止项 | 说明 |
|--------|------|
| 不接入 Crawl4AI | Phase 2 只做 API，采集在后续 |
| 不接入 Qwen API | Phase 2 只做数据存储 |
| 不做用户认证 | Phase 2 无登录系统 |
| 不做复杂权限 | Phase 2 无权限控制 |
| 不做报表导出 | Phase 2 无导出功能 |

---

## 2. 技术架构

### 2.1 后端技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Python | 3.10+ | 主语言 |
| FastAPI | 0.100+ | Web 框架 |
| Pydantic | 2.x | 数据验证 |
| SQLAlchemy | 2.x | ORM |
| SQLite | 3.x | 开发数据库 |
| Uvicorn | 0.23+ | ASGI 服务器 |

### 2.2 数据库切换方案

```
开发环境：SQLite
├── DATABASE_URL = "sqlite:///./ai_research.db"
└── 无需额外配置

生产环境：PostgreSQL
├── DATABASE_URL = "postgresql://user:pass@host/db"
└── 只需修改环境变量
```

**切换步骤：**
1. 修改 `.env` 文件中的 `DATABASE_URL`
2. 安装 `psycopg2` 或 `asyncpg`
3. 重启服务，SQLAlchemy 自动创建表

### 2.3 API 架构

```
FastAPI 应用
├── /health                    # 健康检查
├── /api/v1/
│   ├── /sources               # 信息源管理
│   │   ├── GET /              # 列表（分页、筛选）
│   │   ├── GET /{id}          # 详情
│   │   ├── POST /             # 创建
│   │   ├── PUT /{id}          # 更新
│   │   └── DELETE /{id}       # 删除
│   ├── /raw-records           # 原始记录
│   │   ├── GET /              # 列表
│   │   └── GET /{id}          # 详情
│   ├── /facts                 # 标准化事实
│   │   ├── GET /              # 列表
│   │   ├── GET /{id}          # 详情
│   │   └── PUT /{id}/review   # 更新复核状态
│   └── /insights              # 研究结论
│       ├── GET /              # 列表
│       └── GET /{id}          # 详情
```

---

## 3. 数据库模型

### 3.1 实体关系

```
Source (信息源)
    │
    └── 1:N ──→ RawRecord (原始记录)
                    │
                    └── 1:N ──→ Fact (标准化事实)
                                    │
                                    └── 1:N ──→ Insight (研究结论)
```

### 3.2 表结构

详见 [data-contract.md](./data-contract.md)

---

## 4. 任务分解

| 序号 | 任务 | 分支名 | 优先级 | 状态 |
|------|------|--------|--------|------|
| 1 | Phase 2 规划文档 | docs/phase2-plan | P0 | ✅ |
| 2 | 初始化 FastAPI 后端 | feat/api-init | P0 | ✅ |
| 3 | 数据库模型实现 | feat/db-models | P0 | ✅ |
| 4 | 信息源管理 API | feat/source-api | P1 | 待开始 |
| 5 | 原始记录 API | feat/record-api | P1 | 待开始 |
| 6 | 事实 API | feat/fact-api | P1 | 待开始 |
| 7 | 结论 API | feat/insight-api | P1 | 待开始 |
| 8 | 前端对接真实 API | feat/api-integration | P2 | 待开始 |

---

## 5. 验收标准

### 5.1 后端验收

- [ ] FastAPI 服务正常启动
- [ ] 数据库表自动创建
- [ ] 健康检查接口正常
- [ ] API 文档可访问（/docs）
- [ ] 所有 CRUD 接口正常

### 5.2 前端验收

- [ ] 前端可调用后端 API
- [ ] 数据正常展示
- [ ] 筛选功能正常
- [ ] 分页功能正常

---

## 6. 部署规划

### 6.1 本地开发

```bash
# 后端
cd apps/api
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# 前端
cd apps/web
npm run dev
```

### 6.2 Docker 部署（预留）

```yaml
# docker-compose.yml（Phase 2 后期创建）
version: '3.8'
services:
  frontend:
    build: ./apps/web
    ports:
      - "3000:3000"
  backend:
    build: ./apps/api
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=sqlite:///./data/ai_research.db
```

### 6.3 生产部署（Phase 3）

- 前端：Vercel / Netlify
- 后端：Railway / Render / Fly.io
- 数据库：PostgreSQL（云服务）

---

## 7. 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2026-04-10 | 初始版本，定义 Phase 2 计划 |