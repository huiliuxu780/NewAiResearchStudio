import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any

import httpx

from config import settings

logger = logging.getLogger(__name__)


@dataclass
class SocialPost:
    """社交媒体帖子"""
    platform: str
    account_id: str
    post_id: str
    content: str
    url: str
    published_at: datetime | None = None
    author_name: str = ""
    author_display_name: str = ""
    likes: int = 0
    retweets: int = 0
    comments: int = 0
    media_urls: list[str] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)


class BaseSocialClient(ABC):
    """社交媒体客户端抽象基类"""

    def __init__(self, timeout: float | None = None):
        self.timeout = timeout or settings.social_crawl_timeout
        self._client: httpx.AsyncClient | None = None

    async def __aenter__(self):
        self._client = httpx.AsyncClient(
            timeout=self.timeout,
            headers={
                "User-Agent": settings.user_agent,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
            },
        )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self._client:
            await self._client.aclose()
            self._client = None

    @abstractmethod
    async def fetch_posts(
        self,
        account_id: str,
        max_posts: int = 20,
    ) -> list[SocialPost]:
        """
        抓取指定账号的帖子。

        Args:
            account_id: 账号 ID 或用户名
            max_posts: 最大抓取帖子数

        Returns:
            SocialPost 列表
        """
        ...

    def _ensure_client(self) -> httpx.AsyncClient:
        if self._client is None:
            raise RuntimeError("Social client not initialized. Use async context manager.")
        return self._client

    async def _delay_request(self):
        """请求间隔延迟，避免被封禁"""
        import asyncio
        await asyncio.sleep(settings.social_request_delay)


class TwitterClient(BaseSocialClient):
    """Twitter/X 网页抓取客户端"""

    BASE_URL = "https://twitter.com"

    async def fetch_posts(
        self,
        account_id: str,
        max_posts: int = 20,
    ) -> list[SocialPost]:
        """
        抓取 Twitter/X 账号的推文。

        使用网页抓取方式，无需 API Key。
        注意：Twitter 对未登录用户有限制，可能需要处理登录墙。

        Args:
            account_id: Twitter 用户名（不含 @）
            max_posts: 最大抓取推文数

        Returns:
            SocialPost 列表
        """
        account_id = account_id.lstrip("@")
        url = f"{self.BASE_URL}/{account_id}"
        posts: list[SocialPost] = []

        logger.info(f"Fetching Twitter posts for @{account_id} (max_posts={max_posts})")

        try:
            client = self._ensure_client()

            # 添加额外的请求头以模拟浏览器
            headers = {
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                "Accept-Encoding": "gzip, deflate, br",
                "Connection": "keep-alive",
                "Upgrade-Insecure-Requests": "1",
                "Sec-Fetch-Dest": "document",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-Site": "none",
                "Sec-Fetch-User": "?1",
            }

            response = await client.get(url, headers=headers)
            response.raise_for_status()

            html = response.text
            posts = self._parse_twitter_html(html, account_id)

            # 限制返回数量
            if len(posts) > max_posts:
                posts = posts[:max_posts]

            logger.info(f"Successfully fetched {len(posts)} posts from @{account_id}")

        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                logger.error(f"Twitter account not found: @{account_id}")
            elif e.response.status_code == 403:
                logger.error(f"Twitter access forbidden for @{account_id}, may require login")
            else:
                logger.error(f"Twitter HTTP error for @{account_id}: {e.response.status_code}")
        except httpx.RequestError as e:
            logger.error(f"Twitter request error for @{account_id}: {e}")
        except Exception as e:
            logger.error(f"Twitter unexpected error for @{account_id}: {e}")

        return posts

    def _parse_twitter_html(self, html: str, account_id: str) -> list[SocialPost]:
        """
        解析 Twitter 页面 HTML 提取推文。

        Args:
            html: 页面 HTML 内容
            account_id: Twitter 用户名

        Returns:
            SocialPost 列表
        """
        from bs4 import BeautifulSoup

        posts: list[SocialPost] = []

        try:
            soup = BeautifulSoup(html, "html.parser")

            # Twitter 使用 article 标签包裹推文
            articles = soup.find_all("article", {"data-testid": "tweet"})

            if not articles:
                # 尝试备选选择器
                articles = soup.find_all("article")

            for article in articles:
                try:
                    post = self._extract_tweet(article, account_id)
                    if post:
                        posts.append(post)
                except Exception as e:
                    logger.debug(f"Error extracting tweet: {e}")
                    continue

        except Exception as e:
            logger.error(f"Error parsing Twitter HTML: {e}")

        return posts

    def _extract_tweet(self, article, account_id: str) -> SocialPost | None:
        """
        从单个 article 元素中提取推文信息。

        Args:
            article: BeautifulSoup 的 article 元素
            account_id: Twitter 用户名

        Returns:
            SocialPost 或 None
        """
        try:
            # 提取推文内容
            content_elem = article.find(
                "div",
                {"data-testid": "tweetText"},
            )
            if not content_elem:
                return None

            content = content_elem.get_text(strip=True)
            if not content:
                return None

            # 提取推文链接
            time_elem = article.find("time")
            post_url = ""
            published_at = None

            if time_elem:
                datetime_attr = time_elem.get("datetime")
                if datetime_attr:
                    try:
                        published_at = datetime.fromisoformat(
                            datetime_attr.replace("Z", "+00:00")
                        )
                    except (ValueError, AttributeError):
                        pass

                # 获取推文链接（通常在 time 的父级 a 标签中）
                link_elem = time_elem.find_parent("a")
                if link_elem and link_elem.get("href"):
                    href = link_elem["href"]
                    if href.startswith("/"):
                        post_url = f"{self.BASE_URL}{href}"
                    else:
                        post_url = href

            # 提取推文 ID
            post_id = ""
            if post_url:
                # URL 格式: /username/status/tweet_id
                parts = post_url.rstrip("/").split("/")
                if len(parts) >= 4:
                    post_id = parts[-1]

            # 提取互动数据
            likes = self._extract_count(article, "like")
            retweets = self._extract_count(article, "retweet")
            comments = self._extract_count(article, "reply")

            # 提取媒体 URL
            media_urls = []
            images = article.find_all("img")
            for img in images:
                src = img.get("src")
                if src and "twimg.com" in src:
                    media_urls.append(src)

            return SocialPost(
                platform="twitter",
                account_id=account_id,
                post_id=post_id or f"unknown_{len(post_id)}",
                content=content,
                url=post_url or f"{self.BASE_URL}/{account_id}",
                published_at=published_at,
                author_display_name=account_id,
                likes=likes,
                retweets=retweets,
                comments=comments,
                media_urls=media_urls,
                metadata={
                    "platform": "twitter",
                    "account_id": account_id,
                },
            )

        except Exception as e:
            logger.debug(f"Error extracting tweet details: {e}")
            return None

    def _extract_count(self, article, action_type: str) -> int:
        """
        提取互动数据（点赞、转发、评论数）。

        Args:
            article: BeautifulSoup 元素
            action_type: 操作类型，"like", "retweet", "reply"

        Returns:
            计数值
        """
        try:
            # Twitter 使用 data-testid 属性标识互动按钮
            testid_map = {
                "like": "like",
                "retweet": "retweet",
                "reply": "reply",
            }

            testid = testid_map.get(action_type)
            if not testid:
                return 0

            # 查找包含计数的元素
            count_elem = article.find(
                "span",
                string=lambda text: text and text.strip().isdigit() if text else False,
            )

            # 备选方案：查找 role="group" 内的计数
            if not count_elem:
                group = article.find("div", {"role": "group"})
                if group:
                    spans = group.find_all("span")
                    for span in spans:
                        text = span.get_text(strip=True)
                        if text.isdigit():
                            return int(text)

            if count_elem:
                text = count_elem.get_text(strip=True)
                # 处理 K/M 缩写
                if "K" in text or "k" in text:
                    return int(float(text.lower().replace("k", "")) * 1000)
                elif "M" in text or "m" in text:
                    return int(float(text.lower().replace("m", "")) * 1000000)
                elif text.isdigit():
                    return int(text)

        except Exception:
            pass

        return 0


class WeiboClient(BaseSocialClient):
    """微博网页抓取客户端"""

    BASE_URL = "https://weibo.com"
    MOBILE_BASE_URL = "https://m.weibo.cn"

    async def fetch_posts(
        self,
        account_id: str,
        max_posts: int = 20,
    ) -> list[SocialPost]:
        """
        抓取微博账号的博文。

        使用移动端网页抓取，更容易解析。

        Args:
            account_id: 微博用户 ID（数字 ID 或用户名）
            max_posts: 最大抓取博文数

        Returns:
            SocialPost 列表
        """
        posts: list[SocialPost] = []

        logger.info(f"Fetching Weibo posts for account {account_id} (max_posts={max_posts})")

        try:
            client = self._ensure_client()

            # 尝试使用移动端 API（更容易解析）
            if account_id.isdigit():
                # 数字 ID 使用移动端 API
                url = f"{self.MOBILE_BASE_URL}/api/container/getIndex?type=uid&value={account_id}&containerid=107603{account_id}"
                headers = {
                    "Accept": "application/json, text/plain, */*",
                    "Referer": f"{self.MOBILE_BASE_URL}/u/{account_id}",
                    "X-Requested-With": "XMLHttpRequest",
                }

                response = await client.get(url, headers=headers)
                response.raise_for_status()
                data = response.json()

                posts = self._parse_weibo_api_response(data, account_id, max_posts)
            else:
                # 用户名使用网页抓取
                url = f"{self.MOBILE_BASE_URL}/n/{account_id}"
                headers = {
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                }

                response = await client.get(url, headers=headers)
                response.raise_for_status()

                html = response.text
                posts = self._parse_weibo_html(html, account_id)

                # 限制返回数量
                if len(posts) > max_posts:
                    posts = posts[:max_posts]

            logger.info(f"Successfully fetched {len(posts)} posts from Weibo account {account_id}")

        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                logger.error(f"Weibo account not found: {account_id}")
            else:
                logger.error(f"Weibo HTTP error for {account_id}: {e.response.status_code}")
        except httpx.RequestError as e:
            logger.error(f"Weibo request error for {account_id}: {e}")
        except Exception as e:
            logger.error(f"Weibo unexpected error for {account_id}: {e}")

        return posts

    def _parse_weibo_api_response(
        self,
        data: dict,
        account_id: str,
        max_posts: int,
    ) -> list[SocialPost]:
        """
        解析微博移动端 API 响应。

        Args:
            data: API 响应 JSON 数据
            account_id: 微博用户 ID
            max_posts: 最大帖子数

        Returns:
            SocialPost 列表
        """
        posts: list[SocialPost] = []

        try:
            cards = data.get("data", {}).get("cards", [])

            for card in cards:
                if len(posts) >= max_posts:
                    break

                if card.get("card_type") != 9:
                    continue

                mblog = card.get("mblog", {})
                if not mblog:
                    continue

                post = self._extract_weibo_post(mblog, account_id)
                if post:
                    posts.append(post)

        except Exception as e:
            logger.error(f"Error parsing Weibo API response: {e}")

        return posts

    def _extract_weibo_post(self, mblog: dict, account_id: str) -> SocialPost | None:
        """
        从微博 API 的 mblog 对象中提取帖子信息。

        Args:
            mblog: 微博博文数据对象
            account_id: 微博用户 ID

        Returns:
            SocialPost 或 None
        """
        try:
            post_id = mblog.get("id", "")
            if not post_id:
                return None

            # 提取文本内容（去除 HTML 标签）
            text = mblog.get("text", "")
            if not text:
                text = mblog.get("raw_text", "")

            # 清理 HTML 标签
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(text, "html.parser")
            content = soup.get_text(strip=True)

            if not content:
                return None

            # 提取发布时间
            published_at = None
            created_at = mblog.get("created_at")
            if created_at:
                try:
                    # 微博时间格式: "Wed Mar 15 12:30:00 +0800 2023"
                    published_at = datetime.strptime(
                        created_at, "%a %b %d %H:%M:%S %z %Y"
                    )
                except (ValueError, TypeError):
                    pass

            # 提取互动数据
            attitudes_count = mblog.get("attitudes_count", 0)  # 点赞
            reposts_count = mblog.get("reposts_count", 0)  # 转发
            comments_count = mblog.get("comments_count", 0)  # 评论

            # 提取作者信息
            user = mblog.get("user", {})
            author_name = user.get("screen_name", account_id)

            # 提取媒体 URL
            media_urls = []
            pics = mblog.get("pics", [])
            for pic in pics:
                url = pic.get("url")
                if url:
                    media_urls.append(url)

            # 构建帖子 URL
            post_url = f"{self.BASE_URL}/{account_id}/{post_id}"

            return SocialPost(
                platform="weibo",
                account_id=account_id,
                post_id=post_id,
                content=content,
                url=post_url,
                published_at=published_at,
                author_name=author_name,
                author_display_name=author_name,
                likes=int(attitudes_count) if attitudes_count else 0,
                retweets=int(reposts_count) if reposts_count else 0,
                comments=int(comments_count) if comments_count else 0,
                media_urls=media_urls,
                metadata={
                    "platform": "weibo",
                    "account_id": account_id,
                    "user_info": user,
                },
            )

        except Exception as e:
            logger.debug(f"Error extracting Weibo post: {e}")
            return None

    def _parse_weibo_html(self, html: str, account_id: str) -> list[SocialPost]:
        """
        解析微博网页 HTML 提取博文。

        Args:
            html: 页面 HTML 内容
            account_id: 微博用户名

        Returns:
            SocialPost 列表
        """
        from bs4 import BeautifulSoup

        posts: list[SocialPost] = []

        try:
            soup = BeautifulSoup(html, "html.parser")

            # 微博移动端使用 card-wrap 或 weibo-cell 包裹博文
            cards = soup.find_all("div", class_="card-wrap")
            if not cards:
                cards = soup.find_all("div", class_="weibo-cell")
            if not cards:
                # 备选：查找包含微博内容的 div
                cards = soup.find_all("div", {"action-type": "feed_list_item"})

            for card in cards:
                try:
                    post = self._extract_weibo_from_html(card, account_id)
                    if post:
                        posts.append(post)
                except Exception as e:
                    logger.debug(f"Error extracting Weibo post from HTML: {e}")
                    continue

        except Exception as e:
            logger.error(f"Error parsing Weibo HTML: {e}")

        return posts

    def _extract_weibo_from_html(self, card, account_id: str) -> SocialPost | None:
        """
        从单个卡片元素中提取微博信息。

        Args:
            card: BeautifulSoup 元素
            account_id: 微博用户名

        Returns:
            SocialPost 或 None
        """
        try:
            # 提取文本内容
            content_elem = card.find("div", class_="weibo-text")
            if not content_elem:
                content_elem = card.find("p", class_="txt")
            if not content_elem:
                return None

            from bs4 import BeautifulSoup
            soup = BeautifulSoup(str(content_elem), "html.parser")
            content = soup.get_text(strip=True)

            if not content:
                return None

            # 提取发布时间
            published_at = None
            time_elem = card.find("time")
            if time_elem:
                datetime_attr = time_elem.get("datetime")
                if datetime_attr:
                    try:
                        published_at = datetime.fromisoformat(
                            datetime_attr.replace("Z", "+00:00")
                        )
                    except (ValueError, AttributeError):
                        pass

            # 提取互动数据
            likes = 0
            retweets = 0
            comments = 0

            # 查找互动数据元素
            like_elem = card.find("em", class_="like-count")
            if like_elem:
                try:
                    likes = int(like_elem.get_text(strip=True))
                except (ValueError, TypeError):
                    pass

            return SocialPost(
                platform="weibo",
                account_id=account_id,
                post_id=f"unknown_{len(posts)}",
                content=content,
                url=f"{self.BASE_URL}/{account_id}",
                published_at=published_at,
                author_display_name=account_id,
                likes=likes,
                retweets=retweets,
                comments=comments,
                metadata={
                    "platform": "weibo",
                    "account_id": account_id,
                },
            )

        except Exception as e:
            logger.debug(f"Error extracting Weibo post details: {e}")
            return None


class WeChatClient(BaseSocialClient):
    """微信公众号网页抓取客户端（可选实现）"""

    BASE_URL = "https://mp.weixin.qq.com"

    async def fetch_posts(
        self,
        account_id: str,
        max_posts: int = 20,
    ) -> list[SocialPost]:
        """
        抓取微信公众号文章。

        注意：微信公众号抓取较为复杂，通常需要：
        1. 搜狗微信搜索（已失效）
        2. 微信公众号 RSS 服务
        3. 第三方数据服务

        这里提供基础框架，实际使用需要额外配置。

        Args:
            account_id: 公众号名称或 ID
            max_posts: 最大抓取文章数

        Returns:
            SocialPost 列表
        """
        logger.warning(
            f"WeChat official account crawling requires additional configuration. "
            f"Account: {account_id}"
        )
        return []


def create_social_client(
    platform: str,
    **kwargs: Any,
) -> BaseSocialClient:
    """
    工厂函数：根据平台类型创建对应的社交媒体客户端。

    Args:
        platform: 平台类型，"twitter", "weibo", "wechat"
        **kwargs: 传递给具体客户端的额外参数

    Returns:
        BaseSocialClient 实例

    Raises:
        ValueError: 不支持的平台类型
    """
    platform = platform.lower()

    if platform == "twitter":
        return TwitterClient(**kwargs)
    elif platform == "weibo":
        return WeiboClient(**kwargs)
    elif platform == "wechat":
        return WeChatClient(**kwargs)
    else:
        raise ValueError(
            f"Unsupported social media platform: {platform}. "
            f"Use 'twitter', 'weibo', or 'wechat'."
        )
