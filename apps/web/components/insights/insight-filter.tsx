"use client";

import { Company, InsightType, InsightStatus, Priority } from "@/types";
import { companyLabels, insightTypeLabels, insightStatusLabels, priorityLabels } from "@/types/labels";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InsightFilterProps {
  company: Company | "";
  type: InsightType | "";
  status: InsightStatus | "";
  priority: Priority | "";
  onCompanyChange: (value: Company | "") => void;
  onTypeChange: (value: InsightType | "") => void;
  onStatusChange: (value: InsightStatus | "") => void;
  onPriorityChange: (value: Priority | "") => void;
}

export function InsightFilter({
  company,
  type,
  status,
  priority,
  onCompanyChange,
  onTypeChange,
  onStatusChange,
  onPriorityChange,
}: InsightFilterProps) {
  const companies = Object.values(Company);
  const types = Object.values(InsightType);
  const statuses = Object.values(InsightStatus);
  const priorities = Object.values(Priority);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={company || undefined}
        onValueChange={(value) => onCompanyChange((value ?? "") as Company | "")}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="公司筛选" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">全部公司</SelectItem>
          {companies.map((c) => (
            <SelectItem key={c} value={c}>
              {companyLabels[c]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={type || undefined}
        onValueChange={(value) => onTypeChange((value ?? "") as InsightType | "")}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="结论类型" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">全部类型</SelectItem>
          {types.map((t) => (
            <SelectItem key={t} value={t}>
              {insightTypeLabels[t]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={status || undefined}
        onValueChange={(value) => onStatusChange((value ?? "") as InsightStatus | "")}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="状态筛选" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">全部状态</SelectItem>
          {statuses.map((s) => (
            <SelectItem key={s} value={s}>
              {insightStatusLabels[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={priority || undefined}
        onValueChange={(value) => onPriorityChange((value ?? "") as Priority | "")}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="重要性" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">全部</SelectItem>
          {priorities.map((p) => (
            <SelectItem key={p} value={p}>
              {priorityLabels[p]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}