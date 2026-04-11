import hashlib
import logging
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any

import httpx

from config import settings
from crawler import CrawlerService, CrawlResult
from parsers import BaseParser, BlogParser, NewsParser, OfficialDocParser, ParsedContent

logger = logging.getLogger(__name__)


@dataclass
class Source:
    id: str
    name: str
    company: str
    source_type: str
    url: str
    enabled: bool = True
    schedule: str | None = None
    parser_type: str | None = None
    priority: str = "medium"
    notes: str | None = None
    # 采集策略相关字段
    crawl_strategy: str = "single_page"
    crawl_config: dict[str, Any] = field(default_factory=dict)
    social_platform: str | None = None
    social_account_id: str | None = None


@dataclass
class RawRecord:
    source_id: str
    company: str
    title: str
    url: str
    published_at: datetime | None = None
    raw_content: str | None = None
    raw_html_snapshot: str | None = None
    content_hash: str | None = None
    language: str | None = None
    crawl_status: str = "pending"
    dedupe_status: str = "pending"
    error_message: str | None = None


class APIClient:
    def __init__(self, base_url: str = None):
        self.base_url = base_url or settings.api_base_url
        self._client: httpx.AsyncClient | None = None

    async def __aenter__(self):
        self._client = httpx.AsyncClient(
            timeout=30.0,
            headers=settings.api_headers,
        )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self._client:
            await self._client.aclose()
            self._client = None

    async def update_crawl_task_status(
        self,
        task_id: str,
        status: str,
        records_count: int | None = None,
        error_message: str | None = None,
    ) -> bool:
        """更新抓取任务状态到API"""
        try:
            payload: dict[str, Any] = {"status": status}
            if records_count is not None:
                payload["records_count"] = records_count
            if error_message is not None:
                payload["error_message"] = error_message

            response = await self._client.patch(
                f"{settings.crawl_tasks_url}{task_id}/status",
                json=payload,
            )
            response.raise_for_status()
            logger.info(f"Updated task {task_id} status to '{status}'")
            return True
        except Exception as e:
            logger.error(f"Failed to update task {task_id} status: {e}")
            return False

    async def get_sources(self, enabled_only: bool = True) -> list[Source]:
        params = {}
        if enabled_only:
            params["enabled"] = "true"

        response = await self._client.get(
            settings.sources_url,
            params=params,
        )
        response.raise_for_status()
        data = response.json()

        sources = []
        for item in data.get("items", []):
            sources.append(Source(
                id=item["id"],
                name=item["name"],
                company=item["company"],
                source_type=item["source_type"],
                url=item["url"],
                enabled=item.get("enabled", True),
                schedule=item.get("schedule"),
                parser_type=item.get("parser_type"),
                priority=item.get("priority", "medium"),
                notes=item.get("notes"),
                crawl_strategy=item.get("crawl_strategy", "single_page"),
                crawl_config=item.get("crawl_config", {}),
                social_platform=item.get("social_platform"),
                social_account_id=item.get("social_account_id"),
            ))
        return sources

    async def get_source(self, source_id: str) -> Source | None:
        response = await self._client.get(f"{settings.sources_url}{source_id}")
        if response.status_code == 404:
            return None
        response.raise_for_status()
        data = response.json()
        return Source(
            id=data["id"],
            name=data["name"],
            company=data["company"],
            source_type=data["source_type"],
            url=data["url"],
            enabled=data.get("enabled", True),
            schedule=data.get("schedule"),
            parser_type=data.get("parser_type"),
            priority=data.get("priority", "medium"),
            notes=data.get("notes"),
            crawl_strategy=data.get("crawl_strategy", "single_page"),
            crawl_config=data.get("crawl_config", {}),
            social_platform=data.get("social_platform"),
            social_account_id=data.get("social_account_id"),
        )

    async def create_raw_record(self, record: RawRecord) -> dict:
        payload = {
            "source_id": record.source_id,
            "company": record.company,
            "title": record.title,
            "url": record.url,
            "published_at": record.published_at.isoformat() if record.published_at else None,
            "raw_content": record.raw_content,
            "raw_html_snapshot": record.raw_html_snapshot,
            "content_hash": record.content_hash,
            "language": record.language,
        }
        response = await self._client.post(
            settings.raw_records_url,
            json=payload,
        )
        response.raise_for_status()
        return response.json()

    async def create_raw_records(self, records: list[RawRecord]) -> list[dict]:
        """
        批量创建 RawRecord。

        Args:
            records: RawRecord 列表

        Returns:
            创建结果列表
        """
        results = []
        for record in records:
            try:
                result = await self.create_raw_record(record)
                results.append(result)
            except Exception as e:
                logger.error(f"Failed to create raw record for {record.url}: {e}")
                results.append({"error": str(e), "url": record.url})
        return results


class CrawlTask:
    PARSER_MAP: dict[str, type[BaseParser]] = {
        "official_doc": OfficialDocParser,
        "blog": BlogParser,
        "news": NewsParser,
    }

    def __init__(self):
        self.api_client = APIClient()
        self.crawler = CrawlerService()

    def _get_parser(self, parser_type: str | None) -> BaseParser:
        if parser_type and parser_type in self.PARSER_MAP:
            return self.PARSER_MAP[parser_type]()
        return OfficialDocParser()

    async def _crawl_by_strategy(
        self,
        crawler: CrawlerService,
        source: Source,
    ) -> list[CrawlResult]:
        """
        根据采集策略执行不同的采集方法。

        Args:
            crawler: CrawlerService 实例
            source: Source 数据源对象

        Returns:
            采集结果列表
        """
        strategy = source.crawl_strategy
        crawl_config = source.crawl_config or {}

        if strategy == "single_page":
            result = await crawler.crawl_single_page(source.url, crawl_config)
            return [result]

        elif strategy == "multi_page":
            # 列表页解析 + 详情页批量抓取
            # 需要 crawl_config 包含:
            #   - list_item_selector: 列表项 CSS 选择器
            #   - link_selector: 链接元素 CSS 选择器
            #   - content_selector: 详情页内容 CSS 选择器（可选）
            #   - max_pages: 最大页数（可选，默认 5）
            #   - page_param: 页码参数名（可选，默认 "page"）
            results = await crawler.crawl_multi_page(
                crawl_config=crawl_config,
                base_url=source.url,
            )
            return results

        elif strategy == "search_keyword":
            # 关键词搜索策略：使用搜索引擎 API 获取结果并抓取
            # 需要 crawl_config 包含:
            #   - keywords: 关键词列表（必填）
            #   - search_engine: 搜索引擎类型，"google" 或 "bing"（可选）
            #   - max_results: 每个关键词最大结果数（可选，默认 20）
            #   - language: 语言代码（可选，默认 "zh-CN"）
            #   - time_range: 时间范围 "d"/"w"/"m"/"y"（可选）
            results = await crawler.crawl_search_keyword(crawl_config)
            return results

        elif strategy == "social_media":
            # 社交媒体策略：使用专门的社交媒体客户端抓取
            # 需要 crawl_config 包含:
            #   - platform: 社交媒体平台，"twitter", "weibo", "wechat"（必填）
            #   - account_id: 账号 ID 或用户名（必填）
            #   - account_url: 账号主页 URL（可选）
            #   - max_posts: 最大抓取帖子数（可选，默认 20）
            results = await crawler.crawl_social_media(crawl_config)
            return results

        else:
            # 默认使用 single_page 策略
            logger.warning(f"Unknown crawl strategy: {strategy}, falling back to single_page")
            result = await crawler.crawl_single_page(source.url, crawl_config)
            return [result]

    def _compute_content_hash(self, content: str) -> str:
        return hashlib.sha256(content.encode("utf-8")).hexdigest()

    def _detect_language(self, content: str) -> str:
        if not content:
            return "unknown"
        chinese_chars = sum(1 for c in content if "\u4e00" <= c <= "\u9fff")
        total_chars = len(content)
        if total_chars > 0 and chinese_chars / total_chars > 0.1:
            return "zh"
        return "en"

    async def _build_raw_record(
        self,
        source: Source,
        result: CrawlResult,
        parser: BaseParser,
    ) -> RawRecord:
        """构建 RawRecord 对象"""
        parsed = parser.parse(result.html)
        content = parsed.content or result.content

        return RawRecord(
            source_id=source.id,
            company=source.company,
            title=parsed.title or result.title or source.name,
            url=result.url,
            published_at=parsed.published_at,
            raw_content=content,
            raw_html_snapshot=result.html,
            content_hash=self._compute_content_hash(content),
            language=self._detect_language(content),
            crawl_status="success",
            dedupe_status="pending",
        )

    async def crawl_source(
        self,
        source_id: str,
        crawl_task_id: str | None = None,
    ) -> RawRecord | None:
        """
        抓取单个数据源，支持可选的任务ID追踪。

        Args:
            source_id: 数据源ID
            crawl_task_id: 可选的抓取任务ID，用于状态追踪
        """
        async with self.api_client as api:
            source = await api.get_source(source_id)
            if not source:
                logger.error(f"Source not found: {source_id}")
                if crawl_task_id:
                    await api.update_crawl_task_status(
                        crawl_task_id, "failed",
                        error_message=f"Source not found: {source_id}",
                    )
                return None

            if not source.enabled:
                logger.warning(f"Source is disabled: {source_id}")
                if crawl_task_id:
                    await api.update_crawl_task_status(
                        crawl_task_id, "failed",
                        error_message=f"Source is disabled: {source_id}",
                    )
                return None

            # 更新任务状态为 running
            if crawl_task_id:
                await api.update_crawl_task_status(crawl_task_id, "running")

            try:
                async with self.crawler as crawler:
                    results = await self._crawl_by_strategy(crawler, source)

                    # 检查是否有错误结果
                    errors = [r for r in results if r.error]
                    if errors and not any(r for r in results if not r.error):
                        if crawl_task_id:
                            await api.update_crawl_task_status(
                                crawl_task_id, "failed",
                                records_count=0,
                                error_message=errors[0].error,
                            )
                        return RawRecord(
                            source_id=source.id,
                            company=source.company,
                            title=source.name,
                            url=source.url,
                            crawl_status="failed",
                            error_message=errors[0].error,
                        )

                    parser = self._get_parser(source.parser_type)
                    saved_count = 0

                    for result in results:
                        if result.error:
                            logger.warning(f"Error crawling {result.url}: {result.error}")
                            continue

                        raw_record = await self._build_raw_record(source, result, parser)
                        saved = await self.save_raw_record(raw_record, api)
                        if saved:
                            saved_count += 1

                    if saved_count > 0:
                        logger.info(f"Successfully crawled and saved {saved_count} record(s) from: {source.name}")

                    # 更新任务状态为 completed
                    if crawl_task_id:
                        await api.update_crawl_task_status(
                            crawl_task_id, "completed",
                            records_count=saved_count,
                        )

                    # 返回第一个成功的 record
                    return RawRecord(
                        source_id=source.id,
                        company=source.company,
                        title=source.name,
                        url=source.url,
                        crawl_status="success" if saved_count > 0 else "failed",
                    )

            except Exception as e:
                logger.error(f"Error crawling source {source_id}: {e}")
                if crawl_task_id:
                    await api.update_crawl_task_status(
                        crawl_task_id, "failed",
                        records_count=0,
                        error_message=str(e),
                    )
                return RawRecord(
                    source_id=source.id,
                    company=source.company,
                    title=source.name,
                    url=source.url,
                    crawl_status="failed",
                    error_message=str(e),
                )

    async def crawl_all_sources(self) -> list[RawRecord]:
        """抓取所有启用的数据源（不带任务追踪）"""
        results = []
        async with self.api_client as api:
            sources = await api.get_sources(enabled_only=True)

            if not sources:
                logger.info("No enabled sources found")
                return results

            async with self.crawler as crawler:
                for source in sources:
                    try:
                        crawl_results = await self._crawl_by_strategy(crawler, source)

                        # 过滤掉错误的结果
                        successful_results = [r for r in crawl_results if not r.error]
                        error_results = [r for r in crawl_results if r.error]

                        if error_results:
                            for err_result in error_results:
                                logger.warning(f"Error crawling {err_result.url}: {err_result.error}")
                                results.append(RawRecord(
                                    source_id=source.id,
                                    company=source.company,
                                    title=source.name,
                                    url=err_result.url,
                                    crawl_status="failed",
                                    error_message=err_result.error,
                                ))

                        if not successful_results:
                            continue

                        parser = self._get_parser(source.parser_type)
                        for result in successful_results:
                            raw_record = await self._build_raw_record(
                                source, result, parser
                            )
                            saved = await self.save_raw_record(raw_record, api)
                            if saved:
                                logger.info(f"Successfully crawled: {source.name} - {result.url}")
                            results.append(raw_record)

                    except Exception as e:
                        logger.error(f"Error crawling {source.name}: {e}")
                        results.append(RawRecord(
                            source_id=source.id,
                            company=source.company,
                            title=source.name,
                            url=source.url,
                            crawl_status="failed",
                            error_message=str(e),
                        ))

        return results

    async def save_raw_record(self, record: RawRecord, api: APIClient | None = None) -> bool:
        try:
            if api:
                await api.create_raw_record(record)
            else:
                async with self.api_client as new_api:
                    await new_api.create_raw_record(record)
            return True
        except Exception as e:
            logger.error(f"Failed to save raw record: {e}")
            return False
