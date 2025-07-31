
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ListChecks } from "lucide-react";

export default function LivePollsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <ListChecks className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Live Polls Control Panel</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            This area will be your control center for running live polls. You'll be able to select an active poll, see real-time results, and manually push questions to your audience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground p-8">The live poll control panel is under construction.</p>
        </CardContent>
      </Card>
    </div>
  );
}
