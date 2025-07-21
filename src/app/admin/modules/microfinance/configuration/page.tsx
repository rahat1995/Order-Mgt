
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Cog } from "lucide-react";

export default function MicrofinanceConfigurationPage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Cog className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Microfinance Configuration</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            This section is under construction. You will be able to manage all settings for the microfinance module here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Future features will include setting up general ledger mappings, interest calculation methods, and other global parameters.</p>
        </CardContent>
      </Card>
    </div>
  );
}
