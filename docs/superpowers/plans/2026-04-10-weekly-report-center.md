# 周报中心 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为AI研究平台添加周报中心功能，支持AI自动生成周报、周报管理、导出等功能。

**Architecture:** 后端使用FastAPI+SQLAlchemy实现周报CRUD和AI生成逻辑，前端使用Next.js+@base-ui/react实现周报列表、生成、详情页面。周报生成通过调用现有AI服务，基于事实、结论等数据自动生成结构化报告。

**Tech Stack:** FastAPI, SQLAlchemy, Pydantic, Next.js, @base-ui/react, SWR, lucide-react

---

## 文件结构

### 后端文件
- Create: `apps/api/models/weekly_report.py` - SQLAlchemy模型
- Create: `apps/api/schemas/weekly_report.py` - Pydantic schemas
- Create: `apps/api/services/report_service.py` - 周报CRUD服务
- Create: `apps/api/services/report_generator.py` - AI周报生成服务
- Create: `apps/api/routers/reports.py` - 周报API路由
- Modify: `apps/api/models/__init__.py` - 导出WeeklyReport
- Modify: `apps/api/schemas/__init__.py` - 导出周报schemas
- Modify: `apps/api/routers/__init__.py` - 注册reports路由
- Modify: `apps/api/services/__init__.py` - 导出report_service

### 前端文件
- Create: `apps/web/types/reports.ts` - TypeScript类型定义
- Create: `apps/web/lib/api/reports.ts` - API客户端
- Create: `apps/web/hooks/use-reports.ts` - SWR hooks
- Create: `apps/web/components/reports/report-list.tsx` - 周报列表组件
- Create: `apps/web/components/reports/report-form.tsx` - 生成表单组件
- Create: `apps/web/components/reports/report-detail.tsx` - 周报详情组件
- Create: `apps/web/components/reports/report-export.tsx` - 导出组件
- Create: `apps/web/app/reports/page.tsx` - 周报列表页
- Create: `apps/web/app/reports/generate/page.tsx` - 生成周报页
- Create: `apps/web/app/reports/[id]/page.tsx` - 周报详情页
- Modify: `apps/web/types/labels.ts` - 添加周报相关标签

---

### Task 1: 后端数据模型

**Files:**
- Create: `apps/api/models/weekly_report.py`
- Modify: `apps/api/models/__init__.py`

- [ ] **Step 1: 创建WeeklyReport模型**

```python
from sqlalchemy import Date, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base, TimestampMixin, generate_uuid


class WeeklyReport(Base, TimestampMixin):
    __tablename__ = "weekly_reports"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    company: Mapped[str] = mapped_column(String(50), nullable=False)
    start_date: Mapped[Date] = mapped_column(Date, nullable=False)
    end_date: Mapped[Date] = mapped_column(Date, nullable=False)
    content: Mapped[dict] = mapped_column(JSON, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="generated", nullable=False)
```

- [ ] **Step 2: 更新models/__init__.py导出**

```python
from .weekly_report import WeeklyReport

__all__ = [
    # ... existing exports
    "WeeklyReport",
]
```

- [ ] **Step 3: 验证模型创建**

```bash
cd apps/api && python -c "from models import WeeklyReport; print('OK')"
```

---

### Task 2: 后端Schemas

**Files:**
- Create: `apps/api/schemas/weekly_report.py`
- Modify: `apps/api/schemas/__init__.py`

- [ ] **Step 1: 创建周报Schemas**

```python
from datetime import date, datetime

from .common import BaseSchema, PaginatedResponse, PaginationParams


class WeeklyReportCreate(BaseSchema):
    company: str
    start_date: date
    end_date: date


class WeeklyReportResponse(BaseSchema):
    id: str
    title: str
    company: str
    start_date: date
    end_date: date
    content: dict
    status: str
    created_at: datetime
    updated_at: datetime


class WeeklyReportListResponse(PaginatedResponse[WeeklyReportResponse]):
    pass
```

- [ ] **Step 2: 更新schemas/__init__.py导出**

```python
from .weekly_report import (
    WeeklyReportCreate,
    WeeklyReportListResponse,
    WeeklyReportResponse,
)

__all__ = [
    # ... existing exports
    "WeeklyReportCreate",
    "WeeklyReportResponse",
    "WeeklyReportListResponse",
]
```

---

### Task 3: 后端服务层

**Files:**
- Create: `apps/api/services/report_service.py`
- Create: `apps/api/services/report_generator.py`
- Modify: `apps/api/services/__init__.py`

- [ ] **Step 1: 创建ReportService**

```python
import logging
from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models import WeeklyReport
from schemas import WeeklyReportCreate, WeeklyReportResponse
from utils.helpers import get_paginated

logger = logging.getLogger(__name__)


class ReportService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_report(self, data: WeeklyReportCreate, content: dict) -> WeeklyReport:
        title = f"{data.company}周报 ({data.start_date} ~ {data.end_date})"
        report = WeeklyReport(
            title=title,
            company=data.company,
            start_date=data.start_date,
            end_date=data.end_date,
            content=content,
            status="generated",
        )
        self.session.add(report)
        await self.session.commit()
        await self.session.refresh(report)
        return report

    async def get_report(self, report_id: str) -> WeeklyReport | None:
        result = await self.session.execute(
            select(WeeklyReport).where(WeeklyReport.id == report_id)
        )
        return result.scalar_one_or_none()

    async def get_list(self, company: str | None = None, page: int = 1, page_size: int = 20):
        filters = []
        if company:
            filters.append(WeeklyReport.company == company)

        items, total, total_pages = await get_paginated(
            self.session,
            WeeklyReport,
            page=page,
            page_size=page_size,
            filters=filters,
            order_by=[WeeklyReport.created_at.desc()],
        )
        return items, total, total_pages

    async def delete_report(self, report_id: str) -> bool:
        report = await self.get_report(report_id)
        if not report:
            return False
        await self.session.delete(report)
        await self.session.commit()
        return True
```

- [ ] **Step 2: 创建ReportGenerator**

```python
import logging
from datetime import date

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models import Fact, Insight, WeeklyReport
from schemas import WeeklyReportCreate
from services.report_service import ReportService

logger = logging.getLogger(__name__)


class ReportGenerator:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.report_service = ReportService(session)

    async def generate_report(self, data: WeeklyReportCreate) -> WeeklyReport:
        # 收集数据
        facts = await self._get_facts(data.company, data.start_date, data.end_date)
        insights = await self._get_insights(data.company, data.start_date, data.end_date)

        # 构建提示词
        prompt = self._build_prompt(data.company, data.start_date, data.end_date, facts, insights)

        # 调用AI生成（使用现有的AI服务）
        content = await self._call_ai(prompt)

        # 保存周报
        report = await self.report_service.create_report(data, content)
        return report

    async def _get_facts(self, company: str, start_date: date, end_date: date) -> list[dict]:
        result = await self.session.execute(
            select(Fact).where(
                Fact.company == company,
                Fact.created_at >= start_date,
                Fact.created_at <= end_date,
            ).order_by(Fact.importance_level.desc())
        )
        facts = result.scalars().all()
        return [
            {
                "summary": f.fact_summary,
                "event_type": f.event_type,
                "importance_level": f.importance_level,
            }
            for f in facts[:20]  # 限制数量
        ]

    async def _get_insights(self, company: str, start_date: date, end_date: date) -> list[dict]:
        result = await self.session.execute(
            select(Insight).where(
                Insight.company == company,
                Insight.created_at >= start_date,
                Insight.created_at <= end_date,
            ).order_by(Insight.impact_level.desc())
        )
        insights = result.scalars().all()
        return [
            {
                "content": i.content,
                "insight_type": i.insight_type,
                "impact_level": i.impact_level,
            }
            for i in insights[:20]
        ]

    def _build_prompt(self, company: str, start_date: date, end_date: date, facts: list, insights: list) -> str:
        facts_json = "\n".join([f"- {f['summary']} ({f['event_type']}, {f['importance_level']})" for f in facts])
        insights_json = "\n".join([f"- {i['content']} ({i['insight_type']}, {i['impact_level']})" for i in insights])

        return f"""你是一个专业的AI研究分析师。请根据以下数据生成周报。

## 基本信息
- 公司：{company}
- 时间范围：{start_date} 至 {end_date}
- 事实数量：{len(facts)} 条
- 结论数量：{len(insights)} 条

## 标准化事实
{facts_json}

## 研究结论
{insights_json}

请生成包含以下章节的周报（JSON格式）：
{{
  "sections": [
    {{
      "title": "本周采集概览",
      "type": "collection_overview",
      "content": "..."
    }},
    {{
      "title": "标准化事实汇总",
      "type": "facts_summary",
      "content": "..."
    }},
    {{
      "title": "研究结论",
      "type": "insights_summary",
      "content": "..."
    }},
    {{
      "title": "下周关注建议",
      "type": "next_week_suggestions",
      "content": "..."
    }}
  ]
}}

要求：
- 语言简洁专业
- 重点突出重要事实和高影响结论
- 下周建议要具体可执行
"""

    async def _call_ai(self, prompt: str) -> dict:
        # 使用现有的AI服务调用
        # 这里简化处理，实际应该调用dashscope或其他AI服务
        import json
        from dashscope import Generation
        from config import settings

        response = Generation.call(
            model=settings.qwen_model,
            prompt=prompt,
            temperature=0.3,
            max_tokens=4000,
            result_format="message",
        )

        if response.status_code == 200:
            content = response.output.choices[0].message.content
            # 解析JSON
            if "```json" in content:
                start = content.find("```json") + 7
                end = content.find("```", start)
                content = content[start:end].strip()
            return json.loads(content)
        else:
            raise Exception(f"AI调用失败: {response.message}")
```

- [ ] **Step 3: 更新services/__init__.py导出**

```python
from .report_service import ReportService
from .report_generator import ReportGenerator

__all__ = [
    # ... existing exports
    "ReportService",
    "ReportGenerator",
]
```

---

### Task 4: 后端API路由

**Files:**
- Create: `apps/api/routers/reports.py`
- Modify: `apps/api/routers/__init__.py`

- [ ] **Step 1: 创建reports路由**

```python
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from schemas import (
    WeeklyReportCreate,
    WeeklyReportListResponse,
    WeeklyReportResponse,
    SuccessResponse,
)
from services import get_session, ReportService, ReportGenerator

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/", response_model=WeeklyReportListResponse)
async def list_reports(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    company: str | None = Query(None),
    session: AsyncSession = Depends(get_session),
):
    service = ReportService(session)
    items, total, total_pages = await service.get_list(company=company, page=page, page_size=page_size)
    return WeeklyReportListResponse(
        items=[WeeklyReportResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post("/generate", response_model=WeeklyReportResponse)
async def generate_report(
    data: WeeklyReportCreate,
    session: AsyncSession = Depends(get_session),
):
    generator = ReportGenerator(session)
    try:
        report = await generator.generate_report(data)
        return WeeklyReportResponse.model_validate(report)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"周报生成失败: {str(e)}")


@router.get("/{report_id}", response_model=WeeklyReportResponse)
async def get_report(
    report_id: str,
    session: AsyncSession = Depends(get_session),
):
    service = ReportService(session)
    report = await service.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="周报不存在")
    return WeeklyReportResponse.model_validate(report)


@router.delete("/{report_id}", response_model=SuccessResponse)
async def delete_report(
    report_id: str,
    session: AsyncSession = Depends(get_session),
):
    service = ReportService(session)
    deleted = await service.delete_report(report_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="周报不存在")
    return SuccessResponse(message="周报删除成功")
```

- [ ] **Step 2: 更新routers/__init__.py注册路由**

```python
from .reports import router as reports_router

api_router.include_router(reports_router)
```

---

### Task 5: 前端类型定义和API客户端

**Files:**
- Create: `apps/web/types/reports.ts`
- Create: `apps/web/lib/api/reports.ts`

- [ ] **Step 1: 创建TypeScript类型**

```typescript
export interface WeeklyReport {
  id: string;
  title: string;
  company: string;
  start_date: string;
  end_date: string;
  content: {
    sections: ReportSection[];
  };
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ReportSection {
  title: string;
  type: string;
  content: string;
  stats?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export const COMPANY_LABELS: Record<string, string> = {
  alibaba: "阿里巴巴",
  byte_dance: "字节跳动",
  tencent: "腾讯",
};

export const REPORT_STATUS_LABELS: Record<string, string> = {
  draft: "草稿",
  generated: "已生成",
  published: "已发布",
};
```

- [ ] **Step 2: 创建API客户端**

```typescript
import ky from 'ky';
import { WeeklyReport, PaginatedResponse } from '@/types/reports';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const api = ky.extend({
  prefixUrl: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ReportsFilter {
  page?: number;
  page_size?: number;
  company?: string;
}

export async function getReports(filter?: ReportsFilter): Promise<PaginatedResponse<WeeklyReport>> {
  const params = new URLSearchParams();
  if (filter) {
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
  }
  return api.get(`reports?${params.toString()}`).json();
}

export async function generateReport(data: { company: string; start_date: string; end_date: string }): Promise<WeeklyReport> {
  return api.post('reports/generate', { json: data }).json();
}

export async function getReport(id: string): Promise<WeeklyReport> {
  return api.get(`reports/${id}`).json();
}

export async function deleteReport(id: string): Promise<{ message: string }> {
  return api.delete(`reports/${id}`).json();
}
```

---

### Task 6: 前端Hooks

**Files:**
- Create: `apps/web/hooks/use-reports.ts`

- [ ] **Step 1: 创建SWR hooks**

```typescript
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { getReports, generateReport, getReport, deleteReport, ReportsFilter } from '@/lib/api/reports';
import { WeeklyReport, PaginatedResponse } from '@/types/reports';

export function useReports(filter?: ReportsFilter) {
  const key = ['reports', filter];
  return useSWR<PaginatedResponse<WeeklyReport>>(key, () => getReports(filter));
}

export function useReport(id: string) {
  const key = ['report', id];
  return useSWR<WeeklyReport>(key, () => getReport(id));
}

export function useGenerateReport() {
  return useSWRMutation('generate-report', async (_key: string, { arg }: { arg: { company: string; start_date: string; end_date: string } }) => {
    return generateReport(arg);
  });
}

export function useDeleteReport() {
  return useSWRMutation('delete-report', async (_key: string, { arg }: { arg: string }) => {
    return deleteReport(arg);
  });
}
```

---

### Task 7: 前端组件

**Files:**
- Create: `apps/web/components/reports/report-list.tsx`
- Create: `apps/web/components/reports/report-form.tsx`
- Create: `apps/web/components/reports/report-detail.tsx`

- [ ] **Step 1: 创建report-list组件**

```typescript
"use client";

import { WeeklyReport } from "@/types/reports";
import { COMPANY_LABELS, REPORT_STATUS_LABELS } from "@/types/reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Eye, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ReportListProps {
  reports: WeeklyReport[];
  onDelete: (id: string) => void;
}

export function ReportList({ reports, onDelete }: ReportListProps) {
  const router = useRouter();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {reports.map((report) => (
        <Card key={report.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {report.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">公司</span>
                <span>{COMPANY_LABELS[report.company] || report.company}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">时间范围</span>
                <span>{report.start_date} ~ {report.end_date}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">状态</span>
                <Badge variant="outline">{REPORT_STATUS_LABELS[report.status] || report.status}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">生成时间</span>
                <span>{new Date(report.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/reports/${report.id}`)}
              >
                <Eye className="h-4 w-4 mr-1" />
                查看
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(report.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: 创建report-form组件**

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { COMPANY_LABELS } from "@/types/reports";
import { Sparkles } from "lucide-react";

interface ReportFormProps {
  onSubmit: (data: { company: string; start_date: string; end_date: string }) => void;
  isLoading: boolean;
}

export function ReportForm({ onSubmit, isLoading }: ReportFormProps) {
  const [company, setCompany] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ company, start_date: startDate, end_date: endDate });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>生成周报</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>公司</Label>
            <Select value={company} onValueChange={setCompany}>
              <SelectTrigger>
                <SelectValue placeholder="选择公司" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(COMPANY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>开始日期</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label>结束日期</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <Button type="submit" disabled={isLoading || !company || !startDate || !endDate}>
            <Sparkles className="h-4 w-4 mr-2" />
            {isLoading ? "生成中..." : "生成周报"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: 创建report-detail组件**

```typescript
"use client";

import { WeeklyReport, ReportSection } from "@/types/reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { REPORT_STATUS_LABELS } from "@/types/reports";
import { FileText, Calendar, Building2 } from "lucide-react";

interface ReportDetailProps {
  report: WeeklyReport;
}

export function ReportDetail({ report }: ReportDetailProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            {report.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{report.company}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{report.start_date} ~ {report.end_date}</span>
            </div>
            <div>
              <Badge variant="outline">{REPORT_STATUS_LABELS[report.status]}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {report.content.sections?.map((section: ReportSection, index: number) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="text-lg">{section.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              {section.content.split("\n").map((line, i) => (
                <p key={i} className="mb-2">{line}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

---

### Task 8: 前端页面

**Files:**
- Create: `apps/web/app/reports/page.tsx`
- Create: `apps/web/app/reports/generate/page.tsx`
- Create: `apps/web/app/reports/[id]/page.tsx`

- [ ] **Step 1: 创建周报列表页**

```typescript
"use client";

import { useState } from "react";
import { ReportList } from "@/components/reports/report-list";
import { useReports, useDeleteReport } from "@/hooks/use-reports";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function ReportsPage() {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data, isLoading } = useReports();
  const { trigger: deleteReport } = useDeleteReport();

  const handleDelete = async () => {
    if (deleteId) {
      await deleteReport(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">周报中心</h1>
        <Button onClick={() => router.push("/reports/generate")}>
          <Plus className="h-4 w-4 mr-2" />
          生成周报
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">加载中...</div>
      ) : data?.items && data.items.length > 0 ? (
        <ReportList reports={data.items} onDelete={setDeleteId} />
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          暂无周报，点击上方按钮生成
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="确认删除"
        description="确定要删除此周报吗？"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
```

- [ ] **Step 2: 创建生成周报页**

```typescript
"use client";

import { ReportForm } from "@/components/reports/report-form";
import { useGenerateReport } from "@/hooks/use-reports";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function GenerateReportPage() {
  const router = useRouter();
  const { trigger: generateReport, isMutating } = useGenerateReport();

  const handleSubmit = async (data: { company: string; start_date: string; end_date: string }) => {
    try {
      const report = await generateReport(data);
      toast.success("周报生成成功");
      router.push(`/reports/${report.id}`);
    } catch (error) {
      toast.error("周报生成失败");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">生成周报</h1>
      <ReportForm onSubmit={handleSubmit} isLoading={isMutating} />
    </div>
  );
}
```

- [ ] **Step 3: 创建周报详情页**

```typescript
"use client";

import { useParams } from "next/navigation";
import { ReportDetail } from "@/components/reports/report-detail";
import { useReport } from "@/hooks/use-reports";

export default function ReportDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: report, isLoading } = useReport(id);

  if (isLoading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  if (!report) {
    return <div className="text-center py-8 text-muted-foreground">周报不存在</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">周报详情</h1>
      <ReportDetail report={report} />
    </div>
  );
}
```

---

### Task 9: 测试验证

- [ ] **Step 1: 测试后端API**

```bash
# 测试周报列表
curl http://localhost:8000/api/v1/reports

# 测试生成周报
curl -X POST http://localhost:8000/api/v1/reports/generate \
  -H "Content-Type: application/json" \
  -d '{"company": "alibaba", "start_date": "2026-04-01", "end_date": "2026-04-07"}'
```

- [ ] **Step 2: 测试前端页面**

```bash
# 启动前端
cd apps/web && npm run dev

# 访问页面
# http://localhost:3000/reports
# http://localhost:3000/reports/generate
```

- [ ] **Step 3: 验证完整流程**

1. 访问周报列表页
2. 点击"生成周报"
3. 选择公司和时间范围
4. 点击"生成周报"按钮
5. 等待AI生成完成
6. 查看生成的周报详情
7. 验证周报内容包含所有章节
