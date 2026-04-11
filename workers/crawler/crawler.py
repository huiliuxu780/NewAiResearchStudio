import asyncio
import logging
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Callable

from bs4 import BeautifulSoup
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig
from crawl4ai.content_filter_strategy import PruningContentFilter
from crawl4ai.markdown_generation_strategy import DefaultMarkdownGenerator

from config import settings
from search_client import BaseSearchClient, SearchResult, create_search_client
from social_client import BaseSocialClient, SocialPost, create_social_client
from utils import deduplicate_urls, extract_links_from_html, normalize_url

logger = logging.getLogger(__name__)


@dataclass
class CrawlResult:
    url: str
    title: str = ""
    content: str = ""
    html: str = ""
    status_code: int = 0
    error: str | None = None
    crawled_at: datetime = field(default_factory=datetime.now)
    metadata: dict[str, Any] = field(default_factory=dict)


class CrawlerService:
    def __init__(self):
        self._crawler: AsyncWebCrawler | None = None
        self._browser_config = BrowserConfig(
            user_agent=settings.user_agent,
            headless=True,
            verbose=False,
        )
        self._run_config = CrawlerRunConfig(
            markdown_generator=DefaultMarkdownGenerator(
                content_filter=PruningContentFilter(
                    threshold=0.4,
                    threshold_type="dynamic",
                )
            ),
            page_timeout=settings.crawl_timeout * 1000,
        )

    async def __aenter__(self):
        await self.start()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()

    async def start(self):
        if self._crawler is None:
            self._crawler = AsyncWebCrawler(config=self._browser_config)
            await self._crawler.start()

    async def close(self):
        if self._crawler:
            await self._crawler.close()
            self._crawler = None

    async def crawl_single_page(
        self,
        url: str,
        crawl_config: dict[str, Any] | None = None,
    ) -> CrawlResult:
        """
        抓取单个页面，支持可选的采集配置。

        Args:
            url: 目标 URL
            crawl_config: 采集配置，可包含:
                - content_selector: CSS 选择器，用于提取特定内容区域
                - wait_for: 等待特定元素出现后再提取（CSS 选择器）
                - js_code: 页面加载后执行的 JavaScript 代码
                - remove_elements: 需要移除的 CSS 选择器列表（如广告、导航等）
        """
        result = CrawlResult(url=url)
        crawl_config = crawl_config or {}

        try:
            if self._crawler is None:
                await self.start()

            # 根据 crawl_config 构建运行配置
            run_config = self._build_run_config(crawl_config)

            crawl_result = await self._crawler.arun(
                url=url,
                config=run_config,
            )

            if crawl_result.success:
                result.title = crawl_result.metadata.get("title", "") if crawl_result.metadata else ""

                # 如果配置了 content_selector，优先使用选择器提取内容
                content_selector = crawl_config.get("content_selector")
                if content_selector and crawl_result.html:
                    result.content = await self.extract_content_with_selector(
                        crawl_result.html, content_selector
                    )
                else:
                    result.content = crawl_result.markdown.fit_markdown or crawl_result.markdown.raw_markdown

                result.html = crawl_result.html
                result.status_code = crawl_result.status_code or 200
                result.metadata = crawl_result.metadata or {}
            else:
                result.error = crawl_result.error_message
                result.status_code = crawl_result.status_code or 0

        except Exception as e:
            result.error = str(e)
            result.status_code = 0

        result.crawled_at = datetime.now()
        return result

    def _build_run_config(self, crawl_config: dict[str, Any]) -> CrawlerRunConfig:
        """
        根据采集配置构建 CrawlerRunConfig。

        Args:
            crawl_config: 采集配置字典

        Returns:
            构建好的 CrawlerRunConfig 实例
        """
        # 使用默认配置作为基础
        run_config = CrawlerRunConfig(
            markdown_generator=DefaultMarkdownGenerator(
                content_filter=PruningContentFilter(
                    threshold=0.4,
                    threshold_type="dynamic",
                )
            ),
            page_timeout=settings.crawl_timeout * 1000,
        )

        # 配置等待元素
        wait_for = crawl_config.get("wait_for")
        if wait_for:
            run_config.wait_for = wait_for

        # 配置 JavaScript 代码
        js_code = crawl_config.get("js_code")
        if js_code:
            if isinstance(js_code, str):
                run_config.js_code = [js_code]
            elif isinstance(js_code, list):
                run_config.js_code = js_code

        # 配置需要移除的元素
        remove_elements = crawl_config.get("remove_elements")
        if remove_elements and isinstance(remove_elements, list):
            run_config.excluded_tags = remove_elements

        return run_config

    async def extract_content_with_selector(self, html: str, selector: str) -> str:
        """
        使用 CSS 选择器从 HTML 中提取内容。

        Args:
            html: 完整的 HTML 内容
            selector: CSS 选择器字符串

        Returns:
            提取到的文本内容，多个元素之间用换行符分隔
        """
        try:
            soup = BeautifulSoup(html, "html.parser")
            elements = soup.select(selector)
            if not elements:
                logger.warning(f"No elements found for selector: {selector}")
                return ""
            return "\n".join(el.get_text(strip=True) for el in elements)
        except Exception as e:
            logger.error(f"Error extracting content with selector '{selector}': {e}")
            return ""

    async def crawl_multiple_pages(
        self,
        urls: list[str],
        concurrency: int | None = None,
    ) -> list[CrawlResult]:
        concurrency = concurrency or settings.max_concurrent
        semaphore = asyncio.Semaphore(concurrency)

        async def crawl_with_semaphore(url: str) -> CrawlResult:
            async with semaphore:
                return await self.crawl_single_page(url)

        tasks = [crawl_with_semaphore(url) for url in urls]
        return await asyncio.gather(*tasks)

    async def crawl_social_media(
        self,
        crawl_config: dict[str, Any],
    ) -> list[CrawlResult]:
        """
        抓取社交媒体官方号内容。

        工作流程：
        1. 从 crawl_config 中提取平台类型、账号 ID、最大帖子数等配置
        2. 创建对应的社交媒体客户端
        3. 抓取账号帖子列表
        4. 将帖子转换为 CrawlResult 格式

        Args:
            crawl_config: 采集配置，必须包含:
                - platform: 社交媒体平台，"twitter", "weibo", "wechat"（必填）
                - account_id: 账号 ID 或用户名（必填）
                - account_url: 账号主页 URL（可选，用于构建结果 URL）
                - max_posts: 最大抓取帖子数（可选，默认使用配置）

        Returns:
            CrawlResult 列表，每个帖子对应一个结果
        """
        crawl_config = crawl_config or {}
        platform = crawl_config.get("platform")
        account_id = crawl_config.get("account_id")

        if not platform:
            logger.error("Social media crawl requires 'platform' in crawl_config")
            return []

        if not account_id:
            logger.error("Social media crawl requires 'account_id' in crawl_config")
            return []

        max_posts = crawl_config.get("max_posts", settings.social_max_posts)
        account_url = crawl_config.get("account_url", "")

        logger.info(
            f"Starting social media crawl: platform={platform}, "
            f"account={account_id}, max_posts={max_posts}"
        )

        # 创建社交媒体客户端
        try:
            social_client = create_social_client(platform)
        except ValueError as e:
            logger.error(f"Failed to create social client: {e}")
            return []

        results: list[CrawlResult] = []

        async with social_client:
            try:
                posts = await social_client.fetch_posts(
                    account_id=account_id,
                    max_posts=max_posts,
                )

                if not posts:
                    logger.warning(f"No posts found for {platform} account: {account_id}")
                    return []

                # 将 SocialPost 转换为 CrawlResult
                for post in posts:
                    crawl_result = self._social_post_to_crawl_result(post, account_url)
                    results.append(crawl_result)

                logger.info(
                    f"Successfully crawled {len(results)} posts from "
                    f"{platform} account: {account_id}"
                )

            except Exception as e:
                logger.error(f"Error crawling social media {platform}/{account_id}: {e}")
                # 返回错误结果
                results.append(CrawlResult(
                    url=account_url or f"{platform}/{account_id}",
                    title=f"{platform} - {account_id}",
                    error=str(e),
                    status_code=0,
                ))

        return results

    def _social_post_to_crawl_result(
        self,
        post: SocialPost,
        account_url: str = "",
    ) -> CrawlResult:
        """
        将 SocialPost 转换为 CrawlResult 格式。

        Args:
            post: SocialPost 对象
            account_url: 账号主页 URL（用于构建元数据）

        Returns:
            CrawlResult 对象
        """
        # 构建标题
        title = f"{post.platform} - {post.author_display_name or post.account_id}"
        if post.published_at:
            title += f" - {post.published_at.strftime('%Y-%m-%d %H:%M')}"

        # 构建内容（包含互动数据）
        content_parts = [post.content]

        if post.likes > 0 or post.retweets > 0 or post.comments > 0:
            stats = []
            if post.likes > 0:
                stats.append(f"点赞: {post.likes}")
            if post.retweets > 0:
                stats.append(f"转发: {post.retweets}")
            if post.comments > 0:
                stats.append(f"评论: {post.comments}")
            if stats:
                content_parts.append(f"\n---\n互动数据: {', '.join(stats)}")

        if post.media_urls:
            content_parts.append(f"\n媒体链接: {len(post.media_urls)} 个")

        content = "\n".join(content_parts)

        # 构建元数据
        metadata = {
            "platform": post.platform,
            "account_id": post.account_id,
            "post_id": post.post_id,
            "author_name": post.author_name,
            "author_display_name": post.author_display_name,
            "likes": post.likes,
            "retweets": post.retweets,
            "comments": post.comments,
            "media_urls": post.media_urls,
            "account_url": account_url,
        }
        metadata.update(post.metadata)

        return CrawlResult(
            url=post.url,
            title=title,
            content=content,
            status_code=200,
            crawled_at=post.published_at or datetime.now(),
            metadata=metadata,
        )

    async def crawl_search_keyword(
        self,
        crawl_config: dict[str, Any] | None = None,
    ) -> list[CrawlResult]:
        """
        基于关键词搜索并抓取结果。

        工作流程：
        1. 从 crawl_config 中提取关键词列表、搜索引擎类型、最大结果数等配置
        2. 使用搜索引擎 API 获取搜索结果 URL 列表
        3. 对 URL 去重
        4. 批量抓取搜索结果页面内容

        Args:
            crawl_config: 采集配置，必须包含:
                - keywords: 关键词列表（必填）
                - search_engine: 搜索引擎类型，"google" 或 "bing"（可选，默认使用配置）
                - max_results: 每个关键词最大结果数（可选，默认 20）
                - language: 语言代码，如 "zh-CN"（可选，默认 "zh-CN"）
                - time_range: 时间范围，"d"/"w"/"m"/"y"（可选）

        Returns:
            CrawlResult 列表，包含所有搜索结果页面的抓取结果
        """
        crawl_config = crawl_config or {}
        keywords = crawl_config.get("keywords", [])
        if not keywords:
            logger.warning("No keywords provided for search crawl")
            return []

        search_engine = crawl_config.get("search_engine")
        max_results = crawl_config.get("max_results", settings.default_max_search_results)
        language = crawl_config.get("language", "zh-CN")
        time_range = crawl_config.get("time_range")

        # 收集所有搜索结果 URL
        all_search_results: list[SearchResult] = []
        seen_urls: set[str] = set()

        # 创建搜索引擎客户端
        try:
            search_client = create_search_client(engine=search_engine)
        except ValueError as e:
            logger.error(f"Failed to create search client: {e}")
            return []

        async with search_client:
            for keyword in keywords:
                logger.info(f"Searching for keyword: '{keyword}' (max_results={max_results})")

                try:
                    results = await search_client.search(
                        query=keyword,
                        max_results=max_results,
                        language=language,
                        time_range=time_range,
                    )

                    # 去重
                    for result in results:
                        if result.url not in seen_urls:
                            seen_urls.add(result.url)
                            all_search_results.append(result)

                    logger.info(
                        f"Keyword '{keyword}': found {len(results)} results, "
                        f"total unique: {len(all_search_results)}"
                    )

                except Exception as e:
                    logger.error(f"Error searching for keyword '{keyword}': {e}")
                    continue

        if not all_search_results:
            logger.warning("No search results found for any keywords")
            return []

        logger.info(
            f"Total unique search results: {len(all_search_results)}, "
            f"starting page crawl..."
        )

        # 批量抓取搜索结果页面
        urls = [result.url for result in all_search_results]
        crawl_results = await self.crawl_multiple_pages_with_config(
            urls=urls,
            crawl_config=crawl_config,
        )

        # 将搜索元数据附加到抓取结果中
        url_to_metadata = {r.url: r.metadata for r in all_search_results}
        for crawl_result in crawl_results:
            if crawl_result.url in url_to_metadata:
                crawl_result.metadata.update(url_to_metadata[crawl_result.url])

        return crawl_results

    async def extract_content(self, html: str, selector: str) -> str:
        from bs4 import BeautifulSoup

        soup = BeautifulSoup(html, "html.parser")
        elements = soup.select(selector)
        return "\n".join(el.get_text(strip=True) for el in elements)

    async def crawl_with_pagination(
        self,
        base_url: str,
        page_param: str = "page",
        max_pages: int = 10,
        stop_condition: Callable | None = None,
        crawl_config: dict[str, Any] | None = None,
    ) -> list[CrawlResult]:
        results = []
        crawl_config = crawl_config or {}

        for page in range(1, max_pages + 1):
            separator = "&" if "?" in base_url else "?"
            url = f"{base_url}{separator}{page_param}={page}"
            result = await self.crawl_single_page(url, crawl_config)
            results.append(result)

            if stop_condition and stop_condition(result):
                break

            if result.error:
                break

        return results

    async def crawl_multi_page(
        self,
        crawl_config: dict[str, Any],
        base_url: str,
    ) -> list[CrawlResult]:
        """
        抓取列表页并批量抓取详情页。

        工作流程：
        1. 遍历列表页（支持分页）
        2. 从每个列表页提取详情页链接
        3. 对链接去重
        4. 批量抓取详情页

        Args:
            crawl_config: 采集配置，必须包含:
                - list_item_selector: 列表项 CSS 选择器
                - link_selector: 链接元素 CSS 选择器
                - content_selector: 详情页内容 CSS 选择器
                - max_pages: 最大页数（可选，默认 5）
                - page_param: 页码参数名（可选，默认 "page"）
            base_url: 列表页基础 URL

        Returns:
            所有详情页的 CrawlResult 列表
        """
        list_item_selector = crawl_config.get("list_item_selector")
        link_selector = crawl_config.get("link_selector")
        content_selector = crawl_config.get("content_selector")
        max_pages = crawl_config.get("max_pages", 5)
        page_param = crawl_config.get("page_param", "page")

        if not list_item_selector or not link_selector:
            logger.error("crawl_config must include list_item_selector and link_selector")
            return []

        # 收集所有详情页链接
        all_raw_urls: list[str] = []

        # 遍历列表页
        for page in range(1, max_pages + 1):
            separator = "&" if "?" in base_url else "?"
            list_url = f"{base_url}{separator}{page_param}={page}"

            logger.info(f"Crawling list page {page}/{max_pages}: {list_url}")
            list_result = await self.crawl_single_page(list_url, crawl_config)

            if list_result.error:
                logger.warning(f"Failed to crawl list page {page}: {list_result.error}")
                break

            if not list_result.html:
                logger.warning(f"No HTML content on list page {page}")
                break

            # 提取详情页链接
            raw_links = extract_links_from_html(
                list_result.html,
                list_item_selector,
                link_selector,
            )

            if not raw_links:
                logger.info(f"No links found on list page {page}, stopping pagination")
                break

            # 标准化 URL
            normalized_links = [
                normalize_url(link, base_url) for link in raw_links
            ]
            all_raw_urls.extend(normalized_links)

            logger.info(
                f"Page {page}: extracted {len(normalized_links)} links, "
                f"total collected: {len(all_raw_urls)}"
            )

        # 去重
        unique_urls = deduplicate_urls(all_raw_urls)
        logger.info(f"Total unique detail URLs: {len(unique_urls)}")

        if not unique_urls:
            logger.warning("No detail URLs found after deduplication")
            return []

        # 批量抓取详情页
        detail_results = await self.crawl_multiple_pages_with_config(
            unique_urls,
            crawl_config,
        )

        return detail_results

    async def crawl_multiple_pages_with_config(
        self,
        urls: list[str],
        crawl_config: dict[str, Any] | None = None,
        concurrency: int | None = None,
    ) -> list[CrawlResult]:
        """
        批量抓取页面，支持自定义配置。

        Args:
            urls: URL 列表
            crawl_config: 采集配置（会传递给每个页面的抓取）
            concurrency: 并发数

        Returns:
            CrawlResult 列表
        """
        concurrency = concurrency or settings.max_concurrent
        semaphore = asyncio.Semaphore(concurrency)

        async def crawl_with_semaphore(url: str) -> CrawlResult:
            async with semaphore:
                return await self.crawl_single_page(url, crawl_config)

        tasks = [crawl_with_semaphore(url) for url in urls]
        return await asyncio.gather(*tasks)