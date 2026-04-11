"use client";

import { Source } from "@/types/entities";
import { companyLabels, sourceTypeLabels, priorityLabels, crawlStrategyLabels } from "@/types/labels";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Pencil, Trash2, FileText, Layers, Search, AtSign } from "lucide-react";

interface SourceTableProps {
  data: Source[];
  onRowClick: (source: Source) => void;
  onToggleStatus: (source: Source) => void;
  onEdit: (source: Source) => void;
  onDelete: (source: Source) => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
  };
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

export function SourceTable({ data, onRowClick, onToggleStatus, onEdit, onDelete, pagination }: SourceTableProps) {
  const columns = [
    {
      key: "name",
      header: "来源名称",
      render: (item: Source) => (
        <span className="font-medium">{item.name}</span>
      ),
    },
    {
      key: "company",
      header: "所属公司",
      render: (item: Source) => (
        <Badge variant="outline">{companyLabels[item.company] || item.company}</Badge>
      ),
    },
    {
      key: "source_type",
      header: "来源类型",
      render: (item: Source) => (
        <Badge variant="secondary">{sourceTypeLabels[item.source_type] || item.source_type}</Badge>
      ),
    },
    {
      key: "crawl_strategy",
      header: "采集策略",
      render: (item: Source) => {
        if (!item.crawl_strategy) return <span className="text-sm text-muted-foreground">-</span>;
        const icons: Record<string, React.ComponentType<{ className?: string }>> = {
          single_page: FileText,
          multi_page: Layers,
          search_keyword: Search,
          social_media: AtSign,
        };
        const Icon = icons[item.crawl_strategy] || FileText;
        return (
          <Badge variant="outline" className="text-xs">
            <Icon className="h-3 w-3 mr-1" />
            {crawlStrategyLabels[item.crawl_strategy] || item.crawl_strategy}
          </Badge>
        );
      },
    },
    {
      key: "url",
      header: "来源地址",
      className: "max-w-[200px]",
      render: (item: Source) => (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 truncate"
          onClick={(e) => e.stopPropagation()}
        >
          {item.url}
          <ExternalLink className="h-3 w-3" />
        </a>
      ),
    },
    {
      key: "enabled",
      header: "状态",
      render: (item: Source) => (
        <Badge variant={item.enabled ? "default" : "secondary"}>
          {item.enabled ? "启用" : "停用"}
        </Badge>
      ),
    },
    {
      key: "priority",
      header: "优先级",
      render: (item: Source) => (
        <Badge variant="outline">{priorityLabels[item.priority] || item.priority}</Badge>
      ),
    },
    {
      key: "created_at",
      header: "创建时间",
      render: (item: Source) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(item.created_at)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "操作",
      render: (item: Source) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(item);
            }}
          >
            <Pencil className="h-3 w-3" />
            编辑
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus(item);
            }}
          >
            {item.enabled ? "停用" : "启用"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item);
            }}
          >
            <Trash2 className="h-3 w-3" />
            删除
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      rowKey={(item) => item.id}
      onRowClick={onRowClick}
      pagination={pagination}
    />
  );
}