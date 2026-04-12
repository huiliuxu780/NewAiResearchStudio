"use client";

import { useState } from "react";
import { ReportForm } from "@/components/reports/report-form";
import { useGenerateReport } from "@/hooks/use-reports";
import { useRouter } from "next/navigation";

export default function GenerateReportPage() {
  const router = useRouter();
  const { trigger: generateReport, isMutating } = useGenerateReport();
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (data: { company: string; start_date: string; end_date: string }) => {
    try {
      setErrorMessage("");
      const report = await generateReport(data);
      router.push(`/reports/${report.id}`);
    } catch (error) {
      console.error("Failed to generate report", error);
      setErrorMessage("周报生成失败，请稍后重试。");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">生成周报</h1>
      {errorMessage ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}
      <ReportForm onSubmit={handleSubmit} isLoading={isMutating} />
    </div>
  );
}
