"use client";

import { useState, useMemo } from "react";
import { Company } from "@/types";
import { mockModels, Model, ModelType, modelTypeLabels, apiCapabilityLabels } from "@/mock/models";
import { companyLabels } from "@/types/labels";
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
import { Eye } from "lucide-react";

export default function ModelsPage() {
  const [models] = useState<Model[]>(mockModels);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [company, setCompany] = useState<Company | "">("");
  const [modelType, setModelType] = useState<ModelType | "">("");

  const filteredModels = useMemo(() => {
    return models.filter((model) => {
      if (company && model.company !== company) return false;
      if (modelType && model.modelType !== modelType) return false;
      return true;
    });
  }, [models, company, modelType]);

  const handleRowClick = (model: Model) => {
    setSelectedModel(model);
    setSheetOpen(true);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "beta":
        return "secondary";
      case "deprecated":
        return "outline";
      default:
        return "outline";
    }
  };

  const columns = [
    {
      key: "name",
      header: "模型名称",
      render: (model: Model) => (
        <span className="font-medium">{model.name}</span>
      ),
    },
    {
      key: "company",
      header: "所属公司",
      render: (model: Model) => (
        <Badge variant="outline">{companyLabels[model.company]}</Badge>
      ),
    },
    {
      key: "modelType",
      header: "模型类型",
      render: (model: Model) => (
        <Badge variant="ghost">{modelTypeLabels[model.modelType]}</Badge>
      ),
    },
    {
      key: "releaseDate",
      header: "发布时间",
      render: (model: Model) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(model.releaseDate)}
        </span>
      ),
    },
    {
      key: "pricing",
      header: "定价信息",
      render: (model: Model) => (
        <span className="text-sm line-clamp-1 max-w-[150px]">{model.pricing}</span>
      ),
      className: "max-w-[150px]",
    },
    {
      key: "capabilities",
      header: "核心能力",
      render: (model: Model) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {model.capabilities.slice(0, 3).map((cap) => (
            <Badge key={cap} variant="ghost" className="text-xs">
              {cap}
            </Badge>
          ))}
          {model.capabilities.length > 3 && (
            <Badge variant="ghost" className="text-xs">
              +{model.capabilities.length - 3}
            </Badge>
          )}
        </div>
      ),
      className: "max-w-[200px]",
    },
    {
      key: "contextLength",
      header: "上下文长度",
      render: (model: Model) => (
        <span className="text-sm">{model.contextLength}</span>
      ),
    },
    {
      key: "apiCapabilities",
      header: "API能力",
      render: (model: Model) => (
        <div className="flex flex-wrap gap-1">
          {model.apiCapabilities.slice(0, 2).map((cap) => (
            <Badge key={cap} variant="outline" className="text-xs">
              {apiCapabilityLabels[cap]}
            </Badge>
          ))}
          {model.apiCapabilities.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{model.apiCapabilities.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "操作",
      render: (model: Model) => (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => {
            e.stopPropagation();
            handleRowClick(model);
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">模型档案</h1>
        <p className="text-sm text-muted-foreground">
          共 {filteredModels.length} 个模型
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={company || undefined}
          onValueChange={(value) => setCompany((value ?? "") as Company | "")}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="公司筛选" />
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

        <Select
          value={modelType || undefined}
          onValueChange={(value) => setModelType((value ?? "") as ModelType | "")}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="模型类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">全部类型</SelectItem>
            {Object.keys(modelTypeLabels).map((t) => (
              <SelectItem key={t} value={t}>
                {modelTypeLabels[t as ModelType]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filteredModels}
        rowKey={(model) => model.id}
        onRowClick={handleRowClick}
        emptyText="暂无模型数据"
      />

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{selectedModel?.name}</SheetTitle>
            <SheetDescription>{selectedModel?.description}</SheetDescription>
          </SheetHeader>
          {selectedModel && (
            <ScrollArea className="h-[calc(100vh-120px)]">
              <div className="space-y-4 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">所属公司</span>
                    <Badge variant="outline">{companyLabels[selectedModel.company]}</Badge>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">模型类型</span>
                    <Badge variant="outline">{modelTypeLabels[selectedModel.modelType]}</Badge>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">发布时间</span>
                    <span className="text-sm">{formatDate(selectedModel.releaseDate)}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">状态</span>
                    <Badge variant={getStatusBadgeVariant(selectedModel.status)}>
                      {selectedModel.status === "active" ? "活跃" : selectedModel.status === "beta" ? "测试版" : "已废弃"}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-foreground">定价信息</h3>
                  <p className="text-sm text-muted-foreground">{selectedModel.pricing}</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-foreground">上下文长度</h3>
                  <p className="text-sm text-muted-foreground">{selectedModel.contextLength}</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-foreground">核心能力</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedModel.capabilities.map((cap) => (
                      <Badge key={cap} variant="ghost">{cap}</Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-foreground">API能力</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedModel.apiCapabilities.map((cap) => (
                      <Badge key={cap} variant="outline">{apiCapabilityLabels[cap]}</Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-foreground">更新历史</h3>
                  <div className="space-y-3">
                    {selectedModel.updateHistory.map((update, index) => (
                      <div key={index} className="rounded-lg border border-border bg-muted/30 p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">v{update.version}</Badge>
                          <span className="text-xs text-muted-foreground">{formatDate(update.date)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{update.changes}</p>
                      </div>
                    ))}
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