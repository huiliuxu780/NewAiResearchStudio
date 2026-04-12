"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { COMPANY_LABELS } from "@/types/reports";
import { Sparkles } from "lucide-react";

interface ReportFormProps {
  onSubmit: (data: { company: string; start_date: string; end_date: string }) => void;
  isLoading: boolean;
}

export function ReportForm({ onSubmit, isLoading }: ReportFormProps) {
  const [company, setCompany] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ company, start_date: startDate, end_date: endDate });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>生成周报</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>公司</Label>
            <Select value={company} onValueChange={(value) => setCompany(value ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择公司" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(COMPANY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>开始日期</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label>结束日期</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={isLoading || !company || !startDate || !endDate}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {isLoading ? "生成中..." : "生成周报"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
