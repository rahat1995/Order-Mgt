
'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users, QrCode } from 'lucide-react';
import type { InteractionSession, Participant } from '@/types';
import QRCode from 'react-qr-code';

export function HostViewClient({ sessionId }: { sessionId: string }) {
    const { settings, isLoaded } = useSettings();
    const [session, setSession] = useState<InteractionSession | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [viewState, setViewState] = useState<'joining' | 'questions' | 'results'>('joining');

    useEffect(() => {
        if (isLoaded) {
            const foundSession = settings.interactionSessions?.find(s => s.id === sessionId);
            if (foundSession) {
                setSession(foundSession);
            }
        }
    }, [isLoaded, settings.interactionSessions, sessionId]);

    useEffect(() => {
        if (!session) return;
        
        // Poll for participant updates every 2 seconds
        const interval = setInterval(() => {
            const currentParticipants = settings.participants?.filter(p => p.sessionId === session.id) || [];
            setParticipants(currentParticipants);
        }, 2000);

        return () => clearInterval(interval);

    }, [session, settings.participants]);

    const getJoinUrl = () => {
        if (typeof window !== 'undefined') {
            return `${window.location.origin}/join`;
        }
        return '';
    };

    if (!isLoaded || !session) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin" />
            </div>
        );
    }
    
    if (viewState === 'joining') {
        return (
            <div className="h-full grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                <div className="md:col-span-2 flex flex-col items-center justify-center bg-muted rounded-lg p-8">
                     <h1 className="text-4xl font-bold mb-4">{session.name}</h1>
                     <p className="text-xl text-muted-foreground mb-8">Ask your audience to scan the QR code to join.</p>
                     <div className="p-6 bg-white rounded-xl shadow-lg">
                        <QRCode value={getJoinUrl()} size={256} />
                     </div>
                     <p className="mt-4 font-mono text-lg">{getJoinUrl()}</p>
                </div>
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users />
                            Participants ({participants.length})
                        </CardTitle>
                        <CardDescription>As participants join, they will appear here.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto">
                        <div className="space-y-2">
                            {participants.map(p => (
                                <div key={p.id} className="p-3 border rounded-md bg-background">
                                    <p className="font-semibold">{p.name}</p>
                                    {p.organization && <p className="text-sm text-muted-foreground">{p.organization}</p>}
                                </div>
                            ))}
                             {participants.length === 0 && (
                                <p className="text-sm text-center text-muted-foreground pt-12">Waiting for participants...</p>
                             )}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" size="lg" onClick={() => alert('Question progression coming soon!')}>Start Exam</Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    // Placeholders for next steps
    return <div>Coming soon</div>;
}
