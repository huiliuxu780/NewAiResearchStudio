import logging
from typing import Any

import httpx

from config import settings

logger = logging.getLogger(__name__)


class PromptTemplateClient:
    def __init__(self):
        self.api_base_url = settings.api_base_url

    async def get_active_template(self, task_type: str, category: str | None = None) -> dict[str, Any] | None:
        try:
            params = {"task_type": task_type, "is_active": "true"}
            if category:
                params["category"] = category

            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.api_base_url}/api/v1/prompt-templates",
                    params=params,
                    timeout=10.0,
                )

                if response.status_code == 200:
                    data = response.json()
                    items = data.get("items", [])
                    if items:
                        return items[0]
                return None
        except Exception as e:
            logger.warning(f"Failed to fetch prompt template: {e}")
            return None

    async def render_template(self, template_str: str, variables: dict[str, str]) -> str:
        try:
            return template_str.format(**variables)
        except KeyError as e:
            logger.error(f"Missing variable in template: {e}")
            return template_str
        except Exception as e:
            logger.error(f"Failed to render template: {e}")
            return template_str


prompt_template_client = PromptTemplateClient()
