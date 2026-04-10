from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any

from bs4 import BeautifulSoup


@dataclass
class ParsedContent:
    title: str = ""
    content: str = ""
    published_at: datetime | None = None
    author: str | None = None
    tags: list[str] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)


class BaseParser(ABC):
    def __init__(self):
        self.soup: BeautifulSoup | None = None

    def parse(self, html: str) -> ParsedContent:
        self.soup = BeautifulSoup(html, "html.parser")
        return self._do_parse()

    @abstractmethod
    def _do_parse(self) -> ParsedContent:
        pass

    def _extract_title(self) -> str:
        if self.soup is None:
            return ""

        title_tag = self.soup.find("title")
        if title_tag:
            return title_tag.get_text(strip=True)

        h1_tag = self.soup.find("h1")
        if h1_tag:
            return h1_tag.get_text(strip=True)

        return ""

    def _extract_meta_content(self, name: str) -> str | None:
        if self.soup is None:
            return None

        meta = self.soup.find("meta", attrs={"name": name})
        if meta and meta.get("content"):
            return meta.get("content")

        meta = self.soup.find("meta", attrs={"property": name})
        if meta and meta.get("content"):
            return meta.get("content")

        return None

    def _extract_published_time(self) -> datetime | None:
        if self.soup is None:
            return None

        time_selectors = [
            ("time", {}),
            ("meta", {"itemprop": "datePublished"}),
            ("meta", {"property": "article:published_time"}),
            ("span", {"class": "date"}),
            ("span", {"class": "published"}),
        ]

        for tag, attrs in time_selectors:
            element = self.soup.find(tag, attrs) if attrs else self.soup.find(tag)
            if element:
                datetime_str = element.get("datetime") or element.get("content") or element.get_text(strip=True)
                if datetime_str:
                    return self._parse_datetime(datetime_str)

        return None

    def _parse_datetime(self, datetime_str: str) -> datetime | None:
        formats = [
            "%Y-%m-%dT%H:%M:%S%z",
            "%Y-%m-%dT%H:%M:%S",
            "%Y-%m-%d %H:%M:%S",
            "%Y-%m-%d",
            "%d/%m/%Y",
            "%B %d, %Y",
            "%b %d, %Y",
        ]

        for fmt in formats:
            try:
                return datetime.strptime(datetime_str.strip(), fmt)
            except ValueError:
                continue

        return None

    def _clean_content(self, text: str) -> str:
        lines = text.split("\n")
        cleaned_lines = []
        for line in lines:
            line = line.strip()
            if line:
                cleaned_lines.append(line)
        return "\n".join(cleaned_lines)

    def _remove_unwanted_elements(self):
        if self.soup is None:
            return

        unwanted_tags = ["script", "style", "nav", "footer", "header", "aside"]
        for tag in unwanted_tags:
            for element in self.soup.find_all(tag):
                element.decompose()

        unwanted_classes = ["sidebar", "advertisement", "ad-", "social-share", "comments"]
        for class_name in unwanted_classes:
            for element in self.soup.find_all(class_=lambda x: x and class_name in x):
                element.decompose()