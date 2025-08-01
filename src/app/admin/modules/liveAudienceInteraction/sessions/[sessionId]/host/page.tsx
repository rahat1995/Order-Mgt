
import { HostViewClient } from "@/components/admin/live-interaction/HostViewClient";
import { Vote } from "lucide-react";

export default function HostSessionPage({ params }: { params: { sessionId: string } }) {
  return (
    <div className="h-screen w-screen bg-background text-foreground fixed inset-0 z-50">
        <HostViewClient sessionId={params.sessionId} />
    </div>
  );
}
