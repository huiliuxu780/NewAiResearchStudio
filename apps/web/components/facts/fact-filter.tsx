"use client";

import { Company, EventType, FactStatus } from "@/types";
import { companyLabels, eventTypeLabels, factStatusLabels } from "@/types/labels";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FactFilterProps {
  company: Company | "";
  eventType: EventType | "";
  status: FactStatus | "";
  needReview: string | null;
  onCompanyChange: (value: Company | "") => void;
  onEventTypeChange: (value: EventType | "") => void;
  onStatusChange: (value: FactStatus | "") => void;
  onNeedReviewChange: (value: string) => void;
}

export function FactFilter({
  company,
  eventType,
  status,
  needReview,
  onCompanyChange,
  onEventTypeChange,
  onStatusChange,
  onNeedReviewChange,
}: FactFilterProps) {
  const companies = Object.values(Company);
  const eventTypes = Object.values(EventType);
  const statuses = Object.values(FactStatus);

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
        value={eventType || undefined}
        onValueChange={(value) => onEventTypeChange((value ?? "") as EventType | "")}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="事件类型" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">全部类型</SelectItem>
          {eventTypes.map((e) => (
            <SelectItem key={e} value={e}>
              {eventTypeLabels[e]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={status || undefined}
        onValueChange={(value) => onStatusChange((value ?? "") as FactStatus | "")}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="复核状态" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">全部状态</SelectItem>
          {statuses.map((s) => (
            <SelectItem key={s} value={s}>
              {factStatusLabels[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={needReview || undefined}
        onValueChange={(value) => onNeedReviewChange(value ?? "")}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="是否需复核" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">全部</SelectItem>
          <SelectItem value="yes">需复核</SelectItem>
          <SelectItem value="no">无需复核</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}