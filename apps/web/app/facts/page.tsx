"use client";

import { useState, useMemo } from "react";
import { Fact } from "@/types/entities";
import { FactTable } from "@/components/facts/fact-table";
import { FactFilter } from "@/components/facts/fact-filter";
import { FactDetailSheet } from "@/components/facts/fact-detail-sheet";
import { useFacts, useUpdateFactReview } from "@/hooks";
import { useSWRConfig } from "swr";

export default function FactsPage() {
  const [selectedFact, setSelectedFact] = useState<Fact | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data: apiData, isLoading, error } = useFacts({
    company: filters.company && filters.company !== "all" ? filters.company : undefined,
    event_type: filters.event_type && filters.event_type !== "all" ? filters.event_type : undefined,
    review_status: filters.review_status && filters.review_status !== "all" ? filters.review_status : undefined,
    importance_level: filters.importance_level && filters.importance_level !== "all" ? filters.importance_level : undefined,
    page,
    page_size: pageSize,
  });

  const { mutate } = useSWRConfig();
  const { trigger: triggerReview } = useUpdateFactReview();

  const filteredFacts = useMemo(() => {
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

  const handleRowClick = (fact: Fact) => {
    setSelectedFact(fact);
    setSheetOpen(true);
  };

  const handleApprove = async (fact: Fact) => {
    await triggerReview({ id: fact.id, data: { review_status: "confirmed" } });
    mutate(['facts']);
  };

  const handleReject = async (fact: Fact) => {
    await triggerReview({ id: fact.id, data: { review_status: "rejected" } });
    mutate(['facts']);
  };

  const handleEdit = (fact: Fact) => {
    setSelectedFact(fact);
    setSheetOpen(true);
  };

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">标准化事实</h1>
        <div className="text-center py-8 text-destructive">
          加载失败: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">标准化事实</h1>
        <p className="text-sm text-muted-foreground">
          共 {filteredFacts.length} 条事实
        </p>
      </div>

      <FactFilter
        values={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">加载中...</div>
      ) : (
        <FactTable
          facts={filteredFacts}
          onRowClick={handleRowClick}
          onApprove={handleApprove}
          onReject={handleReject}
          onEdit={handleEdit}
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

      <FactDetailSheet
        fact={selectedFact}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}