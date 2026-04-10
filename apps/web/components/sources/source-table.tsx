"use client";

import { Source } from "@/types";
import { companyLabels, sourceTypeLabels } from "@/types/labels";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface SourceTableProps {
  data: Source[];
  onRowClick: (source: Source) => void;
  onToggleStatus: (source: Source) => void;
}

function formatDate(dateString: string | null) {
  if (!dateString) return "暂无";
  return new Date(dateString).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SourceTable({ data, onRowClick, onToggleStatus }: SourceTableProps) {
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
        <Badge variant="outline">{companyLabels[item.company]}</Badge>
      ),
    },
    {
      key: "type",
      header: "来源类型",
      render: (item: Source) => (
        <Badge variant="secondary">{sourceTypeLabels[item.type]}</Badge>
      ),
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
        >
          {item.url}
          <ExternalLink className="h-3 w-3" />
        </a>
      ),
    },
    {
      key: "isActive",
      header: "状态",
      render: (item: Source) => (
        <Badge variant={item.isActive ? "default" : "secondary"}>
          {item.isActive ? "启用" : "停用"}
        </Badge>
      ),
    },
    {
      key: "fetchFrequency",
      header: "采集频率",
      render: () => <span className="text-sm text-muted-foreground">每日</span>,
    },
    {
      key: "priority",
      header: "优先级",
      render: () => <Badge variant="outline">中</Badge>,
    },
    {
      key: "lastFetchedAt",
      header: "最近采集时间",
      render: (item: Source) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(item.lastFetchedAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "操作",
      render: (item: Source) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onToggleStatus(item);
          }}
        >
          {item.isActive ? "停用" : "启用"}
        </Button>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      rowKey={(item) => item.id}
      onRowClick={onRowClick}
    />
  );
}