# 周报中心设计文档

## 概述

为AI研究平台添加周报中心功能，支持AI自动生成周报、周报管理、导出等功能。

## 范围

### 包含功能
- RPT-001: 周报生成（AI自动生成）
- RPT-002: 周报列表管理
- RPT-003: 周报详情查看
- RPT-004: 周报导出（PDF/Excel）

### 不包含功能（后续迭代）
- RPT-005: 周报模板自定义
- RPT-006: 周报定时生成

## 数据模型

### WeeklyReport 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | str (UUID) | 主键 |
| title | str | 周报标题 |
| company | str | 所属公司 |
| start_date | date | 周报起始日期 |
| end_date | date | 周报结束日期 |
| content | JSON | 周报内容（各章节） |
| status | str | 状态：draft/generated/published |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

### 周报内容结构

```json
{
  "sections": [
    {
      "title": "本周采集概览",
      "type": "collection_overview",
      "content": "...",
      "stats": {
        "raw_records_count": 100,
        "sources_count": 10
      }
    },
    {
      "title": "标准化事实汇总",
      "type": "facts_summary",
      "content": "...",
      "stats": {
        "facts_count": 50,
        "by_event_type": {...},
        "important_facts": [...]
      }
    },
    {
      "title": "研究结论",
      "type": "insights_summary",
      "content": "...",
      "stats": {
        "insights_count": 20,
        "by_impact_level": {...},
        "key_insights": [...]
      }
    },
    {
      "title": "模型/产品动态",
      "type": "models_products",
      "content": "...",
      "stats": {
        "new_models": [...],
        "updated_products": [...]
      }
    },
    {
      "title": "研究主题进展",
      "type": "topics_progress",
      "content": "...",
      "stats": {
        "topics": [...]
      }
    },
    {
      "title": "下周关注建议",
      "type": "next_week_suggestions",
      "content": "..."
    }
  ]
}
```

## 架构设计

### 后端组件

```
apps/api/
├── models/
│   └── weekly_report.py      # SQLAlchemy模型
├── schemas/
│   └── weekly_report.py      # Pydantic schema
├── services/
│   ├── report_service.py     # 周报CRUD服务
│   └── report_generator.py   # AI周报生成服务
├── routers/
│   └── reports.py            # 周报API路由
└── workers/
    └── report_worker.py      # 周报生成Worker（可选）
```

### 前端组件

```
apps/web/
├── app/
│   └── reports/
│       ├── page.tsx          # 周报列表页
│       ├── generate/
│       │   └── page.tsx      # 生成周报页
│       └── [id]/
│           └── page.tsx      # 周报详情页
├── components/
│   └── reports/
│       ├── report-list.tsx   # 周报列表
│       ├── report-form.tsx   # 生成表单
│       ├── report-detail.tsx # 周报详情
│       └── report-export.tsx # 导出功能
├── hooks/
│   └── use-reports.ts        # 周报数据获取
└── types/
    └── reports.ts            # TypeScript类型定义
```

## 核心实现

### 1. AI周报生成

```python
class ReportGenerator:
    async def generate_report(
        self,
        company: str,
        start_date: date,
        end_date: date,
    ) -> WeeklyReport:
        # 1. 收集数据
        facts = await self.get_facts(company, start_date, end_date)
        insights = await self.get_insights(company, start_date, end_date)
        models = await self.get_models(company, start_date, end_date)
        products = await self.get_products(company, start_date, end_date)
        topics = await self.get_topics(company, start_date, end_date)
        
        # 2. 构建提示词
        prompt = self.build_prompt(facts, insights, models, products, topics)
        
        # 3. 调用AI生成
        response = await self.call_ai(prompt)
        
        # 4. 解析并保存
        report = await self.save_report(company, start_date, end_date, response)
        
        return report
```

### 2. 周报生成提示词

```
你是一个专业的AI研究分析师。请根据以下数据生成本周研究报告。

## 数据概览
- 公司：{company}
- 时间范围：{start_date} 至 {end_date}
- 新增事实：{facts_count} 条
- 新增结论：{insights_count} 条

## 标准化事实（按重要性排序）
{facts_json}

## 研究结论（按影响等级排序）
{insights_json}

## 模型/产品动态
{models_products_json}

## 研究主题进展
{topics_json}

请生成包含以下章节的周报：
1. 本周采集概览
2. 标准化事实汇总
3. 研究结论
4. 模型/产品动态
5. 研究主题进展
6. 下周关注建议

要求：
- 语言简洁专业
- 重点突出重要事实和高影响结论
- 下周建议要具体可执行
```

### 3. 周报查询API

```
GET /api/v1/reports
  ?company=alibaba
  &start_date=2026-04-01
  &end_date=2026-04-10
  &status=generated
  &page=1
  &page_size=20

POST /api/v1/reports/generate
  {
    "company": "alibaba",
    "start_date": "2026-04-01",
    "end_date": "2026-04-07"
  }

GET /api/v1/reports/{report_id}
PUT /api/v1/reports/{report_id}
DELETE /api/v1/reports/{report_id}
GET /api/v1/reports/{report_id}/export?format=pdf
```

## 前端设计

### 页面布局

**周报列表页**：
- 顶部：筛选器（公司、时间范围、状态）
- 中部：周报卡片列表
- 操作：生成新周报按钮

**生成周报页**：
- 表单：公司选择、时间范围选择
- 生成按钮
- 生成进度显示

**周报详情页**：
- 顶部：周报标题、时间范围、状态
- 中部：各章节内容（可折叠）
- 操作：编辑、导出、删除

### 导出功能

**PDF导出**：
- 使用 WeasyPrint 或 ReportLab
- 包含页眉页脚
- 格式化章节标题

**Excel导出**：
- 使用 openpyxl
- 每个章节一个sheet
- 包含统计数据

## 错误处理

- AI生成失败时返回错误信息
- 数据不足时提示用户
- 导出失败时提供重试选项

## 性能考虑

- 周报生成是耗时操作，使用异步任务
- 前端显示生成进度
- 缓存已生成的周报内容

## 测试策略

- 单元测试：report_generator 核心逻辑
- 集成测试：API端点
- 前端测试：表单验证、导出功能
