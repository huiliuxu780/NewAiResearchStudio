"""Slack push channel implementation."""

from typing import Any

import httpx

from ..base_channel import BaseChannel, ChannelConfig, SendResult
from utils.logging import get_logger

logger = get_logger(__name__)


class SlackChannel(BaseChannel):
    """Slack 推送渠道。

    配置格式 (Webhook):
    {
        "webhook_url": "https://hooks.slack.com/services/T00/B00/xxx",
        "channel": "#general"  // 可选, 默认频道
    }

    配置格式 (Bot Token):
    {
        "bot_token": "xoxb-xxx",
        "channel": "#general"
    }
    """

    def __init__(self, config: ChannelConfig) -> None:
        super().__init__(config)
        self.webhook_url: str | None = config.raw_config.get("webhook_url")
        self.bot_token: str | None = config.raw_config.get("bot_token")
        self.channel: str = config.raw_config.get("channel", "#general")

    async def send(
        self,
        title: str,
        content: str,
        recipients: list[str],
        content_format: str = "text",
        **kwargs: Any,
    ) -> SendResult:
        """通过 Slack Webhook 或 Bot API 发送消息。"""
        if self.webhook_url:
            return await self._send_via_webhook(title, content)
        elif self.bot_token:
            return await self._send_via_api(title, content, recipients)
        else:
            return SendResult(
                success=False,
                message="Slack webhook URL or bot token not configured",
                error_code="CONFIG_ERROR",
                error_message="webhook_url or bot_token is required",
            )

    async def _send_via_webhook(self, title: str, content: str) -> SendResult:
        """通过 Incoming Webhook 发送。"""
        payload = {
            "blocks": [
                {
                    "type": "header",
                    "text": {"type": "plain_text", "text": title, "emoji": True},
                },
                {
                    "type": "section",
                    "text": {"type": "mrkdwn", "text": content},
                },
            ]
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    self.webhook_url,
                    json=payload,
                    headers={"Content-Type": "application/json"},
                )
                response.raise_for_status()

                if response.text == "ok":
                    return SendResult(
                        success=True,
                        message="Slack message sent via webhook",
                        response_data={"status": "ok"},
                    )
                return SendResult(
                    success=False,
                    message=f"Slack webhook error: {response.text}",
                    error_code="WEBHOOK_ERROR",
                    error_message=response.text,
                )
        except httpx.TimeoutException:
            return SendResult(
                success=False,
                message="Slack webhook request timed out",
                error_code="TIMEOUT",
                error_message="Request exceeded 30s timeout",
            )
        except httpx.HTTPError as e:
            return SendResult(
                success=False,
                message=f"Slack HTTP error: {str(e)}",
                error_code="HTTP_ERROR",
                error_message=str(e),
            )

    async def _send_via_api(
        self, title: str, content: str, recipients: list[str]
    ) -> SendResult:
        """通过 Bot API 发送。"""
        channel = recipients[0] if recipients else self.channel

        payload = {
            "channel": channel,
            "blocks": [
                {
                    "type": "header",
                    "text": {"type": "plain_text", "text": title, "emoji": True},
                },
                {
                    "type": "section",
                    "text": {"type": "mrkdwn", "text": content},
                },
            ],
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://slack.com/api/chat.postMessage",
                    json=payload,
                    headers={
                        "Authorization": f"Bearer {self.bot_token}",
                        "Content-Type": "application/json",
                    },
                )
                response.raise_for_status()
                data = response.json()

                if data.get("ok"):
                    return SendResult(
                        success=True,
                        message="Slack message sent via Bot API",
                        response_data=data,
                    )
                else:
                    error_msg = data.get("error", "Unknown error")
                    return SendResult(
                        success=False,
                        message=f"Slack API error: {error_msg}",
                        error_code="API_ERROR",
                        error_message=error_msg,
                    )
        except httpx.TimeoutException:
            return SendResult(
                success=False,
                message="Slack API request timed out",
                error_code="TIMEOUT",
                error_message="Request exceeded 30s timeout",
            )
        except httpx.HTTPError as e:
            return SendResult(
                success=False,
                message=f"Slack HTTP error: {str(e)}",
                error_code="HTTP_ERROR",
                error_message=str(e),
            )

    def validate_config(self) -> bool:
        """验证 Slack 配置。"""
        if self.webhook_url:
            return self.webhook_url.startswith("https://hooks.slack.com/")
        if self.bot_token:
            return self.bot_token.startswith("xoxb-")
        return False

    def format_content(
        self,
        title: str,
        content: str,
        content_format: str = "text",
        **kwargs: Any,
    ) -> str:
        """格式化为 Slack mrkdwn 格式。"""
        return f"*{title}*\n\n{content}"

    def get_channel_type(self) -> str:
        return "slack"
