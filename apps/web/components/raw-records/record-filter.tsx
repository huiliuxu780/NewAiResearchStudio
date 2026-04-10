"use client";

import { FilterBar, FilterConfig } from "@/components/ui/filter-bar";
import { Company, RawRecordStatus } from "@/types";
import { companyLabels, rawRecordStatusLabels } from "@/types/labels";
import { mockSources } from "@/mock/sources";

interface RecordFilterProps {
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onReset?: () => void;
}

const companyOptions = Object.entries(companyLabels)
  .filter(([key]) => key !== Company.OTHER)
  .map(([value, label]) => ({ value, label }));

const sourceOptions = mockSources.map((source) => ({
  value: source.id,
  label: source.name,
}));

const statusOptions = Object.entries(rawRecordStatusLabels).map(([value, label]) => ({
  value,
  label,
}));

const dedupeOptions = [
  { value: "deduped", label: "已去重" },
  { value: "pending", label: "待去重" },
];

export function RecordFilter({ values, onChange, onReset }: RecordFilterProps) {
  const filters: FilterConfig[] = [
    {
      key: "source",
      type: "select",
      label: "来源",
      options: sourceOptions,
    },
    {
      key: "company",
      type: "select",
      label: "所属公司",
      options: companyOptions,
    },
    {
      key: "status",
      type: "select",
      label: "采集状态",
      options: statusOptions,
    },
    {
      key: "dedupe",
      type: "select",
      label: "去重状态",
      options: dedupeOptions,
    },
  ];

  return <FilterBar filters={filters} values={values} onChange={onChange} onReset={onReset} />;
}