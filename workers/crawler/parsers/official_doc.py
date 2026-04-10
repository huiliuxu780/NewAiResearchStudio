from datetime import datetime

from .base import BaseParser, ParsedContent


class OfficialDocParser(BaseParser):
    def _do_parse(self) -> ParsedContent:
        content = ParsedContent()

        content.title = self._extract_title()

        self._remove_unwanted_elements()

        content.published_at = self._extract_published_time()

        content.author = self._extract_meta_content("author")

        main_content = self._extract_main_content()
        content.content = self._clean_content(main_content)

        content.tags = self._extract_tags()

        content.metadata = {
            "doc_type": self._extract_meta_content("doc-type"),
            "version": self._extract_meta_content("version"),
            "category": self._extract_meta_content("category"),
        }

        return content

    def _extract_main_content(self) -> str:
        if self.soup is None:
            return ""

        selectors = [
            ("article", {}),
            ("div", {"class": "documentation"}),
            ("div", {"class": "docs-content"}),
            ("div", {"class": "content"}),
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

        tag_elements = self.soup.find_all("a", class_="tag")
        for el in tag_elements:
            tag_text = el.get_text(strip=True)
            if tag_text and tag_text not in tags:
                tags.append(tag_text)

        return tags