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
        self._client = httpx.AsyncClient(timeout=30.0)
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self._client:
            await self._client.aclose()
            self._client = None

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

    async def crawl_source(self, source_id: str) -> RawRecord | None:
        async with self.api_client as api:
            source = await api.get_source(source_id)
            if not source:
                logger.error(f"Source not found: {source_id}")
                return None

            if not source.enabled:
                logger.warning(f"Source is disabled: {source_id}")
                return None

            async with self.crawler as crawler:
                result = await crawler.crawl_single_page(source.url)

                if result.error:
                    return RawRecord(
                        source_id=source.id,
                        company=source.company,
                        title=source.name,
                        url=source.url,
                        crawl_status="failed",
                        error_message=result.error,
                    )

                parser = self._get_parser(source.parser_type)
                parsed = parser.parse(result.html)

                raw_record = RawRecord(
                    source_id=source.id,
                    company=source.company,
                    title=parsed.title or result.title or source.name,
                    url=result.url,
                    published_at=parsed.published_at,
                    raw_content=parsed.content or result.content,
                    raw_html_snapshot=result.html,
                    content_hash=self._compute_content_hash(parsed.content or result.content),
                    language=self._detect_language(parsed.content or result.content),
                    crawl_status="success",
                )

                saved = await self.save_raw_record(raw_record, api)
                if saved:
                    logger.info(f"Successfully crawled and saved: {source.name}")
                return raw_record

    async def crawl_all_sources(self) -> list[RawRecord]:
        results = []
        async with self.api_client as api:
            sources = await api.get_sources(enabled_only=True)

            if not sources:
                logger.info("No enabled sources found")
                return results

            async with self.crawler as crawler:
                for source in sources:
                    try:
                        result = await crawler.crawl_single_page(source.url)

                        if result.error:
                            raw_record = RawRecord(
                                source_id=source.id,
                                company=source.company,
                                title=source.name,
                                url=source.url,
                                crawl_status="failed",
                                error_message=result.error,
                            )
                        else:
                            parser = self._get_parser(source.parser_type)
                            parsed = parser.parse(result.html)

                            raw_record = RawRecord(
                                source_id=source.id,
                                company=source.company,
                                title=parsed.title or result.title or source.name,
                                url=result.url,
                                published_at=parsed.published_at,
                                raw_content=parsed.content or result.content,
                                raw_html_snapshot=result.html,
                                content_hash=self._compute_content_hash(parsed.content or result.content),
                                language=self._detect_language(parsed.content or result.content),
                                crawl_status="success",
                            )

                        saved = await self.save_raw_record(raw_record, api)
                        if saved:
                            logger.info(f"Successfully crawled: {source.name}")
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