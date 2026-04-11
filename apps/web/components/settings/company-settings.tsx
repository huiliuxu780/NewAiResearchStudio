"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SettingsSection } from "@/components/settings/settings-section";
import { useCompanySettings } from "@/hooks/use-settings";
import { Building2, Mail, Phone, MapPin, Globe, Image } from "lucide-react";

interface CompanyFormData {
  company_name: string;
  company_logo: string;
  contact_email: string;
  contact_phone: string;
  company_address: string;
  company_website: string;
}

const defaultFormData: CompanyFormData = {
  company_name: "",
  company_logo: "",
  contact_email: "",
  contact_phone: "",
  company_address: "",
  company_website: "",
};

export function CompanySettings({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const { data, isLoading, isSaving, update } = useCompanySettings();

  const [formData, setFormData] = React.useState<CompanyFormData>(defaultFormData);
  const [errors, setErrors] = React.useState<Partial<Record<keyof CompanyFormData, string>>>({});
  const [isDirty, setIsDirty] = React.useState(false);

  // Sync data from server
  React.useEffect(() => {
    if (data) {
      setFormData({
        company_name: data.company_name ?? "",
        company_logo: data.company_logo ?? "",
        contact_email: data.contact_email ?? "",
        contact_phone: data.contact_phone ?? "",
        company_address: data.company_address ?? "",
        company_website: data.company_website ?? "",
      });
      setErrors({});
      setIsDirty(false);
    }
  }, [data]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CompanyFormData, string>> = {};

    if (!formData.company_name.trim()) {
      newErrors.company_name = "公司名称不能为空";
    }

    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = "邮箱格式不正确";
    }

    if (formData.contact_phone && !/^[\d\s\-+()]{7,20}$/.test(formData.contact_phone)) {
      newErrors.contact_phone = "电话号码格式不正确";
    }

    if (formData.company_website && !/^https?:\/\/.+/.test(formData.company_website)) {
      newErrors.company_website = "网址必须以 http:// 或 https:// 开头";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof CompanyFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    // Clear error on change
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      await update(formData);
      setIsDirty(false);
    } catch {
      // Error handled by SWR
    }
  };

  const handleReset = () => {
    if (data) {
      setFormData({
        company_name: data.company_name ?? "",
        company_logo: data.company_logo ?? "",
        contact_email: data.contact_email ?? "",
        contact_phone: data.contact_phone ?? "",
        company_address: data.company_address ?? "",
        company_website: data.company_website ?? "",
      });
    } else {
      setFormData(defaultFormData);
    }
    setErrors({});
    setIsDirty(false);
  };

  return (
    <SettingsSection
      title="公司信息"
      description="配置公司基本信息和联系方式"
      isLoading={isLoading}
      isSaving={isSaving}
      onSave={handleSave}
      onReset={handleReset}
      saveDisabled={!isDirty}
      className={className}
    >
      {/* Company Name */}
      <div className="space-y-2">
        <Label htmlFor="company_name" className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          公司名称
        </Label>
        <Input
          id="company_name"
          value={formData.company_name}
          onChange={(e) => handleChange("company_name", e.target.value)}
          placeholder="请输入公司名称"
          aria-invalid={!!errors.company_name}
          aria-describedby={errors.company_name ? "company_name-error" : undefined}
          className={cn(errors.company_name && "border-destructive")}
        />
        {errors.company_name && (
          <p id="company_name-error" className="text-xs text-destructive" role="alert">
            {errors.company_name}
          </p>
        )}
      </div>

      {/* Company Logo */}
      <div className="space-y-2">
        <Label htmlFor="company_logo" className="flex items-center gap-2">
          <Image className="h-4 w-4 text-muted-foreground" />
          公司 Logo URL
        </Label>
        <Input
          id="company_logo"
          value={formData.company_logo}
          onChange={(e) => handleChange("company_logo", e.target.value)}
          placeholder="https://example.com/logo.png"
          className="font-mono text-xs"
        />
        {formData.company_logo && (
          <div className="mt-2 flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3">
            <img
              src={formData.company_logo}
              alt="Logo 预览"
              className="h-10 w-10 rounded-md object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <span className="text-xs text-muted-foreground">Logo 预览</span>
          </div>
        )}
      </div>

      {/* Contact Email */}
      <div className="space-y-2">
        <Label htmlFor="contact_email" className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          联系邮箱
        </Label>
        <Input
          id="contact_email"
          type="email"
          value={formData.contact_email}
          onChange={(e) => handleChange("contact_email", e.target.value)}
          placeholder="contact@example.com"
          aria-invalid={!!errors.contact_email}
          aria-describedby={errors.contact_email ? "contact_email-error" : undefined}
          className={cn(errors.contact_email && "border-destructive")}
        />
        {errors.contact_email && (
          <p id="contact_email-error" className="text-xs text-destructive" role="alert">
            {errors.contact_email}
          </p>
        )}
      </div>

      {/* Contact Phone */}
      <div className="space-y-2">
        <Label htmlFor="contact_phone" className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          联系电话
        </Label>
        <Input
          id="contact_phone"
          type="tel"
          value={formData.contact_phone}
          onChange={(e) => handleChange("contact_phone", e.target.value)}
          placeholder="+86 138 0000 0000"
          aria-invalid={!!errors.contact_phone}
          aria-describedby={errors.contact_phone ? "contact_phone-error" : undefined}
          className={cn(errors.contact_phone && "border-destructive")}
        />
        {errors.contact_phone && (
          <p id="contact_phone-error" className="text-xs text-destructive" role="alert">
            {errors.contact_phone}
          </p>
        )}
      </div>

      {/* Company Address */}
      <div className="space-y-2">
        <Label htmlFor="company_address" className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          公司地址
        </Label>
        <Textarea
          id="company_address"
          value={formData.company_address}
          onChange={(e) => handleChange("company_address", e.target.value)}
          placeholder="请输入公司详细地址"
          rows={2}
        />
      </div>

      {/* Company Website */}
      <div className="space-y-2">
        <Label htmlFor="company_website" className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          公司网站
        </Label>
        <Input
          id="company_website"
          type="url"
          value={formData.company_website}
          onChange={(e) => handleChange("company_website", e.target.value)}
          placeholder="https://www.example.com"
          aria-invalid={!!errors.company_website}
          aria-describedby={errors.company_website ? "company_website-error" : undefined}
          className={cn("font-mono text-xs", errors.company_website && "border-destructive")}
        />
        {errors.company_website && (
          <p id="company_website-error" className="text-xs text-destructive" role="alert">
            {errors.company_website}
          </p>
        )}
      </div>
    </SettingsSection>
  );
}
