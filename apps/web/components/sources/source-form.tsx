"use client";

import { useState, useEffect } from "react";
import { Source, Company, SourceType } from "@/types";
import { companyLabels, sourceTypeLabels } from "@/types/labels";
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
}

interface SourceFormProps {
  initialData?: Source | null;
  onSubmit: (data: SourceFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const companyOptions = [
  { value: Company.ALIBABA, label: companyLabels[Company.ALIBABA] },
  { value: Company.BYTE_DANCE, label: companyLabels[Company.BYTE_DANCE] },
  { value: Company.TENCENT, label: companyLabels[Company.TENCENT] },
];

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
  { value: "P0", label: "P0" },
  { value: "P1", label: "P1" },
  { value: "P2", label: "P2" },
  { value: "P3", label: "P3" },
];

const defaultFormData: SourceFormData = {
  name: "",
  company: "",
  source_type: "",
  url: "",
  schedule: "",
  parser_type: "",
  priority: "P2",
  notes: "",
  enabled: true,
};

export function SourceForm({ initialData, onSubmit, onCancel, loading }: SourceFormProps) {
  const [formData, setFormData] = useState<SourceFormData>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        company: initialData.company || "",
        source_type: initialData.type || "",
        url: initialData.url || "",
        schedule: "",
        parser_type: "",
        priority: "P2",
        notes: initialData.description || "",
        enabled: initialData.isActive ?? true,
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