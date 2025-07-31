import { CreateExamClient } from "@/components/admin/live-interaction/CreateExamClient";
import { FileText } from "lucide-react";

export default function CreateExamPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <FileText className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Create New Exam</h1>
      </div>
      <p className="text-muted-foreground">
        Follow the steps to configure your exam session, add questions, and set the rules.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <CreateExamClient />
    </div>
  );
}
