"use client";

import { useParams } from "next/navigation";
import { ReportDetail } from "@/components/reports/report-detail";
import { useReport } from "@/hooks/use-reports";

export default function ReportDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: report, isLoading } = useReport(id);

  if (isLoading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  if (!report) {
    return <div className="text-center py-8 text-muted-foreground">周报不存在</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">周报详情</h1>
      <ReportDetail report={report} />
    </div>
  );
}
