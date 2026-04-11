import json
import logging
import time
from typing import Any

import dashscope
from dashscope import Generation
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
    before_sleep_log,
)

from ai_log_client import ai_log_client
from config import settings
from prompts import build_insight_prompt
from prompt_client import prompt_template_client

logger = logging.getLogger(__name__)


class QwenAPIError(Exception):
    """Qwen API 调用错误（可重试）"""
    pass


class QwenRateLimitError(Exception):
    """Qwen API 速率限制错误（可重试）"""
    pass


class RateLimiter:
    """简单的速率限制器"""

    def __init__(self, rate: float):
        self._min_interval = 1.0 / rate if rate > 0 else 0
        self._last_request_time = 0.0

    async def acquire(self) -> None:
        now = time.monotonic()
        elapsed = now - self._last_request_time
        if elapsed < self._min_interval:
            await __import__("asyncio").sleep(self._min_interval - elapsed)
        self._last_request_time = time.monotonic()


# 全局速率限制器实例
_rate_limiter = RateLimiter(settings.qwen_rate_limit_rps)


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
                        headers=settings.api_headers,
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
                    headers=settings.api_headers,
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
                    headers=settings.api_headers,
                )
                if response.status_code == 200:
                    data = response.json()
                    return data.get("items", [])
            except Exception as e:
                logger.error(f"Failed to fetch confirmed facts: {e}")
            return []

    async def _call_qwen_once(self, prompt: str, source_entity_id: str | None = None) -> dict[str, Any]:
        """单次 Qwen API 调用（无重试）"""
        start_time = time.time()
        try:
            response = Generation.call(
                model=settings.qwen_model,
                prompt=prompt,
                temperature=settings.temperature,
                max_tokens=settings.max_tokens,
                result_format="message",
            )

            cost_ms = int((time.time() - start_time) * 1000)

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

                result = json.loads(json_match)
                
                await ai_log_client.log_ai_call(
                    task_type="insight_generation",
                    model_name=settings.qwen_model,
                    input_prompt=prompt,
                    output_result=str(result),
                    input_tokens=response.usage.input_tokens if hasattr(response, 'usage') else 0,
                    output_tokens=response.usage.output_tokens if hasattr(response, 'usage') else 0,
                    cost_ms=cost_ms,
                    status="success",
                    source_entity_id=source_entity_id,
                )
                
                return result
            else:
                error_msg = f"Qwen API error: {response.code} - {response.message}"
                logger.error(error_msg)
                
                await ai_log_client.log_ai_call(
                    task_type="insight_generation",
                    model_name=settings.qwen_model,
                    input_prompt=prompt,
                    output_result="",
                    cost_ms=cost_ms,
                    status="failed",
                    error_message=error_msg,
                    source_entity_id=source_entity_id,
                )
                
                # 根据状态码决定是否抛出可重试异常
                if response.status_code == 429:
                    raise QwenRateLimitError(error_msg)
                elif response.status_code >= 500:
                    raise QwenAPIError(error_msg)
                
                return {"insights": []}
        except json.JSONDecodeError as e:
            cost_ms = int((time.time() - start_time) * 1000)
            error_msg = f"Failed to parse Qwen response: {e}"
            logger.error(error_msg)
            
            await ai_log_client.log_ai_call(
                task_type="insight_generation",
                model_name=settings.qwen_model,
                input_prompt=prompt,
                output_result="",
                cost_ms=cost_ms,
                status="failed",
                error_message=error_msg,
                source_entity_id=source_entity_id,
            )
            
            return {"insights": []}
        except (QwenAPIError, QwenRateLimitError):
            raise
        except Exception as e:
            cost_ms = int((time.time() - start_time) * 1000)
            error_msg = f"Failed to call Qwen API: {e}"
            logger.error(error_msg)
            
            await ai_log_client.log_ai_call(
                task_type="insight_generation",
                model_name=settings.qwen_model,
                input_prompt=prompt,
                output_result="",
                cost_ms=cost_ms,
                status="failed",
                error_message=error_msg,
                source_entity_id=source_entity_id,
            )
            
            return {"insights": []}

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((QwenAPIError, QwenRateLimitError)),
        before_sleep=before_sleep_log(logger, logging.WARNING),
        reraise=True,
    )
    async def call_qwen(self, prompt: str, source_entity_id: str | None = None) -> dict[str, Any]:
        """调用 Qwen API，带重试和速率限制"""
        await _rate_limiter.acquire()
        return await self._call_qwen_once(prompt, source_entity_id)

    async def generate(self, facts: list[dict], company: str, time_range: str = "近30天", source_entity_id: str | None = None) -> list[dict]:
        if not facts:
            logger.warning("No facts provided for insight generation")
            return []

        template = await prompt_template_client.get_active_template(
            task_type="insight_generation",
            category=company,
        )

        if template:
            facts_json = json.dumps(facts, ensure_ascii=False, indent=2)
            prompt = await prompt_template_client.render_template(
                template["template"],
                {
                    "facts": facts_json,
                    "company": company,
                    "time_range": time_range,
                },
            )
        else:
            prompt = build_insight_prompt(facts, company, time_range)

        result = await self.call_qwen(prompt, source_entity_id=source_entity_id)

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
                        headers=settings.api_headers,
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
                    headers=settings.api_headers,
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