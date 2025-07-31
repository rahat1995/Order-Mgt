
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Presentation, ClipboardList, FileText, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SessionListClient } from '@/components/admin/live-interaction/SessionListClient';

export default function InteractionSessionsPage() {
  const sessionTypes = [
    {
      type: 'Exam',
      icon: FileText,
      description: 'Create a timed exam with scored questions.',
      href: '/admin/modules/liveAudienceInteraction/exam/create',
      enabled: true,
    },
    {
      type: 'Survey',
      icon: ClipboardList,
      description: 'Gather anonymous feedback with a survey.',
      href: '#', // Placeholder for now
      enabled: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Presentation className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Interaction Sessions</h1>
        </div>
        <Link href="/admin/modules/liveAudienceInteraction/exam/create" passHref>
          <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Session
          </Button>
        </Link>
      </div>
      <p className="text-muted-foreground">
        Manage all your live audience interaction sessions. Activate a session to make it available for participants.
      </p>
      
      <SessionListClient />

    </div>
  );
}
