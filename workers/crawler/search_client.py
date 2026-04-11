import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any

import httpx

from config import settings

logger = logging.getLogger(__name__)


@dataclass
class SearchResult:
    """搜索引擎返回的单条结果"""
    title: str
    url: str
    snippet: str = ""
    display_link: str = ""
    published_at: datetime | None = None
    metadata: dict[str, Any] = field(default_factory=dict)


class BaseSearchClient(ABC):
    """搜索引擎客户端抽象基类"""

    def __init__(self, timeout: float = 30.0):
        self.timeout = timeout
        self._client: httpx.AsyncClient | None = None

    async def __aenter__(self):
        self._client = httpx.AsyncClient(timeout=self.timeout)
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self._client:
            await self._client.aclose()
            self._client = None

    @abstractmethod
    async def search(
        self,
        query: str,
        max_results: int = 10,
        language: str = "zh-CN",
        time_range: str | None = None,
    ) -> list[SearchResult]:
        """
        执行搜索并返回结果列表。

        Args:
            query: 搜索关键词
            max_results: 最大返回结果数
            language: 语言代码，如 zh-CN, en-US
            time_range: 时间范围，如 "d" (天), "w" (周), "m" (月), "y" (年)

        Returns:
            SearchResult 列表
        """
        ...

    def _ensure_client(self) -> httpx.AsyncClient:
        if self._client is None:
            raise RuntimeError("Search client not initialized. Use async context manager.")
        return self._client


class GoogleCustomSearchClient(BaseSearchClient):
    """Google Custom Search API 客户端"""

    BASE_URL = "https://www.googleapis.com/customsearch/v1"

    def __init__(
        self,
        api_key: str | None = None,
        cx: str | None = None,
        timeout: float = 30.0,
    ):
        super().__init__(timeout=timeout)
        self.api_key = api_key or settings.google_api_key
        self.cx = cx or settings.google_cx

        if not self.api_key:
            logger.warning("Google API key not configured")
        if not self.cx:
            logger.warning("Google Custom Search Engine ID (cx) not configured")

    async def search(
        self,
        query: str,
        max_results: int = 10,
        language: str = "zh-CN",
        time_range: str | None = None,
    ) -> list[SearchResult]:
        if not self.api_key or not self.cx:
            logger.error("Google Custom Search not properly configured")
            return []

        results: list[SearchResult] = []
        start_index = 1
        # Google API 每次最多返回 10 条结果
        per_page = min(10, max_results)

        try:
            client = self._ensure_client()

            while len(results) < max_results:
                params: dict[str, Any] = {
                    "key": self.api_key,
                    "cx": self.cx,
                    "q": query,
                    "num": per_page,
                    "start": start_index,
                    "lr": f"lang_{self._map_language_code(language)}",
                }

                # 添加时间范围过滤
                if time_range:
                    date_restrict = self._map_time_range(time_range)
                    if date_restrict:
                        params["dateRestrict"] = date_restrict

                logger.info(
                    f"Google search: query='{query}', start={start_index}, "
                    f"max_results={max_results}"
                )

                response = await client.get(self.BASE_URL, params=params)
                response.raise_for_status()
                data = response.json()

                items = data.get("items", [])
                if not items:
                    logger.info(f"No more results for query: {query}")
                    break

                for item in items:
                    if len(results) >= max_results:
                        break

                    result = SearchResult(
                        title=item.get("title", ""),
                        url=item.get("link", ""),
                        snippet=item.get("snippet", ""),
                        display_link=item.get("displayLink", ""),
                        metadata={
                            "search_engine": "google",
                            "query": query,
                            "pagemap": item.get("pagemap", {}),
                        },
                    )
                    results.append(result)

                # Google API 限制最多 100 条结果，每次步进 10
                if len(items) < per_page:
                    break

                start_index += per_page

        except httpx.HTTPStatusError as e:
            logger.error(f"Google search HTTP error: {e.response.status_code} - {e.response.text}")
        except httpx.RequestError as e:
            logger.error(f"Google search request error: {e}")
        except Exception as e:
            logger.error(f"Google search unexpected error: {e}")

        logger.info(f"Google search completed: {len(results)} results for '{query}'")
        return results

    def _map_language_code(self, language: str) -> str:
        """将语言代码转换为 Google API 格式"""
        lang_map = {
            "zh-CN": "zh-cn",
            "zh-TW": "zh-tw",
            "en-US": "en",
            "en-GB": "en",
            "ja": "ja",
            "ko": "ko",
        }
        return lang_map.get(language, language.split("-")[0])

    def _map_time_range(self, time_range: str) -> str | None:
        """将时间范围转换为 Google API 格式"""
        time_map = {
            "d": "d1",      # 过去 1 天
            "w": "w1",      # 过去 1 周
            "m": "m1",      # 过去 1 个月
            "y": "y1",      # 过去 1 年
        }
        return time_map.get(time_range)


class BingSearchClient(BaseSearchClient):
    """Bing Search API 客户端"""

    BASE_URL = "https://api.bing.microsoft.com/v7.0/search"

    def __init__(
        self,
        api_key: str | None = None,
        timeout: float = 30.0,
    ):
        super().__init__(timeout=timeout)
        self.api_key = api_key or settings.bing_api_key

        if not self.api_key:
            logger.warning("Bing API key not configured")

    async def search(
        self,
        query: str,
        max_results: int = 10,
        language: str = "zh-CN",
        time_range: str | None = None,
    ) -> list[SearchResult]:
        if not self.api_key:
            logger.error("Bing Search not properly configured")
            return []

        results: list[SearchResult] = []
        offset = 0
        # Bing API 每次最多返回 50 条结果
        per_page = min(50, max_results)

        try:
            client = self._ensure_client()
            headers = {"Ocp-Apim-Subscription-Key": self.api_key}

            while len(results) < max_results:
                params: dict[str, Any] = {
                    "q": query,
                    "count": per_page,
                    "offset": offset,
                    "mkt": language,
                    "textFormat": "Raw",
                }

                # 添加时间范围过滤
                if time_range:
                    freshness = self._map_time_range(time_range)
                    if freshness:
                        params["freshness"] = freshness

                logger.info(
                    f"Bing search: query='{query}', offset={offset}, "
                    f"max_results={max_results}"
                )

                response = await client.get(
                    self.BASE_URL,
                    headers=headers,
                    params=params,
                )
                response.raise_for_status()
                data = response.json()

                web_pages = data.get("webPages", {})
                items = web_pages.get("value", [])
                if not items:
                    logger.info(f"No more results for query: {query}")
                    break

                for item in items:
                    if len(results) >= max_results:
                        break

                    # 尝试解析发布日期
                    published_at = None
                    date_display = item.get("datePublished")
                    if date_display:
                        try:
                            published_at = datetime.fromisoformat(
                                date_display.replace("Z", "+00:00")
                            )
                        except (ValueError, AttributeError):
                            pass

                    result = SearchResult(
                        title=item.get("name", ""),
                        url=item.get("url", ""),
                        snippet=item.get("snippet", ""),
                        display_link=item.get("displayUrl", ""),
                        published_at=published_at,
                        metadata={
                            "search_engine": "bing",
                            "query": query,
                            "date_published": date_display,
                        },
                    )
                    results.append(result)

                if len(items) < per_page:
                    break

                offset += per_page

        except httpx.HTTPStatusError as e:
            logger.error(f"Bing search HTTP error: {e.response.status_code} - {e.response.text}")
        except httpx.RequestError as e:
            logger.error(f"Bing search request error: {e}")
        except Exception as e:
            logger.error(f"Bing search unexpected error: {e}")

        logger.info(f"Bing search completed: {len(results)} results for '{query}'")
        return results

    def _map_time_range(self, time_range: str) -> str | None:
        """将时间范围转换为 Bing API 格式"""
        time_map = {
            "d": "Day",
            "w": "Week",
            "m": "Month",
            "y": "Year",
        }
        return time_map.get(time_range)


def create_search_client(
    engine: str | None = None,
    **kwargs: Any,
) -> BaseSearchClient:
    """
    工厂函数：根据搜索引擎类型创建对应的客户端。

    Args:
        engine: 搜索引擎类型，"google" 或 "bing"，默认使用配置中的 default_search_engine
        **kwargs: 传递给具体客户端的额外参数

    Returns:
        BaseSearchClient 实例

    Raises:
        ValueError: 不支持的搜索引擎类型
    """
    engine = (engine or settings.default_search_engine).lower()

    if engine == "google":
        return GoogleCustomSearchClient(**kwargs)
    elif engine == "bing":
        return BingSearchClient(**kwargs)
    else:
        raise ValueError(f"Unsupported search engine: {engine}. Use 'google' or 'bing'.")
