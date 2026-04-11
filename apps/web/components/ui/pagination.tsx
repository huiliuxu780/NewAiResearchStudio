"use client";

import { Button } from "./button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  className?: string;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export function Pagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
  className,
}: PaginationProps) {
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-3 border-t border-border",
        className
      )}
    >
      <div className="text-sm text-muted-foreground">
        显示 {startItem}-{endItem} 条，共 {total} 条
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          上一页
        </Button>
        <span className="text-sm text-muted-foreground">
          第 {page} / {totalPages || 1} 页
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          下一页
        </Button>
        {onPageSizeChange && (
          <select
            className="ml-2 text-sm border border-input rounded-md bg-background px-2 py-1 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size} 条/页
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
