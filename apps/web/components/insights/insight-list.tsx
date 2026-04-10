"use client";

import { Insight, InsightStatus, InsightType, Priority } from "@/types";
import { insightTypeLabels, insightStatusLabels, priorityLabels } from "@/types/labels";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, FileText } from "lucide-react";

interface InsightListProps {
  insights: Insight[];
  onCardClick: (insight: Insight) => void;
  onViewFacts: (insight: Insight) => void;
}

export function InsightList({
  insights,
  onCardClick,
  onViewFacts,
}: InsightListProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getStatusBadgeVariant = (status: InsightStatus) => {
    switch (status) {
      case InsightStatus.APPROVED:
        return "default";
      case InsightStatus.PENDING_REVIEW:
        return "secondary";
      case InsightStatus.ARCHIVED:
        return "outline";
      case InsightStatus.DRAFT:
        return "ghost";
      default:
        return "outline";
    }
  };

  const getTypeBadgeVariant = (type: InsightType) => {
    switch (type) {
      case InsightType.COMPETITIVE_INTELLIGENCE:
        return "default";
      case InsightType.TREND_ANALYSIS:
        return "secondary";
      case InsightType.TECH_EVALUATION:
        return "outline";
      case InsightType.MARKET_INSIGHT:
        return "ghost";
      case InsightType.PRODUCT_ANALYSIS:
        return "outline";
      case InsightType.STRATEGIC_RECOMMENDATION:
        return "secondary";
      default:
        return "outline";
    }
  };

  const getPriorityBadgeVariant = (priority: Priority) => {
    switch (priority) {
      case Priority.URGENT:
        return "destructive";
      case Priority.HIGH:
        return "default";
      case Priority.MEDIUM:
        return "secondary";
      case Priority.LOW:
        return "outline";
      default:
        return "outline";
    }
  };

  if (insights.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        暂无研究结论
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {insights.map((insight) => (
        <Card
          key={insight.id}
          className="cursor-pointer hover:ring-2 hover:ring-ring/50 transition-all"
          onClick={() => onCardClick(insight)}
        >
          <CardHeader>
            <CardTitle className="line-clamp-1">{insight.title}</CardTitle>
            <CardDescription className="line-clamp-2">
              {insight.summary}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant={getTypeBadgeVariant(insight.type)}>
                {insightTypeLabels[insight.type]}
              </Badge>
              <Badge variant={getPriorityBadgeVariant(insight.priority)}>
                {priorityLabels[insight.priority]}
              </Badge>
              <Badge variant={getStatusBadgeVariant(insight.status)}>
                {insightStatusLabels[insight.status]}
              </Badge>
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              更于 {formatDate(insight.updatedAt)}
            </span>
            <Button
              variant="ghost"
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                onViewFacts(insight);
              }}
            >
              <FileText className="size-3" />
              关联事实
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}