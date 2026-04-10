"use client";

import { useState, useMemo } from "react";
import { Insight, Company, InsightType, InsightStatus, Priority } from "@/types";
import { mockInsights } from "@/mock/insights";
import { InsightList } from "@/components/insights/insight-list";
import { InsightFilter } from "@/components/insights/insight-filter";
import { InsightDetailSheet } from "@/components/insights/insight-detail-sheet";
import { useInsights } from "@/hooks";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

export default function InsightsPage() {
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [company, setCompany] = useState<Company | "">("");
  const [type, setType] = useState<InsightType | "">("");
  const [status, setStatus] = useState<InsightStatus | "">("");
  const [priority, setPriority] = useState<Priority | "">("");

  const { data: apiData, isLoading } = useInsights({
    company: company || undefined,
    type: type || undefined,
    status: status || undefined,
    priority: priority || undefined,
  });

  const filteredInsights = useMemo(() => {
    if (USE_MOCK) {
      return mockInsights.filter((insight) => {
        if (company && !insight.relatedFacts.some((f) => f.company === company)) return false;
        if (type && insight.type !== type) return false;
        if (status && insight.status !== status) return false;
        if (priority && insight.priority !== priority) return false;
        return true;
      });
    }
    return apiData?.items || [];
  }, [apiData, company, type, status, priority]);

  const handleCardClick = (insight: Insight) => {
    setSelectedInsight(insight);
    setSheetOpen(true);
  };

  const handleViewFacts = (insight: Insight) => {
    setSelectedInsight(insight);
    setSheetOpen(true);
  };

  const handleViewFact = (factId: string) => {
    console.log("查看事实:", factId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">研究结论</h1>
        <p className="text-sm text-muted-foreground">
          共 {filteredInsights.length} 条结论
        </p>
      </div>

      <InsightFilter
        company={company}
        type={type}
        status={status}
        priority={priority}
        onCompanyChange={setCompany}
        onTypeChange={setType}
        onStatusChange={setStatus}
        onPriorityChange={setPriority}
      />

      {isLoading && !USE_MOCK ? (
        <div className="text-center py-8 text-muted-foreground">加载中...</div>
      ) : (
        <InsightList
          insights={filteredInsights}
          onCardClick={handleCardClick}
          onViewFacts={handleViewFacts}
        />
      )}

      <InsightDetailSheet
        insight={selectedInsight}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onViewFact={handleViewFact}
      />
    </div>
  );
}