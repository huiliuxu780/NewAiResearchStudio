"use client";

import { WeeklyReport } from "@/types/reports";
import { COMPANY_LABELS, REPORT_STATUS_LABELS } from "@/types/reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Eye, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ReportListProps {
  reports: WeeklyReport[];
  onDelete: (id: string) => void;
}

export function ReportList({ reports, onDelete }: ReportListProps) {
  const router = useRouter();

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium">暂无周报</h3>
        <p className="text-sm text-muted-foreground mt-1">
          使用上方的表单生成第一份周报
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {reports.map((report) => (
        <Card key={report.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {report.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">公司</span>
                <span>{COMPANY_LABELS[report.company] || report.company}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">时间范围</span>
                <span>{report.start_date} ~ {report.end_date}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">状态</span>
                <Badge variant="outline">
                  {REPORT_STATUS_LABELS[report.status] || report.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">生成时间</span>
                <span>{new Date(report.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/reports/${report.id}`)}
              >
                <Eye className="h-4 w-4 mr-1" />
                查看
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(report.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
