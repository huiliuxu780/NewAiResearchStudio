import { Suspense } from "react";
import { PushConsoleClient } from "@/components/push/push-console-client";

export default function PushOverviewPage() {
  return (
    <Suspense fallback={null}>
      <PushConsoleClient view="overview" />
    </Suspense>
  );
}
