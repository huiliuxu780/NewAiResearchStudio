"use client";

import { FilterBar, FilterConfig } from "@/components/ui/filter-bar";
import { Company, SourceType } from "@/types";
import { companyLabels, sourceTypeLabels } from "@/types/labels";

interface SourceFilterProps {
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onReset?: () => void;
}

const companyOptions = Object.entries(companyLabels)
  .filter(([key]) => key !== Company.OTHER)
  .map(([value, label]) => ({ value, label }));

const sourceTypeOptions = Object.entries(sourceTypeLabels).map(([value, label]) => ({
  value,
  label,
}));

const statusOptions = [
  { value: "active", label: "启用" },
  { value: "inactive", label: "停用" },
];

export function SourceFilter({ values, onChange, onReset }: SourceFilterProps) {
  const filters: FilterConfig[] = [
    {
      key: "company",
      type: "select",
      label: "所属公司",
      options: companyOptions,
    },
    {
      key: "type",
      type: "select",
      label: "来源类型",
      options: sourceTypeOptions,
    },
    {
      key: "status",
      type: "select",
      label: "状态",
      options: statusOptions,
    },
  ];

  return <FilterBar filters={filters} values={values} onChange={onChange} onReset={onReset} />;
}