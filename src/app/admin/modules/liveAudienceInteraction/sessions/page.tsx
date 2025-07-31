
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Presentation } from "lucide-react";

export default function InteractionSessionsPage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Presentation className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Interaction Sessions</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            This section is under construction. You will be able to create and manage your live polls, exams, and surveys here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Future features will include a session builder, QR code generation for audience entry, and real-time activation controls.</p>
        </CardContent>
      </Card>
    </div>
  );
}
