"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Insight } from "@/types";
import { companyLabels, insightTypeLabels, priorityLabels } from "@/types/labels";
import { Lightbulb } from "lucide-react";

interface InsightListProps {
  insights: Insight[];
  title?: string;
}

export function InsightList({ insights, title = "最新研究结论" }: InsightListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              暂无研究结论
            </div>
          ) : (
            insights.map((insight) => (
              <div
                key={insight.id}
                className="rounded-lg border border-border p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <h4 className="text-sm font-medium leading-tight">
                      {insight.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {insight.summary}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge
                      variant={
                        insight.priority === "high" || insight.priority === "urgent"
                          ? "default"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {priorityLabels[insight.priority]}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="outline" className="text-xs">
                    {insightTypeLabels[insight.type]}
                  </Badge>
                  {insight.relatedFacts.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {companyLabels[insight.relatedFacts[0].company]}
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}