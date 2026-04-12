"use client";

import { PromptTemplate } from "@/types/entities";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Edit,
  Play,
  Power,
  PowerOff,
  Trash2,
  MoreVertical,
  Tag,
  Layers,
  GitBranch,
  Variable,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PromptTemplateCardProps {
  template: PromptTemplate;
  onEdit: (template: PromptTemplate) => void;
  onTest: (template: PromptTemplate) => void;
  onToggleActive: (template: PromptTemplate) => void;
  onDelete: (template: PromptTemplate) => void;
}

const categoryLabels: Record<string, string> = {
  fact_extraction: "事实提取",
  insight_generation: "洞察生成",
  summary: "摘要",
  classification: "分类",
  other: "其他",
};

const taskTypeLabels: Record<string, string> = {
  extraction: "提取",
  generation: "生成",
  analysis: "分析",
  transformation: "转换",
  other: "其他",
};

export function PromptTemplateCard({
  template,
  onEdit,
  onTest,
  onToggleActive,
  onDelete,
}: PromptTemplateCardProps) {
  const categoryLabel = categoryLabels[template.category] || template.category;
  const taskTypeLabel = taskTypeLabels[template.task_type] || template.task_type;

  return (
    <Card
      className={cn(
        "group relative transition-all duration-200 hover:ring-2 hover:ring-primary/50",
        !template.is_active && "opacity-70"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <CardTitle className="truncate text-base">{template.name}</CardTitle>
              {template.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {template.description}
                </p>
              )}
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Badge
                    variant={template.is_active ? "default" : "secondary"}
                    className={cn(
                      "shrink-0",
                      template.is_active
                        ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {template.is_active ? "已启用" : "已停用"}
                  </Badge>
                }
              />
              <TooltipContent>
                <p>{template.is_active ? "当前已启用" : "当前已停用"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="gap-1">
            <Tag className="h-3 w-3" />
            {categoryLabel}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Layers className="h-3 w-3" />
            {taskTypeLabel}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <GitBranch className="h-3 w-3" />
            v{template.version}
          </Badge>
        </div>

        {template.variables.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <Variable className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex flex-wrap gap-1">
              {template.variables.slice(0, 4).map((variable) => (
                <Badge
                  key={variable}
                  variant="secondary"
                  className="text-xs px-1.5 py-0 h-5 font-mono"
                >
                  {"{"}{variable}{"}"}
                </Badge>
              ))}
              {template.variables.length > 4 && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
                  +{template.variables.length - 4}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-muted-foreground">
            更新于 {new Date(template.updated_at).toLocaleDateString("zh-CN")}
          </span>

          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onTest(template)}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  }
                />
                <TooltipContent>
                  <p>测试提示词</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onEdit(template)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  }
                />
                <TooltipContent>
                  <p>编辑提示词</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon-sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onToggleActive(template)}>
                  {template.is_active ? (
                    <>
                      <PowerOff className="h-4 w-4 mr-2" />
                      停用
                    </>
                  ) : (
                    <>
                      <Power className="h-4 w-4 mr-2" />
                      启用
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(template)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
