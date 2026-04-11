"use client";

import { Fact } from "@/types/entities";
import { companyLabels, eventTypeLabels, reviewStatusLabels } from "@/types/labels";

interface FactListProps {
  facts: Fact[];
}

export function FactList({ facts }: FactListProps) {
  if (facts.length === 0) {
    return <div className="text-center text-muted-foreground py-4">暂无事实数据</div>;
  }

  return (
    <div className="space-y-3">
      {facts.slice(0, 5).map((fact) => (
        <div key={fact.id} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/30">
          <div className="flex-1 min-w-0">
            <p className="text-sm line-clamp-2">{fact.fact_summary}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground">
                {companyLabels[fact.company] || fact.company}
              </span>
              <span className="text-xs text-muted-foreground">|</span>
              <span className="text-xs text-muted-foreground">
                {eventTypeLabels[fact.event_type] || fact.event_type}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}