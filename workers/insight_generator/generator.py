import json
import logging
from typing import Any

import dashscope
from dashscope import Generation

from config import settings
from prompts import build_insight_prompt

logger = logging.getLogger(__name__)


class InsightGenerator:
    def __init__(self):
        dashscope.api_key = settings.qwen_api_key

    async def fetch_facts_by_ids(self, fact_ids: list[str]) -> list[dict]:
        import httpx

        async with httpx.AsyncClient() as client:
            facts = []
            for fact_id in fact_ids:
                try:
                    response = await client.get(
                        f"{settings.facts_url}{fact_id}",
                        timeout=30.0,
                    )
                    if response.status_code == 200:
                        facts.append(response.json())
                except Exception as e:
                    logger.error(f"Failed to fetch fact {fact_id}: {e}")
            return facts

    async def fetch_facts_by_company(self, company: str, review_status: str = "confirmed") -> list[dict]:
        import httpx

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    settings.facts_url,
                    params={"company": company, "review_status": review_status, "page_size": 50},
                    timeout=30.0,
                )
                if response.status_code == 200:
                    data = response.json()
                    return data.get("items", [])
            except Exception as e:
                logger.error(f"Failed to fetch facts for company {company}: {e}")
            return []

    async def fetch_confirmed_facts(self, page_size: int = 50) -> list[dict]:
        import httpx

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    settings.facts_url,
                    params={"review_status": "confirmed", "page_size": page_size},
                    timeout=30.0,
                )
                if response.status_code == 200:
                    data = response.json()
                    return data.get("items", [])
            except Exception as e:
                logger.error(f"Failed to fetch confirmed facts: {e}")
            return []

    async def call_qwen(self, prompt: str) -> dict[str, Any]:
        try:
            response = Generation.call(
                model=settings.qwen_model,
                prompt=prompt,
                temperature=settings.temperature,
                max_tokens=settings.max_tokens,
                result_format="message",
            )

            if response.status_code == 200:
                content = response.output.choices[0].message.content
                json_match = content
                if "```json" in content:
                    start = content.find("```json") + 7
                    end = content.find("```", start)
                    json_match = content[start:end].strip()
                elif "```" in content:
                    start = content.find("```") + 3
                    end = content.find("```", start)
                    json_match = content[start:end].strip()

                return json.loads(json_match)
            else:
                logger.error(f"Qwen API error: {response.code} - {response.message}")
                return {"insights": []}
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Qwen response: {e}")
            return {"insights": []}
        except Exception as e:
            logger.error(f"Failed to call Qwen API: {e}")
            return {"insights": []}

    async def generate(self, facts: list[dict], company: str, time_range: str = "近30天") -> list[dict]:
        if not facts:
            logger.warning("No facts provided for insight generation")
            return []

        prompt = build_insight_prompt(facts, company, time_range)
        result = await self.call_qwen(prompt)

        insights = []
        for insight_data in result.get("insights", []):
            insight_data["company"] = company
            insights.append(insight_data)

        return insights

    async def save_insights(self, insights: list[dict], fact_id: str) -> bool:
        import httpx

        async with httpx.AsyncClient() as client:
            success = True
            for insight in insights:
                try:
                    insight_payload = {
                        "fact_id": fact_id,
                        "company": insight.get("company", ""),
                        "insight_content": insight.get("insight_content", ""),
                        "insight_type": insight.get("insight_type", ""),
                        "impact_level": insight.get("impact_level", ""),
                        "confidence": insight.get("confidence", ""),
                        "reasoning_brief": insight.get("reasoning_brief"),
                        "action_suggestion": insight.get("action_suggestion"),
                    }

                    response = await client.post(
                        settings.insights_url,
                        json=insight_payload,
                        timeout=30.0,
                    )

                    if response.status_code not in (200, 201):
                        logger.error(f"Failed to save insight: {response.text}")
                        success = False
                except Exception as e:
                    logger.error(f"Failed to save insight: {e}")
                    success = False

            return success

    async def update_fact_insight_generated(self, fact_id: str) -> bool:
        import httpx

        async with httpx.AsyncClient() as client:
            try:
                response = await client.put(
                    f"{settings.facts_url}{fact_id}/review",
                    json={"review_status": "insight_generated"},
                    timeout=30.0,
                )
                return response.status_code == 200
            except Exception as e:
                logger.error(f"Failed to update fact status: {e}")
                return False

    async def generate_for_fact_ids(self, fact_ids: list[str]) -> dict[str, Any]:
        results = {"success": 0, "failed": 0, "total": len(fact_ids)}

        for fact_id in fact_ids:
            facts = await self.fetch_facts_by_ids([fact_id])
            if not facts:
                logger.warning(f"Fact not found: {fact_id}")
                results["failed"] += 1
                continue

            fact = facts[0]
            company = fact.get("company", "")

            insights = await self.generate([fact], company)
            if not insights:
                logger.warning(f"No insights generated for fact: {fact_id}")
                results["failed"] += 1
                continue

            saved = await self.save_insights(insights, fact_id)
            if saved:
                await self.update_fact_insight_generated(fact_id)
                results["success"] += 1
                logger.info(f"Generated {len(insights)} insights for fact: {fact_id}")
            else:
                results["failed"] += 1

        return results

    async def generate_for_company(self, company: str) -> dict[str, Any]:
        facts = await self.fetch_facts_by_company(company)
        if not facts:
            logger.warning(f"No confirmed facts found for company: {company}")
            return {"success": 0, "failed": 0, "total": 0}

        results = {"success": 0, "failed": 0, "total": len(facts)}

        for fact in facts:
            fact_id = fact.get("id")
            insights = await self.generate([fact], company)

            if not insights:
                results["failed"] += 1
                continue

            saved = await self.save_insights(insights, fact_id)
            if saved:
                await self.update_fact_insight_generated(fact_id)
                results["success"] += 1
                logger.info(f"Generated {len(insights)} insights for fact: {fact_id}")
            else:
                results["failed"] += 1

        return results

    async def generate_for_all_confirmed(self) -> dict[str, Any]:
        facts = await self.fetch_confirmed_facts()
        if not facts:
            logger.info("No confirmed facts found")
            return {"success": 0, "failed": 0, "total": 0}

        results = {"success": 0, "failed": 0, "total": len(facts)}

        for fact in facts:
            fact_id = fact.get("id")
            company = fact.get("company", "")

            insights = await self.generate([fact], company)

            if not insights:
                results["failed"] += 1
                continue

            saved = await self.save_insights(insights, fact_id)
            if saved:
                await self.update_fact_insight_generated(fact_id)
                results["success"] += 1
                logger.info(f"Generated {len(insights)} insights for fact: {fact_id}")
            else:
                results["failed"] += 1

        return results