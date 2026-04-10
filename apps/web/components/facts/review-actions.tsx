"use client";

import { Fact, FactStatus } from "@/types";
import { factStatusLabels } from "@/types/labels";
import { Badge } from "@/components/ui/badge";
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
  const getStatusBadgeVariant = (status: FactStatus) => {
    switch (status) {
      case FactStatus.APPROVED:
        return "default";
      case FactStatus.PENDING_REVIEW:
        return "secondary";
      case FactStatus.REJECTED:
        return "destructive";
      case FactStatus.DRAFT:
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Badge variant={getStatusBadgeVariant(fact.status)}>
        {factStatusLabels[fact.status]}
      </Badge>
      {fact.status === FactStatus.PENDING_REVIEW && (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="xs"
            onClick={() => onApprove(fact)}
          >
            <Check className="size-3" />
            确认
          </Button>
          <Button
            variant="outline"
            size="xs"
            onClick={() => onEdit(fact)}
          >
            <Edit className="size-3" />
            修改
          </Button>
          <Button
            variant="destructive"
            size="xs"
            onClick={() => onReject(fact)}
          >
            <X className="size-3" />
            驳回
          </Button>
        </div>
      )}
    </div>
  );
}