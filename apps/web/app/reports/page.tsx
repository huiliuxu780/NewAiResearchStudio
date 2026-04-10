"use client";

import { useState, useMemo } from "react";
import { WeekReportStatus } from "@/types";
import { mockReports, Report, ReportType, reportTypeLabels } from "@/mock/reports";
import { weekReportStatusLabels } from "@/types/labels";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Eye, Download } from "lucide-react";

export default function ReportsPage() {
  const [reports] = useState<Report[]>(mockReports);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [reportType, setReportType] = useState<ReportType | "">("");
  const [status, setStatus] = useState<WeekReportStatus | "">("");
  const [timeRange, setTimeRange] = useState<string>("");

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      if (reportType && report.reportType !== reportType) return false;
      if (status && report.status !== status) return false;
      return true;
    });
  }, [reports, reportType, status]);

  const handleRowClick = (report: Report) => {
    setSelectedReport(report);
    setSheetOpen(true);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getStatusBadgeVariant = (reportStatus: WeekReportStatus) => {
    switch (reportStatus) {
      case WeekReportStatus.PUBLISHED:
        return "default";
      case WeekReportStatus.DRAFT:
        return "secondary";
      case WeekReportStatus.ARCHIVED:
        return "outline";
      default:
        return "outline";
    }
  };

  const columns = [
    {
      key: "title",
      header: "报告名称",
      render: (report: Report) => (
        <span className="font-medium">{report.title}</span>
      ),
    },
    {
      key: "reportType",
      header: "报告类型",
      render: (report: Report) => (
        <Badge variant="outline">{reportTypeLabels[report.reportType]}</Badge>
      ),
    },
    {
      key: "generatedAt",
      header: "生成时间",
      render: (report: Report) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(report.generatedAt)}
        </span>
      ),
    },
    {
      key: "status",
      header: "状态",
      render: (report: Report) => (
        <Badge variant={getStatusBadgeVariant(report.status)}>
          {weekReportStatusLabels[report.status]}
        </Badge>
      ),
    },
    {
      key: "relatedFactCount",
      header: "关联事实数",
      render: (report: Report) => (
        <span className="text-sm">{report.relatedFactCount}</span>
      ),
    },
    {
      key: "relatedInsightCount",
      header: "关联结论数",
      render: (report: Report) => (
        <span className="text-sm">{report.relatedInsightCount}</span>
      ),
    },
    {
      key: "actions",
      header: "操作",
      render: (report: Report) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              handleRowClick(report);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
            }}
            disabled={report.status !== WeekReportStatus.PUBLISHED}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">周报中心</h1>
        <p className="text-sm text-muted-foreground">
          共 {filteredReports.length} 份报告
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={reportType || undefined}
          onValueChange={(value) => setReportType((value ?? "") as ReportType | "")}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="报告类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">全部类型</SelectItem>
            {Object.keys(reportTypeLabels).map((t) => (
              <SelectItem key={t} value={t}>
                {reportTypeLabels[t as ReportType]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={status || undefined}
          onValueChange={(value) => setStatus((value ?? "") as WeekReportStatus | "")}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="状态筛选" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">全部状态</SelectItem>
            {Object.values(WeekReportStatus).map((s) => (
              <SelectItem key={s} value={s}>
                {weekReportStatusLabels[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={timeRange || undefined}
          onValueChange={(value) => setTimeRange(value ?? "")}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="时间范围" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">全部时间</SelectItem>
            <SelectItem value="week">最近一周</SelectItem>
            <SelectItem value="month">最近一月</SelectItem>
            <SelectItem value="quarter">最近三月</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filteredReports}
        rowKey={(report) => report.id}
        onRowClick={handleRowClick}
        emptyText="暂无报告数据"
      />

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>{selectedReport?.title}</SheetTitle>
            <SheetDescription>{selectedReport?.summary}</SheetDescription>
          </SheetHeader>
          {selectedReport && (
            <ScrollArea className="h-[calc(100vh-120px)]">
              <div className="space-y-4 p-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">报告类型</span>
                    <Badge variant="outline">{reportTypeLabels[selectedReport.reportType]}</Badge>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">生成时间</span>
                    <span className="text-sm">{formatDate(selectedReport.generatedAt)}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">状态</span>
                    <Badge variant={getStatusBadgeVariant(selectedReport.status)}>
                      {weekReportStatusLabels[selectedReport.status]}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">作者</span>
                    <span className="text-sm">{selectedReport.author}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">关联事实数</span>
                    <span className="text-sm font-medium">{selectedReport.relatedFactCount}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">关联结论数</span>
                    <span className="text-sm font-medium">{selectedReport.relatedInsightCount}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-foreground">报告内容</h3>
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {selectedReport.content || "报告内容待生成..."}
                    </div>
                  </div>
                </div>

                {selectedReport.publishedAt && (
                  <>
                    <Separator />
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">发布时间</span>
                      <span className="text-sm">{formatDate(selectedReport.publishedAt)}</span>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}