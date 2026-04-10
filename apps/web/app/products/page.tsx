"use client";

import { useState, useMemo } from "react";
import { Company } from "@/types";
import { mockProducts, Product, ProductType, productTypeLabels, updateFrequencyLabels } from "@/mock/products";
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

export default function ProductsPage() {
  const [products] = useState<Product[]>(mockProducts);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [company, setCompany] = useState<Company | "">("");
  const [productType, setProductType] = useState<ProductType | "">("");

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (company && product.company !== company) return false;
      if (productType && product.productType !== productType) return false;
      return true;
    });
  }, [products, company, productType]);

  const handleRowClick = (product: Product) => {
    setSelectedProduct(product);
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
      case "discontinued":
        return "outline";
      default:
        return "outline";
    }
  };

  const columns = [
    {
      key: "name",
      header: "产品名称",
      render: (product: Product) => (
        <span className="font-medium">{product.name}</span>
      ),
    },
    {
      key: "company",
      header: "所属公司",
      render: (product: Product) => (
        <Badge variant="outline">{companyLabels[product.company]}</Badge>
      ),
    },
    {
      key: "productType",
      header: "产品类型",
      render: (product: Product) => (
        <Badge variant="ghost">{productTypeLabels[product.productType]}</Badge>
      ),
    },
    {
      key: "positioning",
      header: "产品定位",
      render: (product: Product) => (
        <span className="text-sm line-clamp-1 max-w-[150px]">{product.positioning}</span>
      ),
      className: "max-w-[150px]",
    },
    {
      key: "capabilities",
      header: "核心能力",
      render: (product: Product) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {product.capabilities.slice(0, 3).map((cap) => (
            <Badge key={cap} variant="ghost" className="text-xs">
              {cap}
            </Badge>
          ))}
          {product.capabilities.length > 3 && (
            <Badge variant="ghost" className="text-xs">
              +{product.capabilities.length - 3}
            </Badge>
          )}
        </div>
      ),
      className: "max-w-[200px]",
    },
    {
      key: "updateFrequency",
      header: "更新节奏",
      render: (product: Product) => (
        <Badge variant="outline">{updateFrequencyLabels[product.updateFrequency]}</Badge>
      ),
    },
    {
      key: "relatedModels",
      header: "关联模型",
      render: (product: Product) => (
        <div className="flex flex-wrap gap-1">
          {product.relatedModels.slice(0, 2).map((model) => (
            <Badge key={model} variant="secondary" className="text-xs">
              {model}
            </Badge>
          ))}
          {product.relatedModels.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{product.relatedModels.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "操作",
      render: (product: Product) => (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => {
            e.stopPropagation();
            handleRowClick(product);
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
        <h1 className="text-2xl font-bold text-foreground">产品档案</h1>
        <p className="text-sm text-muted-foreground">
          共 {filteredProducts.length} 个产品
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
          value={productType || undefined}
          onValueChange={(value) => setProductType((value ?? "") as ProductType | "")}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="产品类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">全部类型</SelectItem>
            {Object.keys(productTypeLabels).map((t) => (
              <SelectItem key={t} value={t}>
                {productTypeLabels[t as ProductType]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filteredProducts}
        rowKey={(product) => product.id}
        onRowClick={handleRowClick}
        emptyText="暂无产品数据"
      />

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{selectedProduct?.name}</SheetTitle>
            <SheetDescription>{selectedProduct?.positioning}</SheetDescription>
          </SheetHeader>
          {selectedProduct && (
            <ScrollArea className="h-[calc(100vh-120px)]">
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-foreground">产品描述</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedProduct.description}
                  </p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">所属公司</span>
                    <Badge variant="outline">{companyLabels[selectedProduct.company]}</Badge>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">产品类型</span>
                    <Badge variant="outline">{productTypeLabels[selectedProduct.productType]}</Badge>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">发布时间</span>
                    <span className="text-sm">{formatDate(selectedProduct.launchDate)}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">状态</span>
                    <Badge variant={getStatusBadgeVariant(selectedProduct.status)}>
                      {selectedProduct.status === "active" ? "活跃" : selectedProduct.status === "beta" ? "测试版" : "已停运"}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">更新节奏</span>
                    <Badge variant="outline">{updateFrequencyLabels[selectedProduct.updateFrequency]}</Badge>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">定价</span>
                    <span className="text-sm">{selectedProduct.pricing}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-foreground">核心能力</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.capabilities.map((cap) => (
                      <Badge key={cap} variant="ghost">{cap}</Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-foreground">关联模型</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.relatedModels.map((model) => (
                      <Badge key={model} variant="secondary">{model}</Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-foreground">目标用户</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.targetUsers.map((user) => (
                      <Badge key={user} variant="outline">{user}</Badge>
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