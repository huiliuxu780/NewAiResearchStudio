"use client";

import { Insight } from "@/types/entities";
import { companyLabels, insightTypeLabels, impactLevelLabels, confidenceLevelLabels } from "@/types/labels";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";

interface InsightTableProps {
  insights: Insight[];
  onRowClick: (insight: Insight) => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
  };
}

export function InsightTable({ insights, onRowClick, pagination }: InsightTableProps) {
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const columns = [
    {
      key: "insight_content",
      header: "结论内容",
      render: (insight: Insight) => (
        <span className="text-sm line-clamp-2">{insight.insight_content}</span>
      ),
      className: "max-w-[200px]",
    },
    {
      key: "company",
      header: "所属公司",
      render: (insight: Insight) => (
        <Badge variant="outline">{companyLabels[insight.company] || insight.company}</Badge>
      ),
    },
    {
      key: "insight_type",
      header: "结论类型",
      render: (insight: Insight) => (
        <Badge variant="ghost">{insightTypeLabels[insight.insight_type] || insight.insight_type}</Badge>
      ),
    },
    {
      key: "impact_level",
      header: "影响等级",
      render: (insight: Insight) => (
        <Badge variant="outline">{impactLevelLabels[insight.impact_level] || insight.impact_level}</Badge>
      ),
    },
    {
      key: "confidence",
      header: "置信度",
      render: (insight: Insight) => (
        <Badge variant="outline">{confidenceLevelLabels[insight.confidence] || insight.confidence}</Badge>
      ),
    },
    {
      key: "created_at",
      header: "创建时间",
      render: (insight: Insight) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(insight.created_at)}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={insights}
      rowKey={(insight) => insight.id}
      onRowClick={onRowClick}
      emptyText="暂无研究结论"
      pagination={pagination}
    />
  );
}