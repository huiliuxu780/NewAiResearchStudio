"""Base channel abstraction for push notifications."""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any


@dataclass
class SendResult:
    """推送发送结果。"""
    success: bool
    message: str
    response_data: dict[str, Any] | None = None
    error_code: str | None = None
    error_message: str | None = None


@dataclass
class ChannelConfig:
    """渠道配置基类。"""
    channel_type: str
    raw_config: dict[str, Any] = field(default_factory=dict)


class BaseChannel(ABC):
    """推送渠道抽象基类。

    所有推送渠道必须继承此类并实现以下方法:
    - send(): 发送推送消息
    - validate_config(): 验证渠道配置
    - format_content(): 格式化推送内容
    - get_channel_type(): 返回渠道类型标识
    """

    def __init__(self, config: ChannelConfig) -> None:
        self.config = config

    @abstractmethod
    async def send(
        self,
        title: str,
        content: str,
        recipients: list[str],
        content_format: str = "text",
        **kwargs: Any,
    ) -> SendResult:
        """发送推送消息。

        Args:
            title: 推送标题
            content: 推送内容(已格式化)
            recipients: 接收方列表(用户ID、邮箱、webhook URL等)
            content_format: 内容格式(text, html, markdown, rich_text)
            **kwargs: 渠道特定的额外参数

        Returns:
            SendResult: 发送结果
        """
        ...

    @abstractmethod
    def validate_config(self) -> bool:
        """验证渠道配置是否完整有效。

        Returns:
            bool: 配置是否有效
        """
        ...

    @abstractmethod
    def format_content(
        self,
        title: str,
        content: str,
        content_format: str = "text",
        **kwargs: Any,
    ) -> str:
        """格式化推送内容以适配渠道要求。

        Args:
            title: 推送标题
            content: 原始内容
            content_format: 内容格式
            **kwargs: 渠道特定的格式化参数

        Returns:
            str: 格式化后的内容
        """
        ...

    @abstractmethod
    def get_channel_type(self) -> str:
        """返回渠道类型标识。

        Returns:
            str: 渠道类型 (feishu, email, dingtalk, wechat_work, slack)
        """
        ...

    def __repr__(self) -> str:
        return f"<{self.__class__.__name__}(type={self.get_channel_type()})>"
