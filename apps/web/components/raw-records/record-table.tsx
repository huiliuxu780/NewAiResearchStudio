"use client";

import { RawRecord, Source } from "@/types/entities";
import { companyLabels, crawlStatusLabels } from "@/types/labels";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

interface RecordTableProps {
  records: RawRecord[];
  onRowClick: (record: RawRecord) => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
  };
}

export function RecordTable({ records, onRowClick, pagination }: RecordTableProps) {
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getCrawlStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "success":
        return "default";
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const columns = [
    {
      key: "title",
      header: "标题",
      render: (record: RawRecord) => (
        <span className="text-sm line-clamp-2">{record.title}</span>
      ),
      className: "max-w-[200px]",
    },
    {
      key: "company",
      header: "所属公司",
      render: (record: RawRecord) => (
        <Badge variant="outline">{companyLabels[record.company] || record.company}</Badge>
      ),
    },
    {
      key: "url",
      header: "来源地址",
      className: "max-w-[150px]",
      render: (record: RawRecord) => (
        <a
          href={record.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 truncate"
          onClick={(e) => e.stopPropagation()}
        >
          {record.url}
          <ExternalLink className="h-3 w-3" />
        </a>
      ),
    },
    {
      key: "published_at",
      header: "发布时间",
      render: (record: RawRecord) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(record.published_at)}
        </span>
      ),
    },
    {
      key: "crawled_at",
      header: "采集时间",
      render: (record: RawRecord) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(record.crawled_at)}
        </span>
      ),
    },
    {
      key: "crawl_status",
      header: "采集状态",
      render: (record: RawRecord) => (
        <Badge variant={getCrawlStatusBadgeVariant(record.crawl_status)}>
          {crawlStatusLabels[record.crawl_status] || record.crawl_status}
        </Badge>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={records}
      rowKey={(record) => record.id}
      onRowClick={onRowClick}
      emptyText="暂无原始记录"
      pagination={pagination}
    />
  );
}