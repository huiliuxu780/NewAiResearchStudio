"use client";

import * as React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { CompanySettings } from "@/components/settings/company-settings";
import { AiDefaultSettings } from "@/components/settings/ai-default-settings";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { SystemSettings } from "@/components/settings/system-settings";
import {
  Building2,
  Brain,
  Bell,
  Settings2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

type SettingsTab = "company" | "ai_defaults" | "notifications" | "system";

interface TabConfig {
  id: SettingsTab;
  label: string;
  icon: React.ElementType;
  component: React.ComponentType<{ className?: string }>;
}

const tabs: TabConfig[] = [
  {
    id: "company",
    label: "公司信息",
    icon: Building2,
    component: CompanySettings,
  },
  {
    id: "ai_defaults",
    label: "AI 默认配置",
    icon: Brain,
    component: AiDefaultSettings,
  },
  {
    id: "notifications",
    label: "通知设置",
    icon: Bell,
    component: NotificationSettings,
  },
  {
    id: "system",
    label: "系统参数",
    icon: Settings2,
    component: SystemSettings,
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState<SettingsTab>("company");
  const [saveStatus, setSaveStatus] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Auto-dismiss save status after 5 seconds
  React.useEffect(() => {
    if (saveStatus) {
      const timer = setTimeout(() => {
        setSaveStatus(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">系统设置</h1>
          <p className="text-sm text-muted-foreground">
            管理系统配置、公司信息、AI 模型参数和通知设置
          </p>
        </div>
      </div>

      {/* Save Status Banner */}
      {saveStatus && (
        <div
          className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
            saveStatus.type === "success"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
              : "border-destructive/20 bg-destructive/10 text-destructive"
          }`}
          role="alert"
        >
          {saveStatus.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{saveStatus.message}</span>
        </div>
      )}

      {/* Settings Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value ?? "general")}
        className="w-full"
      >
        <TabsList className="w-full overflow-x-auto sm:w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.id} value={tab.id}>
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {tabs.map((tab) => {
          const Component = tab.component;
          return (
            <TabsContent key={tab.id} value={tab.id}>
              <Component className="max-w-3xl" />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
