"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, X, HelpCircle } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  type: "select" | "input" | "date";
  label: string;
  placeholder?: string;
  tooltip?: string;
  options?: FilterOption[];
}

interface FilterBarProps {
  filters: FilterConfig[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onReset?: () => void;
  className?: string;
}

export function FilterBar({
  filters,
  values,
  onChange,
  onReset,
  className,
}: FilterBarProps) {
  const hasActiveFilters = Object.values(values).some((v) => v && v !== "all");

  return (
    <TooltipProvider>
      <div className={cn("flex flex-wrap items-center gap-3", className)}>
        {filters.map((filter) => {
          const filterContent = (
            <React.Fragment key={filter.key}>
              {filter.type === "input" && (
                <div className="relative flex-1 min-w-[200px] max-w-[300px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={filter.placeholder || filter.label}
                    value={values[filter.key] || ""}
                    onChange={(e) => onChange(filter.key, e.target.value)}
                    className="pl-9"
                  />
                </div>
              )}

              {filter.type === "select" && (
                <Select
                  key={filter.key}
                  value={values[filter.key] || "all"}
                  onValueChange={(value) => onChange(filter.key, value ?? "")}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder={filter.label} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    {filter.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {filter.type === "date" && (
                <Input
                  type="date"
                  placeholder={filter.label}
                  value={values[filter.key] || ""}
                  onChange={(e) => onChange(filter.key, e.target.value)}
                  className="w-[150px]"
                />
              )}
            </React.Fragment>
          );

          if (filter.tooltip) {
            return (
              <div key={filter.key} className="flex items-center gap-1">
                {filterContent}
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[250px]">
                    <p className="text-sm">{filter.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            );
          }

          return filterContent;
        })}
        {hasActiveFilters && onReset && (
          <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground">
            <X className="h-4 w-4 mr-1" />
            重置
          </Button>
        )}
      </div>
    </TooltipProvider>
  );
}