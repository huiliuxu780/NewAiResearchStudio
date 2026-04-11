import json
import logging
import os
from datetime import date

from sqlalchemy import select
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
        facts = await self._get_facts(data.company, data.start_date, data.end_date)
        insights = await self._get_insights(data.company, data.start_date, data.end_date)
        prompt = self._build_prompt(data.company, data.start_date, data.end_date, facts, insights)
        content = await self._call_ai(prompt)
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
            for f in facts[:20]
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
                "content": i.insight_content,
                "insight_type": i.insight_type,
                "impact_level": i.impact_level,
            }
            for i in insights[:20]
        ]

    def _build_prompt(self, company: str, start_date: date, end_date: date, facts: list, insights: list) -> str:
        facts_text = "\n".join([f"- {f['summary']} ({f['event_type']}, {f['importance_level']})" for f in facts])
        insights_text = "\n".join([f"- {i['content']} ({i['insight_type']}, {i['impact_level']})" for i in insights])

        return f"""你是一个专业的AI研究分析师。请根据以下数据生成周报。

## 基本信息
- 公司：{company}
- 时间范围：{start_date} 至 {end_date}
- 事实数量：{len(facts)} 条
- 结论数量：{len(insights)} 条

## 标准化事实
{facts_text}

## 研究结论
{insights_text}

请生成包含以下章节的周报（JSON格式）：
{{
  "sections": [
    {{"title": "本周采集概览", "type": "collection_overview", "content": "..."}},
    {{"title": "标准化事实汇总", "type": "facts_summary", "content": "..."}},
    {{"title": "研究结论", "type": "insights_summary", "content": "..."}},
    {{"title": "下周关注建议", "type": "next_week_suggestions", "content": "..."}}
  ]
}}

要求：语言简洁专业，重点突出重要事实和高影响结论，下周建议要具体可执行。
"""

    async def _call_ai(self, prompt: str) -> dict:
        from dashscope import Generation

        qwen_model = os.environ.get("QWEN_MODEL", "qwen-plus")

        response = Generation.call(
            model=qwen_model,
            prompt=prompt,
            temperature=0.3,
            max_tokens=4000,
            result_format="message",
        )

        if response.status_code == 200:
            content = response.output.choices[0].message.content
            if "```json" in content:
                start = content.find("```json") + 7
                end = content.find("```", start)
                content = content[start:end].strip()
            return json.loads(content)
        else:
            raise Exception(f"AI调用失败: {response.message}")
