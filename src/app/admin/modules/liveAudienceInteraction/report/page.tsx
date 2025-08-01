
import { SessionReportClient } from "@/components/admin/live-interaction/SessionReportClient";
import { BarChart } from "lucide-react";

export default function SessionReportPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <BarChart className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Session Reports</h1>
      </div>
      <p className="text-muted-foreground">
        Analyze results from your past interaction sessions. Select a session to view participant scores and detailed answers.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <SessionReportClient />
    </div>
  );
}
