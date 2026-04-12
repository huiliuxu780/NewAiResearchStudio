# AI 研究平台 - 运行手册

## 适用范围

本手册用于本地开发、接手排查和最小闭环验证。

## 运行前提

- 操作系统：Windows（当前接手环境）
- Node.js / npm 可用
- Python 3.12 可用
- 后端虚拟环境位于 `apps/api/venv`
- 如需真实 AI 抽取/生成链路，需要有效的 `QWEN_API_KEY`

## 环境变量

### Web

文件：`apps/web/.env.local` 或参考 `apps/web/.env.example`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_USE_MOCK=false
```

### API

文件：`apps/api/.env` 或参考 `apps/api/.env.example`

```env
DATABASE_URL=sqlite+aiosqlite:///./data/research.db
CORS_ORIGINS=["http://localhost:3000"]
APP_ENV=development
API_KEY=dev-key
```

说明：
- `API_KEY` 在开发环境可保留为空，但建议本地联调时显式配置
- `apps/api/config/settings.py` 已兼容 `API_KEY` 和 `API_KEYS`

### Crawler

文件：`workers/crawler/.env`

```env
API_BASE_URL=http://localhost:8000
CRAWL_TIMEOUT=60
MAX_CONCURRENT=5
SCHEDULE_INTERVAL=3600
```

### Fact Extractor

文件：`workers/fact_extractor/.env`

```env
QWEN_API_KEY=your_qwen_api_key_here
QWEN_MODEL=qwen-plus
API_BASE_URL=http://localhost:8000
TEMPERATURE=0.1
MAX_TOKENS=2000
SCHEDULE_INTERVAL=3600
BATCH_SIZE=10
```

### Insight Generator

文件：`workers/insight_generator/.env`

```env
QWEN_API_KEY=your_qwen_api_key_here
QWEN_MODEL=qwen-plus
API_BASE_URL=http://localhost:8000
TEMPERATURE=0.7
MAX_TOKENS=1000
SCHEDULE_INTERVAL=3600
BATCH_SIZE=10
```

## 启动顺序

建议顺序：

1. 启动后端 API
2. 启动前端 Web
3. 按需启动 crawler / fact_extractor / insight_generator

## 后端启动

```powershell
cd E:\my-projects\ai-research-platform\apps\api
.\venv\Scripts\python.exe main.py
```

默认地址：

- API: `http://localhost:8000`
- Health: `http://localhost:8000/health`

## 前端启动

```powershell
cd E:\my-projects\ai-research-platform\apps\web
npm.cmd run dev
```

默认地址：

- Web: `http://localhost:3000`

说明：
- `apps/web/next.config.ts` 中配置了 `/api/* -> http://localhost:8000/api/*` 的 rewrite

## Crawler 启动

```powershell
cd E:\my-projects\ai-research-platform\workers\crawler
python main.py --help
```

常用命令：

```powershell
python main.py --init
python main.py --all
python main.py --schedule
python main.py --source-id <source_id>
```

## Fact Extractor 启动

```powershell
cd E:\my-projects\ai-research-platform\workers\fact_extractor
python main.py --help
```

常用命令：

```powershell
python main.py --all-pending
python main.py --schedule
python main.py --record-id <raw_record_id>
```

## Insight Generator 启动

```powershell
cd E:\my-projects\ai-research-platform\workers\insight_generator
python main.py --help
```

常用命令：

```powershell
python main.py --all
python main.py --schedule
python main.py --company alibaba
python main.py --fact-ids id1,id2
```

## Docker 启动

仅前后端：

```powershell
cd E:\my-projects\ai-research-platform
docker compose up --build
```

连 workers 一起：

```powershell
cd E:\my-projects\ai-research-platform
docker compose --profile workers up --build
```

## 最小验证清单

### 1. 后端导入

```powershell
cd E:\my-projects\ai-research-platform\apps\api
.\venv\Scripts\python.exe -c "from main import app; print('api-import-ok')"
```

### 2. 前端质量基线

```powershell
cd E:\my-projects\ai-research-platform\apps\web
npm.cmd run lint
npm.cmd run build
```

### 3. Worker 导入/帮助信息

```powershell
cd E:\my-projects\ai-research-platform\workers\crawler
python main.py --help
```

```powershell
cd E:\my-projects\ai-research-platform\workers\fact_extractor
python main.py --help
```

```powershell
cd E:\my-projects\ai-research-platform\workers\insight_generator
python main.py --help
```

## 已知限制

- 未配置真实 `QWEN_API_KEY` 时，AI 真链路不可验证
- 前端基线已恢复，当前 `lint` 仅剩 warning，`build` 已通过
- 历史文档存在漂移，排查时优先参考 `docs/current-state.md`
- 当前接手环境中，API 与三个 worker 的最小运行验证已经通过
- worker 所在系统 Python 仍会输出一条 `requests` 依赖兼容性 warning，不影响 `--help` 级别的 smoke check

## 当前接手环境的 Python 依赖缺口

### API

```powershell
cd E:\my-projects\ai-research-platform\apps\api
.\venv\Scripts\python.exe -m pip install -r requirements.txt
```

### Fact Extractor

```powershell
cd E:\my-projects\ai-research-platform\workers\fact_extractor
python -m pip install -r requirements.txt
```

### Insight Generator

```powershell
cd E:\my-projects\ai-research-platform\workers\insight_generator
python -m pip install -r requirements.txt
```

说明：
- 上述安装命令已在当前接手会话中执行完毕
- 目前无需再补基础依赖，即可继续做 API 和 worker 侧开发/排障
