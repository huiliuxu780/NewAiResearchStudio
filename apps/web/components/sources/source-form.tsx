"use client";

import { useState, useEffect } from "react";
import { Source } from "@/types/entities";
import { companyLabels, sourceTypeLabels, crawlStrategyLabels, socialPlatformLabels, searchEngineLabels } from "@/types/labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileText, Layers, Search, AtSign, X, Plus, Info, Link2, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SourceFormData {
  name: string;
  company: string;
  source_type: string;
  url: string;
  schedule: string;
  parser_type: string;
  priority: string;
  notes: string;
  enabled: boolean;
  // 采集策略相关字段
  crawl_strategy: string;
  crawl_config: Record<string, any>;
  social_platform: string;
  social_account_id: string;
}

interface SourceFormProps {
  initialData?: Source | null;
  onSubmit: (data: SourceFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const companyOptions = Object.entries(companyLabels).map(([value, label]) => ({
  value,
  label,
}));

const sourceTypeOptions = Object.entries(sourceTypeLabels).map(([value, label]) => ({
  value,
  label,
}));

const parserTypeOptions = [
  { value: "official_doc", label: "官方文档" },
  { value: "blog", label: "博客" },
  { value: "news", label: "新闻" },
];

const priorityOptions = [
  { value: "high", label: "高" },
  { value: "medium", label: "中" },
  { value: "low", label: "低" },
];

const crawlStrategyOptions = [
  { value: "single_page", label: "整页读取", icon: FileText },
  { value: "multi_page", label: "子页面遍历", icon: Layers },
  { value: "search_keyword", label: "搜索关键词", icon: Search },
  { value: "social_media", label: "官方号观测", icon: AtSign },
];

const socialPlatformOptions = Object.entries(socialPlatformLabels).map(([value, label]) => ({
  value,
  label,
}));

const searchEngineOptions = Object.entries(searchEngineLabels).map(([value, label]) => ({
  value,
  label,
}));

const languageOptions = [
  { value: "zh-CN", label: "中文（简体）" },
  { value: "zh-TW", label: "中文（繁体）" },
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "es", label: "Español" },
];

const timeRangeOptions = [
  { value: "day", label: "过去 24 小时" },
  { value: "week", label: "过去一周" },
  { value: "month", label: "过去一个月" },
  { value: "year", label: "过去一年" },
  { value: "any", label: "不限时间" },
];

const defaultFormData: SourceFormData = {
  name: "",
  company: "",
  source_type: "",
  url: "",
  schedule: "",
  parser_type: "",
  priority: "medium",
  notes: "",
  enabled: true,
  crawl_strategy: "single_page",
  crawl_config: {},
  social_platform: "",
  social_account_id: "",
};

// 关键词标签输入组件
interface KeywordInputProps {
  value: string[];
  onChange: (keywords: string[]) => void;
  placeholder?: string;
  error?: string;
}

function KeywordInput({ value, onChange, placeholder, error }: KeywordInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addKeyword = () => {
    const keyword = inputValue.trim();
    if (keyword && !value.includes(keyword)) {
      onChange([...value, keyword]);
      setInputValue("");
    }
  };

  const removeKeyword = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addKeyword();
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeKeyword(value.length - 1);
    }
  };

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "flex flex-wrap items-center gap-1.5 min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors",
          "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/20",
          error && "border-destructive focus-within:border-destructive focus-within:ring-destructive/20"
        )}
      >
        {value.map((keyword, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
          >
            {keyword}
            <button
              type="button"
              onClick={() => removeKeyword(index)}
              className="ml-0.5 rounded-sm p-0.5 hover:bg-primary/20 transition-colors"
              aria-label={`删除关键词 ${keyword}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addKeyword}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] bg-transparent outline-none placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
}

export function SourceForm({ initialData, onSubmit, onCancel, loading }: SourceFormProps) {
  const [formData, setFormData] = useState<SourceFormData>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        company: initialData.company || "",
        source_type: initialData.source_type || "",
        url: initialData.url || "",
        schedule: initialData.schedule || "",
        parser_type: initialData.parser_type || "",
        priority: initialData.priority || "medium",
        notes: initialData.notes || "",
        enabled: initialData.enabled ?? true,
        crawl_strategy: initialData.crawl_strategy || "single_page",
        crawl_config: initialData.crawl_config || {},
        social_platform: initialData.social_platform || "",
        social_account_id: initialData.social_account_id || "",
      });
    } else {
      setFormData(defaultFormData);
    }
    setErrors({});
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "请输入来源名称";
    }

    if (!formData.company) {
      newErrors.company = "请选择所属公司";
    }

    if (!formData.source_type) {
      newErrors.source_type = "请选择来源类型";
    }

    if (!formData.url.trim()) {
      newErrors.url = "请输入来源地址";
    } else {
      try {
        new URL(formData.url);
      } catch {
        newErrors.url = "请输入有效的URL地址";
      }
    }

    // 采集策略相关验证
    if (!formData.crawl_strategy) {
      newErrors.crawl_strategy = "请选择采集策略";
    }

    if (formData.crawl_strategy === "multi_page") {
      if (!formData.crawl_config?.list_url?.trim()) {
        newErrors["crawl_config.list_url"] = "请输入列表页URL";
      }
      if (!formData.crawl_config?.link_selector?.trim()) {
        newErrors["crawl_config.link_selector"] = "请输入链接CSS选择器";
      }
    }

    if (formData.crawl_strategy === "search_keyword") {
      const keywords = formData.crawl_config?.keywords;
      if (!keywords || (Array.isArray(keywords) ? keywords.length === 0 : !keywords.trim())) {
        newErrors["crawl_config.keywords"] = "请输入至少一个搜索关键词";
      }
      if (!formData.crawl_config?.search_engine) {
        newErrors["crawl_config.search_engine"] = "请选择搜索引擎";
      }
    }

    if (formData.crawl_strategy === "social_media") {
      if (!formData.social_platform) {
        newErrors.social_platform = "请选择社交平台";
      }
      if (!formData.social_account_id?.trim()) {
        newErrors.social_account_id = "请输入账号ID";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const updateField = (field: keyof SourceFormData, value: string | boolean | null) => {
    setFormData((prev) => ({ ...prev, [field]: value ?? "" }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const updateCrawlConfig = (key: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      crawl_config: { ...prev.crawl_config, [key]: value },
    }));
    const errorKey = `crawl_config.${key}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  // 当切换采集策略时，清空相关配置
  const handleCrawlStrategyChange = (value: string) => {
    updateField("crawl_strategy", value);
    setFormData((prev) => ({
      ...prev,
      crawl_config: {},
      social_platform: "",
      social_account_id: "",
    }));
  };

  const renderCrawlStrategyConfig = () => {
    switch (formData.crawl_strategy) {
      case "single_page":
        return (
          <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>整页读取模式：只需提供目标页面URL，系统将读取整个页面内容。</span>
            </div>
          </div>
        );

      case "multi_page":
        return (
          <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-4">
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Layers className="h-4 w-4 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <span>子页面遍历模式：从列表页提取详情页链接并逐个采集。</span>
                <p className="text-xs text-muted-foreground/70">
                  适用于文章列表、产品目录等需要分页遍历的场景。系统会根据配置的选择器提取链接，自动拼接页码参数进行翻页。
                </p>
              </div>
            </div>

            <Separator className="bg-border/50" />

            {/* 列表页配置 */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-primary uppercase tracking-wide">列表页</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="list_url">列表页 URL *</Label>
                <Input
                  id="list_url"
                  value={formData.crawl_config?.list_url || ""}
                  onChange={(e) => updateCrawlConfig("list_url", e.target.value)}
                  placeholder="https://example.com/articles"
                />
                {errors["crawl_config.list_url"] && (
                  <p className="text-sm text-destructive">{errors["crawl_config.list_url"]}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  列表页的完整 URL，页码参数会自动追加到 URL 后面
                </p>
              </div>
            </div>

            {/* 选择器配置 */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-primary uppercase tracking-wide">选择器</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="list_item_selector">列表项 CSS 选择器</Label>
                <Input
                  id="list_item_selector"
                  value={formData.crawl_config?.list_item_selector || ""}
                  onChange={(e) => updateCrawlConfig("list_item_selector", e.target.value)}
                  placeholder=".article-list li"
                />
                <p className="text-xs text-muted-foreground">
                  用于定位列表项容器，如 <code className="bg-muted px-1 py-0.5 rounded text-[11px]">.article-list li</code>
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="link_selector">链接 CSS 选择器 *</Label>
                <Input
                  id="link_selector"
                  value={formData.crawl_config?.link_selector || ""}
                  onChange={(e) => updateCrawlConfig("link_selector", e.target.value)}
                  placeholder="a.title"
                />
                {errors["crawl_config.link_selector"] && (
                  <p className="text-sm text-destructive">{errors["crawl_config.link_selector"]}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  用于提取详情页链接，如 <code className="bg-muted px-1 py-0.5 rounded text-[11px]">a.title</code> 或 <code className="bg-muted px-1 py-0.5 rounded text-[11px]">a[href]</code>
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content_selector">内容 CSS 选择器</Label>
                <Input
                  id="content_selector"
                  value={formData.crawl_config?.content_selector || ""}
                  onChange={(e) => updateCrawlConfig("content_selector", e.target.value)}
                  placeholder=".article-content"
                />
                <p className="text-xs text-muted-foreground">
                  用于提取详情页正文内容，如 <code className="bg-muted px-1 py-0.5 rounded text-[11px]">.article-content</code> 或 <code className="bg-muted px-1 py-0.5 rounded text-[11px]">article</code>
                </p>
              </div>
            </div>

            {/* 分页配置 */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-primary uppercase tracking-wide">分页</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="max_pages">最大页数</Label>
                  <Input
                    id="max_pages"
                    type="number"
                    min={1}
                    max={100}
                    value={formData.crawl_config?.max_pages || ""}
                    onChange={(e) => updateCrawlConfig("max_pages", parseInt(e.target.value) || 5)}
                    placeholder="5"
                  />
                  <p className="text-xs text-muted-foreground">默认 5，最大 100</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="page_param">页码参数名</Label>
                  <Input
                    id="page_param"
                    value={formData.crawl_config?.page_param || ""}
                    onChange={(e) => updateCrawlConfig("page_param", e.target.value)}
                    placeholder="page"
                  />
                  <p className="text-xs text-muted-foreground">
                    如 <code className="bg-muted px-1 py-0.5 rounded text-[11px]">page</code>、<code className="bg-muted px-1 py-0.5 rounded text-[11px]">p</code>
                  </p>
                </div>
              </div>
            </div>

            {/* 配置示例 */}
            <div className="rounded-md bg-black/30 p-3 space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">配置示例：</p>
              <pre className="text-[11px] text-muted-foreground/80 overflow-x-auto leading-relaxed">
{`// 最终请求 URL 示例:
// https://example.com/articles?page=1
// https://example.com/articles?page=2

// 提取链接示例:
// document.querySelector("a.title").href`}
              </pre>
            </div>
          </div>
        );

      case "search_keyword":
        return (
          <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-4">
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Search className="h-4 w-4 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <span>搜索关键词模式：通过搜索引擎采集指定关键词的结果页面。</span>
                <p className="text-xs text-muted-foreground/70">
                  系统将根据配置的关键词自动执行搜索，并采集搜索结果页面内容。支持多关键词、语言筛选和时间范围过滤。
                </p>
              </div>
            </div>

            <Separator className="bg-border/50" />

            {/* 关键词输入 */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-primary uppercase tracking-wide">关键词</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="keywords">搜索关键词 *</Label>
                <KeywordInput
                  value={formData.crawl_config?.keywords || []}
                  onChange={(keywords) => updateCrawlConfig("keywords", keywords)}
                  placeholder="输入关键词后按回车添加"
                  error={errors["crawl_config.keywords"]}
                />
                <p className="text-xs text-muted-foreground">
                  支持添加多个关键词，系统将分别搜索每个关键词。示例：AI、机器学习、深度学习
                </p>
              </div>
            </div>

            {/* 搜索引擎和最大结果数 */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-primary uppercase tracking-wide">搜索设置</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="search_engine">搜索引擎 *</Label>
                  <Select
                    value={formData.crawl_config?.search_engine || ""}
                    onValueChange={(value) => updateCrawlConfig("search_engine", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="请选择搜索引擎" />
                    </SelectTrigger>
                    <SelectContent>
                      {searchEngineOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors["crawl_config.search_engine"] && (
                    <p className="text-sm text-destructive">{errors["crawl_config.search_engine"]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_results">最大结果数</Label>
                  <Input
                    id="max_results"
                    type="number"
                    min={1}
                    max={100}
                    value={formData.crawl_config?.max_results || ""}
                    onChange={(e) => updateCrawlConfig("max_results", parseInt(e.target.value) || 20)}
                    placeholder="20"
                  />
                  <p className="text-xs text-muted-foreground">每个关键词的最大结果数，默认 20</p>
                </div>
              </div>
            </div>

            {/* 语言筛选和时间范围 */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-primary uppercase tracking-wide">筛选条件</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="language">语言筛选</Label>
                  <Select
                    value={formData.crawl_config?.language || ""}
                    onValueChange={(value) => updateCrawlConfig("language", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="不限语言" />
                    </SelectTrigger>
                    <SelectContent>
                      {languageOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">限定搜索结果的语言</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time_range">时间范围</Label>
                  <Select
                    value={formData.crawl_config?.time_range || ""}
                    onValueChange={(value) => updateCrawlConfig("time_range", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="不限时间" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeRangeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">限定搜索的时间范围</p>
                </div>
              </div>
            </div>

            {/* 配置示例 */}
            <div className="rounded-md bg-black/30 p-3 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground">配置示例：</p>
              </div>
              <pre className="text-[11px] text-muted-foreground/80 overflow-x-auto leading-relaxed">
{`// 搜索配置示例:
{
  "keywords": ["AI", "机器学习", "深度学习"],
  "search_engine": "google",
  "max_results": 20,
  "language": "zh-CN",
  "time_range": "month"
}

// 系统将依次搜索每个关键词，
// 采集最多 20 条中文结果（过去一个月内）`}
              </pre>
            </div>
          </div>
        );

      case "social_media":
        return (
          <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-4">
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <AtSign className="h-4 w-4 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <span>官方号观测模式：监控指定社交平台官方账号的动态更新。</span>
                <p className="text-xs text-muted-foreground/70">
                  系统将定期抓取指定社交平台官方账号的最新动态，适用于社交媒体监控、竞品追踪等场景。
                </p>
              </div>
            </div>

            <Separator className="bg-border/50" />

            {/* 平台选择 */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-primary uppercase tracking-wide">平台</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="social_platform">社交平台 *</Label>
                <Select
                  value={formData.social_platform}
                  onValueChange={(value) => updateField("social_platform", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="请选择社交平台" />
                  </SelectTrigger>
                  <SelectContent>
                    {socialPlatformOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.social_platform && (
                  <p className="text-sm text-destructive">{errors.social_platform}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  选择需要监控的社交平台，系统将使用对应平台的 API 或爬虫进行数据采集。
                </p>
              </div>
            </div>

            {/* 账号 ID 和账号 URL */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-primary uppercase tracking-wide">账号</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="social_account_id">账号 ID / 用户名 *</Label>
                <Input
                  id="social_account_id"
                  value={formData.social_account_id}
                  onChange={(e) => updateField("social_account_id", e.target.value)}
                  placeholder="请输入账号ID或用户名"
                />
                {errors.social_account_id && (
                  <p className="text-sm text-destructive">{errors.social_account_id}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  平台账号的唯一标识，如 Twitter 的用户名 <code className="bg-muted px-1 py-0.5 rounded text-[11px]">elonmusk</code>
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="social_account_url" className="flex items-center gap-1.5">
                  <Link2 className="h-3.5 w-3.5" />
                  账号主页 URL
                  <span className="text-xs text-muted-foreground font-normal">(可选)</span>
                </Label>
                <Input
                  id="social_account_url"
                  value={formData.crawl_config?.account_url || ""}
                  onChange={(e) => updateCrawlConfig("account_url", e.target.value)}
                  placeholder="https://twitter.com/elonmusk"
                />
                <p className="text-xs text-muted-foreground">
                  账号主页的完整 URL，用于快速访问和验证。如 <code className="bg-muted px-1 py-0.5 rounded text-[11px]">https://twitter.com/elonmusk</code>
                </p>
              </div>
            </div>

            {/* 抓取设置 */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-primary uppercase tracking-wide">抓取设置</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_posts" className="flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5" />
                  最大抓取条数
                </Label>
                <Input
                  id="max_posts"
                  type="number"
                  min={1}
                  max={100}
                  value={formData.crawl_config?.max_posts || ""}
                  onChange={(e) => updateCrawlConfig("max_posts", parseInt(e.target.value) || 20)}
                  placeholder="20"
                />
                <p className="text-xs text-muted-foreground">
                  每次抓取的最大动态/帖子数量，默认 20，最大 100
                </p>
              </div>
            </div>

            {/* 配置示例 */}
            <div className="rounded-md bg-black/30 p-3 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground">配置示例：</p>
              </div>
              <pre className="text-[11px] text-muted-foreground/80 overflow-x-auto leading-relaxed">
{`// 官方号观测配置示例:
{
  "platform": "twitter",
  "account_id": "elonmusk",
  "account_url": "https://twitter.com/elonmusk",
  "max_posts": 20
}

// 系统将定期抓取 @elonmusk 的最新 20 条动态`}
              </pre>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">来源名称 *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="请输入来源名称"
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">所属公司 *</Label>
        <Select
          value={formData.company}
          onValueChange={(value) => updateField("company", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="请选择所属公司" />
          </SelectTrigger>
          <SelectContent>
            {companyOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.company && <p className="text-sm text-destructive">{errors.company}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="source_type">来源类型 *</Label>
        <Select
          value={formData.source_type}
          onValueChange={(value) => updateField("source_type", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="请选择来源类型" />
          </SelectTrigger>
          <SelectContent>
            {sourceTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.source_type && <p className="text-sm text-destructive">{errors.source_type}</p>}
      </div>

      <Separator />

      {/* 采集策略选择 */}
      <div className="space-y-3">
        <Label>采集策略 *</Label>
        <Tabs
          value={formData.crawl_strategy}
          onValueChange={handleCrawlStrategyChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4">
            {crawlStrategyOptions.map((option) => {
              const Icon = option.icon;
              return (
                <TabsTrigger key={option.value} value={option.value} className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{option.label}</span>
                  <span className="sm:hidden">{option.label.slice(0, 2)}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
        {errors.crawl_strategy && (
          <p className="text-sm text-destructive">{errors.crawl_strategy}</p>
        )}
      </div>

      {/* 采集策略配置 */}
      {renderCrawlStrategyConfig()}

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="url">来源地址 *</Label>
        <Input
          id="url"
          value={formData.url}
          onChange={(e) => updateField("url", e.target.value)}
          placeholder="请输入来源地址"
        />
        {errors.url && <p className="text-sm text-destructive">{errors.url}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="schedule">采集频率</Label>
        <Input
          id="schedule"
          value={formData.schedule}
          onChange={(e) => updateField("schedule", e.target.value)}
          placeholder="Cron 表达式，如: 0 0 * * * (每日)"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="parser_type">解析器类型</Label>
        <Select
          value={formData.parser_type}
          onValueChange={(value) => updateField("parser_type", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="请选择解析器类型" />
          </SelectTrigger>
          <SelectContent>
            {parserTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority">优先级</Label>
        <Select
          value={formData.priority}
          onValueChange={(value) => updateField("priority", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="请选择优先级" />
          </SelectTrigger>
          <SelectContent>
            {priorityOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">备注</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => updateField("notes", e.target.value)}
          placeholder="请输入备注信息"
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={formData.enabled}
          onCheckedChange={(checked) => updateField("enabled", checked)}
        />
        <Label>启用状态</Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          取消
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "提交中..." : initialData ? "保存" : "创建"}
        </Button>
      </div>
    </form>
  );
}