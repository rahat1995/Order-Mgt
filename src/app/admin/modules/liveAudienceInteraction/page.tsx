
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Vote, MessageSquare, ListChecks, Presentation, BarChart } from 'lucide-react';

const interactionSubModules = [
  {
    href: '/admin/modules/liveAudienceInteraction/sessions',
    icon: Presentation,
    title: 'Interaction Sessions',
    description: 'Create and manage polls, exams, and surveys.',
    enabled: true,
  },
  {
    href: '/admin/modules/liveAudienceInteraction/report',
    icon: BarChart,
    title: 'Session Reports',
    description: 'View detailed reports and results from past sessions.',
    enabled: true,
  },
  {
    href: '/admin/modules/liveAudienceInteraction/polls',
    icon: ListChecks,
    title: 'Live Polls',
    description: 'Manage and display real-time poll results.',
    enabled: true,
  },
  {
    href: '/admin/modules/liveAudienceInteraction/qa',
    icon: MessageSquare,
    title: 'Audience Q&A',
    description: 'Manage questions submitted by the audience.',
    enabled: false,
  },
];

export default function LiveAudienceInteractionPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Vote className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Live Audience Interaction</h1>
      </div>
      <p className="text-muted-foreground">
        Engage with your audience in real-time during events, presentations, or streams.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {interactionSubModules.map((module) => (
          <Card
            key={module.title}
            className={`hover:shadow-lg transition-shadow ${!module.enabled ? 'bg-muted/50 cursor-not-allowed' : ''}`}
          >
            <Link href={module.enabled ? module.href : '#'} passHref>
              <div className="h-full flex flex-col justify-between">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                  <module.icon className="h-6 w-6 text-primary" />
                  <CardTitle>{module.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {module.description}
                    {!module.enabled && <span className="text-xs block text-primary/70">(Coming soon)</span>}
                  </p>
                </CardContent>
              </div>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
