"use client";

import { useState, useMemo } from "react";
import { Fact, Company, EventType, FactStatus } from "@/types";
import { mockFacts } from "@/mock/facts";
import { FactTable } from "@/components/facts/fact-table";
import { FactFilter } from "@/components/facts/fact-filter";
import { FactDetailSheet } from "@/components/facts/fact-detail-sheet";

export default function FactsPage() {
  const [facts, setFacts] = useState<Fact[]>(mockFacts);
  const [selectedFact, setSelectedFact] = useState<Fact | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [company, setCompany] = useState<Company | "">("");
  const [eventType, setEventType] = useState<EventType | "">("");
  const [status, setStatus] = useState<FactStatus | "">("");
  const [needReview, setNeedReview] = useState<string | null>(null);

  const filteredFacts = useMemo(() => {
    return facts.filter((fact) => {
      if (company && fact.company !== company) return false;
      if (eventType && fact.eventType !== eventType) return false;
      if (status && fact.status !== status) return false;
      if (needReview === "yes" && fact.status !== FactStatus.PENDING_REVIEW) return false;
      if (needReview === "no" && fact.status === FactStatus.PENDING_REVIEW) return false;
      return true;
    });
  }, [facts, company, eventType, status, needReview]);

  const handleRowClick = (fact: Fact) => {
    setSelectedFact(fact);
    setSheetOpen(true);
  };

  const handleApprove = (fact: Fact) => {
    setFacts((prev) =>
      prev.map((f) =>
        f.id === fact.id
          ? { ...f, status: FactStatus.APPROVED, reviewedBy: "当前用户", reviewedAt: new Date().toISOString() }
          : f
      )
    );
  };

  const handleReject = (fact: Fact) => {
    setFacts((prev) =>
      prev.map((f) =>
        f.id === fact.id
          ? { ...f, status: FactStatus.REJECTED, reviewedBy: "当前用户", reviewedAt: new Date().toISOString() }
          : f
      )
    );
  };

  const handleEdit = (fact: Fact) => {
    setSelectedFact(fact);
    setSheetOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">标准化事实</h1>
        <p className="text-sm text-muted-foreground">
          共 {filteredFacts.length} 条事实
        </p>
      </div>

      <FactFilter
        company={company}
        eventType={eventType}
        status={status}
        needReview={needReview}
        onCompanyChange={setCompany}
        onEventTypeChange={setEventType}
        onStatusChange={setStatus}
        onNeedReviewChange={(value) => setNeedReview(value)}
      />

      <FactTable
        facts={filteredFacts}
        onRowClick={handleRowClick}
        onApprove={handleApprove}
        onReject={handleReject}
        onEdit={handleEdit}
      />

      <FactDetailSheet
        fact={selectedFact}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}