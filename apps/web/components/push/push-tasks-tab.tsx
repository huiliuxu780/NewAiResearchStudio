"use client";

import { BellRing, Eye, Loader2, Play, Plus } from "lucide-react";
import { PushSectionEmpty, PushStatusBadge, formatDateTime, getTriggerTypeLabel } from "@/components/push/push-shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { PaginatedResponse } from "@/lib/api";
import type { PushTask } from "@/types/push";

export function PushTasksTab({
  taskTriggerFilter,
  taskStatusFilter,
  taskEnabledFilter,
  data,
  error,
  isLoading,
  updatingTaskId,
  triggeringTaskId,
  onTaskTriggerChange,
  onTaskStatusChange,
  onTaskEnabledChange,
  onTaskPageChange,
  onTaskPageSizeChange,
  onCreateTask,
  onEditTask,
  onDeleteTask,
  onViewTask,
  onToggleTask,
  onTriggerTask,
}: {
  taskTriggerFilter: string;
  taskStatusFilter: string;
  taskEnabledFilter: string;
  data?: PaginatedResponse<PushTask>;
  error?: Error;
  isLoading: boolean;
  updatingTaskId: string | null;
  triggeringTaskId: string | null;
  onTaskTriggerChange: (value: string) => void;
  onTaskStatusChange: (value: string) => void;
  onTaskEnabledChange: (value: string) => void;
  onTaskPageChange: (page: number) => void;
  onTaskPageSizeChange: (size: number) => void;
  onCreateTask: () => void;
  onEditTask: (task: PushTask) => void;
  onDeleteTask: (task: PushTask) => void;
  onViewTask: (task: PushTask) => void;
  onToggleTask: (task: PushTask) => void;
  onTriggerTask: (task: PushTask) => void;
}) {
  return (
    <Card className="border-border/40 bg-background/50 py-0">
      <CardHeader className="flex flex-col gap-3 border-b border-border/60 py-4 md:flex-row md:items-end md:justify-between">
        <div>
          <CardTitle className="text-base">推送任务</CardTitle>
          <CardDescription>查看调度状态、快速启停，并支持手动触发验证链路。</CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={taskTriggerFilter} onValueChange={(value) => onTaskTriggerChange(value ?? "all")}>
            <SelectTrigger className="w-[130px] bg-background/70">
              <SelectValue placeholder="触发方式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部触发</SelectItem>
              <SelectItem value="scheduled">定时触发</SelectItem>
              <SelectItem value="event_triggered">事件触发</SelectItem>
              <SelectItem value="manual">手动触发</SelectItem>
            </SelectContent>
          </Select>

          <Select value={taskStatusFilter} onValueChange={(value) => onTaskStatusChange(value ?? "all")}>
            <SelectTrigger className="w-[120px] bg-background/70">
              <SelectValue placeholder="运行状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="enabled">已启用</SelectItem>
              <SelectItem value="disabled">已停用</SelectItem>
              <SelectItem value="running">执行中</SelectItem>
            </SelectContent>
          </Select>

          <Select value={taskEnabledFilter} onValueChange={(value) => onTaskEnabledChange(value ?? "all")}>
            <SelectTrigger className="w-[120px] bg-background/70">
              <SelectValue placeholder="启停状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部启停</SelectItem>
              <SelectItem value="true">已启用</SelectItem>
              <SelectItem value="false">已停用</SelectItem>
            </SelectContent>
          </Select>

          <Button size="sm" onClick={onCreateTask}>
            <Plus className="h-3.5 w-3.5" />
            新建任务
          </Button>
        </div>
      </CardHeader>

      {error ? (
        <CardContent className="py-8 text-sm text-destructive">{error.message}</CardContent>
      ) : isLoading ? (
        <CardContent className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          正在加载任务列表...
        </CardContent>
      ) : data?.items.length ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>任务名称</TableHead>
                <TableHead>触发方式</TableHead>
                <TableHead>渠道数</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>最近执行</TableHead>
                <TableHead>下次执行</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="max-w-[260px] whitespace-normal">
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{task.name}</p>
                      <p className="text-xs text-muted-foreground">{task.description || "暂无描述"}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getTriggerTypeLabel(task.trigger_type)}</TableCell>
                  <TableCell>{task.channel_ids.length}</TableCell>
                  <TableCell><PushStatusBadge status={task.status} /></TableCell>
                  <TableCell>{formatDateTime(task.last_executed_at)}</TableCell>
                  <TableCell>{formatDateTime(task.next_scheduled_at)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => onViewTask(task)}>
                        <Eye className="h-3.5 w-3.5" />
                        查看
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => onEditTask(task)}>
                        编辑
                      </Button>
                      <Button size="sm" variant={task.is_enabled ? "outline" : "default"} disabled={updatingTaskId === task.id} onClick={() => onToggleTask(task)}>
                        {updatingTaskId === task.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BellRing className="h-3.5 w-3.5" />}
                        {task.is_enabled ? "停用" : "启用"}
                      </Button>
                      <Button size="sm" variant="secondary" disabled={triggeringTaskId === task.id} onClick={() => onTriggerTask(task)}>
                        {triggeringTaskId === task.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                        触发
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => onDeleteTask(task)}>
                        删除
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination
            page={data.page}
            pageSize={data.page_size}
            total={data.total}
            totalPages={data.total_pages}
            onPageChange={onTaskPageChange}
            onPageSizeChange={onTaskPageSizeChange}
          />
        </>
      ) : (
        <CardContent className="pt-4">
          <PushSectionEmpty icon={BellRing} title="暂无任务数据" description="当前筛选条件下没有推送任务，可切换条件后重试。" />
        </CardContent>
      )}
    </Card>
  );
}
