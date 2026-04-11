"use client";

import { useState, useEffect } from "react";
import { PromptTemplate } from "@/types/entities";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, X, Save, Loader2 } from "lucide-react";

interface PromptTemplateSheetProps {
  template: PromptTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<PromptTemplate>) => void;
  isSaving?: boolean;
}

const categoryOptions = [
  { value: "fact_extraction", label: "事实提取" },
  { value: "insight_generation", label: "洞察生成" },
  { value: "summary", label: "摘要" },
  { value: "classification", label: "分类" },
  { value: "other", label: "其他" },
];

const taskTypeOptions = [
  { value: "extraction", label: "提取" },
  { value: "generation", label: "生成" },
  { value: "analysis", label: "分析" },
  { value: "transformation", label: "转换" },
  { value: "other", label: "其他" },
];

export function PromptTemplateSheet({
  template,
  open,
  onOpenChange,
  onSave,
  isSaving = false,
}: PromptTemplateSheetProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [taskType, setTaskType] = useState("");
  const [templateContent, setTemplateContent] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [variables, setVariables] = useState<string[]>([]);
  const [newVariable, setNewVariable] = useState("");

  useEffect(() => {
    if (template) {
      setName(template.name);
      setCategory(template.category);
      setTaskType(template.task_type);
      setTemplateContent(template.template);
      setDescription(template.description || "");
      setNotes(template.notes || "");
      setIsActive(template.is_active);
      setVariables(template.variables || []);
    } else {
      setName("");
      setCategory("");
      setTaskType("");
      setTemplateContent("");
      setDescription("");
      setNotes("");
      setIsActive(true);
      setVariables([]);
    }
    setNewVariable("");
  }, [template, open]);

  const handleAddVariable = () => {
    const trimmed = newVariable.trim();
    if (trimmed && !variables.includes(trimmed)) {
      setVariables([...variables, trimmed]);
      setNewVariable("");
    }
  };

  const handleRemoveVariable = (variable: string) => {
    setVariables(variables.filter((v) => v !== variable));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddVariable();
    }
  };

  const handleSave = () => {
    onSave({
      name,
      category,
      task_type: taskType,
      template: templateContent,
      description: description || null,
      notes: notes || null,
      is_active: isActive,
      variables,
    });
  };

  const isFormValid = name && category && taskType && templateContent;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle className="text-lg">
            {template ? "编辑提示词" : "新建提示词"}
          </SheetTitle>
          <SheetDescription>
            {template
              ? `当前版本: v${template.version}`
              : "创建一个新的提示词模板"}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="prompt-name">名称</Label>
              <Input
                id="prompt-name"
                placeholder="输入提示词名称"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prompt-category">分类</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="prompt-category">
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt-task-type">任务类型</Label>
                <Select value={taskType} onValueChange={setTaskType}>
                  <SelectTrigger id="prompt-task-type">
                    <SelectValue placeholder="选择任务类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {taskTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt-template">模板内容</Label>
              <Textarea
                id="prompt-template"
                placeholder="输入提示词模板内容，使用 {variable} 表示变量"
                value={templateContent}
                onChange={(e) => setTemplateContent(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label>变量列表</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="输入变量名"
                  value={newVariable}
                  onChange={(e) => setNewVariable(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddVariable}
                  disabled={!newVariable.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {variables.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {variables.map((variable) => (
                    <Badge
                      key={variable}
                      variant="secondary"
                      className="gap-1 pr-1"
                    >
                      <span className="font-mono text-xs">{"{"}{variable}{"}"}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariable(variable)}
                        className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="prompt-description">描述</Label>
              <Textarea
                id="prompt-description"
                placeholder="输入提示词描述（可选）"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt-notes">备注</Label>
              <Textarea
                id="prompt-notes"
                placeholder="输入备注信息（可选）"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>启用状态</Label>
                <p className="text-xs text-muted-foreground">
                  启用后该提示词将可用于测试和调用
                </p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isFormValid || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                保存
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
