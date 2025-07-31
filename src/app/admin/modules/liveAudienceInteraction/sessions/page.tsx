import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Presentation, ClipboardList, FileText } from 'lucide-react';

export default function InteractionSessionsPage() {
  const sessionTypes = [
    {
      type: 'Exam',
      icon: FileText,
      description: 'Create a timed exam with scored questions.',
      href: '#', // Placeholder for now
      enabled: false,
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
      <div className="flex items-center gap-4">
        <Presentation className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Interaction Sessions</h1>
      </div>
      <p className="text-muted-foreground">
        Choose the type of interaction you want to create.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessionTypes.map((session) => (
          <Card
            key={session.type}
            className={`hover:shadow-lg transition-shadow ${!session.enabled ? 'bg-muted/50 cursor-not-allowed' : ''}`}
          >
            <Link href={session.enabled ? session.href : '#'} passHref>
              <div className="h-full flex flex-col justify-between p-6">
                <div className="flex items-center gap-4">
                  <session.icon className="h-8 w-8 text-primary" />
                  <CardTitle className="text-2xl">{session.type}</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  {session.description}
                   {!session.enabled && <span className="text-xs block text-primary/70">(Coming soon)</span>}
                </p>
              </div>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
