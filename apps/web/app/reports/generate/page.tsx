"use client";

import { ReportForm } from "@/components/reports/report-form";
import { useGenerateReport } from "@/hooks/use-reports";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function GenerateReportPage() {
  const router = useRouter();
  const { trigger: generateReport, isMutating } = useGenerateReport();

  const handleSubmit = async (data: { company: string; start_date: string; end_date: string }) => {
    try {
      const report = await generateReport(data);
      toast.success("周报生成成功");
      router.push(`/reports/${report.id}`);
    } catch (error) {
      toast.error("周报生成失败");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">生成周报</h1>
      <ReportForm onSubmit={handleSubmit} isLoading={isMutating} />
    </div>
  );
}
