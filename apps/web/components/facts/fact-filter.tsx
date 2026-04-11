"use client";

import { FilterBar, FilterConfig } from "@/components/ui/filter-bar";
import { companyLabels, eventTypeLabels, reviewStatusLabels, importanceLevelLabels } from "@/types/labels";

interface FactFilterProps {
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onReset?: () => void;
}

const companyOptions = Object.entries(companyLabels).map(([value, label]) => ({
  value,
  label,
}));

const eventTypeOptions = Object.entries(eventTypeLabels).map(([value, label]) => ({
  value,
  label,
}));

const reviewStatusOptions = Object.entries(reviewStatusLabels).map(([value, label]) => ({
  value,
  label,
}));

const importanceOptions = Object.entries(importanceLevelLabels).map(([value, label]) => ({
  value,
  label,
}));

export function FactFilter({ values, onChange, onReset }: FactFilterProps) {
  const filters: FilterConfig[] = [
    {
      key: "company",
      type: "select",
      label: "所属公司",
      tooltip: "按公司筛选标准化事实",
      options: companyOptions,
    },
    {
      key: "event_type",
      type: "select",
      label: "事件类型",
      tooltip: "事实对应的事件类型，如发布、更新、收购等",
      options: eventTypeOptions,
    },
    {
      key: "importance_level",
      type: "select",
      label: "重要性",
      tooltip: "事实的重要程度，分为高、中、低",
      options: importanceOptions,
    },
    {
      key: "review_status",
      type: "select",
      label: "复核状态",
      tooltip: "事实的复核状态，包括待复核、已确认、已驳回等",
      options: reviewStatusOptions,
    },
  ];

  return <FilterBar filters={filters} values={values} onChange={onChange} onReset={onReset} />;
}