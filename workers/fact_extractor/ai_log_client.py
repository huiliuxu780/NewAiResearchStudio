import logging
import time
from typing import Any

import httpx

from config import settings

logger = logging.getLogger(__name__)


class AILogClient:
    def __init__(self):
        self.api_base_url = settings.api_base_url

    async def log_ai_call(
        self,
        task_type: str,
        model_name: str,
        input_prompt: str,
        output_result: str,
        input_tokens: int = 0,
        output_tokens: int = 0,
        cost_ms: int = 0,
        status: str = "success",
        error_message: str | None = None,
        source_entity_id: str | None = None,
    ) -> bool:
        try:
            log_data = {
                "task_type": task_type,
                "model_name": model_name,
                "input_prompt": input_prompt[:1000],
                "output_result": output_result[:1000],
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "cost_ms": cost_ms,
                "status": status,
                "error_message": error_message,
                "source_entity_id": source_entity_id,
            }

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.api_base_url}/api/v1/logs/ai",
                    json=log_data,
                    timeout=10.0,
                )

                if response.status_code not in (200, 201):
                    logger.warning(f"Failed to log AI call: {response.status_code}")
                    return False
                return True
        except Exception as e:
            logger.warning(f"Failed to send AI log: {e}")
            return False


ai_log_client = AILogClient()
