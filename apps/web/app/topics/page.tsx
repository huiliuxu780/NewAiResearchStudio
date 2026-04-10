"use client";

import { useState, useMemo } from "react";
import { Company } from "@/types";
import { mockTopics, ResearchTopic, TopicStatus, topicStatusLabels } from "@/mock/topics";
import { companyLabels } from "@/types/labels";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
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

export default function TopicsPage() {
  const [topics] = useState<ResearchTopic[]>(mockTopics);
  const [selectedTopic, setSelectedTopic] = useState<ResearchTopic | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [status, setStatus] = useState<TopicStatus | "">("");
  const [company, setCompany] = useState<Company | "">("");

  const filteredTopics = useMemo(() => {
    return topics.filter((topic) => {
      if (status && topic.status !== status) return false;
      if (company && !topic.companies.includes(company)) return false;
      return true;
    });
  }, [topics, status, company]);

  const handleCardClick = (topic: ResearchTopic) => {
    setSelectedTopic(topic);
    setSheetOpen(true);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getStatusBadgeVariant = (topicStatus: TopicStatus) => {
    switch (topicStatus) {
      case "active":
        return "default";
      case "paused":
        return "secondary";
      case "completed":
        return "outline";
      case "archived":
        return "ghost";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">研究主题</h1>
        <p className="text-sm text-muted-foreground">
          共 {filteredTopics.length} 个主题
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={status || undefined}
          onValueChange={(value) => setStatus((value ?? "") as TopicStatus | "")}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="主题状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">全部状态</SelectItem>
            {Object.keys(topicStatusLabels).map((s) => (
              <SelectItem key={s} value={s}>
                {topicStatusLabels[s as TopicStatus]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={company || undefined}
          onValueChange={(value) => setCompany((value ?? "") as Company | "")}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="关注公司" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">全部公司</SelectItem>
            {Object.values(Company).map((c) => (
              <SelectItem key={c} value={c}>
                {companyLabels[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTopics.map((topic) => (
          <Card
            key={topic.id}
            className="cursor-pointer hover:bg-muted/30 transition-colors"
            onClick={() => handleCardClick(topic)}
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">{topic.name}</CardTitle>
                <Badge variant={getStatusBadgeVariant(topic.status)}>
                  {topicStatusLabels[topic.status]}
                </Badge>
              </div>
              <CardDescription className="line-clamp-2">
                {topic.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {topic.companies.slice(0, 4).map((c) => (
                    <Badge key={c} variant="outline" className="text-xs">
                      {companyLabels[c]}
                    </Badge>
                  ))}
                  {topic.companies.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{topic.companies.length - 4}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {topic.keywords.slice(0, 3).map((keyword) => (
                    <Badge key={keyword} variant="ghost" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>事实: {topic.relatedFactCount}</span>
                <span>结论: {topic.relatedInsightCount}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDate(topic.createdAt)}
              </span>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredTopics.length === 0 && (
        <div className="text-center text-muted-foreground py-12">
          暂无主题数据
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{selectedTopic?.name}</SheetTitle>
            <SheetDescription>{selectedTopic?.description}</SheetDescription>
          </SheetHeader>
          {selectedTopic && (
            <ScrollArea className="h-[calc(100vh-120px)]">
              <div className="space-y-4 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">主题状态</span>
                    <Badge variant={getStatusBadgeVariant(selectedTopic.status)}>
                      {topicStatusLabels[selectedTopic.status]}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">创建时间</span>
                    <span className="text-sm">{formatDate(selectedTopic.createdAt)}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">关联事实数</span>
                    <span className="text-sm font-medium">{selectedTopic.relatedFactCount}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">关联结论数</span>
                    <span className="text-sm font-medium">{selectedTopic.relatedInsightCount}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-foreground">关注公司</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTopic.companies.map((c) => (
                      <Badge key={c} variant="outline">{companyLabels[c]}</Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-foreground">关键词</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTopic.keywords.map((keyword) => (
                      <Badge key={keyword} variant="ghost">{keyword}</Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-foreground">关联事实</h3>
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <p className="text-sm text-muted-foreground">
                      共 {selectedTopic.relatedFactCount} 条关联事实，点击查看详情
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-foreground">关联结论</h3>
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <p className="text-sm text-muted-foreground">
                      共 {selectedTopic.relatedInsightCount} 条关联结论，点击查看详情
                    </p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}