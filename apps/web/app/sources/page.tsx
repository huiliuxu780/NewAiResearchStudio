"use client";

import { useState, useMemo } from "react";
import { Source } from "@/types";
import { mockSources } from "@/mock/sources";
import { SourceTable } from "@/components/sources/source-table";
import { SourceFilter } from "@/components/sources/source-filter";
import { SourceDetailSheet } from "@/components/sources/source-detail-sheet";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function SourcesPage() {
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sources, setSources] = useState<Source[]>(mockSources);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    company: "all",
    type: "all",
    status: "all",
  });

  const filteredSources = useMemo(() => {
    return sources.filter((source) => {
      if (filterValues.company !== "all" && source.company !== filterValues.company) {
        return false;
      }
      if (filterValues.type !== "all" && source.type !== filterValues.type) {
        return false;
      }
      if (filterValues.status !== "all") {
        const isActive = filterValues.status === "active";
        if (source.isActive !== isActive) {
          return false;
        }
      }
      return true;
    });
  }, [sources, filterValues]);

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleFilterReset = () => {
    setFilterValues({ company: "all", type: "all", status: "all" });
  };

  const handleRowClick = (source: Source) => {
    setSelectedSource(source);
    setSheetOpen(true);
  };

  const handleToggleStatus = (source: Source) => {
    setSources((prev) =>
      prev.map((s) =>
        s.id === source.id ? { ...s, isActive: !s.isActive } : s
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">信息源管理</h1>
        <Button>
          <Plus className="h-4 w-4" />
          新增信息源
        </Button>
      </div>

      <SourceFilter
        values={filterValues}
        onChange={handleFilterChange}
        onReset={handleFilterReset}
      />

      <SourceTable
        data={filteredSources}
        onRowClick={handleRowClick}
        onToggleStatus={handleToggleStatus}
      />

      <SourceDetailSheet
        source={selectedSource}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}