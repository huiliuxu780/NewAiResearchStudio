"use client";

import { RawRecord } from "@/types";
import { companyLabels, rawRecordStatusLabels, eventTypeLabels } from "@/types/labels";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileText, Sparkles } from "lucide-react";

interface RecordTableProps {
  data: RawRecord[];
  onRowClick: (record: RawRecord) => void;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RecordTable({ data, onRowClick }: RecordTableProps) {
  const columns = [
    {
      key: "title",
      header: "标题",
      className: "max-w-[300px]",
      render: (item: RawRecord) => (
        <span className="font-medium truncate">{item.title}</span>
      ),
    },
    {
      key: "company",
      header: "所属公司",
      render: (item: RawRecord) => (
        <Badge variant="outline">{companyLabels[item.company]}</Badge>
      ),
    },
    {
      key: "source",
      header: "来源",
      render: (item: RawRecord) => (
        <span className="text-sm text-muted-foreground">{item.source.name}</span>
      ),
    },
    {
      key: "publishedAt",
      header: "发布时间",
      render: (item: RawRecord) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(item.publishedAt)}
        </span>
      ),
    },
    {
      key: "fetchedAt",
      header: "采集时间",
      render: (item: RawRecord) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(item.fetchedAt)}
        </span>
      ),
    },
    {
      key: "status",
      header: "采集状态",
      render: (item: RawRecord) => (
        <Badge variant={item.status === "completed" ? "default" : "secondary"}>
          {rawRecordStatusLabels[item.status]}
        </Badge>
      ),
    },
    {
      key: "dedupeStatus",
      header: "去重状态",
      render: () => (
        <Badge variant="outline">已去重</Badge>
      ),
    },
    {
      key: "language",
      header: "语言",
      render: () => (
        <span className="text-sm text-muted-foreground">中文</span>
      ),
    },
    {
      key: "actions",
      header: "操作",
      render: (item: RawRecord) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              window.open(item.originalUrl, "_blank");
            }}
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => e.stopPropagation()}
          >
            <FileText className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => e.stopPropagation()}
          >
            <Sparkles className="h-3 w-3" />
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
    />
  );
}