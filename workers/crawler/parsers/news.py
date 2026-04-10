from datetime import datetime

from .base import BaseParser, ParsedContent


class NewsParser(BaseParser):
    def _do_parse(self) -> ParsedContent:
        content = ParsedContent()

        content.title = self._extract_title()

        self._remove_unwanted_elements()

        content.published_at = self._extract_published_time()

        content.author = self._extract_author()

        main_content = self._extract_main_content()
        content.content = self._clean_content(main_content)

        content.tags = self._extract_tags()

        content.metadata = {
            "source": self._extract_source(),
            "category": self._extract_category(),
            "location": self._extract_location(),
        }

        return content

    def _extract_author(self) -> str | None:
        if self.soup is None:
            return None

        author_selectors = [
            ("meta", {"name": "author"}),
            ("meta", {"property": "article:author"}),
            ("span", {"class": "author"}),
            ("span", {"class": "byline"}),
            ("div", {"class": "author-name"}),
        ]

        for tag, attrs in author_selectors:
            element = self.soup.find(tag, attrs)
            if element:
                if tag == "meta":
                    return element.get("content")
                return element.get_text(strip=True)

        return None

    def _extract_main_content(self) -> str:
        if self.soup is None:
            return ""

        selectors = [
            ("article", {}),
            ("div", {"class": "article-body"}),
            ("div", {"class": "news-content"}),
            ("div", {"class": "story-content"}),
            ("div", {"itemprop": "articleBody"}),
            ("main", {}),
        ]

        for tag, attrs in selectors:
            element = self.soup.find(tag, attrs) if attrs else self.soup.find(tag)
            if element:
                return element.get_text(separator="\n", strip=True)

        body = self.soup.find("body")
        if body:
            return body.get_text(separator="\n", strip=True)

        return ""

    def _extract_source(self) -> str | None:
        if self.soup is None:
            return None

        source_selectors = [
            ("meta", {"name": "source"}),
            ("meta", {"property": "article:source"}),
            ("span", {"class": "source"}),
            ("span", {"class": "publication"}),
        ]

        for tag, attrs in source_selectors:
            element = self.soup.find(tag, attrs)
            if element:
                if tag == "meta":
                    return element.get("content")
                return element.get_text(strip=True)

        return None

    def _extract_category(self) -> str | None:
        if self.soup is None:
            return None

        category_selectors = [
            ("meta", {"name": "category"}),
            ("meta", {"property": "article:section"}),
            ("span", {"class": "category"}),
            ("a", {"class": "category"}),
        ]

        for tag, attrs in category_selectors:
            element = self.soup.find(tag, attrs)
            if element:
                if tag == "meta":
                    return element.get("content")
                return element.get_text(strip=True)

        return None

    def _extract_location(self) -> str | None:
        if self.soup is None:
            return None

        location_selectors = [
            ("meta", {"name": "location"}),
            ("span", {"class": "location"}),
            ("span", {"class": "dateline"}),
        ]

        for tag, attrs in location_selectors:
            element = self.soup.find(tag, attrs)
            if element:
                if tag == "meta":
                    return element.get("content")
                return element.get_text(strip=True)

        return None

    def _extract_tags(self) -> list[str]:
        if self.soup is None:
            return []

        tags = []

        keywords = self._extract_meta_content("keywords")
        if keywords:
            tags.extend([k.strip() for k in keywords.split(",") if k.strip()])

        news_keywords = self._extract_meta_content("news_keywords")
        if news_keywords:
            tags.extend([k.strip() for k in news_keywords.split(",") if k.strip()])

        return list(dict.fromkeys(tags))