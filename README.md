# AI 研究平台

面向 AI 研究工作的情报中台，追踪阿里、字节、腾讯三家公司在 AI 方向上的模型、产品、平台、价格、战略与生态变化。

## 核心链路

```
信息源 → 原始记录 → 标准化事实 → 研究结论 → 日报/周报输出
```

## 技术栈

- **前端**: Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- **后端**: Python + FastAPI + Pydantic + SQLAlchemy
- **采集**: Crawl4AI
- **分析**: Qwen API

## 项目结构

```
ai-research-platform/
├── apps/
│   ├── web/          # Next.js 前端应用
│   └── api/          # FastAPI 后端应用
├── workers/
│   ├── crawler/      # 采集服务
│   ├── fact_extractor/   # 事实抽取服务
│   └── insight_generator/ # 结论生成服务
├── packages/
│   ├── shared-types/ # 共享类型定义
│   └── ui/           # 共享 UI 组件
├── docs/             # 项目文档
└── mock/             # Mock 数据
```

## 开发指南

### 前端开发

```bash
cd apps/web
npm install
npm run dev
```

访问 http://localhost:3000

### 文档

- [产品范围定义](docs/product-scope.md)
- [信息架构](docs/information-architecture.md)
- [数据契约](docs/data-contract.md)
- [工程规则](docs/engineering-rules.md)
- [Phase 1 计划](docs/phase-1-plan.md)

## 研究对象

| 公司 | 标识 | 主要产品 |
|------|------|----------|
| 阿里巴巴 | alibaba | 通义千问、阿里云 |
| 字节跳动 | bytedance | 豆包、火山引擎 |
| 腾讯 | tencent | 混元、腾讯云 |

## License

MIT