"use client";

import { Fact } from "@/types/entities";
import { Button } from "@/components/ui/button";
import { Check, X, Edit } from "lucide-react";

interface ReviewActionsProps {
  fact: Fact;
  onApprove: (fact: Fact) => void;
  onReject: (fact: Fact) => void;
  onEdit: (fact: Fact) => void;
}

export function ReviewActions({
  fact,
  onApprove,
  onReject,
  onEdit,
}: ReviewActionsProps) {
  return (
    <div className="flex items-center gap-1">
      {fact.review_status === "pending" && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onApprove(fact);
            }}
          >
            <Check className="h-3 w-3" />
            确认
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(fact);
            }}
          >
            <Edit className="h-3 w-3" />
            修改
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onReject(fact);
            }}
          >
            <X className="h-3 w-3" />
            驳回
          </Button>
        </>
      )}
    </div>
  );
}