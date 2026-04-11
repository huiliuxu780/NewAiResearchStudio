"use client";

import { FilterBar, FilterConfig } from "@/components/ui/filter-bar";
import { companyLabels, crawlStatusLabels, dedupeStatusLabels } from "@/types/labels";

interface RecordFilterProps {
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onReset?: () => void;
}

const companyOptions = Object.entries(companyLabels).map(([value, label]) => ({
  value,
  label,
}));

const crawlStatusOptions = Object.entries(crawlStatusLabels).map(([value, label]) => ({
  value,
  label,
}));

const dedupeStatusOptions = Object.entries(dedupeStatusLabels).map(([value, label]) => ({
  value,
  label,
}));

export function RecordFilter({ values, onChange, onReset }: RecordFilterProps) {
  const filters: FilterConfig[] = [
    {
      key: "company",
      type: "select",
      label: "所属公司",
      tooltip: "按公司筛选原始记录",
      options: companyOptions,
    },
    {
      key: "crawl_status",
      type: "select",
      label: "采集状态",
      tooltip: "数据采集的状态，包括待处理、成功、失败",
      options: crawlStatusOptions,
    },
    {
      key: "dedupe_status",
      type: "select",
      label: "去重状态",
      tooltip: "记录的去重状态，包括新记录、重复、已抽取等",
      options: dedupeStatusOptions,
    },
    {
      key: "keyword",
      type: "input",
      label: "关键词搜索",
      placeholder: "搜索标题或内容...",
      tooltip: "在原始记录的标题和内容中搜索关键词",
    },
  ];

  return <FilterBar filters={filters} values={values} onChange={onChange} onReset={onReset} />;
}