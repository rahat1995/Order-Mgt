
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
    
    useEffect(() => {
        if (isLoaded) {
            const session = settings.interactionSessions?.find(s => s.status === 'active') || null;
            setActiveSession(session);
        }
    }, [isLoaded, settings.interactionSessions]);

    const handleJoinSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!activeSession) return;
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        if (!name) return;

        const newParticipant = addParticipant({ sessionId: activeSession.id, name });
        setParticipant(newParticipant);
    };

    const handleAnswerSubmit = () => {
        if (!activeSession || !participant) return;
        const currentQuestion = activeSession.questions[currentQuestionIndex];
        const answer = currentQuestion.type === 'multiple-choice' ? selectedOption : textAnswer;

        if (!answer) {
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
                // End of exam/survey
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
            </Card>
        )
    }

    const currentQuestion = activeSession.questions[currentQuestionIndex];
    
    // Question View
    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Question {currentQuestionIndex + 1} of {activeSession.questions.length}</CardTitle>
                    {currentQuestion.duration && <div className="text-sm text-muted-foreground">Time: {currentQuestion.duration}s</div>}
                </div>
                <CardDescription className="text-lg text-foreground pt-2">{currentQuestion.text}</CardDescription>
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
                <Button onClick={handleAnswerSubmit} className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Submitting...</> : "Submit Answer"}
                </Button>
            </CardFooter>
        </Card>
    );
}
