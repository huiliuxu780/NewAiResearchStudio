import asyncio
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any

from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig
from crawl4ai.content_filter_strategy import PruningContentFilter
from crawl4ai.markdown_generation_strategy import DefaultMarkdownGenerator

from config import settings


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

    async def crawl_single_page(self, url: str) -> CrawlResult:
        result = CrawlResult(url=url)

        try:
            if self._crawler is None:
                await self.start()

            crawl_result = await self._crawler.arun(
                url=url,
                config=self._run_config,
            )

            if crawl_result.success:
                result.title = crawl_result.metadata.get("title", "") if crawl_result.metadata else ""
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
        stop_condition: callable | None = None,
    ) -> list[CrawlResult]:
        results = []

        for page in range(1, max_pages + 1):
            separator = "&" if "?" in base_url else "?"
            url = f"{base_url}{separator}{page_param}={page}"
            result = await self.crawl_single_page(url)
            results.append(result)

            if stop_condition and stop_condition(result):
                break

            if result.error:
                break

        return results