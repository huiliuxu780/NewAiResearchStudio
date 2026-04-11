"use client";

import { useState, useMemo } from "react";
import { Insight } from "@/types/entities";
import { InsightTable } from "@/components/insights/insight-table";
import { InsightFilter } from "@/components/insights/insight-filter";
import { InsightDetailSheet } from "@/components/insights/insight-detail-sheet";
import { useInsights } from "@/hooks";

export default function InsightsPage() {
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data: apiData, isLoading, error } = useInsights({
    company: filters.company && filters.company !== "all" ? filters.company : undefined,
    insight_type: filters.insight_type && filters.insight_type !== "all" ? filters.insight_type : undefined,
    impact_level: filters.impact_level && filters.impact_level !== "all" ? filters.impact_level : undefined,
    confidence: filters.confidence && filters.confidence !== "all" ? filters.confidence : undefined,
    page,
    page_size: pageSize,
  });

  const filteredInsights = useMemo(() => {
    return apiData?.items || [];
  }, [apiData]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({});
    setPage(1);
  };

  const handleRowClick = (insight: Insight) => {
    setSelectedInsight(insight);
    setSheetOpen(true);
  };

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">研究结论</h1>
        <div className="text-center py-8 text-destructive">
          加载失败: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">研究结论</h1>
        <p className="text-sm text-muted-foreground">
          共 {filteredInsights.length} 条结论
        </p>
      </div>

      <InsightFilter
        values={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">加载中...</div>
      ) : (
        <InsightTable
          insights={filteredInsights}
          onRowClick={handleRowClick}
          pagination={{
            page,
            pageSize,
            total: apiData?.total ?? 0,
            totalPages: apiData?.total_pages ?? 0,
            onPageChange: setPage,
            onPageSizeChange: (size) => {
              setPageSize(size);
              setPage(1);
            },
          }}
        />
      )}

      <InsightDetailSheet
        insight={selectedInsight}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}