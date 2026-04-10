"use client";

import * as React from "react";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Fact } from "@/types";
import { companyLabels, eventTypeLabels, factStatusLabels } from "@/types/labels";
import { FileText } from "lucide-react";

interface FactListProps {
  facts: Fact[];
  title?: string;
}

export function FactList({ facts, title = "最新标准化事实" }: FactListProps) {
  const columns = [
    {
      key: "createdAt",
      header: "时间",
      render: (fact: Fact) => (
        <span className="text-sm text-muted-foreground">
          {new Date(fact.createdAt).toLocaleDateString("zh-CN")}
        </span>
      ),
      className: "w-[100px]",
    },
    {
      key: "company",
      header: "公司",
      render: (fact: Fact) => (
        <Badge variant="outline" className="text-xs">
          {companyLabels[fact.company]}
        </Badge>
      ),
      className: "w-[100px]",
    },
    {
      key: "eventType",
      header: "事件类型",
      render: (fact: Fact) => (
        <Badge variant="secondary" className="text-xs">
          {eventTypeLabels[fact.eventType]}
        </Badge>
      ),
      className: "w-[120px]",
    },
    {
      key: "summary",
      header: "事实摘要",
      render: (fact: Fact) => (
        <span className="text-sm line-clamp-2">{fact.summary}</span>
      ),
    },
    {
      key: "status",
      header: "复核状态",
      render: (fact: Fact) => (
        <Badge
          variant={fact.status === "approved" ? "default" : "secondary"}
          className="text-xs"
        >
          {factStatusLabels[fact.status]}
        </Badge>
      ),
      className: "w-[100px]",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={facts}
          rowKey={(fact) => fact.id}
          emptyText="暂无事实数据"
        />
      </CardContent>
    </Card>
  );
}