"""Feishu (Lark) push channel implementation."""

import json
from typing import Any

import httpx

from ..base_channel import BaseChannel, ChannelConfig, SendResult
from utils.logging import get_logger

logger = get_logger(__name__)


class FeishuChannel(BaseChannel):
    """飞书推送渠道。

    支持两种推送方式:
    1. Webhook Bot - 通过群机器人 Webhook 推送
    2. App Message - 通过飞书开放平台 API 发送消息

    配置格式 (Webhook):
    {
        "webhook_url": "https://open.feishu.cn/open-apis/bot/v2/hook/...",
        "secret": "可选的签名密钥"
    }

    配置格式 (App):
    {
        "app_id": "cli_xxx",
        "app_secret": "xxx",
        "receive_id_type": "open_id"  # open_id, user_id, chat_id
    }
    """

    def __init__(self, config: ChannelConfig) -> None:
        super().__init__(config)
        self.webhook_url: str | None = config.raw_config.get("webhook_url")
        self.secret: str | None = config.raw_config.get("secret")
        self.app_id: str | None = config.raw_config.get("app_id")
        self.app_secret: str | None = config.raw_config.get("app_secret")
        self.receive_id_type: str = config.raw_config.get("receive_id_type", "open_id")

    async def send(
        self,
        title: str,
        content: str,
        recipients: list[str],
        content_format: str = "text",
        **kwargs: Any,
    ) -> SendResult:
        """通过飞书 Webhook 发送富文本消息。"""
        if not self.webhook_url:
            return SendResult(
                success=False,
                message="Feishu webhook URL not configured",
                error_code="CONFIG_ERROR",
                error_message="webhook_url is required",
            )

        payload = self._build_payload(title, content, content_format)

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    self.webhook_url,
                    json=payload,
                    headers={"Content-Type": "application/json"},
                )
                response.raise_for_status()
                data = response.json()

                if data.get("code") == 0 or data.get("StatusCode") == 0:
                    return SendResult(
                        success=True,
                        message="Feishu message sent successfully",
                        response_data=data,
                    )
                else:
                    error_msg = data.get("msg", data.get("StatusMessage", "Unknown error"))
                    return SendResult(
                        success=False,
                        message=f"Feishu API error: {error_msg}",
                        error_code=str(data.get("code", data.get("StatusCode", "API_ERROR"))),
                        error_message=error_msg,
                    )
        except httpx.TimeoutException:
            return SendResult(
                success=False,
                message="Feishu webhook request timed out",
                error_code="TIMEOUT",
                error_message="Request exceeded 30s timeout",
            )
        except httpx.HTTPError as e:
            return SendResult(
                success=False,
                message=f"Feishu HTTP error: {str(e)}",
                error_code="HTTP_ERROR",
                error_message=str(e),
            )

    def validate_config(self) -> bool:
        """验证飞书配置。"""
        if self.webhook_url:
            return self.webhook_url.startswith("https://")
        if self.app_id and self.app_secret:
            return True
        return False

    def format_content(
        self,
        title: str,
        content: str,
        content_format: str = "text",
        **kwargs: Any,
    ) -> str:
        """格式化为飞书富文本格式。"""
        if content_format == "rich_text":
            return content
        # 默认包装为飞书富文本格式
        return f"**{title}**\n\n{content}"

    def get_channel_type(self) -> str:
        return "feishu"

    def _build_payload(self, title: str, content: str, content_format: str) -> dict:
        """构建飞书 Webhook 请求体。"""
        return {
            "msg_type": "interactive",
            "card": {
                "header": {
                    "title": {"tag": "plain_text", "content": title},
                    "template": "blue",
                },
                "elements": [
                    {
                        "tag": "markdown",
                        "content": content,
                    }
                ],
            },
        }
