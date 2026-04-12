"use client";

import * as React from "react";
import { StatsCard } from "@/components/ui/stats-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { FactList } from "@/components/dashboard/fact-list";
import { InsightList } from "@/components/dashboard/insight-list";
import { useDashboardStats, useCompanyStats, useTrendData, useFacts, useInsights } from "@/hooks";
import { companyLabels } from "@/types/labels";
import {
  Activity,
  Database,
  CheckCircle,
  Lightbulb,
} from "lucide-react";

const COMPANY_OPTIONS = [
  { value: "all", label: "全部" },
  { value: "alibaba", label: "阿里" },
  { value: "byte_dance", label: "字节" },
  { value: "tencent", label: "腾讯" },
];

export default function Home() {
  const [selectedCompany, setSelectedCompany] = React.useState<string>("all");

  const companyFilter = selectedCompany === "all" ? null : selectedCompany;

  const { data: dashboardStats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: companyStats } = useCompanyStats();
  const { data: trendData } = useTrendData(companyFilter || undefined);
  const { data: factsData } = useFacts({ page_size: 10 });
  const { data: insightsData } = useInsights({ page_size: 5 });

  if (statsError) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <div className="text-center py-8 text-destructive">
          加载失败: {statsError.message}
        </div>
      </div>
    );
  }

  const stats = {
    today_fact_count: dashboardStats?.today_fact_count || 0,
    pending_review_count: dashboardStats?.pending_review_count || 0,
    insight_count: dashboardStats?.insight_count || 0,
    active_source_count: dashboardStats?.active_source_count || 0,
  };

  const facts = factsData?.items || [];
  const insights = insightsData?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <div className="flex items-center gap-4">
          <Select value={selectedCompany} onValueChange={(value) => setSelectedCompany(value ?? "all")}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="选择公司" />
            </SelectTrigger>
            <SelectContent>
              {COMPANY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {statsLoading ? (
        <div className="text-center py-8 text-muted-foreground">加载中...</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="今日新增情报数"
              value={stats.today_fact_count}
              icon={Activity}
              trend={{ value: 12, label: "较昨日", positive: true }}
            />
            <StatsCard
              title="待复核事实数"
              value={stats.pending_review_count}
              icon={CheckCircle}
            />
            <StatsCard
              title="最新研究结论数"
              value={stats.insight_count}
              icon={Lightbulb}
            />
            <StatsCard
              title="活跃信息源数"
              value={stats.active_source_count}
              icon={Database}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">情报趋势</CardTitle>
              </CardHeader>
              <CardContent>
                <TrendChart data={trendData || []} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">公司分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {companyStats?.map((stat) => (
                    <div key={stat.company} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {companyLabels[stat.company] || stat.company}
                        </Badge>
                      </div>
                      <span className="text-sm font-medium">{stat.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">最新事实</CardTitle>
              </CardHeader>
              <CardContent>
                <FactList facts={facts} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">最新研究结论</CardTitle>
              </CardHeader>
              <CardContent>
                <InsightList insights={insights} />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
