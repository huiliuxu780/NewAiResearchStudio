"use client";

import { Fact } from "@/types/entities";
import { companyLabels, eventTypeLabels, reviewStatusLabels, importanceLevelLabels, confidenceLevelLabels } from "@/types/labels";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { ReviewActions } from "./review-actions";

interface FactTableProps {
  facts: Fact[];
  onRowClick: (fact: Fact) => void;
  onApprove: (fact: Fact) => void;
  onReject: (fact: Fact) => void;
  onEdit: (fact: Fact) => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
  };
}

export function FactTable({
  facts,
  onRowClick,
  onApprove,
  onReject,
  onEdit,
  pagination,
}: FactTableProps) {
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getReviewStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default";
      case "pending":
        return "secondary";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const columns = [
    {
      key: "fact_summary",
      header: "事实摘要",
      render: (fact: Fact) => (
        <span className="text-sm line-clamp-2">{fact.fact_summary}</span>
      ),
      className: "max-w-[200px]",
    },
    {
      key: "company",
      header: "所属公司",
      render: (fact: Fact) => (
        <Badge variant="outline">{companyLabels[fact.company] || fact.company}</Badge>
      ),
    },
    {
      key: "event_type",
      header: "事件类型",
      render: (fact: Fact) => (
        <Badge variant="ghost">{eventTypeLabels[fact.event_type] || fact.event_type}</Badge>
      ),
    },
    {
      key: "importance_level",
      header: "重要性",
      render: (fact: Fact) => (
        <Badge variant="outline">{importanceLevelLabels[fact.importance_level] || fact.importance_level}</Badge>
      ),
    },
    {
      key: "confidence",
      header: "置信度",
      render: (fact: Fact) => (
        <Badge variant="outline">{confidenceLevelLabels[fact.confidence] || fact.confidence}</Badge>
      ),
    },
    {
      key: "created_at",
      header: "创建时间",
      render: (fact: Fact) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(fact.created_at)}
        </span>
      ),
    },
    {
      key: "review_status",
      header: "复核状态",
      render: (fact: Fact) => (
        <Badge variant={getReviewStatusBadgeVariant(fact.review_status)}>
          {reviewStatusLabels[fact.review_status] || fact.review_status}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "操作",
      render: (fact: Fact) => (
        <ReviewActions
          fact={fact}
          onApprove={onApprove}
          onReject={onReject}
          onEdit={onEdit}
        />
      ),
      className: "min-w-[180px]",
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={facts}
      rowKey={(fact) => fact.id}
      onRowClick={onRowClick}
      emptyText="暂无事实数据"
      pagination={pagination}
    />
  );
}