import { Suspense } from "react";
import { PushConsoleClient } from "@/components/push/push-console-client";

export default function PushWorkbenchPage() {
  return (
    <Suspense fallback={null}>
      <PushConsoleClient view="workbench" />
    </Suspense>
  );
}
