
'use client';

import React, { useState, useMemo } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { InteractionSession, Participant, InteractionResponse, InteractionQuestion } from '@/types';
import { CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DetailedAnswer {
    questionText: string;
    isCorrect: boolean;
    participantAnswer: string;
    correctAnswer?: string;
}

const ReportDetailDialog = ({ 
    participant, 
    session, 
    detailedAnswers 
}: { 
    participant: Participant | null, 
    session: InteractionSession | null,
    detailedAnswers: DetailedAnswer[]
}) => {
    if (!participant || !session) return null;

    return (
        <DialogContent className="max-w-3xl">
            <DialogHeader>
                <DialogTitle>Answer Details for {participant.name}</DialogTitle>
                <DialogDescription>
                    Session: {session.name}
                </DialogDescription>
            </DialogHeader>
            <div className="max-h-[70vh] overflow-y-auto pr-4">
                <div className="space-y-4">
                    {detailedAnswers.map((answer, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                            <p className="font-semibold">{index + 1}. {answer.questionText}</p>
                            <div className="mt-2 text-sm space-y-1">
                                <div className={cn("flex items-start gap-2 p-2 rounded-md", answer.isCorrect ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800")}>
                                    {answer.isCorrect 
                                        ? <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                        : <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    }
                                    <p><span className="font-medium">Your answer:</span> {answer.participantAnswer || '(No answer)'}</p>
                                </div>
                                {!answer.isCorrect && answer.correctAnswer && (
                                     <div className="flex items-start gap-2 p-2 rounded-md bg-gray-100 text-gray-800">
                                        <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600" />
                                        <p><span className="font-medium">Correct answer:</span> {answer.correctAnswer}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DialogContent>
    )
};


export function SessionReportClient() {
    const { settings, isLoaded } = useSettings();
    const { interactionSessions = [], participants = [], interactionResponses = [] } = settings;
    const [selectedSessionId, setSelectedSessionId] = useState<string>('');
    const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    
    const examSessions = useMemo(() => interactionSessions.filter(s => s.type === 'exam'), [interactionSessions]);

    const reportData = useMemo(() => {
        if (!selectedSessionId) return [];
        const session = interactionSessions.find(s => s.id === selectedSessionId);
        if (!session) return [];

        const sessionParticipants = participants.filter(p => p.sessionId === selectedSessionId);
        const sessionResponses = interactionResponses.filter(r => r.sessionId === selectedSessionId);

        return sessionParticipants.map(participant => {
            let score = 0;
            session.questions.forEach(question => {
                const response = sessionResponses.find(r => r.participantId === participant.id && r.questionId === question.id);
                if (response && response.answer === question.correctOptionId) {
                    score++;
                }
            });
            return {
                participant,
                score,
                totalQuestions: session.questions.length,
            };
        }).sort((a,b) => b.score - a.score);

    }, [selectedSessionId, interactionSessions, participants, interactionResponses]);

    const detailedAnswers = useMemo(() => {
        if (!selectedParticipant || !selectedSessionId) return [];
        const session = interactionSessions.find(s => s.id === selectedSessionId);
        if (!session) return [];
        
        const participantResponses = interactionResponses.filter(r => r.participantId === selectedParticipant.id && r.sessionId === selectedSessionId);

        return session.questions.map(question => {
            const response = participantResponses.find(r => r.questionId === question.id);
            const isCorrect = response?.answer === question.correctOptionId;
            const participantAnswerText = question.options?.find(o => o.id === response?.answer)?.text || response?.answer || '';
            const correctAnswerText = question.options?.find(o => o.id === question.correctOptionId)?.text;
            
            return {
                questionText: question.text,
                isCorrect,
                participantAnswer: participantAnswerText,
                correctAnswer: correctAnswerText,
            };
        });

    }, [selectedParticipant, selectedSessionId, interactionSessions, interactionResponses]);

    const handleViewDetails = (participant: Participant) => {
        setSelectedParticipant(participant);
        setIsDetailOpen(true);
    };

    if (!isLoaded) {
        return <p>Loading reports...</p>;
    }
    
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Select a Session</CardTitle>
                    <div className="w-full md:w-1/3">
                        <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose an exam session..." />
                            </SelectTrigger>
                            <SelectContent>
                                {examSessions.map(session => (
                                    <SelectItem key={session.id} value={session.id}>
                                        {session.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Rank</TableHead>
                                <TableHead>Participant</TableHead>
                                <TableHead>ID</TableHead>
                                <TableHead>Organization</TableHead>
                                <TableHead className="text-right">Score</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reportData.length > 0 ? (
                                reportData.map((data, index) => (
                                    <TableRow key={data.participant.id}>
                                        <TableCell className="font-bold">{index + 1}</TableCell>
                                        <TableCell className="font-medium">{data.participant.name}</TableCell>
                                        <TableCell>{(data.participant as any).participantId || 'N/A'}</TableCell>
                                        <TableCell>{(data.participant as any).organization || 'N/A'}</TableCell>
                                        <TableCell className="text-right font-semibold">{data.score} / {data.totalQuestions}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => handleViewDetails(data.participant)}>
                                                View Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        {selectedSessionId ? "No participants found for this session." : "Please select a session to view the report."}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

             <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <ReportDetailDialog
                    participant={selectedParticipant}
                    session={interactionSessions.find(s => s.id === selectedSessionId) || null}
                    detailedAnswers={detailedAnswers}
                />
            </Dialog>
        </>
    )
}
