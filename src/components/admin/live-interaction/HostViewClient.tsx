'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users, QrCode, ArrowLeft, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import type { InteractionSession, Participant, InteractionQuestion, InteractionResponse } from '@/types';
import QRCode from 'react-qr-code';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const QuestionDisplay = ({ question }: { question: InteractionQuestion }) => (
    <div className="p-8 border rounded-lg bg-background h-full flex flex-col justify-center">
        <p className="text-3xl font-bold text-center">{question.text}</p>
        <div className="mt-8 grid grid-cols-2 gap-4">
            {(question.options || []).map(option => (
                <div key={option.id} className={cn(
                    "p-4 border-2 rounded-lg text-center font-semibold text-lg",
                    option.id === question.correctOptionId ? "border-primary bg-primary/10" : "border-muted"
                )}>
                    {option.text}
                </div>
            ))}
        </div>
    </div>
);


const AnswerResults = ({ question, responses, participants }: { question: InteractionQuestion, responses: InteractionResponse[], participants: Participant[] }) => {
    const totalResponses = responses.length;
    
    const getParticipantName = (id: string) => participants.find(p => p.id === id)?.name || 'Unknown';
    
    const responsesByOption = (question.options || []).map(option => {
        const optionResponses = responses.filter(r => r.answer === option.id);
        const percentage = totalResponses > 0 ? (optionResponses.length / totalResponses) * 100 : 0;
        return {
            ...option,
            responses: optionResponses,
            count: optionResponses.length,
            percentage,
        };
    });

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>Live Answers ({totalResponses})</CardTitle>
                <CardDescription>Results for the current question.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-3">
                {responsesByOption.map(opt => (
                    <div key={opt.id}>
                        <div className="flex justify-between items-center mb-1 text-sm">
                            <span className="font-semibold flex items-center">
                                {opt.id === question.correctOptionId 
                                    ? <CheckCircle className="h-4 w-4 mr-2 text-green-500" /> 
                                    : <XCircle className="h-4 w-4 mr-2 text-destructive" />
                                }
                                {opt.text}
                            </span>
                            <span className="text-muted-foreground">{opt.count} ({opt.percentage.toFixed(0)}%)</span>
                        </div>
                        <Progress value={opt.percentage} />
                        <div className="text-xs text-muted-foreground space-y-1 mt-2 pl-4">
                            {opt.responses.map(res => (
                                <p key={res.id}>- {getParticipantName(res.participantId)}</p>
                            ))}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}


export function HostViewClient({ sessionId }: { sessionId: string }) {
    const { settings, isLoaded } = useSettings();
    const [session, setSession] = useState<InteractionSession | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [responses, setResponses] = useState<InteractionResponse[]>([]);
    const [viewState, setViewState] = useState<'joining' | 'questions' | 'results'>('joining');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

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
        
        const interval = setInterval(() => {
            const currentParticipants = settings.participants?.filter(p => p.sessionId === session.id) || [];
            const currentResponses = settings.interactionResponses?.filter(r => r.sessionId === session.id) || [];
            setParticipants(currentParticipants);
            setResponses(currentResponses);
        }, 1000);

        return () => clearInterval(interval);

    }, [session, settings.participants, settings.interactionResponses]);

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

    const currentQuestion = session.questions[currentQuestionIndex];
    const currentQuestionResponses = responses.filter(r => r.questionId === currentQuestion?.id);

    const handleNextQuestion = () => {
        if (currentQuestionIndex < session.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            setViewState('results'); // Or a dedicated results state
        }
    };
    
    const handlePrevQuestion = () => {
        setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
    };
    
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
                        <Button className="w-full" size="lg" onClick={() => setViewState('questions')} disabled={session.questions.length === 0}>
                            {session.questions.length > 0 ? 'Start Exam' : 'No Questions Found'}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    if (viewState === 'questions') {
        return (
            <div className="h-full flex flex-col p-6 gap-6">
                <div className="flex justify-between items-center flex-shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold">{session.name}</h1>
                        <p className="text-muted-foreground">Question {currentQuestionIndex + 1} of {session.questions.length}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={handlePrevQuestion} disabled={currentQuestionIndex === 0}>
                            <ArrowLeft className="mr-2 h-4 w-4"/> Previous
                        </Button>
                        <Button onClick={handleNextQuestion}>
                            {currentQuestionIndex === session.questions.length - 1 ? 'Finish Exam' : 'Next Question'}
                             <ArrowRight className="ml-2 h-4 w-4"/>
                        </Button>
                    </div>
                </div>
                <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
                    <div className="md:col-span-2">
                        <QuestionDisplay question={currentQuestion} />
                    </div>
                    <div>
                        <AnswerResults question={currentQuestion} responses={currentQuestionResponses} participants={participants} />
                    </div>
                </div>
            </div>
        )
    }

    if (viewState === 'results') {
         return (
             <div className="h-full flex items-center justify-center text-center">
                 <Card>
                     <CardHeader>
                         <CardTitle>Exam Finished!</CardTitle>
                         <CardDescription>Results view is coming soon.</CardDescription>
                     </CardHeader>
                 </Card>
             </div>
         )
    }

    return <div>Invalid State</div>;
}