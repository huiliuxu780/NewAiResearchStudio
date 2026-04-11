"use client";

import { useState } from "react";
import { ReportList } from "@/components/reports/report-list";
import { useReports, useDeleteReport } from "@/hooks/use-reports";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function ReportsPage() {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data, isLoading } = useReports();
  const { trigger: deleteReport } = useDeleteReport();

  const handleDelete = async () => {
    if (deleteId) {
      await deleteReport(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">周报中心</h1>
        <Button onClick={() => router.push("/reports/generate")}>
          <Plus className="h-4 w-4 mr-2" />
          生成周报
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">加载中...</div>
      ) : data?.items && data.items.length > 0 ? (
        <ReportList reports={data.items} onDelete={setDeleteId} />
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          暂无周报，点击上方按钮生成
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="确认删除"
        description="确定要删除此周报吗？"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
