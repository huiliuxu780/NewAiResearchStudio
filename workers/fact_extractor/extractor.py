import json
import logging
import time
from typing import Any

import dashscope
import httpx
from dashscope import Generation
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
    before_sleep_log,
    retry_if_exception,
)

from ai_log_client import ai_log_client
from config import settings
from prompts import build_extraction_prompt
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


class FactExtractor:
    def __init__(self):
        dashscope.api_key = settings.qwen_api_key

    def _should_retry(self, exception: Exception) -> bool:
        """判断异常是否应该重试"""
        return isinstance(exception, (QwenAPIError, QwenRateLimitError))

    async def fetch_raw_records(self, crawl_status: str = "success", page_size: int = 50) -> list[dict]:
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    settings.raw_records_url,
                    params={"crawl_status": crawl_status, "page_size": page_size},
                    timeout=30.0,
                    headers=settings.api_headers,
                )
                if response.status_code == 200:
                    data = response.json()
                    return data.get("items", [])
            except Exception as e:
                logger.error(f"Failed to fetch raw records: {e}")
            return []

    async def fetch_raw_record_by_id(self, record_id: str) -> dict | None:
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{settings.raw_records_url}{record_id}",
                    timeout=30.0,
                    headers=settings.api_headers,
                )
                if response.status_code == 200:
                    return response.json()
            except Exception as e:
                logger.error(f"Failed to fetch raw record {record_id}: {e}")
            return None

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
                    task_type="fact_extraction",
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
                    task_type="fact_extraction",
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

                return {"facts": []}
        except json.JSONDecodeError as e:
            cost_ms = int((time.time() - start_time) * 1000)
            error_msg = f"Failed to parse Qwen response: {e}"
            logger.error(error_msg)

            await ai_log_client.log_ai_call(
                task_type="fact_extraction",
                model_name=settings.qwen_model,
                input_prompt=prompt,
                output_result="",
                cost_ms=cost_ms,
                status="failed",
                error_message=error_msg,
                source_entity_id=source_entity_id,
            )

            return {"facts": []}
        except (QwenAPIError, QwenRateLimitError):
            raise
        except Exception as e:
            cost_ms = int((time.time() - start_time) * 1000)
            error_msg = f"Failed to call Qwen API: {e}"
            logger.error(error_msg)

            await ai_log_client.log_ai_call(
                task_type="fact_extraction",
                model_name=settings.qwen_model,
                input_prompt=prompt,
                output_result="",
                cost_ms=cost_ms,
                status="failed",
                error_message=error_msg,
                source_entity_id=source_entity_id,
            )

            return {"facts": []}

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

    async def extract(self, raw_record: dict) -> list[dict]:
        raw_content = raw_record.get("raw_content", "")
        if not raw_content:
            logger.warning(f"No raw content in record: {raw_record.get('id')}")
            return []

        company = raw_record.get("company", "")
        source_type = "unknown"
        record_id = raw_record.get("id")

        template = await prompt_template_client.get_active_template(
            task_type="fact_extraction",
            category=source_type,
        )

        if template:
            prompt = await prompt_template_client.render_template(
                template["template"],
                {
                    "raw_content": raw_content,
                    "company": company,
                    "source_type": source_type,
                },
            )
        else:
            prompt = build_extraction_prompt(raw_content, company, source_type)

        result = await self.call_qwen(prompt, source_entity_id=record_id)

        facts = []
        for fact_data in result.get("facts", []):
            fact_data["raw_record_id"] = record_id
            fact_data["company"] = company
            fact_data["source_url"] = raw_record.get("url", "")
            fact_data["published_at"] = raw_record.get("published_at")
            facts.append(fact_data)

        return facts

    async def save_facts(self, facts: list[dict]) -> bool:
        if not facts:
            return True

        async with httpx.AsyncClient() as client:
            success = True
            for fact in facts:
                try:
                    fact_payload = {
                        "raw_record_id": fact.get("raw_record_id", ""),
                        "company": fact.get("company", ""),
                        "fact_summary": fact.get("fact_summary", ""),
                        "topic_level_1": fact.get("topic_level_1", ""),
                        "topic_level_2": fact.get("topic_level_2"),
                        "event_type": fact.get("event_type", ""),
                        "entity_type": fact.get("entity_type", ""),
                        "entity_name": fact.get("entity_name", ""),
                        "importance_level": fact.get("importance_level", ""),
                        "capability_level": fact.get("capability_level"),
                        "confidence": fact.get("confidence", ""),
                        "published_at": fact.get("published_at"),
                        "source_url": fact.get("source_url", ""),
                        "needs_review": False,
                    }

                    response = await client.post(
                        settings.facts_url,
                        json=fact_payload,
                        timeout=30.0,
                        headers=settings.api_headers,
                    )

                    if response.status_code not in (200, 201):
                        logger.error(f"Failed to save fact: {response.text}")
                        success = False
                except Exception as e:
                    logger.error(f"Failed to save fact: {e}")
                    success = False

            return success

    async def update_raw_record_status(self, record_id: str, dedupe_status: str) -> bool:
        async with httpx.AsyncClient() as client:
            try:
                response = await client.put(
                    f"{settings.raw_records_url}{record_id}/status",
                    json={"dedupe_status": dedupe_status},
                    timeout=30.0,
                    headers=settings.api_headers,
                )
                return response.status_code == 200
            except Exception as e:
                logger.error(f"Failed to update raw record status: {e}")
                return False

    async def extract_for_record(self, record_id: str) -> dict[str, Any]:
        result = {"success": False, "facts_count": 0, "error": None}

        raw_record = await self.fetch_raw_record_by_id(record_id)
        if not raw_record:
            result["error"] = f"Raw record not found: {record_id}"
            return result

        facts = await self.extract(raw_record)
        if not facts:
            await self.update_raw_record_status(record_id, "extracted_empty")
            result["success"] = True
            result["error"] = "No facts extracted"
            return result

        saved = await self.save_facts(facts)
        if saved:
            await self.update_raw_record_status(record_id, "extracted")
            result["success"] = True
            result["facts_count"] = len(facts)
            logger.info(f"Extracted {len(facts)} facts from record: {record_id}")
        else:
            result["error"] = "Failed to save facts"

        return result

    async def extract_all_pending(self, batch_size: int = None) -> dict[str, Any]:
        if batch_size is None:
            batch_size = settings.batch_size

        results = {"success": 0, "failed": 0, "total": 0, "total_facts": 0}

        raw_records = await self.fetch_raw_records(crawl_status="success", page_size=batch_size)
        if not raw_records:
            logger.info("No raw records found for extraction")
            return results

        results["total"] = len(raw_records)

        for raw_record in raw_records:
            record_id = raw_record.get("id")
            result = await self.extract_for_record(record_id)

            if result["success"]:
                results["success"] += 1
                results["total_facts"] += result["facts_count"]
            else:
                results["failed"] += 1
                logger.error(f"Failed to extract from record {record_id}: {result['error']}")

        return results