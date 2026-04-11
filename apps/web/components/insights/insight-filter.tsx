"use client";

import { FilterBar, FilterConfig } from "@/components/ui/filter-bar";
import { companyLabels, insightTypeLabels, impactLevelLabels, confidenceLevelLabels } from "@/types/labels";

interface InsightFilterProps {
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onReset?: () => void;
}

const companyOptions = Object.entries(companyLabels).map(([value, label]) => ({
  value,
  label,
}));

const insightTypeOptions = Object.entries(insightTypeLabels).map(([value, label]) => ({
  value,
  label,
}));

const impactLevelOptions = Object.entries(impactLevelLabels).map(([value, label]) => ({
  value,
  label,
}));

const confidenceOptions = Object.entries(confidenceLevelLabels).map(([value, label]) => ({
  value,
  label,
}));

export function InsightFilter({ values, onChange, onReset }: InsightFilterProps) {
  const filters: FilterConfig[] = [
    {
      key: "company",
      type: "select",
      label: "所属公司",
      tooltip: "按公司筛选研究结论",
      options: companyOptions,
    },
    {
      key: "insight_type",
      type: "select",
      label: "结论类型",
      tooltip: "研究结论的类型，如竞争优势、风险预警、增长机会等",
      options: insightTypeOptions,
    },
    {
      key: "impact_level",
      type: "select",
      label: "影响等级",
      tooltip: "结论对业务的影响程度，分为高、中、低",
      options: impactLevelOptions,
    },
    {
      key: "confidence",
      type: "select",
      label: "置信度",
      tooltip: "AI生成结论的可信度评估",
      options: confidenceOptions,
    },
  ];

  return <FilterBar filters={filters} values={values} onChange={onChange} onReset={onReset} />;
}