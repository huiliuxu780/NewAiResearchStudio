"""WeChat Work (企业微信) push channel implementation."""

from typing import Any

import httpx

from ..base_channel import BaseChannel, ChannelConfig, SendResult
from utils.logging import get_logger

logger = get_logger(__name__)


class WeChatWorkChannel(BaseChannel):
    """企业微信推送渠道。

    配置格式:
    {
        "webhook_url": "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx",
        "mentioned_list": ["@all"]  // 可选, @提醒列表
    }
    """

    def __init__(self, config: ChannelConfig) -> None:
        super().__init__(config)
        self.webhook_url: str | None = config.raw_config.get("webhook_url")
        self.mentioned_list: list[str] = config.raw_config.get("mentioned_list", [])

    async def send(
        self,
        title: str,
        content: str,
        recipients: list[str],
        content_format: str = "text",
        **kwargs: Any,
    ) -> SendResult:
        """通过企业微信 Webhook 发送消息。"""
        if not self.webhook_url:
            return SendResult(
                success=False,
                message="WeChat Work webhook URL not configured",
                error_code="CONFIG_ERROR",
                error_message="webhook_url is required",
            )

        payload = self._build_payload(title, content)

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    self.webhook_url,
                    json=payload,
                    headers={"Content-Type": "application/json"},
                )
                response.raise_for_status()
                data = response.json()

                if data.get("errcode") == 0:
                    return SendResult(
                        success=True,
                        message="WeChat Work message sent successfully",
                        response_data=data,
                    )
                else:
                    error_msg = data.get("errmsg", "Unknown error")
                    return SendResult(
                        success=False,
                        message=f"WeChat Work API error: {error_msg}",
                        error_code=str(data.get("errcode", "API_ERROR")),
                        error_message=error_msg,
                    )
        except httpx.TimeoutException:
            return SendResult(
                success=False,
                message="WeChat Work webhook request timed out",
                error_code="TIMEOUT",
                error_message="Request exceeded 30s timeout",
            )
        except httpx.HTTPError as e:
            return SendResult(
                success=False,
                message=f"WeChat Work HTTP error: {str(e)}",
                error_code="HTTP_ERROR",
                error_message=str(e),
            )

    def validate_config(self) -> bool:
        """验证企业微信配置。"""
        return bool(self.webhook_url and self.webhook_url.startswith("https://"))

    def format_content(
        self,
        title: str,
        content: str,
        content_format: str = "text",
        **kwargs: Any,
    ) -> str:
        """格式化为企微 Markdown 格式。"""
        mention_text = ""
        if self.mentioned_list:
            mention_text = " ".join(f"<@{m}>" for m in self.mentioned_list) + "\n\n"
        return f"{mention_text}### {title}\n\n{content}"

    def get_channel_type(self) -> str:
        return "wechat_work"

    def _build_payload(self, title: str, content: str) -> dict:
        """构建企业微信请求体 (Markdown 消息)。"""
        return {
            "msgtype": "markdown",
            "markdown": {
                "content": self.format_content(title, content, "markdown"),
            },
        }
