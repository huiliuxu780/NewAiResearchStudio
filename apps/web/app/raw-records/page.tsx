"use client";

import { useState, useMemo } from "react";
import { RawRecord } from "@/types";
import { mockRawRecords } from "@/mock/raw-records";
import { RecordTable } from "@/components/raw-records/record-table";
import { RecordFilter } from "@/components/raw-records/record-filter";
import { RecordPreviewSheet } from "@/components/raw-records/record-preview-sheet";

export default function RawRecordsPage() {
  const [selectedRecord, setSelectedRecord] = useState<RawRecord | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    source: "all",
    company: "all",
    status: "all",
    dedupe: "all",
  });

  const filteredRecords = useMemo(() => {
    return mockRawRecords.filter((record) => {
      if (filterValues.source !== "all" && record.sourceId !== filterValues.source) {
        return false;
      }
      if (filterValues.company !== "all" && record.company !== filterValues.company) {
        return false;
      }
      if (filterValues.status !== "all" && record.status !== filterValues.status) {
        return false;
      }
      return true;
    });
  }, [filterValues]);

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleFilterReset = () => {
    setFilterValues({ source: "all", company: "all", status: "all", dedupe: "all" });
  };

  const handleRowClick = (record: RawRecord) => {
    setSelectedRecord(record);
    setSheetOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">原始记录</h1>
        <p className="text-sm text-muted-foreground">
          共 {filteredRecords.length} 条记录
        </p>
      </div>

      <RecordFilter
        values={filterValues}
        onChange={handleFilterChange}
        onReset={handleFilterReset}
      />

      <RecordTable data={filteredRecords} onRowClick={handleRowClick} />

      <RecordPreviewSheet
        record={selectedRecord}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}