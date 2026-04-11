"use client";

import { Insight } from "@/types/entities";
import { companyLabels, insightTypeLabels, impactLevelLabels } from "@/types/labels";
import { Badge } from "@/components/ui/badge";

interface InsightListProps {
  insights: Insight[];
}

export function InsightList({ insights }: InsightListProps) {
  if (insights.length === 0) {
    return <div className="text-center text-muted-foreground py-4">暂无研究结论</div>;
  }

  return (
    <div className="space-y-3">
      {insights.slice(0, 5).map((insight) => (
        <div key={insight.id} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/30">
          <div className="flex-1 min-w-0">
            <p className="text-sm line-clamp-2">{insight.insight_content}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {companyLabels[insight.company] || insight.company}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {insightTypeLabels[insight.insight_type] || insight.insight_type}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {impactLevelLabels[insight.impact_level] || insight.impact_level}
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}