"use client";

import { Fact, FactStatus } from "@/types";
import { companyLabels, eventTypeLabels, factStatusLabels } from "@/types/labels";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { ReviewActions } from "./review-actions";

interface FactTableProps {
  facts: Fact[];
  onRowClick: (fact: Fact) => void;
  onApprove: (fact: Fact) => void;
  onReject: (fact: Fact) => void;
  onEdit: (fact: Fact) => void;
}

export function FactTable({
  facts,
  onRowClick,
  onApprove,
  onReject,
  onEdit,
}: FactTableProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getStatusBadgeVariant = (status: FactStatus) => {
    switch (status) {
      case FactStatus.APPROVED:
        return "default";
      case FactStatus.PENDING_REVIEW:
        return "secondary";
      case FactStatus.REJECTED:
        return "destructive";
      case FactStatus.DRAFT:
        return "outline";
      default:
        return "outline";
    }
  };

  const columns = [
    {
      key: "summary",
      header: "事实摘要",
      render: (fact: Fact) => (
        <span className="text-sm line-clamp-2">{fact.summary}</span>
      ),
      className: "max-w-[200px]",
    },
    {
      key: "company",
      header: "所属公司",
      render: (fact: Fact) => (
        <Badge variant="outline">{companyLabels[fact.company]}</Badge>
      ),
    },
    {
      key: "eventType",
      header: "事件类型",
      render: (fact: Fact) => (
        <Badge variant="ghost">{eventTypeLabels[fact.eventType]}</Badge>
      ),
    },
    {
      key: "importance",
      header: "重要性",
      render: (fact: Fact) => (
        <Badge variant={fact.status === FactStatus.PENDING_REVIEW ? "secondary" : "outline"}>
          {fact.status === FactStatus.PENDING_REVIEW ? "高" : "中"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "发布时间",
      render: (fact: Fact) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(fact.createdAt)}
        </span>
      ),
    },
    {
      key: "status",
      header: "复核状态",
      render: (fact: Fact) => (
        <Badge variant={getStatusBadgeVariant(fact.status)}>
          {factStatusLabels[fact.status]}
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
    />
  );
}