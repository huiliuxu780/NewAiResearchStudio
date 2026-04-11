"""Email push channel implementation."""

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any

import aiosmtplib

from ..base_channel import BaseChannel, ChannelConfig, SendResult
from utils.logging import get_logger

logger = get_logger(__name__)


class EmailChannel(BaseChannel):
    """邮件推送渠道。

    配置格式:
    {
        "smtp_host": "smtp.example.com",
        "smtp_port": 587,
        "use_tls": true,
        "username": "sender@example.com",
        "password": "app_password",
        "from_name": "AI Research Platform",
        "from_email": "noreply@example.com"
    }
    """

    def __init__(self, config: ChannelConfig) -> None:
        super().__init__(config)
        self.smtp_host: str = config.raw_config.get("smtp_host", "")
        self.smtp_port: int = config.raw_config.get("smtp_port", 587)
        self.use_tls: bool = config.raw_config.get("use_tls", True)
        self.username: str = config.raw_config.get("username", "")
        self.password: str = config.raw_config.get("password", "")
        self.from_name: str = config.raw_config.get("from_name", "AI Research Platform")
        self.from_email: str = config.raw_config.get("from_email", "")

    async def send(
        self,
        title: str,
        content: str,
        recipients: list[str],
        content_format: str = "text",
        **kwargs: Any,
    ) -> SendResult:
        """发送邮件推送。"""
        if not recipients:
            return SendResult(
                success=False,
                message="No recipients specified",
                error_code="NO_RECIPIENTS",
                error_message="Recipients list is empty",
            )

        msg = self._build_message(title, content, recipients, content_format)

        try:
            smtp = aiosmtplib.SMTP(
                hostname=self.smtp_host,
                port=self.smtp_port,
                use_tls=self.use_tls,
                timeout=30,
            )
            await smtp.connect()
            await smtp.login(self.username, self.password)
            await smtp.send_message(msg)
            await smtp.quit()

            return SendResult(
                success=True,
                message=f"Email sent to {len(recipients)} recipient(s)",
                response_data={"recipients": recipients},
            )
        except aiosmtplib.SMTPException as e:
            return SendResult(
                success=False,
                message=f"SMTP error: {str(e)}",
                error_code="SMTP_ERROR",
                error_message=str(e),
            )
        except Exception as e:
            return SendResult(
                success=False,
                message=f"Email send failed: {str(e)}",
                error_code="SEND_ERROR",
                error_message=str(e),
            )

    def validate_config(self) -> bool:
        """验证邮件配置。"""
        return all([
            self.smtp_host,
            self.smtp_port > 0,
            self.username,
            self.password,
            self.from_email,
        ])

    def format_content(
        self,
        title: str,
        content: str,
        content_format: str = "text",
        **kwargs: Any,
    ) -> str:
        """格式化邮件内容。"""
        if content_format == "html":
            return content
        # 纯文本转简单 HTML
        paragraphs = content.split("\n\n")
        html_parts = [f"<h2>{title}</h2>"]
        for p in paragraphs:
            if p.strip():
                html_parts.append(f"<p>{p.strip()}</p>")
        return "\n".join(html_parts)

    def get_channel_type(self) -> str:
        return "email"

    def _build_message(
        self,
        title: str,
        content: str,
        recipients: list[str],
        content_format: str,
    ) -> MIMEMultipart:
        """构建邮件消息。"""
        msg = MIMEMultipart("alternative")
        msg["Subject"] = title
        msg["From"] = f"{self.from_name} <{self.from_email}>"
        msg["To"] = ", ".join(recipients)

        # 纯文本版本
        msg.attach(MIMEText(content, "plain", "utf-8"))

        # HTML 版本
        if content_format == "html":
            html_content = content
        else:
            html_content = self.format_content(title, content, "html")
        msg.attach(MIMEText(html_content, "html", "utf-8"))

        return msg
