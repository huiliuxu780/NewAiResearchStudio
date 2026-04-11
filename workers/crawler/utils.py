import logging
from urllib.parse import urljoin, urlparse, urlunparse

from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)


def extract_links_from_html(
    html: str,
    item_selector: str,
    link_selector: str,
    attribute: str = "href",
) -> list[str]:
    """
    从 HTML 中提取详情页链接。

    Args:
        html: 完整的 HTML 内容
        item_selector: 列表项的 CSS 选择器（如 ".article-list li"）
        link_selector: 链接元素的 CSS 选择器（如 "a.title"）
        attribute: 链接属性名，默认为 "href"

    Returns:
        提取到的原始链接列表（可能包含相对路径）
    """
    try:
        soup = BeautifulSoup(html, "html.parser")
        items = soup.select(item_selector)
        if not items:
            logger.warning(f"No items found for selector: {item_selector}")
            return []

        links = []
        for item in items:
            link_element = item.select_one(link_selector)
            if link_element and link_element.get(attribute):
                links.append(link_element[attribute])

        logger.info(f"Extracted {len(links)} links from HTML")
        return links

    except Exception as e:
        logger.error(f"Error extracting links from HTML: {e}")
        return []


def normalize_url(url: str, base_url: str) -> str:
    """
    标准化 URL，处理相对路径、协议相对路径等。

    Args:
        url: 原始 URL（可能是相对路径或绝对路径）
        base_url: 基础 URL，用于解析相对路径

    Returns:
        标准化后的绝对 URL
    """
    if not url:
        return ""

    # 处理协议相对路径（如 //example.com/path）
    if url.startswith("//"):
        parsed_base = urlparse(base_url)
        return f"{parsed_base.scheme}:{url}"

    # 处理相对路径
    if not url.startswith(("http://", "https://")):
        url = urljoin(base_url, url)

    # 清理 URL（移除锚点、规范化）
    parsed = urlparse(url)
    normalized = urlunparse((
        parsed.scheme.lower(),
        parsed.netloc.lower(),
        parsed.path.rstrip("/") or "/",
        parsed.params,
        parsed.query,
        "",  # 移除 fragment
    ))

    return normalized


def deduplicate_urls(urls: list[str]) -> list[str]:
    """
    URL 去重，保持原始顺序。

    Args:
        urls: URL 列表

    Returns:
        去重后的 URL 列表
    """
    seen = set()
    result = []

    for url in urls:
        if url not in seen:
            seen.add(url)
            result.append(url)

    logger.info(f"Deduplicated URLs: {len(urls)} -> {len(result)}")
    return result
