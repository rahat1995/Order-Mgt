
'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users, QrCode, ArrowLeft, ArrowRight, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { InteractionSession, Participant, InteractionQuestion, InteractionResponse } from '@/types';
import QRCode from 'react-qr-code';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const QuestionDisplay = ({ question, timeLeft }: { question: InteractionQuestion, timeLeft: number | null }) => (
    <div className="p-8 border rounded-lg bg-background h-full flex flex-col justify-center relative">
        {timeLeft !== null && (
            <div className="absolute top-4 right-4 flex items-center gap-2 text-lg font-bold text-primary tabular-nums">
                <Clock className="h-5 w-5" />
                <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
            </div>
        )}
        <p className="text-3xl font-bold text-center">{question.text}</p>
        <div className="mt-8 grid grid-cols-2 gap-4">
            {(question.options || []).map(option => (
                <div key={option.id} className="p-4 border-2 rounded-lg text-center font-semibold text-lg border-muted">
                    {option.text}
                </div>
            ))}
        </div>
    </div>
);


const ParticipantProgress = ({ participants, responses }: { participants: Participant[], responses: InteractionResponse[] }) => {
    const participantProgress = participants.map(p => {
        const answeredCount = responses.filter(r => r.participantId === p.id).length;
        return {
            ...p,
            answeredCount,
        };
    }).sort((a, b) => b.answeredCount - a.answeredCount);

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>Participant Progress ({participants.length})</CardTitle>
                <CardDescription>Real-time count of answered questions per participant.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-2">
                {participantProgress.map(p => (
                    <div key={p.id} className="flex justify-between items-center p-2 border rounded-md bg-muted/50">
                        <span className="font-semibold">{p.name}</span>
                        <span className="text-sm text-muted-foreground">{p.answeredCount} answered</span>
                    </div>
                ))}
                 {participantProgress.length === 0 && (
                    <p className="text-sm text-center text-muted-foreground pt-12">Waiting for participants...</p>
                 )}
            </CardContent>
        </Card>
    );
}

const FinalResults = ({ session, participants, responses }: { session: InteractionSession, participants: Participant[], responses: InteractionResponse[] }) => {
    const results = participants.map(p => {
        let score = 0;
        const participantResponses = session.questions.map(q => {
            const response = responses.find(r => r.participantId === p.id && r.questionId === q.id);
            const isCorrect = response?.answer === q.correctOptionId;
            if (isCorrect) score++;
            
            const selectedOption = q.options?.find(opt => opt.id === response?.answer);
            return {
                questionId: q.id,
                isCorrect,
                answerText: selectedOption?.text || response?.answer || 'N/A'
            };
        });
        return {
            ...p,
            score,
            responses: participantResponses
        };
    }).sort((a,b) => b.score - a.score);

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>Final Results</CardTitle>
                <CardDescription>Summary of participant performance.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Rank</TableHead>
                            <TableHead>Participant</TableHead>
                            {session.questions.map((q, i) => (
                                <TableHead key={q.id} className="text-center">Q{i+1}</TableHead>
                            ))}
                            <TableHead className="text-right">Score</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {results.map((res, index) => (
                            <TableRow key={res.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell className="font-semibold">{res.name}</TableCell>
                                {res.responses.map(r => (
                                    <TableCell key={r.questionId} className="text-center">
                                        <span className={cn('p-1 rounded', r.isCorrect ? 'text-green-700' : 'text-red-700 line-through')}>
                                          {r.answerText}
                                        </span>
                                    </TableCell>
                                ))}
                                <TableCell className="text-right font-bold">{res.score} / {session.questions.length}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export function HostViewClient({ sessionId }: { sessionId: string }) {
    const { settings, updateInteractionSession, isLoaded } = useSettings();
    const [session, setSession] = useState<InteractionSession | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [responses, setResponses] = useState<InteractionResponse[]>([]);
    const [viewState, setViewState] = useState<'joining' | 'questions' | 'results'>('joining');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);


    useEffect(() => {
        if (isLoaded) {
            const foundSession = settings.interactionSessions?.find(s => s.id === sessionId);
            if (foundSession) {
                setSession(foundSession);
                if (foundSession.status === 'in-progress') {
                    setViewState('questions');
                } else if (foundSession.status === 'completed') {
                    setViewState('results');
                } else {
                    setViewState('joining');
                }
            }
        }
    }, [isLoaded, settings.interactionSessions, sessionId]);

    useEffect(() => {
        if (!session || viewState !== 'joining') return;
        
        const interval = setInterval(() => {
            const currentParticipants = settings.participants?.filter(p => p.sessionId === session.id) || [];
            setParticipants(currentParticipants);
        }, 1000);

        return () => clearInterval(interval);

    }, [session, viewState, settings.participants]);
    
    // Timer effect for auto-advancing questions
    useEffect(() => {
        if (viewState !== 'questions' || !session || !session.questions[currentQuestionIndex]) {
            return;
        }

        const duration = session.questions[currentQuestionIndex].duration || 30;
        setTimeLeft(duration);

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev === null || prev <= 1) {
                    clearInterval(timer);
                    handleNextQuestion();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);

    }, [viewState, currentQuestionIndex, session]);


    const getJoinUrl = () => {
        if (typeof window !== 'undefined') {
            return `${window.location.origin}/join?sessionId=${sessionId}`;
        }
        return '';
    };

    const handleStartExam = () => {
        if (!session) return;
        updateInteractionSession({ ...session, status: 'in-progress' });
        setViewState('questions');
    };

    if (!isLoaded || !session) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin" />
            </div>
        );
    }

    const currentQuestion = session.questions[currentQuestionIndex];
    
    const handleNextQuestion = () => {
        if (currentQuestionIndex < session.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            updateInteractionSession({ ...session, status: 'completed' });
            setViewState('results'); 
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
                        <Button className="w-full" size="lg" onClick={handleStartExam} disabled={session.questions.length === 0}>
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
                <div className="flex-grow grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-6 overflow-hidden">
                    <div className="md:col-span-1">
                        <QuestionDisplay question={currentQuestion} timeLeft={timeLeft} />
                    </div>
                    <div>
                        <ParticipantProgress participants={participants} responses={responses} />
                    </div>
                </div>
            </div>
        )
    }

    if (viewState === 'results') {
         return (
             <div className="h-full flex flex-col p-6 gap-6">
                 <h1 className="text-2xl font-bold flex-shrink-0">{session.name} - Final Results</h1>
                 <div className="flex-grow">
                     <FinalResults session={session} participants={participants} responses={responses} />
                 </div>
             </div>
         )
    }

    return <div>Invalid State</div>;
}

    
