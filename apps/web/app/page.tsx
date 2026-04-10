"use client";

import * as React from "react";
import { StatsCard } from "@/components/ui/stats-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import {
  mockDashboardStats,
  mockCompanyStats,
  getTrendDataByCompany,
} from "@/mock/dashboard";
import { mockFacts } from "@/mock/facts";
import { mockInsights } from "@/mock/insights";
import { Company } from "@/types";
import { companyLabels } from "@/types/labels";
import {
  Activity,
  Database,
  FileText,
  CheckCircle,
  Lightbulb,
  TrendingUp,
} from "lucide-react";

const COMPANY_OPTIONS = [
  { value: "all", label: "全部" },
  { value: Company.ALIBABA, label: "阿里" },
  { value: Company.BYTE_DANCE, label: "字节" },
  { value: Company.TENCENT, label: "腾讯" },
];

export default function Home() {
  const [selectedCompany, setSelectedCompany] = React.useState<string>("all");

  const companyFilter = selectedCompany === "all" ? null : selectedCompany as Company;

  const filteredFacts = React.useMemo(() => {
    let facts = mockFacts.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (companyFilter) {
      facts = facts.filter((fact) => fact.company === companyFilter);
    }
    return facts.slice(0, 10);
  }, [companyFilter]);

  const filteredInsights = React.useMemo(() => {
    let insights = mockInsights
      .filter((insight) => insight.status === "approved")
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    if (companyFilter) {
      insights = insights.filter((insight) =>
        insight.relatedFacts.some((fact) => fact.company === companyFilter)
      );
    }
    return insights.slice(0, 5);
  }, [companyFilter]);

  const stats = React.useMemo(() => {
    if (!companyFilter) {
      return {
        todayNewInsights: mockDashboardStats.weeklyNewInsights,
        pendingReviewFacts: mockDashboardStats.pendingReviewFacts,
        latestInsights: mockDashboardStats.totalInsights,
        activeSources: mockDashboardStats.activeSources,
      };
    }
    const companyStat = mockCompanyStats.find((stat) => stat.company === companyFilter);
    return {
      todayNewInsights: companyStat?.insightCount || 0,
      pendingReviewFacts: mockFacts.filter(
        (f) => f.company === companyFilter && f.status === "pending_review"
      ).length,
      latestInsights: companyStat?.insightCount || 0,
      activeSources: mockDashboardStats.activeSources,
    };
  }, [companyFilter]);

  const trendData = React.useMemo(() => {
    return getTrendDataByCompany(companyFilter);
  }, [companyFilter]);

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="今日新增情报数"
          value={stats.todayNewInsights}
          icon={Activity}
          trend={{ value: 12, label: "较昨日", positive: true }}
        />
        <StatsCard
          title="待复核事实数"
          value={stats.pendingReviewFacts}
          icon={CheckCircle}
        />
        <StatsCard
          title="最新研究结论数"
          value={stats.latestInsights}
          icon={Lightbulb}
        />
        <StatsCard
          title="活跃信息源数"
          value={stats.activeSources}
          icon={Database}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TrendChart data={trendData} title="近7日情报趋势" />
        <InsightList insights={filteredInsights} title="最新研究结论" />
      </div>

      <FactList facts={filteredFacts} title="最新标准化事实" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            企业数据统计
          </CardTitle>
          <CardDescription>各企业数据分布情况</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockCompanyStats.map((stat) => (
              <div key={stat.company} className="flex items-center justify-between">
                <span className="text-sm font-medium">{companyLabels[stat.company]}</span>
                <div className="flex items-center gap-4">
                  <Badge variant="outline">{stat.recordCount} 记录</Badge>
                  <Badge variant="outline">{stat.factCount} 事实</Badge>
                  <Badge variant="outline">{stat.insightCount} 结论</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}