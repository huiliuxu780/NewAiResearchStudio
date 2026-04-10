"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  mockModelConfigs,
  mockPromptTemplates,
  mockStorageConfigs,
  mockCrawlConfigs,
  mockCronTasks,
} from "@/mock/settings";
import { ExternalLink } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("model");

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">系统设置</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList variant="line" className="w-full justify-start">
          <TabsTrigger value="model">模型配置</TabsTrigger>
          <TabsTrigger value="prompt">Prompt模板</TabsTrigger>
          <TabsTrigger value="storage">存储配置</TabsTrigger>
          <TabsTrigger value="crawl">抓取策略</TabsTrigger>
          <TabsTrigger value="cron">定时任务</TabsTrigger>
          <TabsTrigger value="logs">系统日志</TabsTrigger>
        </TabsList>

        <TabsContent value="model" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Qwen API 配置</CardTitle>
              <CardDescription>配置通义千问大模型API参数</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockModelConfigs.map((config) => (
                <div key={config.id} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">配置名称</label>
                      <Input value={config.name} disabled />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">服务商</label>
                      <Input value={config.provider} disabled />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">API Key</label>
                      <Input value={config.apiKey} type="password" disabled />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">API Endpoint</label>
                      <Input value={config.apiEndpoint} disabled />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">模型版本</label>
                      <Input value={config.modelVersion} disabled />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">状态</label>
                      <div className="flex items-center gap-2">
                        <Badge variant={config.isActive ? "default" : "outline"}>
                          {config.isActive ? "已启用" : "已禁用"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      最后更新: {formatDate(config.updatedAt)}
                    </span>
                    <Button variant="outline" size="sm" disabled>
                      编辑配置
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prompt" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Prompt模板配置</CardTitle>
              <CardDescription>管理系统Prompt模板</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPromptTemplates.map((template) => (
                  <div key={template.id} className="rounded-lg border border-border p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </div>
                      <Badge variant="outline">{template.category}</Badge>
                    </div>
                    <Separator className="my-3" />
                    <div className="space-y-2">
                      <span className="text-xs text-muted-foreground">变量参数</span>
                      <div className="flex flex-wrap gap-1">
                        {template.variables.map((v) => (
                          <Badge key={v} variant="ghost" className="text-xs">
                            {v}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        最后更新: {formatDate(template.updatedAt)}
                      </span>
                      <Button variant="ghost" size="sm" disabled>
                        查看详情
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>存储配置</CardTitle>
              <CardDescription>配置数据存储参数</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockStorageConfigs.map((config) => (
                <div key={config.id} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">存储类型</label>
                      <Input value={config.type} disabled />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">主机地址</label>
                      <Input value={config.host} disabled />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">端口</label>
                      <Input value={config.port.toString()} disabled />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">数据库</label>
                      <Input value={config.database} disabled />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">用户名</label>
                      <Input value={config.username} disabled />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">状态</label>
                      <div className="flex items-center gap-2">
                        <Badge variant={config.isActive ? "default" : "outline"}>
                          {config.isActive ? "已连接" : "已断开"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      最后更新: {formatDate(config.updatedAt)}
                    </span>
                    <Button variant="outline" size="sm" disabled>
                      编辑配置
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crawl" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Crawl4AI 配置</CardTitle>
              <CardDescription>配置数据抓取策略</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCrawlConfigs.map((config) => (
                  <div key={config.id} className="rounded-lg border border-border p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{config.name}</h4>
                        <p className="text-sm text-muted-foreground">{config.targetUrl}</p>
                      </div>
                      <Badge variant={config.isActive ? "default" : "outline"}>
                        {config.isActive ? "已启用" : "已禁用"}
                      </Badge>
                    </div>
                    <Separator className="my-3" />
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">抓取间隔</span>
                        <p className="font-medium">{config.crawlInterval}秒</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">最大深度</span>
                        <p className="font-medium">{config.maxDepth}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">超时时间</span>
                        <p className="font-medium">{config.timeout}秒</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">User Agent</span>
                        <p className="font-medium text-xs">{config.userAgent}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        最后更新: {formatDate(config.updatedAt)}
                      </span>
                      <Button variant="ghost" size="sm" disabled>
                        编辑配置
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cron" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>定时任务配置</CardTitle>
              <CardDescription>管理系统定时任务</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCronTasks.map((task) => (
                  <div key={task.id} className="rounded-lg border border-border p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{task.name}</h4>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                      </div>
                      <Badge variant={task.isActive ? "default" : "outline"}>
                        {task.isActive ? "已启用" : "已禁用"}
                      </Badge>
                    </div>
                    <Separator className="my-3" />
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">执行计划</span>
                        <p className="font-medium">{task.schedule}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">上次执行</span>
                        <p className="font-medium">
                          {task.lastRunAt ? formatDate(task.lastRunAt) : "未执行"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">下次执行</span>
                        <p className="font-medium">
                          {task.nextRunAt ? formatDate(task.nextRunAt) : "未计划"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        命令: {task.command}
                      </span>
                      <Button variant="ghost" size="sm" disabled>
                        编辑任务
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>系统日志</CardTitle>
              <CardDescription>查看系统运行日志</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border bg-muted/30 p-6 text-center">
                <p className="text-muted-foreground mb-4">
                  系统日志功能正在开发中，敬请期待
                </p>
                <Button variant="outline" disabled>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  查看日志入口
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}