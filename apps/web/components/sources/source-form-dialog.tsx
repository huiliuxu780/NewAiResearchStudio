"use client";

import { Source } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SourceForm } from "./source-form";
import type { SourceFormData } from "./source-form";

export type { SourceFormData };

interface SourceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Source | null;
  onSubmit: (data: SourceFormData) => void;
  loading?: boolean;
}

export function SourceFormDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  loading,
}: SourceFormDialogProps) {
  const handleSubmit = (data: SourceFormData) => {
    onSubmit(data);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "编辑信息源" : "新增信息源"}
          </DialogTitle>
        </DialogHeader>
        <SourceForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
}