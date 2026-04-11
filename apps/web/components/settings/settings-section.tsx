"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save, RotateCcw } from "lucide-react";

interface SettingsSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  isLoading?: boolean;
  isSaving?: boolean;
  onSave?: () => void;
  onReset?: () => void;
  showActions?: boolean;
  saveDisabled?: boolean;
  resetDisabled?: boolean;
}

export function SettingsSection({
  title,
  description,
  isLoading = false,
  isSaving = false,
  onSave,
  onReset,
  showActions = true,
  saveDisabled = false,
  resetDisabled = false,
  className,
  children,
  ...props
}: SettingsSectionProps) {
  return (
    <Card className={cn("w-full", className)} {...props}>
      <CardHeader className="pb-3">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <Separator />
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            加载中...
          </div>
        ) : (
          <div className="space-y-6">{children}</div>
        )}
      </CardContent>
      {showActions && (
        <>
          <Separator />
          <CardFooter className="flex items-center justify-between gap-2 pt-4">
            <div className="text-xs text-muted-foreground">
              {isSaving ? (
                <span className="flex items-center">
                  <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                  保存中...
                </span>
              ) : (
                "修改后请点击保存"
              )}
            </div>
            <div className="flex items-center gap-2">
              {onReset && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onReset}
                  disabled={resetDisabled || isSaving}
                >
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  重置
                </Button>
              )}
              {onSave && (
                <Button
                  size="sm"
                  onClick={onSave}
                  disabled={saveDisabled || isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  保存
                </Button>
              )}
            </div>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
