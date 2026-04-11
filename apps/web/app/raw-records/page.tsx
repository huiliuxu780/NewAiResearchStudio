"use client";

import { useState, useMemo } from "react";
import { RawRecord } from "@/types/entities";
import { RecordTable } from "@/components/raw-records/record-table";
import { RecordFilter } from "@/components/raw-records/record-filter";
import { RecordPreviewSheet } from "@/components/raw-records/record-preview-sheet";
import { useRawRecords, useSources } from "@/hooks";

export default function RawRecordsPage() {
  const [selectedRecord, setSelectedRecord] = useState<RawRecord | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data: sourcesData } = useSources();
  const { data: apiData, isLoading, error } = useRawRecords({
    company: filters.company && filters.company !== "all" ? filters.company : undefined,
    crawl_status: filters.crawl_status && filters.crawl_status !== "all" ? filters.crawl_status : undefined,
    dedupe_status: filters.dedupe_status && filters.dedupe_status !== "all" ? filters.dedupe_status : undefined,
    page,
    page_size: pageSize,
  });

  const filteredRecords = useMemo(() => {
    return apiData?.items || [];
  }, [apiData]);

  const sources = useMemo(() => {
    return sourcesData?.items || [];
  }, [sourcesData]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({});
    setPage(1);
  };

  const handleRowClick = (record: RawRecord) => {
    setSelectedRecord(record);
    setSheetOpen(true);
  };

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">原始记录</h1>
        <div className="text-center py-8 text-destructive">
          加载失败: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">原始记录</h1>
        <p className="text-sm text-muted-foreground">
          共 {filteredRecords.length} 条记录
        </p>
      </div>

      <RecordFilter
        values={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">加载中...</div>
      ) : (
        <RecordTable
          records={filteredRecords}
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

      <RecordPreviewSheet
        record={selectedRecord}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}