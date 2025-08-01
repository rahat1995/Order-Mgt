import { ParticipantViewClient } from '@/components/live-interaction/ParticipantViewClient';
import { Suspense } from 'react';

function JoinSessionPageContent() {
    return (
        <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
            <ParticipantViewClient />
        </div>
    );
}


export default function JoinSessionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JoinSessionPageContent />
    </Suspense>
  );
}
