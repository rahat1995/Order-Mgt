
'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import type { InteractionSession, Participant, InteractionQuestion } from '@/types';
import { Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const participantFields = [
    { id: 'name', label: 'Participant Name', required: true },
    { id: 'participantId', label: 'Participant ID', required: false },
    { id: 'organization', label: 'Organization', required: false },
    { id: 'mobile', label: 'Mobile Number', required: false },
    { id: 'email', label: 'Email', required: false },
    { id: 'location', label: 'Location', required: false },
];

export function ParticipantViewClient() {
    const { settings, addParticipant, addInteractionResponse, isLoaded } = useSettings();
    const [activeSession, setActiveSession] = useState<InteractionSession | null>(null);
    const [participant, setParticipant] = useState<Participant | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string>('');
    const [textAnswer, setTextAnswer] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [finalScore, setFinalScore] = useState<number | null>(null);

    useEffect(() => {
        if (isLoaded) {
            const session = settings.interactionSessions?.find(s => s.status === 'active') || null;
            setActiveSession(session);
        }
    }, [isLoaded, settings.interactionSessions]);

    useEffect(() => {
        if (activeSession?.type === 'exam' && currentQuestionIndex >= 0 && activeSession.questions[currentQuestionIndex]) {
            const duration = activeSession.questions[currentQuestionIndex].duration;
            if (duration) {
                setTimeLeft(duration);
                const timer = setInterval(() => {
                    setTimeLeft(prevTime => {
                        if (prevTime === null || prevTime <= 1) {
                            clearInterval(timer);
                            handleAnswerSubmit(true); // Auto-submit when time is up
                            return 0;
                        }
                        return prevTime - 1;
                    });
                }, 1000);
                return () => clearInterval(timer);
            }
        }
    }, [currentQuestionIndex, activeSession]);


    const handleJoinSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!activeSession) return;
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        if (!name) return;

        const participantData: Omit<Participant, 'id'> = { sessionId: activeSession.id, name: ''};
        
        participantFields.forEach(field => {
            const value = formData.get(field.id) as string;
            if(value) {
                (participantData as any)[field.id] = value;
            }
        })
        
        const newParticipant = addParticipant(participantData);
        setParticipant(newParticipant);
    };

    const handleAnswerSubmit = (autoSubmit = false) => {
        if (!activeSession || !participant) return;
        const currentQuestion = activeSession.questions[currentQuestionIndex];
        const answer = currentQuestion.type === 'multiple-choice' ? selectedOption : textAnswer;

        if (!answer && !autoSubmit) {
            alert('Please provide an answer.');
            return;
        }
        
        setIsSubmitting(true);
        addInteractionResponse({
            sessionId: activeSession.id,
            questionId: currentQuestion.id,
            participantId: participant.id,
            answer: answer,
        });

        // Move to next question or end
        setTimeout(() => {
            if (currentQuestionIndex < activeSession.questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
                setSelectedOption('');
                setTextAnswer('');
            } else {
                // End of exam/survey, calculate score if it's an exam
                if (activeSession.type === 'exam') {
                    const responses = settings.interactionResponses?.filter(r => r.participantId === participant.id && r.sessionId === activeSession.id) || [];
                    let score = 0;
                    activeSession.questions.forEach(q => {
                        const response = responses.find(r => r.questionId === q.id);
                        if (response && response.answer === q.correctOptionId) {
                            score++;
                        }
                    });
                     // Check final answer
                    if (answer && answer === currentQuestion.correctOptionId) {
                        score++;
                    }

                    setFinalScore(score);
                }
                setCurrentQuestionIndex(-1); // Use -1 to signify completion
            }
            setIsSubmitting(false);
        }, 500);
    };

    if (!isLoaded) {
        return <Card className="w-full max-w-md text-center"><CardHeader><CardTitle>Loading Session...</CardTitle></CardHeader></Card>;
    }

    if (!activeSession) {
        return <Card className="w-full max-w-md text-center"><CardHeader><CardTitle>No Active Session</CardTitle><CardDescription>There is no poll, exam, or survey currently active. Please wait for the host to start a session.</CardDescription></CardHeader></Card>;
    }
    
    // Participant Join Form
    if (!participant) {
        return (
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>{activeSession.name}</CardTitle>
                    <CardDescription>Please enter your details to join the session.</CardDescription>
                </CardHeader>
                <form onSubmit={handleJoinSubmit}>
                    <CardContent className="space-y-4">
                        {participantFields.filter(f => activeSession.requiredParticipantFields[f.id]).map(field => (
                             <div key={field.id} className="space-y-2">
                                <Label htmlFor={field.id}>{field.label}</Label>
                                <Input id={field.id} name={field.id} required={field.required} />
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full">Join Session</Button>
                    </CardFooter>
                </form>
            </Card>
        );
    }
    
    // End of Session View
    if (currentQuestionIndex === -1) {
        return (
             <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle>Thank You!</CardTitle>
                    <CardDescription>Your responses have been submitted. You may now close this window.</CardDescription>
                </CardHeader>
                {finalScore !== null && (
                    <CardContent>
                        <p className="text-lg font-semibold">Your Score:</p>
                        <p className="text-4xl font-bold text-primary">{finalScore} / {activeSession.questions.length}</p>
                    </CardContent>
                )}
            </Card>
        )
    }

    const currentQuestion = activeSession.questions[currentQuestionIndex];
    const progressPercentage = (timeLeft !== null && currentQuestion.duration) 
        ? (timeLeft / currentQuestion.duration) * 100 
        : 100;

    // Question View
    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Question {currentQuestionIndex + 1} of {activeSession.questions.length}</CardTitle>
                    {activeSession.type === 'exam' && timeLeft !== null && (
                        <div className="text-lg font-bold text-primary tabular-nums">
                            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                        </div>
                    )}
                </div>
                 {activeSession.type === 'exam' && currentQuestion.duration && (
                    <Progress value={progressPercentage} className="w-full h-2 mt-2" />
                 )}
                <CardDescription className="text-lg text-foreground pt-4">{currentQuestion.text}</CardDescription>
            </CardHeader>
            <CardContent>
                {currentQuestion.type === 'multiple-choice' && (
                    <RadioGroup value={selectedOption} onValueChange={setSelectedOption} className="space-y-2">
                        {(currentQuestion.options || []).map(opt => (
                            <div key={opt.id} className="flex items-center space-x-2 p-3 border rounded-md has-[:checked]:bg-accent has-[:checked]:border-primary">
                                <RadioGroupItem value={opt.id} id={opt.id} />
                                <Label htmlFor={opt.id} className="flex-grow cursor-pointer">{opt.text}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                )}
                 {currentQuestion.type === 'text' && (
                    <Textarea 
                        value={textAnswer}
                        onChange={(e) => setTextAnswer(e.target.value)}
                        rows={5}
                        placeholder="Type your answer here..."
                    />
                )}
            </CardContent>
            <CardFooter>
                <Button onClick={() => handleAnswerSubmit()} className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Submitting...</> : "Submit Answer"}
                </Button>
            </CardFooter>
        </Card>
    );
}
