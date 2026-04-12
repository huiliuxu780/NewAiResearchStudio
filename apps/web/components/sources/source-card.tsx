"use client";

import { Source } from "@/types/entities";
import { companyLabels, sourceTypeLabels, crawlStrategyLabels, socialPlatformLabels } from "@/types/labels";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Layers,
  Search,
  AtSign,
  MoreVertical,
  ExternalLink,
  Pencil,
  Trash2,
  Power,
  PowerOff,
} from "lucide-react";

interface SourceCardProps {
  source: Source;
  onToggleStatus: (source: Source) => void;
  onEdit: (source: Source) => void;
  onDelete: (source: Source) => void;
  onViewDetail: (source: Source) => void;
}

const strategyIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  single_page: FileText,
  multi_page: Layers,
  search_keyword: Search,
  social_media: AtSign,
};

const strategyColors: Record<string, string> = {
  single_page: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  multi_page: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  search_keyword: "bg-green-500/10 text-green-400 border-green-500/20",
  social_media: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

function getCrawlConfigSummary(source: Source): string {
  if (!source.crawl_strategy) return "";

  switch (source.crawl_strategy) {
    case "single_page":
      return "单页面采集";

    case "multi_page": {
      const config = source.crawl_config || {};
      const parts: string[] = [];
      if (config.max_pages) parts.push(`最多 ${config.max_pages} 页`);
      if (config.detail_selector) parts.push("已配置选择器");
      return parts.length > 0 ? parts.join(" · ") : "列表页遍历";
    }

    case "search_keyword": {
      const config = source.crawl_config || {};
      const parts: string[] = [];
      if (config.keywords && config.keywords.length > 0) {
        const keywords = config.keywords.slice(0, 2);
        parts.push(keywords.join(", "));
      }
      if (config.search_engine) parts.push(config.search_engine);
      return parts.length > 0 ? parts.join(" · ") : "关键词搜索";
    }

    case "social_media": {
      const parts: string[] = [];
      if (source.social_platform) {
        parts.push(socialPlatformLabels[source.social_platform] || source.social_platform);
      }
      if (source.social_account_id) {
        parts.push(source.social_account_id);
      }
      return parts.length > 0 ? parts.join(" · ") : "社交平台观测";
    }

    default:
      return "";
  }
}

export function SourceCard({ source, onToggleStatus, onEdit, onDelete, onViewDetail }: SourceCardProps) {
  const StrategyIcon = strategyIcons[source.crawl_strategy || "single_page"] || FileText;
  const strategyColor = strategyColors[source.crawl_strategy || "single_page"] || strategyColors.single_page;
  const configSummary = getCrawlConfigSummary(source);

  return (
    <Card
      className="group cursor-pointer transition-all hover:ring-2 hover:ring-primary/20 hover:shadow-lg"
      onClick={() => onViewDetail(source)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="truncate">{source.name}</CardTitle>
            <CardDescription className="mt-1 truncate">{source.notes || "暂无描述"}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewDetail(source); }}>
                <ExternalLink className="mr-2 h-4 w-4" />
                查看详情
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(source); }}>
                <Pencil className="mr-2 h-4 w-4" />
                编辑
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onToggleStatus(source); }}>
                {source.enabled ? (
                  <>
                    <PowerOff className="mr-2 h-4 w-4" />
                    停用
                  </>
                ) : (
                  <>
                    <Power className="mr-2 h-4 w-4" />
                    启用
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => { e.stopPropagation(); onDelete(source); }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant={source.enabled ? "default" : "secondary"} className="text-xs">
            {source.enabled ? "启用" : "停用"}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {companyLabels[source.company] || source.company}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {sourceTypeLabels[source.source_type] || source.source_type}
          </Badge>
        </div>

        {/* 采集策略标签 */}
        {source.crawl_strategy && (
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className={`text-xs ${strategyColor}`}
            >
              <StrategyIcon className="h-3 w-3 mr-1" />
              {crawlStrategyLabels[source.crawl_strategy] || source.crawl_strategy}
            </Badge>
          </div>
        )}

        {/* 采集配置摘要 */}
        {configSummary && (
          <p className="text-xs text-muted-foreground truncate">
            {configSummary}
          </p>
        )}

        {/* URL */}
        <div className="flex items-center gap-1 mt-2">
          <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-primary truncate transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {source.url}
          </a>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
          <span>优先级: {source.priority}</span>
          <span>{source.schedule || "未设置频率"}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
