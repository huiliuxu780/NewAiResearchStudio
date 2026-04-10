# AI 研究平台 - 需求池

## 采集源类型扩展需求

### 需求背景
不同类型的数据源需要不同的采集策略，当前设计需要扩展以支持多种采集模式。

### 需求详情

| 采集类型 | 说明 | 示例 | 技术方案 |
|----------|------|------|----------|
| **搜索关键词** | 通过搜索引擎关键词获取信息 | Google 搜索"通义千问 发布" | SerpAPI / 自建搜索 |
| **整页读取** | 读取单个页面的完整内容 | 官方博客文章、新闻页面 | Crawl4AI 单页抓取 |
| **子页面遍历** | 从列表页进入详情页抓取 | 产品更新日志列表 → 各详情页 | Crawl4AI 多页抓取 |
| **官方号观测** | 监控社交媒体官方账号 | X(Twitter)、微信公众号、微博 | Playwright / 第三方 API |

### 数据模型扩展建议

```python
# Source 模型扩展字段
class SourceType(Enum):
    SEARCH_KEYWORD = "search_keyword"      # 搜索关键词
    SINGLE_PAGE = "single_page"            # 单页面
    MULTI_PAGE = "multi_page"              # 多页面遍历
    SOCIAL_MEDIA = "social_media"          # 社交媒体
    RSS_FEED = "rss_feed"                  # RSS 订阅
    API_ENDPOINT = "api_endpoint"          # API 接口

# 新增字段
class Source:
    # ... 现有字段
    crawl_strategy: str                    # 采集策略
    crawl_config: JSON                     # 采集配置（关键词、选择器等）
    social_platform: str                   # 社交平台（X、微博、微信）
    social_account_id: str                 # 社交账号 ID
```

### 优先级建议

| 优先级 | 类型 | 原因 |
|--------|------|------|
| P0 | 整页读取 | 最基础，覆盖大部分官方文档 |
| P1 | 子页面遍历 | 覆盖更新日志、产品列表 |
| P2 | 搜索关键词 | 需要额外 API，成本较高 |
| P3 | 官方号观测 | 技术复杂度高，可能需要第三方服务 |

### 迭代计划

| Phase | 功能 | 说明 |
|-------|------|------|
| Phase 2 | 整页读取 | Crawl4AI 基础抓取 |
| Phase 2.5 | 子页面遍历 | 列表页 → 详情页 |
| Phase 3 | 搜索关键词 | 接入搜索 API |
| Phase 3.5 | 官方号观测 | 社交媒体监控 |

---

## 其他待记录需求

*在此处添加新需求...*

---

## 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2026-04-10 | 初始版本，记录采集源类型扩展需求 |