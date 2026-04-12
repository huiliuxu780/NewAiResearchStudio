"use client";

import { Source } from "@/types/entities";
import { companyLabels, sourceTypeLabels, crawlStrategyLabels, socialPlatformLabels, searchEngineLabels, languageLabels, timeRangeLabels } from "@/types/labels";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ExternalLink,
  Calendar,
  Globe,
  FileText,
  Layers,
  Search,
  AtSign,
  Settings,
  Hash,
  Target,
  User,
  Languages,
  Clock,
} from "lucide-react";

interface SourceDetailSheetProps {
  source: Source | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDate(dateString: string | null | undefined) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const strategyIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  single_page: FileText,
  multi_page: Layers,
  search_keyword: Search,
  social_media: AtSign,
};

const strategyDescriptions: Record<string, string> = {
  single_page: "系统将读取指定URL的整个页面内容，适用于单页文档、公告等场景。",
  multi_page: "系统将从列表页提取详情页链接，并逐个采集详情页内容，适用于文章列表、产品目录等场景。",
  search_keyword: "系统将通过指定搜索引擎搜索关键词，并采集搜索结果页面内容，适用于关键词监控场景。",
  social_media: "系统将监控指定社交平台官方账号的动态更新，适用于社交媒体监控场景。",
};

function renderCrawlConfigDetail(source: Source) {
  if (!source.crawl_strategy) {
    return (
      <div className="text-sm text-muted-foreground">
        未配置采集策略
      </div>
    );
  }

  const StrategyIcon = strategyIcons[source.crawl_strategy] || FileText;
  const description = strategyDescriptions[source.crawl_strategy] || "";

  return (
    <div className="space-y-4">
      {/* 策略说明 */}
      <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <StrategyIcon className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">
            {crawlStrategyLabels[source.crawl_strategy] || source.crawl_strategy}
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>

      {/* 具体配置 */}
      <div className="space-y-3">
        {source.crawl_strategy === "single_page" && (
          <div className="flex items-start gap-3">
            <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">采集目标</p>
              <p className="text-sm text-muted-foreground">单页面完整读取</p>
            </div>
          </div>
        )}

        {source.crawl_strategy === "multi_page" && (
          <>
            <div className="flex items-start gap-3">
              <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">列表页 URL</p>
                <p className="text-sm text-muted-foreground break-all">
                  {source.crawl_config?.list_url || "未配置"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Layers className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">列表项 CSS 选择器</p>
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                  {source.crawl_config?.list_item_selector || "未配置"}
                </code>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Target className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">链接 CSS 选择器</p>
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                  {source.crawl_config?.link_selector || "未配置"}
                </code>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">内容 CSS 选择器</p>
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                  {source.crawl_config?.content_selector || "未配置"}
                </code>
              </div>
            </div>
            <Separator className="bg-border/50" />
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start gap-3">
                <Hash className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">最大页数</p>
                  <p className="text-sm text-muted-foreground">
                    {source.crawl_config?.max_pages || "5"} 页
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Settings className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">页码参数名</p>
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                    {source.crawl_config?.page_param || "page"}
                  </code>
                </div>
              </div>
            </div>
            {/* 配置示例 */}
            <div className="rounded-md bg-black/30 p-3 space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">URL 拼接示例：</p>
              <pre className="text-[11px] text-muted-foreground/80 overflow-x-auto leading-relaxed">
{`${source.crawl_config?.list_url || "https://example.com/articles"}?${source.crawl_config?.page_param || "page"}=1
${source.crawl_config?.list_url || "https://example.com/articles"}?${source.crawl_config?.page_param || "page"}=2`}
              </pre>
            </div>
          </>
        )}

        {source.crawl_strategy === "search_keyword" && (
          <>
            <div className="flex items-start gap-3">
              <Search className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">搜索关键词</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {(() => {
                    const keywords = source.crawl_config?.keywords;
                    if (!keywords) return <span className="text-sm text-muted-foreground">未配置</span>;
                    const keywordList = keywords.filter((keyword) => keyword.trim());
                    if (keywordList.length === 0) return <span className="text-sm text-muted-foreground">未配置</span>;
                    return keywordList.map((keyword: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {keyword.trim()}
                      </Badge>
                    ));
                  })()}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">搜索引擎</p>
                <p className="text-sm text-muted-foreground">
                  {source.crawl_config?.search_engine
                    ? searchEngineLabels[source.crawl_config.search_engine] || source.crawl_config.search_engine
                    : "未配置"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Hash className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">最大结果数</p>
                <p className="text-sm text-muted-foreground">
                  {source.crawl_config?.max_results || "20"} 条/关键词
                </p>
              </div>
            </div>
            <Separator className="bg-border/50" />
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start gap-3">
                <Languages className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">语言筛选</p>
                  <p className="text-sm text-muted-foreground">
                    {source.crawl_config?.language
                      ? languageLabels[source.crawl_config.language] || source.crawl_config.language
                      : "不限语言"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">时间范围</p>
                  <p className="text-sm text-muted-foreground">
                    {source.crawl_config?.time_range
                      ? timeRangeLabels[source.crawl_config.time_range] || source.crawl_config.time_range
                      : "不限时间"}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {source.crawl_strategy === "social_media" && (
          <>
            <div className="flex items-start gap-3">
              <AtSign className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">社交平台</p>
                <p className="text-sm text-muted-foreground">
                  {source.social_platform
                    ? socialPlatformLabels[source.social_platform] || source.social_platform
                    : "未配置"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">账号 ID / 用户名</p>
                <p className="text-sm text-muted-foreground">
                  {source.social_account_id || "未配置"}
                </p>
              </div>
            </div>
            {source.crawl_config?.account_url && (
              <div className="flex items-start gap-3">
                <ExternalLink className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">账号主页 URL</p>
                  <a
                    href={source.crawl_config.account_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 break-all"
                  >
                    {source.crawl_config.account_url}
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <Hash className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">最大抓取条数</p>
                <p className="text-sm text-muted-foreground">
                  {source.crawl_config?.max_posts || "20"} 条/次
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function SourceDetailSheet({ source, open, onOpenChange }: SourceDetailSheetProps) {
  if (!source) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[500px] sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle>{source.name}</SheetTitle>
          <SheetDescription>{source.notes || "暂无描述"}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={source.enabled ? "default" : "secondary"}>
              {source.enabled ? "启用" : "停用"}
            </Badge>
            <Badge variant="outline">{companyLabels[source.company] || source.company}</Badge>
            <Badge variant="outline">{sourceTypeLabels[source.source_type] || source.source_type}</Badge>
          </div>

          <Separator />

          <div className="grid gap-3">
            <div className="flex items-start gap-3">
              <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">来源地址</p>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                >
                  {source.url}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">创建时间</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(source.created_at)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">更新时间</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(source.updated_at)}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* 采集策略配置 */}
          <div>
            <p className="text-sm font-medium mb-3 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              采集配置
            </p>
            {renderCrawlConfigDetail(source)}
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium mb-2">备注</p>
            <p className="text-sm text-muted-foreground">{source.notes || "暂无备注"}</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
