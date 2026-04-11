"""Jinja2 template engine for push notifications."""

from typing import Any

from jinja2 import BaseLoader, Environment, TemplateError

from utils.logging import get_logger

logger = get_logger(__name__)


class TemplateEngine:
    """Jinja2 模板引擎封装。

    用于渲染推送通知的标题和内容模板。
    支持自定义过滤器和全局变量。
    """

    def __init__(self) -> None:
        self.env = Environment(
            loader=BaseLoader(),
            autoescape=False,  # 推送内容不需要 HTML 转义
            trim_blocks=True,
            lstrip_blocks=True,
        )
        self._register_builtin_filters()
        self._register_builtin_globals()

    def _register_builtin_filters(self) -> None:
        """注册内置过滤器。"""
        self.env.filters["truncate"] = self._truncate_filter
        self.env.filters["strip_html"] = self._strip_html_filter
        self.env.filters["to_markdown"] = self._to_markdown_filter

    def _register_builtin_globals(self) -> None:
        """注册内置全局变量。"""
        from datetime import datetime
        self.env.globals["now"] = datetime.now
        self.env.globals["strftime"] = lambda fmt, dt=None: (dt or datetime.now()).strftime(fmt)

    def render(self, template_str: str, variables: dict[str, Any]) -> str:
        """渲染模板字符串。

        Args:
            template_str: Jinja2 模板字符串
            variables: 模板变量字典

        Returns:
            str: 渲染后的字符串

        Raises:
            TemplateRenderError: 模板渲染失败
        """
        try:
            template = self.env.from_string(template_str)
            return template.render(**variables)
        except TemplateError as e:
            raise TemplateRenderError(f"Template render failed: {str(e)}") from e
        except Exception as e:
            raise TemplateRenderError(f"Unexpected error rendering template: {str(e)}") from e

    def render_title_and_content(
        self,
        title_template: str,
        content_template: str,
        variables: dict[str, Any],
    ) -> tuple[str, str]:
        """同时渲染标题和内容模板。

        Args:
            title_template: 标题模板
            content_template: 内容模板
            variables: 模板变量

        Returns:
            tuple[str, str]: (渲染后的标题, 渲染后的内容)
        """
        title = self.render(title_template, variables)
        content = self.render(content_template, variables)
        return title, content

    def validate_template(self, template_str: str) -> tuple[bool, str | None]:
        """验证模板语法是否正确。

        Args:
            template_str: 模板字符串

        Returns:
            tuple[bool, str | None]: (是否有效, 错误信息)
        """
        try:
            self.env.parse(template_str)
            return True, None
        except TemplateError as e:
            return False, str(e)

    @staticmethod
    def _truncate_filter(value: str, length: int = 100, suffix: str = "...") -> str:
        """截断字符串到指定长度。"""
        if len(value) <= length:
            return value
        return value[:length] + suffix

    @staticmethod
    def _strip_html_filter(value: str) -> str:
        """移除 HTML 标签。"""
        import re
        return re.sub(r"<[^>]+>", "", value)

    @staticmethod
    def _to_markdown_filter(value: str) -> str:
        """简单转换为 Markdown 格式。"""
        return value.replace("\n", "\n\n")


class TemplateRenderError(Exception):
    """模板渲染异常。"""
    pass
