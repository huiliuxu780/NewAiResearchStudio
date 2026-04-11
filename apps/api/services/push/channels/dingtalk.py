"""DingTalk push channel implementation."""

import hashlib
import base64
import hmac
import time
import urllib.parse
from typing import Any

import httpx

from ..base_channel import BaseChannel, ChannelConfig, SendResult
from utils.logging import get_logger

logger = get_logger(__name__)


class DingTalkChannel(BaseChannel):
    """钉钉推送渠道。

    配置格式:
    {
        "webhook_url": "https://oapi.dingtalk.com/robot/send?access_token=xxx",
        "secret": "可选的签名密钥"
    }
    """

    def __init__(self, config: ChannelConfig) -> None:
        super().__init__(config)
        self.webhook_url: str | None = config.raw_config.get("webhook_url")
        self.secret: str | None = config.raw_config.get("secret")

    async def send(
        self,
        title: str,
        content: str,
        recipients: list[str],
        content_format: str = "text",
        **kwargs: Any,
    ) -> SendResult:
        """通过钉钉 Webhook 发送消息。"""
        if not self.webhook_url:
            return SendResult(
                success=False,
                message="DingTalk webhook URL not configured",
                error_code="CONFIG_ERROR",
                error_message="webhook_url is required",
            )

        url = self._sign_url(self.webhook_url) if self.secret else self.webhook_url
        payload = self._build_payload(title, content)

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    url,
                    json=payload,
                    headers={"Content-Type": "application/json"},
                )
                response.raise_for_status()
                data = response.json()

                if data.get("errcode") == 0:
                    return SendResult(
                        success=True,
                        message="DingTalk message sent successfully",
                        response_data=data,
                    )
                else:
                    error_msg = data.get("errmsg", "Unknown error")
                    return SendResult(
                        success=False,
                        message=f"DingTalk API error: {error_msg}",
                        error_code=str(data.get("errcode", "API_ERROR")),
                        error_message=error_msg,
                    )
        except httpx.TimeoutException:
            return SendResult(
                success=False,
                message="DingTalk webhook request timed out",
                error_code="TIMEOUT",
                error_message="Request exceeded 30s timeout",
            )
        except httpx.HTTPError as e:
            return SendResult(
                success=False,
                message=f"DingTalk HTTP error: {str(e)}",
                error_code="HTTP_ERROR",
                error_message=str(e),
            )

    def validate_config(self) -> bool:
        """验证钉钉配置。"""
        return bool(self.webhook_url and self.webhook_url.startswith("https://"))

    def format_content(
        self,
        title: str,
        content: str,
        content_format: str = "text",
        **kwargs: Any,
    ) -> str:
        """格式化为钉钉 Markdown 格式。"""
        return f"## {title}\n\n{content}"

    def get_channel_type(self) -> str:
        return "dingtalk"

    def _sign_url(self, webhook_url: str) -> str:
        """对 Webhook URL 进行签名。"""
        timestamp = str(round(time.time() * 1000))
        string_to_sign = f"{timestamp}\n{self.secret}"
        hmac_code = hmac.new(
            self.secret.encode("utf-8"),
            string_to_sign.encode("utf-8"),
            digestmod=hashlib.sha256,
        ).digest()
        sign = urllib.parse.quote_plus(base64.b64encode(hmac_code))
        separator = "&" if "?" in webhook_url else "?"
        return f"{webhook_url}{separator}timestamp={timestamp}&sign={sign}"

    def _build_payload(self, title: str, content: str) -> dict:
        """构建钉钉请求体 (Markdown 消息)。"""
        return {
            "msgtype": "markdown",
            "markdown": {
                "title": title,
                "text": self.format_content(title, content, "markdown"),
            },
        }
