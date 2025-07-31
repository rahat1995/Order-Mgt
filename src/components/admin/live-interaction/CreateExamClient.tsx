
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { User, FileQuestion, Settings, Check } from 'lucide-react';


const STEPS = [
    { id: 1, name: 'Basic Info', icon: Settings },
    { id: 2, name: 'Questions', icon: FileQuestion },
    { id: 3, name: 'Review', icon: Check },
];

const participantFields = [
    { id: 'name', label: 'Participant Name', required: true },
    { id: 'participantId', label: 'Participant ID', required: false },
    { id: 'organization', label: 'Organization', required: false },
    { id: 'mobile', label: 'Mobile Number', required: false },
    { id: 'email', label: 'Email', required: false },
    { id: 'location', label: 'Location', required: false },
];


export function CreateExamClient() {
    const [step, setStep] = useState(1);
    const [examName, setExamName] = useState('');
    const [requiredFields, setRequiredFields] = useState<Record<string, boolean>>({
        name: true,
        participantId: false,
        organization: false,
        mobile: false,
        email: false,
        location: false,
    });
    
    const handleFieldToggle = (fieldId: string) => {
        setRequiredFields(prev => ({
            ...prev,
            [fieldId]: !prev[fieldId],
        }));
    };

    const nextStep = () => setStep(s => Math.min(s + 1, STEPS.length));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));


    return (
        <div className="space-y-6">
            <div className="flex items-center justify-center">
                {STEPS.map((s, index) => (
                    <React.Fragment key={s.id}>
                        <div className="flex flex-col items-center gap-2">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center border-2",
                                step >= s.id ? 'bg-primary border-primary text-primary-foreground' : 'bg-muted'
                            )}>
                                <s.icon className="h-5 w-5" />
                            </div>
                            <p className={cn("text-sm", step >= s.id ? 'font-semibold' : 'text-muted-foreground')}>{s.name}</p>
                        </div>
                        {index < STEPS.length - 1 && <div className={cn("flex-1 h-0.5 mx-4", step > s.id ? 'bg-primary' : 'bg-border')} />}
                    </React.Fragment>
                ))}
            </div>

            {step === 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Step 1: Basic Information & Participant Fields</CardTitle>
                        <CardDescription>Give your exam a name and configure the information you need to collect from participants.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <div className="space-y-2">
                            <Label htmlFor="examName">Exam Name</Label>
                            <Input 
                                id="examName" 
                                placeholder="e.g., Annual Sales Kick-off Exam"
                                value={examName}
                                onChange={(e) => setExamName(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Participant Information</Label>
                            <p className="text-sm text-muted-foreground">Select which fields are required for participants to enter before starting the exam.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                {participantFields.map(field => (
                                    <div key={field.id} className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                                        <Label htmlFor={field.id} className="font-normal">{field.label}</Label>
                                        <Switch 
                                            id={field.id} 
                                            checked={requiredFields[field.id] || false}
                                            onCheckedChange={() => handleFieldToggle(field.id)}
                                            disabled={field.required}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
            
            {step === 2 && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Step 2: Add Questions</CardTitle>
                        <CardDescription>Define the questions for your exam. This feature is coming soon.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-center text-muted-foreground p-8">Question builder will be available here.</p>
                    </CardContent>
                </Card>
            )}

            {step === 3 && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Step 3: Review & Save</CardTitle>
                        <CardDescription>Review all the settings and questions before saving the exam. This feature is coming soon.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-center text-muted-foreground p-8">Review details will be available here.</p>
                    </CardContent>
                </Card>
            )}

            <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep} disabled={step === 1}>Previous</Button>
                <Button onClick={nextStep} disabled={step === STEPS.length}>Next</Button>
            </div>
        </div>
    );
}
