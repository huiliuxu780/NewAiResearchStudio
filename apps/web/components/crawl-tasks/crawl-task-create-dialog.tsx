"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Source } from "@/types/entities";
import { Loader2, Plus, AlertCircle } from "lucide-react";

interface CrawlTaskCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sources: Source[];
  isLoadingSources?: boolean;
  onSubmit: (data: CreateTaskFormData) => void;
  loading?: boolean;
}

export interface CreateTaskFormData {
  source_id: string;
  task_type: string;
}

const taskTypes = [
  { value: "full", label: "全量抓取", description: "抓取数据源中的所有内容" },
  { value: "incremental", label: "增量抓取", description: "仅抓取新增或更新的内容" },
  { value: "retry", label: "重试抓取", description: "重新抓取之前失败的任务" },
];

export function CrawlTaskCreateDialog({
  open,
  onOpenChange,
  sources,
  isLoadingSources,
  onSubmit,
  loading,
}: CrawlTaskCreateDialogProps) {
  const [sourceId, setSourceId] = React.useState("");
  const [taskType, setTaskType] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!sourceId) {
      newErrors.source_id = "请选择数据源";
    }
    if (!taskType) {
      newErrors.task_type = "请选择任务类型";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit({ source_id: sourceId, task_type: taskType });
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSourceId("");
      setTaskType("");
      setErrors({});
    }
    onOpenChange(open);
  };

  const selectedTaskType = taskTypes.find((t) => t.value === taskType);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            创建抓取任务
          </DialogTitle>
          <DialogDescription>
            选择数据源和任务类型来创建新的抓取任务。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* 数据源选择 */}
          <div className="space-y-2">
            <Label htmlFor="source-select">数据源</Label>
            <Select value={sourceId} onValueChange={(v) => { setSourceId(v ?? ""); setErrors((prev) => ({ ...prev, source_id: "" })); }}>
              <SelectTrigger
                id="source-select"
                className={cn(errors.source_id && "border-destructive ring-destructive/20")}
              >
                <SelectValue placeholder="选择数据源" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingSources ? (
                  <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    加载中...
                  </div>
                ) : sources.length === 0 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    暂无可用数据源
                  </div>
                ) : (
                  sources.map((source) => (
                    <SelectItem key={source.id} value={source.id}>
                      <div className="flex items-center gap-2">
                        <span className="truncate">{source.name}</span>
                        <span className="text-xs text-muted-foreground">({source.company})</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.source_id && (
              <p className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                {errors.source_id}
              </p>
            )}
          </div>

          {/* 任务类型选择 */}
          <div className="space-y-2">
            <Label htmlFor="task-type-select">任务类型</Label>
            <Select value={taskType} onValueChange={(v) => { setTaskType(v ?? ""); setErrors((prev) => ({ ...prev, task_type: "" })); }}>
              <SelectTrigger
                id="task-type-select"
                className={cn(errors.task_type && "border-destructive ring-destructive/20")}
              >
                <SelectValue placeholder="选择任务类型" />
              </SelectTrigger>
              <SelectContent>
                {taskTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex flex-col gap-0.5">
                      <span>{type.label}</span>
                      <span className="text-xs text-muted-foreground">{type.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.task_type && (
              <p className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                {errors.task_type}
              </p>
            )}
          </div>

          {/* 任务类型说明 */}
          {selectedTaskType && (
            <div className="rounded-lg border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">{selectedTaskType.label}</p>
              <p className="mt-1">{selectedTaskType.description}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                创建中...
              </>
            ) : (
              "创建任务"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
