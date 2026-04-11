"use client";

import { WeeklyReport, ReportSection } from "@/types/reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { REPORT_STATUS_LABELS } from "@/types/reports";
import { FileText, Calendar, Building2 } from "lucide-react";

interface ReportDetailProps {
  report: WeeklyReport;
}

export function ReportDetail({ report }: ReportDetailProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            {report.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{report.company}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{report.start_date} ~ {report.end_date}</span>
            </div>
            <div>
              <Badge variant="outline">
                {REPORT_STATUS_LABELS[report.status]}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {report.content.sections?.map(
        (section: ReportSection, index: number) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                {section.content.split("\n").map((line, i) => (
                  <p key={i} className="mb-2">
                    {line}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}
