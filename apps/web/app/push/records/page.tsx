import { Suspense } from "react";
import { PushConsoleClient } from "@/components/push/push-console-client";

export default function PushRecordsPage() {
  return (
    <Suspense fallback={null}>
      <PushConsoleClient view="records" />
    </Suspense>
  );
}
