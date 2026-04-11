"use client";

import { useState, useEffect } from "react";
import { PromptTemplate } from "@/types/entities";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface PromptTemplateTestDialogProps {
  template: PromptTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTest: (id: string, variables: Record<string, string>) => void;
  isTesting?: boolean;
  testResult?: { success: boolean; message: string; template_name: string; variables: string[] } | null;
}

export function PromptTemplateTestDialog({
  template,
  open,
  onOpenChange,
  onTest,
  isTesting = false,
  testResult,
}: PromptTemplateTestDialogProps) {
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (template) {
      const initialValues: Record<string, string> = {};
      template.variables.forEach((v) => {
        initialValues[v] = "";
      });
      setVariableValues(initialValues);
    }
  }, [template, open]);

  const handleVariableChange = (variable: string, value: string) => {
    setVariableValues((prev) => ({ ...prev, [variable]: value }));
  };

  const handleTest = () => {
    if (template) {
      onTest(template.id, variableValues);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            测试提示词: {template.name}
          </DialogTitle>
          <DialogDescription>
            为提示词变量提供测试值，然后运行测试
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-4 px-4">
          <div className="space-y-4 py-2">
            {template.variables.length > 0 ? (
              <div className="space-y-3">
                <Label>变量值</Label>
                {template.variables.map((variable) => (
                  <div key={variable} className="space-y-1.5">
                    <Label htmlFor={`test-var-${variable}`} className="text-xs font-mono">
                      {"{"}{variable}{"}"}
                    </Label>
                    <Input
                      id={`test-var-${variable}`}
                      placeholder={`输入 ${variable} 的值`}
                      value={variableValues[variable] || ""}
                      onChange={(e) => handleVariableChange(variable, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground text-sm">
                该提示词没有变量，可以直接运行测试
              </div>
            )}

            {testResult && (
              <div className="space-y-2">
                <Label>测试结果</Label>
                <div
                  className={`rounded-lg border p-4 ${
                    testResult.success
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-destructive/30 bg-destructive/5"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {testResult.success ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <p
                        className={`text-sm font-medium ${
                          testResult.success ? "text-emerald-500" : "text-destructive"
                        }`}
                      >
                        {testResult.message}
                      </p>
                      {testResult.template_name && (
                        <p className="text-xs text-muted-foreground">
                          提示词: {testResult.template_name}
                        </p>
                      )}
                      {testResult.variables.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {testResult.variables.map((v) => (
                            <Badge key={v} variant="outline" className="text-xs font-mono">
                              {"{"}{v}{"}"}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            关闭
          </Button>
          <Button onClick={handleTest} disabled={isTesting}>
            {isTesting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                测试中...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                运行测试
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
