"""Channel factory for creating push channel instances."""

from typing import Any

from .base_channel import BaseChannel, ChannelConfig


class ChannelFactory:
    """推送渠道工厂类。

    根据渠道类型动态创建对应的渠道实例。
    支持注册自定义渠道类型。
    """

    _registry: dict[str, type[BaseChannel]] = {}

    @classmethod
    def register(cls, channel_type: str, channel_class: type[BaseChannel]) -> None:
        """注册渠道类型。

        Args:
            channel_type: 渠道类型标识 (如 "feishu", "email")
            channel_class: 渠道实现类
        """
        cls._registry[channel_type.lower()] = channel_class

    @classmethod
    def create(cls, channel_type: str, config: dict[str, Any]) -> BaseChannel:
        """创建渠道实例。

        Args:
            channel_type: 渠道类型标识
            config: 渠道配置字典

        Returns:
            BaseChannel: 渠道实例

        Raises:
            ValueError: 渠道类型未注册
        """
        channel_type = channel_type.lower()
        channel_class = cls._registry.get(channel_type)
        if channel_class is None:
            available = ", ".join(cls._registry.keys())
            raise ValueError(
                f"Unknown channel type: '{channel_type}'. Available types: {available}"
            )
        return channel_class(ChannelConfig(channel_type=channel_type, raw_config=config))

    @classmethod
    def get_available_types(cls) -> list[str]:
        """获取所有已注册的渠道类型。"""
        return list(cls._registry.keys())

    @classmethod
    def is_registered(cls, channel_type: str) -> bool:
        """检查渠道类型是否已注册。"""
        return channel_type.lower() in cls._registry


# Auto-register all built-in channels when this module is imported
def _register_builtin_channels() -> None:
    """注册所有内置渠道。"""
    from .channels.feishu import FeishuChannel
    from .channels.email import EmailChannel
    from .channels.dingtalk import DingTalkChannel
    from .channels.wechat_work import WeChatWorkChannel
    from .channels.slack import SlackChannel

    ChannelFactory.register("feishu", FeishuChannel)
    ChannelFactory.register("email", EmailChannel)
    ChannelFactory.register("dingtalk", DingTalkChannel)
    ChannelFactory.register("wechat_work", WeChatWorkChannel)
    ChannelFactory.register("slack", SlackChannel)


_register_builtin_channels()
