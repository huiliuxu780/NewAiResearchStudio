from datetime import datetime

from .base import BaseParser, ParsedContent


class BlogParser(BaseParser):
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
            "reading_time": self._estimate_reading_time(content.content),
            "word_count": len(content.content.split()),
        }

        return content

    def _extract_author(self) -> str | None:
        if self.soup is None:
            return None

        author_selectors = [
            ("meta", {"name": "author"}),
            ("meta", {"property": "article:author"}),
            ("span", {"class": "author"}),
            ("div", {"class": "author-name"}),
            ("a", {"rel": "author"}),
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
            ("div", {"class": "post-content"}),
            ("div", {"class": "entry-content"}),
            ("div", {"class": "article-content"}),
            ("div", {"class": "blog-content"}),
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

    def _extract_tags(self) -> list[str]:
        if self.soup is None:
            return []

        tags = []

        keywords = self._extract_meta_content("keywords")
        if keywords:
            tags.extend([k.strip() for k in keywords.split(",") if k.strip()])

        tag_selectors = [
            ("a", {"rel": "tag"}),
            ("span", {"class": "tag"}),
            ("a", {"class": "tag"}),
        ]

        for tag, attrs in tag_selectors:
            elements = self.soup.find_all(tag, attrs)
            for el in elements:
                tag_text = el.get_text(strip=True)
                if tag_text and tag_text not in tags:
                    tags.append(tag_text)

        return tags

    def _estimate_reading_time(self, text: str) -> int:
        words = len(text.split())
        words_per_minute = 200
        return max(1, words // words_per_minute)