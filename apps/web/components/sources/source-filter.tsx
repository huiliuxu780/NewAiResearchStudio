"use client";

import { FilterBar, FilterConfig } from "@/components/ui/filter-bar";
import { companyLabels, sourceTypeLabels, priorityLabels } from "@/types/labels";

interface SourceFilterProps {
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onReset?: () => void;
}

const companyOptions = Object.entries(companyLabels).map(([value, label]) => ({
  value,
  label,
}));

const sourceTypeOptions = Object.entries(sourceTypeLabels).map(([value, label]) => ({
  value,
  label,
}));

const priorityOptions = Object.entries(priorityLabels).map(([value, label]) => ({
  value,
  label,
}));

const statusOptions = [
  { value: "true", label: "启用" },
  { value: "false", label: "停用" },
];

export function SourceFilter({ values, onChange, onReset }: SourceFilterProps) {
  const filters: FilterConfig[] = [
    {
      key: "company",
      type: "select",
      label: "所属公司",
      tooltip: "按公司筛选，包括阿里巴巴、字节跳动、腾讯等",
      options: companyOptions,
    },
    {
      key: "source_type",
      type: "select",
      label: "来源类型",
      tooltip: "信息来源的类型，如官方博客、技术文章、新闻报道等",
      options: sourceTypeOptions,
    },
    {
      key: "priority",
      type: "select",
      label: "优先级",
      tooltip: "数据源的采集优先级，高优先级源会被优先处理",
      options: priorityOptions,
    },
    {
      key: "enabled",
      type: "select",
      label: "状态",
      tooltip: "数据源的启用/停用状态",
      options: statusOptions,
    },
  ];

  return <FilterBar filters={filters} values={values} onChange={onChange} onReset={onReset} />;
}